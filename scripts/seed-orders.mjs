import Database from 'better-sqlite3';

const db = new Database('data.db');

const getUserIds = db.prepare('SELECT id FROM users');
const userIds = getUserIds.all().map((row) => row.id);

if (userIds.length === 0) {
  console.error('No users found. Seed users before orders.');
  process.exit(1);
}

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentMethods = ['card', 'bank_transfer', 'cash', 'apple_pay', 'line_pay'];

const insertOrder = db.prepare(`
  INSERT INTO orders (user_id, parcel_id, total_amount, currency, status, payment_method, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const countOrders = db.prepare('SELECT COUNT(*) as count FROM orders');
const beforeCount = countOrders.get().count;

const seedCount = 1000;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomAmount = () => Number((Math.random() * 1950 + 50).toFixed(2));

const insertMany = db.transaction((count) => {
  for (let i = 0; i < count; i += 1) {
    const userId = pick(userIds);
    const amount = randomAmount();
    const status = pick(statuses);
    const payment = pick(paymentMethods);
    const notes = Math.random() < 0.2 ? 'Auto seeded order' : null;
    insertOrder.run(userId, null, amount, 'TWD', status, payment, notes);
  }
});

insertMany(seedCount);

const afterCount = countOrders.get().count;

console.log(JSON.stringify({
  before: beforeCount,
  inserted: seedCount,
  after: afterCount
}, null, 2));
