import { Router, Request, Response, CookieOptions } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  createUser,
  getUserByUsername,
  getUserByPhone,
  getUserById,
  createOTP,
  getOTP,
  verifyOTP,
  getLatestOTP
} from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}
const JWT_EXPIRES = '7d';
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'auth_token';
const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === 'production';
const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/',
  maxAge: AUTH_COOKIE_MAX_AGE_MS,
};

// SUBMAIL配置
const SUBMAIL_APPID = process.env.SUBMAIL_APPID || '';
const SUBMAIL_APPKEY = process.env.SUBMAIL_APPKEY || '';
const SUBMAIL_API = 'https://api-v4.mysubmail.com/internationalsms/send.json';

interface AuthRequest extends Request {
  userId?: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface LoginFailureEntry {
  count: number;
  resetAt: number;
  blockedUntil: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const loginFailureStore = new Map<string, LoginFailureEntry>();

const readEnvInt = (key: string, fallback: number, min: number, max: number): number => {
  const raw = process.env[key];
  const parsed = raw ? Number(raw) : fallback;
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const normalized = Math.floor(parsed);
  return Math.min(Math.max(normalized, min), max);
};

const AUTH_LOGIN_RATE_LIMIT = readEnvInt('AUTH_LOGIN_RATE_LIMIT', 10, 1, 200);
const AUTH_LOGIN_RATE_WINDOW_SECONDS = readEnvInt('AUTH_LOGIN_RATE_WINDOW_SECONDS', 900, 30, 86400);
const AUTH_LOGIN_FAIL_MAX = readEnvInt('AUTH_LOGIN_FAIL_MAX', 5, 1, 50);
const AUTH_LOGIN_FAIL_BLOCK_SECONDS = readEnvInt('AUTH_LOGIN_FAIL_BLOCK_SECONDS', 900, 30, 86400);
const AUTH_SMS_RATE_LIMIT = readEnvInt('AUTH_SMS_RATE_LIMIT', 5, 1, 100);
const AUTH_SMS_RATE_WINDOW_SECONDS = readEnvInt('AUTH_SMS_RATE_WINDOW_SECONDS', 900, 30, 86400);
const AUTH_VERIFY_RATE_LIMIT = readEnvInt('AUTH_VERIFY_RATE_LIMIT', 12, 1, 200);
const AUTH_VERIFY_RATE_WINDOW_SECONDS = readEnvInt('AUTH_VERIFY_RATE_WINDOW_SECONDS', 600, 30, 86400);

const parseCookieToken = (req: Request): string | null => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  const chunks = cookieHeader.split(';');
  for (const chunk of chunks) {
    const [name, ...rest] = chunk.trim().split('=');
    if (name === AUTH_COOKIE_NAME) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
};

const resolveAuthToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return parseCookieToken(req);
};

const getClientIp = (req: Request): string => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

const consumeRateLimit = (
  key: string,
  limit: number,
  windowMs: number
): { blocked: boolean; retryAfterSec: number } => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs
    });
    return { blocked: false, retryAfterSec: 0 };
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);
  if (entry.count > limit) {
    return {
      blocked: true,
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
    };
  }

  return { blocked: false, retryAfterSec: 0 };
};

const isLoginBlocked = (key: string): { blocked: boolean; retryAfterSec: number } => {
  const now = Date.now();
  const entry = loginFailureStore.get(key);
  if (!entry) {
    return { blocked: false, retryAfterSec: 0 };
  }
  if (entry.blockedUntil > now) {
    return {
      blocked: true,
      retryAfterSec: Math.max(1, Math.ceil((entry.blockedUntil - now) / 1000))
    };
  }
  return { blocked: false, retryAfterSec: 0 };
};

