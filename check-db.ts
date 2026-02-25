import Database from 'better-sqlite3';

const db = new Database('data.db');
const result = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
console.log('总用户数:', result.cnt);
db.close();
