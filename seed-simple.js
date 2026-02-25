const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('data.db');

const firstNames = ['李', '王', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '朱', '马', '郭', '何', '高', '林', '郑', '谢'];
const lastNames = ['伟', '娜', '芳', '敏', '静', '莉', '燕', '琳', '婷', '美', '强', '华', '明', '鹏', '军', '超', '浩', '宇', '飞', '杰', '新', '峰', '亮', '俊', '涛', '华', '辉', '聪', '龙', '博'];
const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都', '西安', '重庆', '苏州', '长沙', '青岛', '南昌', '郑州', '福州', '昆明', '贵阳', '沈阳', '哈尔滨', '台北'];
const districts = ['朝阳区', '浦东新区', '天河区', '罗湖区', '西湖区', '鼓楼区', '洪山区', '武侯区', '莲湖区', '渝北区'];
const streets = ['中关村大街', '延安路', '珠江路', '欢乐谷路', '西溪路', '五一路', '起义路', '府城大街', '长安街', '花园路'];
const domains = ['gmail.com', 'outlook.com', 'qq.com', 'sina.com', '163.com', 'yeah.net', 'hotmail.com', 'yahoo.com'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateChineseName() {
  return getRandomItem(firstNames) + getRandomItem(lastNames);
}

function generatePhoneNumber() {
  const prefix = ['13', '14', '15', '16', '17', '18', '19'][Math.floor(Math.random() * 7)];
  const middle = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const end = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return prefix + middle + end;
}

function generateEmail() {
  const username = `user${Math.floor(Math.random() * 10000000)}`;
  return username + '@' + getRandomItem(domains);
}

function generateAddress() {
  const city = getRandomItem(cities);
  const district = getRandomItem(districts);
  const street = getRandomItem(streets);
  const number = Math.floor(Math.random() * 500) + 1;
  return `${city}${district}${street}${number}号`;
}

function generateRandomDate() {
  const now = new Date();
  const months = 12;
  const randomTime = now.getTime() - Math.random() * months * 30 * 24 * 60 * 60 * 1000;
  return new Date(randomTime).toISOString();
}

const existingCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
const TARGET = 100000;
const remaining = Math.max(0, TARGET - existingCount);

if (remaining === 0) {
  console.log(`数据库已有${existingCount}条记录，无需添加。`);
  db.close();
  process.exit(0);
}

console.log(`数据库有${existingCount}条记录，需添加${remaining}条到100000...`);

const BATCH_SIZE = 5000;
const insert = db.prepare(`INSERT INTO users (username, password, phone, email, real_name, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`);

const startTime = Date.now();
let addedCount = 0;

for (let i = 0; i < remaining; i += BATCH_SIZE) {
  const batchSize = Math.min(BATCH_SIZE, remaining - i);
  const batch = [];
  
  for (let j = 0; j < batchSize; j++) {
    const idx = existingCount + i + j;
    const username = `user_${idx}`;
    const phone = generatePhoneNumber();
    const email = generateEmail();
    const realName = generateChineseName();
    const address = generateAddress();
    const password = bcrypt.hashSync(`pass_${idx}123`, 6);
    const createdAt = generateRandomDate();
    
    batch.push([username, password, phone, email, realName, address, createdAt]);
  }
  
  const insertMany = db.transaction((items) => {
    let count = 0;
    for (const item of items) {
      insert.run(...item);
      count++;
    }
    return count;
  });
  
  addedCount += insertMany(batch);
  const now = Date.now();
  const elapsed = (now - startTime) / 1000;
  const totalCount = existingCount + addedCount;
  const percentage = ((totalCount / TARGET) * 100).toFixed(1);
  const speed = (addedCount / elapsed).toFixed(0);
  
  console.log(`✓ 已插入 ${totalCount.toLocaleString()} 条记录 (${percentage}%) - 耗时 ${elapsed.toFixed(1)}s - ${speed}条/秒`);
}

const finalCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
const totalTime = (Date.now() - startTime) / 1000;

console.log('\n====== 完成 ======');
console.log(`✓ 总用户数: ${finalCount.toLocaleString()}`);
console.log(`✓ 新增: ${addedCount.toLocaleString()}`);
console.log(`⏱ 耗时: ${totalTime.toFixed(2)}秒`);
console.log(`⚡ 速度: ${(addedCount / totalTime).toFixed(0)}条/秒`);

db.close();
