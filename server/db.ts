import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jiyun',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  dateStrings: true
});

export const initDb = async (): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(32) UNIQUE,
        email VARCHAR(255),
        real_name VARCHAR(255),
        address VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(32) NOT NULL,
        code VARCHAR(16) NOT NULL,
        expires_at DATETIME NOT NULL,
        verified TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_otp_phone (phone),
        INDEX idx_otp_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(32) DEFAULT 'admin',
        status VARCHAR(32) DEFAULT 'active',
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_admin_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS parcels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        tracking_number VARCHAR(128) UNIQUE NOT NULL,
        origin VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        weight DOUBLE,
        status VARCHAR(64) DEFAULT 'pending',
        estimated_delivery DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_parcels_user (user_id),
        INDEX idx_parcels_tracking (tracking_number),
        CONSTRAINT fk_parcels_user FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        parcel_id INT,
        total_amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(8) DEFAULT 'TWD',
        status VARCHAR(64) DEFAULT 'pending',
        payment_method VARCHAR(64),
        notes VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_orders_user (user_id),
        INDEX idx_orders_parcel (parcel_id),
        INDEX idx_orders_status (status),
        CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
        CONSTRAINT fk_orders_parcel FOREIGN KEY (parcel_id) REFERENCES parcels(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const adminCount = await getAdminCount();
    if (adminCount === 0) {
      const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123456';
      const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
      const hashed = bcrypt.hashSync(defaultPassword, 10);

      await createAdmin(defaultUsername, hashed, defaultEmail, 'admin');
      console.log(`[Admin Init] Created default admin account: ${defaultUsername}`);
    }
  } finally {
    connection.release();
  }
};

export interface User {
  id: number;
  username: string;
  password: string;
  phone: string | null;
  email: string | null;
  real_name: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

const querySingle = async <T>(sql: string, params: any[] = []): Promise<T | null> => {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(sql, params);
  return (rows[0] as T) || null;
};

const queryAll = async <T>(sql: string, params: any[] = []): Promise<T[]> => {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(sql, params);
  return rows as T[];
};

const toSafeInt = (value: number, fallback: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  const normalized = Math.floor(value);
  return Math.min(Math.max(normalized, min), max);
};

export const createUser = async (
  username: string,
  password: string,
  phone: string | null,
  email: string | null,
  realName: string | null,
  address: string | null
): Promise<number> => {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    `INSERT INTO users (username, password, phone, email, real_name, address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, password, phone, email, realName, address]
  );
  return result.insertId;
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  return querySingle<User>('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
};

export const getUserByPhone = async (phone: string): Promise<User | null> => {
  return querySingle<User>('SELECT * FROM users WHERE phone = ? LIMIT 1', [phone]);
};

export const getUserById = async (id: number): Promise<User | null> => {
  return querySingle<User>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
};

export const createOTP = async (phone: string, code: string, expiresAt: string): Promise<void> => {
  await pool.execute(
    'INSERT INTO otp_codes (phone, code, expires_at) VALUES (?, ?, ?)',
    [phone, code, expiresAt]
  );
};

export const getOTP = async (phone: string, code: string): Promise<any | null> => {
  return querySingle<any>(
    `SELECT * FROM otp_codes
     WHERE phone = ? AND code = ? AND expires_at > NOW() AND verified = 0
     ORDER BY created_at DESC LIMIT 1`,
    [phone, code]
  );
};

export const verifyOTP = async (phone: string, code: string): Promise<void> => {
  await pool.execute(
    `UPDATE otp_codes
     SET verified = 1
     WHERE phone = ? AND code = ? AND expires_at > NOW()`,
    [phone, code]
  );
};

export const getLatestOTP = async (phone: string): Promise<any | null> => {
  return querySingle<any>(
    `SELECT * FROM otp_codes
     WHERE phone = ? AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [phone]
  );
};

export const getSmsPaged = async (limit: number, offset: number): Promise<any[]> => {
  const safeLimit = toSafeInt(limit, 10, 1, 500);
  const safeOffset = toSafeInt(offset, 0, 0, Number.MAX_SAFE_INTEGER);
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT id, phone, code, verified, created_at, expires_at
     FROM otp_codes
     ORDER BY created_at DESC
     LIMIT ${safeLimit} OFFSET ${safeOffset}`
  );
  return rows as any[];
};

export const getSmsCount = async (): Promise<number> => {
  const row = await querySingle<{ count: number }>('SELECT COUNT(*) as count FROM otp_codes');
  return row ? row.count : 0;
};

// Admin operations
export const createAdmin = async (
  username: string,
  password: string,
  email: string,
  role: string
): Promise<number> => {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    'INSERT INTO admin_users (username, password, email, role) VALUES (?, ?, ?, ?)',
    [username, password, email, role]
  );
  return result.insertId;
};

export const getAdminByUsername = async (username: string): Promise<any | null> => {
  return querySingle<any>('SELECT * FROM admin_users WHERE username = ? LIMIT 1', [username]);
};

export const updateAdminLastLogin = async (adminId: number): Promise<void> => {
  await pool.execute('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [adminId]);
};

export const getAdminsPaged = async (limit: number, offset: number): Promise<any[]> => {
  const safeLimit = toSafeInt(limit, 10, 1, 500);
  const safeOffset = toSafeInt(offset, 0, 0, Number.MAX_SAFE_INTEGER);
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT id, username, email, role, status, last_login, created_at, updated_at
     FROM admin_users
     ORDER BY created_at DESC
     LIMIT ${safeLimit} OFFSET ${safeOffset}`
  );
  return rows as any[];
};

