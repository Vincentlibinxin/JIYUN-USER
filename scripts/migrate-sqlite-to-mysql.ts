import 'dotenv/config';
import path from 'path';
import Database from 'better-sqlite3';
import mysql from 'mysql2/promise';

type TableSpec = {
  name: string;
  columns: string[];
};

const sqlitePath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data.db');
const sqlite = new Database(sqlitePath, { readonly: true });

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

const tables: TableSpec[] = [
  {
    name: 'users',
    columns: [
      'id',
      'username',
      'password',
      'phone',
      'email',
      'real_name',
      'address',
      'created_at',
      'updated_at'
    ]
  },
  {
    name: 'admin_users',
    columns: [
      'id',
      'username',
      'password',
      'email',
      'role',
      'status',
      'last_login',
      'created_at',
      'updated_at'
    ]
  },
  {
    name: 'otp_codes',
    columns: ['id', 'phone', 'code', 'expires_at', 'verified', 'created_at']
  },
  {
    name: 'parcels',
    columns: [
      'id',
      'user_id',
      'tracking_number',
      'origin',
      'destination',
      'weight',
      'status',
      'estimated_delivery',
      'created_at',
      'updated_at'
    ]
  },
  {
    name: 'orders',
    columns: [
      'id',
      'user_id',
      'parcel_id',
      'total_amount',
      'currency',
      'status',
      'payment_method',
      'notes',
      'created_at',
      'updated_at'
    ]
  }
];

const dateColumns = new Set([
  'created_at',
  'updated_at',
  'expires_at',
  'last_login',
  'estimated_delivery'
]);

const toMysqlDate = (value: Date): string => {
  const pad = (num: number): string => String(num).padStart(2, '0');
  return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())} ${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}:${pad(value.getUTCSeconds())}`;
};

const normalizeDateValue = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Date) {
    return toMysqlDate(value);
  }
  if (typeof value === 'string' && value.includes('T')) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return toMysqlDate(parsed);
    }
  }
  return value;
};

const batchInsert = async (
  connection: mysql.PoolConnection,
  table: TableSpec,
  rows: Record<string, any>[],
  batchSize: number
): Promise<void> => {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    if (batch.length === 0) {
      continue;
    }
    const values = batch.map((row) =>
      table.columns.map((col) =>
        dateColumns.has(col) ? normalizeDateValue(row[col]) : row[col]
      )
    );
    const sql = `INSERT INTO ${table.name} (${table.columns.join(', ')}) VALUES ?`;
    await connection.query(sql, [values]);
  }
};

const ensureSchema = async (connection: mysql.PoolConnection): Promise<void> => {
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
};

const migrate = async (): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    await ensureSchema(connection);
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.beginTransaction();

    for (const table of tables) {
      const stmt = sqlite.prepare(`SELECT ${table.columns.join(', ')} FROM ${table.name}`);
      const rows = stmt.all() as Record<string, any>[];
      if (rows.length === 0) {
        console.log(`[Skip] ${table.name} is empty`);
        continue;
      }

      console.log(`[Migrate] ${table.name}: ${rows.length} rows`);
      await batchInsert(connection, table, rows, 500);
    }

    await connection.commit();
    console.log('Migration completed successfully.');
  } catch (error) {
    await connection.rollback();
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    connection.release();
  }
};

migrate().catch((error) => {
  console.error('Unexpected migration error:', error);
  process.exit(1);
});
