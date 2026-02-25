import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import { authMiddleware } from './middleware/auth';
import { getUserById, initDb } from './db';

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://192.168.1.35:3000'];
const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const resolvedOrigins = corsOrigins.length > 0 ? corsOrigins : defaultOrigins;

app.use(cors({
  origin: resolvedOrigins.includes('*') ? true : resolvedOrigins,
  credentials: true
}));

app.use(express.json());

// 提供靜態文件服務（Layui 資源和管理系統 HTML）
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

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
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
