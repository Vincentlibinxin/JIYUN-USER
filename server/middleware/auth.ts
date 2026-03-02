import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

export interface AuthRequest extends Request {
  userId?: number;
  user?: any;
}

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'auth_token';

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

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;
    const cookieToken = parseCookieToken(req);
    const token = headerToken || cookieToken;

    if (!token) {
      res.status(401).json({ error: '未授权' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: '登录已过期' });
  }
};