const registerLoginFailure = (key: string): void => {
  const now = Date.now();
  const windowMs = AUTH_LOGIN_RATE_WINDOW_SECONDS * 1000;
  const maxFailures = AUTH_LOGIN_FAIL_MAX;
  const blockMs = AUTH_LOGIN_FAIL_BLOCK_SECONDS * 1000;

  const current = loginFailureStore.get(key);
  if (!current || now > current.resetAt) {
    loginFailureStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
      blockedUntil: 0
    });
    return;
  }

  current.count += 1;
  if (current.count >= maxFailures) {
    current.blockedUntil = now + blockMs;
  }
  loginFailureStore.set(key, current);
};

const clearLoginFailures = (key: string): void => {
  loginFailureStore.delete(key);
};

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

// 生成6位数字验证码
const generateOTPCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 将台湾手机号转换为E164格式
const convertPhoneToE164 = (phone: string): string => {
  return '+886' + phone.substring(1); // 09xxx -> +8869xxx
};

const maskPhone = (phone: string): string => {
  if (phone.length < 4) {
    return '***';
  }
  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
};

// 通过SUBMAIL发送短信验证码
const sendSMSVerification = async (phone: string, code: string): Promise<{ success: boolean; error?: string }> => {
  if (!SUBMAIL_APPID || !SUBMAIL_APPKEY) {
    const error = 'SUBMAIL credentials not configured';
    console.error(error);
    return { success: false, error };
  }

  const phoneE164 = convertPhoneToE164(phone);
  const content = `【榕台海峽快運】您的驗證碼：${code}，請在10分鐘內輸入。`;

  try {
    const body = new URLSearchParams({
      appid: SUBMAIL_APPID,
      to: phoneE164,
      content,
      signature: SUBMAIL_APPKEY,
    }).toString();

    const response = await fetch(SUBMAIL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    
    const data = await response.json() as any;
    
    if (data.status === 'success') {
      console.log(`SMS sent successfully to ${maskPhone(phone)}`);
      return { success: true };
    } else {
      const errorMsg = `SUBMAIL error: ${data.status} - ${data.msg || data.error || JSON.stringify(data)}`;
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    const errorMsg = `SMS API error: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
};

router.post('/send-sms', async (req: Request, res: Response): Promise<void> => {
  try {
    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';

    if (!phone) {
      res.status(400).json({ error: '手机号码不能为空' });
      return;
    }

    // 验证手机号格式
    if (!/^09\d{8}$/.test(phone)) {
      res.status(400).json({ error: '请输入有效的手机号码' });
      return;
    }

    const ip = getClientIp(req);
    const smsLimit = consumeRateLimit(`send-sms:${ip}:${phone}`, AUTH_SMS_RATE_LIMIT, AUTH_SMS_RATE_WINDOW_SECONDS * 1000);
    if (smsLimit.blocked) {
      res.status(429).json({ error: `请求过于频繁，请在 ${smsLimit.retryAfterSec} 秒后重试` });
      return;
    }

    // 检查手机号是否已被注册
    const existingUser = await getUserByPhone(phone);
    if (existingUser) {
      res.status(400).json({ error: '手机号已被注册' });
      return;
    }

    // 生成验证码
    const code = generateOTPCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后过期

    // 保存验证码到数据库
    try {
      await createOTP(phone, code, expiresAt.toISOString());
      console.log(`OTP created for ${maskPhone(phone)}`);
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ error: '数据库错误，请稍后重试' });
      return;
    }

    // 发送短信
    const result = await sendSMSVerification(phone, code);
    if (!result.success) {
      console.error(`Failed to send SMS to ${maskPhone(phone)}:`, result.error);
      res.status(500).json({ error: '发送验证码失败，请稍后重试' });
      return;
    }

    console.log(`SMS sent successfully to ${maskPhone(phone)}`);
    res.json({ message: '验证码已发送' });
  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/verify-code', async (req: Request, res: Response): Promise<void> => {
  try {
    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';

    if (!phone || !code) {
      res.status(400).json({ error: '手机号码和验证码不能为空' });
      return;
    }

    // 验证手机号格式
    if (!/^09\d{8}$/.test(phone)) {
      res.status(400).json({ error: '请输入有效的手机号码' });
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      res.status(400).json({ error: '验证码格式无效' });
      return;
    }

    const ip = getClientIp(req);
    const verifyLimit = consumeRateLimit(`verify-code:${ip}:${phone}`, AUTH_VERIFY_RATE_LIMIT, AUTH_VERIFY_RATE_WINDOW_SECONDS * 1000);
    if (verifyLimit.blocked) {
      res.status(429).json({ error: `请求过于频繁，请在 ${verifyLimit.retryAfterSec} 秒后重试` });
      return;
    }

    // 查询验证码
    const otp = await getOTP(phone, code);
    if (!otp) {
      res.status(400).json({ error: '验证码无效或已过期' });
      return;
    }

    // 标记验证码为已验证
    await verifyOTP(phone, code);

    res.json({ message: '验证码验证成功' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';

    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' });
      return;
    }

    if (username.length < 6 || username.length > 64) {
      res.status(400).json({ error: '用户名长度需为6-64个字符' });
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      res.status(400).json({ error: '用户名只能包含字母和数字' });
      return;
    }

    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: '密码长度需为8-128个字符' });
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      res.status(400).json({ error: '密码必须包含大写字母、小写字母和数字' });
      return;
    }

    if (email) {
      if (email.length > 254) {
        res.status(400).json({ error: '邮箱长度无效' });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: '请输入有效的邮箱地址' });
        return;
      }
    }

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      res.status(400).json({ error: '用户名已存在' });
      return;
    }

    if (phone) {
      // 验证手机号格式
      if (!/^09\d{8}$/.test(phone)) {
        res.status(400).json({ error: '请输入有效的手机号码' });
        return;
      }

      const existingPhone = await getUserByPhone(phone);
      if (existingPhone) {
        res.status(400).json({ error: '手机号已被注册' });
        return;
      }

      // 检查手机号是否已验证
      const latestOTP = await getLatestOTP(phone);
      
      if (!latestOTP || !latestOTP.verified) {
        res.status(400).json({ error: '请先验证手机号码' });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userId = await createUser(username, hashedPassword, phone || null, email || null, null, null);
    const token = generateToken(userId);
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);

    res.status(201).json({
      message: '注册成功',
      user: {
        id: userId,
        username,
        phone: phone || null,
        email: email || null
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' });
      return;
    }

    const ip = getClientIp(req);
    const usernameKey = username.toLowerCase();
    const loginRateLimit = consumeRateLimit(`login:${ip}:${usernameKey}`, AUTH_LOGIN_RATE_LIMIT, AUTH_LOGIN_RATE_WINDOW_SECONDS * 1000);
    if (loginRateLimit.blocked) {
      res.status(429).json({ error: `登录尝试过于频繁，请在 ${loginRateLimit.retryAfterSec} 秒后重试` });
      return;
    }

    const blockedState = isLoginBlocked(`login-fail:${ip}:${usernameKey}`);
    if (blockedState.blocked) {
      res.status(429).json({ error: `账户已临时锁定，请在 ${blockedState.retryAfterSec} 秒后重试` });
      return;
    }

    const user = await getUserByUsername(username);
    if (!user) {
      registerLoginFailure(`login-fail:${ip}:${usernameKey}`);
      res.status(401).json({ error: '用户名或密码错误' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      registerLoginFailure(`login-fail:${ip}:${usernameKey}`);
      res.status(401).json({ error: '用户名或密码错误' });
      return;
    }

    clearLoginFailures(`login-fail:${ip}:${usernameKey}`);

    const token = generateToken(user.id);
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);

    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        real_name: user.real_name,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = resolveAuthToken(req);
    if (!token) {
      res.status(401).json({ error: '未登录' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    const user = await getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: '用户不存在' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        real_name: user.real_name,
        address: user.address
      }
    });
  } catch (error) {
    res.status(401).json({ error: '登录已过期' });
  }
});

router.post('/logout', async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
  res.json({ message: '已退出登录' });
});

export default router;
