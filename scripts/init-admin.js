/**
 * 初始化脚本：创建默认管理员账户
 * 运行: node scripts/init-admin.js
 */

(async () => {
  try {
    const Database = (await import('better-sqlite3')).default;
    const bcrypt = (await import('bcryptjs')).default;
    const path = (await import('path')).default;

    const dbPath = path.join(process.cwd(), 'data.db');
    const db = new Database(dbPath);

    // 检查管理员表是否存在
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='admin_users'
    `).get();

    if (!tableExists) {
      console.error('❌ admin_users 表不存在，请先运行服务器初始化数据库。');
      process.exit(1);
    }

    // 检查是否已存在 admin 用户
    const existingAdmin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get('admin');
    
    if (existingAdmin) {
      console.log('✓ 默认管理员账户已存在');
      console.log('  用户名: admin');
      console.log('  密码: admin123');
    } else {
      // 创建默认管理员账户
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const insert = db.prepare(`
        INSERT INTO admin_users (username, password, email, role, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      const result = insert.run('admin', hashedPassword, 'admin@rongtai.com', 'admin', 'active');
      
      console.log('✅ 默认管理员账户已创建');
      console.log('');
      console.log('📋 管理员账户信息：');
      console.log('  ID: ' + result.lastInsertRowid);
      console.log('  用户名: admin');
      console.log('  密码: admin123');
      console.log('  邮箱: admin@rongtai.com');
      console.log('  角色: admin');
      console.log('');
      console.log('🔐 请妥善保管此账户信息，建议运行后修改默认密码。');
    }

    db.close();
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
})();