export const getAdminsCount = async (): Promise<number> => {
  const row = await querySingle<{ count: number }>('SELECT COUNT(*) as count FROM admin_users');
  return row ? row.count : 0;
};

export const updateAdminStatus = async (status: string, adminId: number): Promise<void> => {
  await pool.execute('UPDATE admin_users SET status = ?, updated_at = NOW() WHERE id = ?', [status, adminId]);
};

export const deleteAdmin = async (adminId: number): Promise<void> => {
  await pool.execute('DELETE FROM admin_users WHERE id = ?', [adminId]);
};

const getAdminCount = async (): Promise<number> => {
  const row = await querySingle<{ count: number }>('SELECT COUNT(*) as count FROM admin_users');
  return row ? row.count : 0;
};

// User management (for admin dashboard)
export const getUsersPaged = async (limit: number, offset: number): Promise<any[]> => {
  const safeLimit = toSafeInt(limit, 10, 1, 500);
  const safeOffset = toSafeInt(offset, 0, 0, Number.MAX_SAFE_INTEGER);
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT id, username, phone, email, real_name, address, created_at, updated_at
     FROM users
     ORDER BY created_at DESC
     LIMIT ${safeLimit} OFFSET ${safeOffset}`
  );
  return rows as any[];
};

export const getUsersCount = async (): Promise<number> => {
  const row = await querySingle<{ count: number }>('SELECT COUNT(*) as count FROM users');
  return row ? row.count : 0;
};

export const searchUsers = async (keyword: string): Promise<any[]> => {
  const like = `%${keyword}%`;
  return queryAll<any>(
    `SELECT id, username, phone, email, real_name, address, created_at, updated_at
     FROM users
     WHERE username LIKE ? OR phone LIKE ? OR email LIKE ? OR real_name LIKE ?
     ORDER BY created_at DESC`,
    [like, like, like, like]
  );
};

export const updateUser = async (
  realName: string | null,
  address: string | null,
  email: string | null,
  userId: number
): Promise<void> => {
  await pool.execute(
    'UPDATE users SET real_name = ?, address = ?, email = ?, updated_at = NOW() WHERE id = ?',
    [realName, address, email, userId]
  );
};

export const deleteUser = async (userId: number): Promise<void> => {
  await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
};

// Parcel operations
export const createParcel = async (
  userId: number,
  trackingNumber: string,
  origin: string,
  destination: string,
  weight: number | null,
  estimatedDelivery: string | null
): Promise<number> => {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    `INSERT INTO parcels (user_id, tracking_number, origin, destination, weight, estimated_delivery)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, trackingNumber, origin, destination, weight, estimatedDelivery]
  );
  return result.insertId;
};

export const getParcelsByUserId = async (userId: number): Promise<any[]> => {
  return queryAll<any>('SELECT * FROM parcels WHERE user_id = ? ORDER BY created_at DESC', [userId]);
};

export const getParcelsPaged = async (limit: number, offset: number): Promise<any[]> => {
  const safeLimit = toSafeInt(limit, 10, 1, 500);
  const safeOffset = toSafeInt(offset, 0, 0, Number.MAX_SAFE_INTEGER);
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT * FROM parcels ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`
  );
  return rows as any[];
};

export const getParcelsCount = async (): Promise<number> => {
  const row = await querySingle<{ count: number }>('SELECT COUNT(*) as count FROM parcels');
  return row ? row.count : 0;
};

export const updateParcelStatus = async (status: string, parcelId: number): Promise<void> => {
  await pool.execute('UPDATE parcels SET status = ?, updated_at = NOW() WHERE id = ?', [status, parcelId]);
};

// Order operations
export const createOrder = async (
  userId: number,
  parcelId: number | null,
  totalAmount: number,
  currency: string,
  paymentMethod: string | null,
  notes: string | null
): Promise<number> => {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    `INSERT INTO orders (user_id, parcel_id, total_amount, currency, payment_method, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, parcelId, totalAmount, currency, paymentMethod, notes]
  );
  return result.insertId;
};

export const getOrdersByUserId = async (userId: number): Promise<any[]> => {
  return queryAll<any>('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
};

export const getOrdersPaged = async (limit: number, offset: number): Promise<any[]> => {
  const safeLimit = toSafeInt(limit, 10, 1, 500);
  const safeOffset = toSafeInt(offset, 0, 0, Number.MAX_SAFE_INTEGER);
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT * FROM orders ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`
  );
  return rows as any[];
};

export const getOrdersCount = async (): Promise<number> => {
  const row = await querySingle<{ count: number }>('SELECT COUNT(*) as count FROM orders');
  return row ? row.count : 0;
};

export const updateOrderStatus = async (status: string, orderId: number): Promise<void> => {
  await pool.execute('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, orderId]);
};

export const getPool = (): mysql.Pool => pool;
