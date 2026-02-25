import { Router, Request, Response } from 'express';
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
const JWT_SECRET = process.env.JWT_SECRET || 'rongtai-secret-key-2026';
const JWT_EXPIRES = '7d';

// SUBMAIL配置
const SUBMAIL_APPID = process.env.SUBMAIL_APPID || '';
const SUBMAIL_APPKEY = process.env.SUBMAIL_APPKEY || '';
const SUBMAIL_API = 'https://api-v4.mysubmail.com/internationalsms/send.json';

interface AuthRequest extends Request {
  userId?: number;
}

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
    console.log('Sending SMS to:', phoneE164);
    console.log('APPID:', SUBMAIL_APPID);
    
    const body = new URLSearchParams({
      appid: SUBMAIL_APPID,
      to: phoneE164,
      content,
      signature: SUBMAIL_APPKEY,
    }).toString();
    
    console.log('Request body:', body);

    const response = await fetch(SUBMAIL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    console.log('Response status:', response.status);
    
    const data = await response.json() as any;
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.status === 'success') {
      console.log('SMS sent successfully:', data.send_id);
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
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ error: '手机号码不能为空' });
      return;
    }

    // 验证手机号格式
    if (!/^09\d{8}$/.test(phone)) {
      res.status(400).json({ error: '请输入有效的手机号码' });
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
      console.log(`OTP created for ${phone}: ${code}`);
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ error: '数据库错误，请稍后重试' });
      return;
    }

    // 发送短信
    const result = await sendSMSVerification(phone, code);
    if (!result.success) {
      console.error(`Failed to send SMS to ${phone}:`, result.error);
      res.status(500).json({ error: '发送验证码失败，请稍后重试' });
      return;
    }

    console.log(`SMS sent successfully to ${phone}`);
    res.json({ message: '验证码已发送' });
  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/verify-code', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      res.status(400).json({ error: '手机号码和验证码不能为空' });
      return;
    }

    // 验证手机号格式
    if (!/^09\d{8}$/.test(phone)) {
      res.status(400).json({ error: '请输入有效的手机号码' });
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
    const { username, password, phone, email } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' });
      return;
    }

    if (username.length < 6) {
      res.status(400).json({ error: '用户名至少6个字符' });
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      res.status(400).json({ error: '用户名只能包含字母和数字' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: '密码至少8个字符' });
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      res.status(400).json({ error: '密码必须包含大写字母、小写字母和数字' });
      return;
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

    res.status(201).json({
      message: '注册成功',
      token,
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
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' });
      return;
    }

    const user = await getUserByUsername(username);
    if (!user) {
      res.status(401).json({ error: '用户名或密码错误' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: '用户名或密码错误' });
      return;
    }

    const token = generateToken(user.id);

    res.json({
      message: '登录成功',
      token,
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: '未登录' });
      return;
    }

    const token = authHeader.substring(7);
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

export default router;
