import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  createAdmin,
  getAdminByUsername,
  updateAdminLastLogin,
  getAdminsPaged,
  getAdminsCount,
  updateAdminStatus,
  deleteAdmin,
  getSmsPaged,
  getSmsCount,
  getUsersPaged,
  getUsersCount,
  searchUsers,
  updateUser,
  deleteUser,
  getOrdersPaged,
  getOrdersCount,
  getParcelsPaged,
  getParcelsCount,
  updateOrderStatus,
  updateParcelStatus,
  getUserById
} from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'rongtai-secret-key-2026';
const JWT_EXPIRES = '24h';

interface AdminRequest extends Request {
  adminId?: number;
}

// 生成管理员 Token
export const generateAdminToken = (adminId: number): string => {
  return jwt.sign({ adminId, type: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

// 管理员认证中间件
export const adminAuthMiddleware = (req: AdminRequest, res: Response, next: () => void) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: '未授权' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'admin') {
      res.status(403).json({ error: '权限不足' });
      return;
    }
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    res.status(401).json({ error: '无效的令牌' });
  }
};

// 管理员登录
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' });
      return;
    }

    const admin = await getAdminByUsername(username);
    if (!admin) {
      res.status(401).json({ error: '用户名或密码错误' });
      return;
    }

    if (admin.status && admin.status !== 'active') {
      res.status(403).json({ error: '账号已停用' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: '用户名或密码错误' });
      return;
    }

    // 更新最后登录时间
    await updateAdminLastLogin(admin.id);

    const token = generateAdminToken(admin.id);
    res.json({
      message: '登录成功',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取所有用户（分页）
router.get('/users', adminAuthMiddleware, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [users, total] = await Promise.all([
      getUsersPaged(limit, offset),
      getUsersCount()
    ]);

    res.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取短信验证码记录
router.get('/sms', adminAuthMiddleware, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      getSmsPaged(limit, offset),
      getSmsCount()
    ]);

    res.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get sms error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 搜索用户
router.get('/users/search', adminAuthMiddleware, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const keyword = req.query.q as string;
    if (!keyword) {
      res.status(400).json({ error: '搜索关键词不能为空' });
      return;
    }

    const filtered = await searchUsers(keyword);

    res.json({
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取单个用户信息
router.get('/users/:id', adminAuthMiddleware, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const user = await getUserById(parseInt(req.params.id));
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    // 隐藏密码字段
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 编辑用户信息
router.put('/users/:id', adminAuthMiddleware, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { real_name, address, email } = req.body;
    const userId = parseInt(req.params.id);

    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    await updateUser(real_name || null, address || null, email || null, userId);

    res.json({
      message: '用户信息已更新',
      user: {
        id: userId,
        username: user.username,
        phone: user.phone,
        email: email || user.email,
        real_name: real_name || user.real_name,
        address: address || user.address
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除用户
router.delete('/users/:id', adminAuthMiddleware, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const user = await getUserById(userId);

    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    await deleteUser(userId);
    res.json({ message: `用户 ${user.username} 已删除` });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取所有订单
router.get('/orders', adminAuthMiddleware, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      getOrdersPaged(limit, offset),
      getOrdersCount()
    ]);

    res.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新订单状态
router.patch('/orders/:id', adminAuthMiddleware, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const orderId = parseInt(req.params.id);

    if (!status) {
      res.status(400).json({ error: '状态不能为空' });
      return;
    }

    await updateOrderStatus(status, orderId);
    res.json({ message: '订单状态已更新', orderId, status });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取所有包裹
router.get('/parcels', adminAuthMiddleware, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [parcels, total] = await Promise.all([
      getParcelsPaged(limit, offset),
      getParcelsCount()
    ]);

    res.json({
      data: parcels,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get parcels error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新包裹状态
router.patch('/parcels/:id', adminAuthMiddleware, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const parcelId = parseInt(req.params.id);

    if (!status) {
      res.status(400).json({ error: '状态不能为空' });
      return;
    }

    await updateParcelStatus(status, parcelId);
    res.json({ message: '包裹状态已更新', parcelId, status });
  } catch (error) {
    console.error('Update parcel error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取管理员列表
router.get('/admins', adminAuthMiddleware, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      getAdminsPaged(limit, offset),
      getAdminsCount()
    ]);

    res.json({
      data: admins,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 新增管理员
router.post('/admins', adminAuthMiddleware, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email) {
      res.status(400).json({ error: '用户名、密码和邮箱不能为空' });
      return;
    }

    const existing = await getAdminByUsername(username);
    if (existing) {
      res.status(409).json({ error: '管理员已存在' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const adminId = await createAdmin(username, hashed, email, role || 'admin');

    res.status(201).json({
      message: '管理员已创建',
      admin: {
        id: adminId,
        username,
        email,
        role: role || 'admin',
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新管理员状态
router.patch('/admins/:id', adminAuthMiddleware, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const adminId = parseInt(req.params.id);

    if (!status) {
      res.status(400).json({ error: '状态不能为空' });
      return;
    }

    await updateAdminStatus(status, adminId);
    res.json({ message: '管理员状态已更新', adminId, status });
  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除管理员
router.delete('/admins/:id', adminAuthMiddleware, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const adminId = parseInt(req.params.id);

    await deleteAdmin(adminId);
    res.json({ message: '管理员已删除', adminId });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
