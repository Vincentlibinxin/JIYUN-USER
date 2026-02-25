const testPhone = '0912345678';
let testCode = '123456'; // 这是一个测试，稍后会用实际的
const testUsername = 'testuser123';
const testPassword = 'TestPass123';

async function testRegister() {
  console.log('\n=== 测试注册流程 ===\n');

  // 步骤1: 发送短信
  console.log('步骤1: 发送短信验证码...');
  try {
    const smsResponse = await fetch('http://localhost:3001/api/auth/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone })
    });
    const smsData = await smsResponse.json();
    console.log('状态:', smsResponse.status);
    console.log('响应:', smsData);

    if (!smsResponse.ok) {
      console.error('发送短信失败');
      return;
    }
  } catch (error) {
    console.error('发送短信请求失败:', error.message);
    return;
  }

  // 步骤2: 等待一秒后验证码（使用从数据库获取的实际代码）
  console.log('\n步骤2: 从数据库获取实际验证码...');
  
  // 延迟2秒以确保SMS已处理
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    const Database = (await import('better-sqlite3')).default;
    const path = (await import('path')).default;
    const dbPath = path.join(process.cwd(), 'data.db');
    const db = new Database(dbPath);
    const otp = db.prepare(`
      SELECT code FROM otp_codes 
      WHERE phone = ? 
      ORDER BY created_at DESC LIMIT 1
    `).get(testPhone);
    
    db.close();
    
    if (otp) {
      testCode = otp.code;
      console.log('获取到验证码:', testCode);
    } else {
      console.error('数据库中没有找到验证码记录');
      return;
    }
  } catch (error) {
    console.error('获取验证码失败:', error.message);
    return;
  }

  // 步骤3: 验证代码
  console.log('\n步骤3: 验证代码...');
  try {
    const verifyResponse = await fetch('http://localhost:3001/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone, code: testCode })
    });
    const verifyData = await verifyResponse.json();
    console.log('状态:', verifyResponse.status);
    console.log('响应:', verifyData);

    if (!verifyResponse.ok) {
      console.error('验证代码失败');
      return;
    }
  } catch (error) {
    console.error('验证代码请求失败:', error.message);
    return;
  }

  // 步骤4: 注册账户
  console.log('\n步骤4: 注册账户...');
  try {
    const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        password: testPassword,
        phone: testPhone,
        email: 'test@example.com'
      })
    });
    const registerData = await registerResponse.json();
    console.log('状态:', registerResponse.status);
    console.log('响应:', registerData);

    if (registerResponse.ok) {
      console.log('\n✅ 注册成功！');
      console.log('Token:', registerData.token);
      console.log('用户信息:', registerData.user);
    } else {
      console.log('\n❌ 注册失败！');
    }
  } catch (error) {
    console.error('注册请求失败:', error.message);
  }
}

testRegister().catch(console.error);
