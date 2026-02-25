import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);

// 中文人名数据库
const firstNames = ['李', '王', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '朱', '马', '郭', '何', '高', '林', '郑', '谢'];
const lastNames = ['伟', '娜', '芳', '敏', '静', '莉', '燕', '琳', '婷', '美', '强', '华', '明', '鹏', '军', '超', '浩', '宇', '飞', '杰', '新', '峰', '亮', '俊', '涛', '华', '辉', '聪', '龙', '博'];

// 城市
const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都', '西安', '重庆', '苏州', '长沙', '青岛', '南昌', '郑州', '福州', '昆明', '贵阳', '沈阳', '哈尔滨', '台北', '台中', '高雄', '厦门', '宁波', '天津', '南昌', '济南', '做梦'];
const districts = ['朝阳区', '浦东新区', '天河区', '罗湖区', '西湖区', '鼓楼区', '洪山区', '武侯区', '莲湖区', '渝北区', '都昌区', '淳安县', '建德市', '富阳区', '临安区', '余杭区', '下城区', '江干区', '西湖区', '拱墅区'];
const streets = ['中关村大街', '延安路', '珠江路', '欢乐谷路', '西溪路', '五一路', '起义路', '府城大街', '长安街', '花园路', '滨江路', '环城路', '江滨路', '文苑路', '翠苑路', '龙游路', '虎山路', '龙井路', '杨公堤', '白堤'];

function getRandomItem(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateChineseName(): string {
  const firstName = getRandomItem(firstNames);
  const lastName = getRandomItem(lastNames);
  return firstName + lastName;
}

function generatePhoneNumber(): string {
  const prefix = ['13', '14', '15', '16', '17', '18', '19'][Math.floor(Math.random() * 7)];
  const middle = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const end = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return prefix + middle + end;
}

function generateEmail(): string {
  const username = `user${Math.floor(Math.random() * 10000000)}`;
  const domains = ['gmail.com', 'outlook.com', 'qq.com', 'sina.com', '163.com', 'yeah.net', 'hotmail.com', 'yahoo.com'];
  return username + '@' + getRandomItem(domains);
}

function generateAddress(): string {
  const city = getRandomItem(cities);
  const district = getRandomItem(districts);
  const street = getRandomItem(streets);
  const number = Math.floor(Math.random() * 500) + 1;
  return `${city}${district}${street}${number}号`;
}

function generateRandomDate(): string {
  const now = new Date();
  const months = 12;
  const randomTime = now.getTime() - Math.random() * months * 30 * 24 * 60 * 60 * 1000;
  return new Date(randomTime).toISOString();
}

async function seedUsers() {
  const BATCH_SIZE = 1000;
  const COUNT = 100000;
  
  // 检查已有的记录数
  const existingCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  const remaining = Math.max(0, COUNT - existingCount);
  
  if (remaining === 0) {
    console.log(`數據庫已有${existingCount}條記錄，達到目標數量，無需添加。`);
    db.close();
    return;
  }
  
  console.log(`數據庫已有${existingCount}條記錄，需要添加${remaining}條達到${COUNT}個目標...`);
  const startTime = Date.now();
  const startIndex = existingCount;

  const insert = db.prepare(`
    INSERT INTO users (username, password, phone, email, real_name, address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const usedUsernames = new Set<string>();
  const usedPhones = new Set<string>();
  const usedEmails = new Set<string>();
  let successCount = 0;
  let errorCount = 0;

  // 使用事务来提高性能
  const insertBatch = db.transaction((batch: Array<[string, string, string, string, string, string, string]>) => {
    for (const data of batch) {
      try {
        insert.run(...data);
        successCount++;
      } catch (err) {
        errorCount++;
      }
    }
  });

  for (let i = 0; i < remaining; i += BATCH_SIZE) {
    const batch: Array<[string, string, string, string, string, string, string]> = [];
    const batchEnd = Math.min(i + BATCH_SIZE, remaining);

    for (let j = i; j < batchEnd; j++) {
      const userIndex = startIndex + j;
      let username = `user_${userIndex}`;
      let attempts = 0;
      while (usedUsernames.has(username) && attempts < 5) {
        username = `user_${userIndex}_${Math.random().toString(36).substr(2, 5)}`;
        attempts++;
      }

      let phone = generatePhoneNumber();
      attempts = 0;
      while (usedPhones.has(phone) && attempts < 5) {
        phone = generatePhoneNumber();
        attempts++;
      }

      let email = generateEmail();
      attempts = 0;
      while (usedEmails.has(email) && attempts < 5) {
        email = generateEmail();
        attempts++;
      }

      const realName = generateChineseName();
      const address = generateAddress();
      const password = await bcrypt.hash(`pass_${userIndex}123`, 6); // 降低加密难度加快速度
      const createdAt = generateRandomDate();

      usedUsernames.add(username);
      usedPhones.add(phone);
      usedEmails.add(email);

      batch.push([username, password, phone, email, realName, address, createdAt]);
    }

    insertBatch(batch);

    const progress = existingCount + Math.min(i + BATCH_SIZE, remaining);
    const percentage = ((progress / COUNT) * 100).toFixed(1);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✓ 已插入 ${progress.toLocaleString()} 條記錄 (${percentage}%) - 耗時 ${elapsed}s`);
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log('\n====== 數據插入完成 ======');
  console.log(`✓ 新增: ${remaining.toLocaleString()} 條會員數據`);
  console.log(`⏱ 耗時: ${duration.toFixed(2)} 秒`);
  console.log(`⚡ 平均速度: ${(remaining / duration).toFixed(0)} 條/秒`);

  // 验证数据
  const count = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  console.log(`\n數據庫用戶總數: ${count.count.toLocaleString()}`);

  // 示例数据
  const samples = db.prepare('SELECT id, username, phone, email, real_name FROM users ORDER BY id DESC LIMIT 5').all();
  console.log('\n最近添加的5條樣本數據:');
  samples.forEach((user: any, index: number) => {
    console.log(`  ${index + 1}. ${user.username} - ${user.real_name} (${user.phone})`);
  });
  
  db.close();
}

seedUsers().catch(console.error);
