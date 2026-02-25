/**
 * 完整的注册流程测试 - 模拟真实用户行为
 */

async function completeRegistrationFlow() {
  const uniqueId = Date.now();
  const testPhone = `09${String(uniqueId).slice(-8)}`; // 动态生成手机号
  const testUsername = `testuser${uniqueId}`;
  const testPassword = 'TestPass123';
  const testEmail = `test${uniqueId}@example.com`;

  console.log('\n=== 完整注册流程测试 ===');
  console.log('用户名:', testUsername);
  console.log('手机号:', testPhone);
  console.log('密码:', testPassword);
  console.log('邮箱:', testEmail);
  console.log('');

  // 步骤1: 发送短信
  console.log('步骤1: 发送短信...');
  const smsResponse = await fetch('http://localhost:3001/api/auth/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: testPhone })
  });
  
  if (!smsResponse.ok) {
    console.error('❌ 发送短信失败:', await smsResponse.json());
    return;
  }
  console.log('✓ SMS已发送');

  // 步骤2: 从数据库获取验证码
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('步骤2: 获取验证码...');
  let testCode;
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
    
    if (!otp) {
      console.error('❌ 数据库中没有找到验证码');
      db.close();
      return;
    }
    
    testCode = otp.code;
    console.log('✓ 验证码:', testCode);
    db.close();
  } catch (error) {
    console.error('❌ 获取验证码失败:', error.message);
    return;
  }

  // 步骤3: 验证代码
  console.log('步骤3: 验证代码...');
  const verifyResponse = await fetch('http://localhost:3001/api/auth/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: testPhone, code: testCode })
  });
  
  if (!verifyResponse.ok) {
    console.error('❌ 验证失败:', await verifyResponse.json());
    return;
  }
  console.log('✓ 验证码已验证');

  // 步骤4: 注册账户
  console.log('步骤4: 提交注册表单...');
  console.log('发送数据:');
  console.log('  - username:', testUsername);
  console.log('  - password:', testPassword);
  console.log('  - phone:', testPhone);
  console.log('  - email:', testEmail);

  const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: testUsername,
      password: testPassword,
      phone: testPhone,
      email: testEmail
    })
  });

  const registerData = await registerResponse.json();
  
  console.log('响应状态:', registerResponse.status);
  console.log('响应数据:', registerData);

  if (registerResponse.ok) {
    console.log('\n✅ 注册成功！');
    console.log('Token:', registerData.token);
    console.log('用户:', registerData.user);
  } else {
    console.log('\n❌ 注册失败！');
    console.log('错误:', registerData.error);
  }
}

await completeRegistrationFlow();
console.log('\n');
