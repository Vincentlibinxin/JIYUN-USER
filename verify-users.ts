import Database from 'better-sqlite3';

const db = new Database('data.db');

const result = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
console.log('✓ 总用户数:', result.cnt.toLocaleString('zh-CN'));

// 获取样本
const samples = db.prepare('SELECT id, username, phone, email, real_name, address FROM users ORDER BY RANDOM() LIMIT 5').all();
console.log('\n随机样本数据:');
samples.forEach((user, idx) => {
  console.log(`${idx + 1}. ${user.real_name} (${user.username})`);
  console.log(`   电话: ${user.phone}`);
  console.log(`   邮箱: ${user.email}`);
  console.log(`   地址: ${user.address}\n`);
});

// 分页测试
const totalPages = Math.ceil(result.cnt / 10);
console.log('\n分页测试 (每页10条):');
console.log(`- 总用户数: ${result.cnt.toLocaleString('zh-CN')}`);
console.log(`- 总页数: ${totalPages.toLocaleString('zh-CN')}`);

// 获取各页的数据
const page1 = db.prepare('SELECT * FROM users LIMIT 10 OFFSET 0').all();
const page100 = db.prepare('SELECT * FROM users LIMIT 10 OFFSET 990').all();
const lastPage = db.prepare('SELECT * FROM users LIMIT 10 OFFSET 99990').all();

console.log(`- 第1页: ${page1.length} 条`);
console.log(`- 第100页: ${page100.length} 条`);
console.log(`- 第10000页: ${lastPage.length} 条`);

db.close();
