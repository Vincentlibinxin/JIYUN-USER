import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth';
import { authMiddleware } from './middleware/auth';
import { getUserById, initDb } from './db';

const app = express();
const PORT = process.env.PORT || 3007;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultOrigins = ['http://localhost:3008', 'http://127.0.0.1:3008'];
const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const resolvedOrigins = corsOrigins.length > 0 ? corsOrigins : defaultOrigins;
const useStrictOriginList = corsOrigins.length > 0;

const isFrontendOrigin = (origin: string): boolean => {
  try {
    const parsed = new URL(origin);
    return parsed.port === '3008';
  } catch {
    return false;
  }
};

if (resolvedOrigins.includes('*')) {
  throw new Error('CORS wildcard (*) is not allowed. Please configure explicit CORS_ORIGINS.');
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (resolvedOrigins.includes(origin) || (!useStrictOriginList && isFrontendOrigin(origin))) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

// 提供靜態文件服務
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);

app.get('/api/user/profile', authMiddleware, async (req: any, res) => {
  try {
    const user = await getUserById(req.userId);
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
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
    res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const startServer = async (): Promise<void> => {
  await initDb();
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
