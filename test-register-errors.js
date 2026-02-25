/**
 * 测试场景：用户没有验证手机号就点击立即注册
 */

const testUsername = 'newuser456';
const testPassword = 'NewPass456';
const testPhone = '0987654321'; // 一个新的手机号（未通过短信验证）
const testEmail = 'newuser@example.com';

async function testRegisterWithoutVerification() {
  console.log('\n=== 测试场景：未验证手机号直接注册 ===\n');

  console.log('场景: 用户输入用户名、密码和手机号，但没有验证手机号，直接点击"立即注册"');
  console.log('预期结果: 后端应该返回错误"请先验证手机号码"');
  console.log('');

  try {
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
    console.log('响应状态码:', registerResponse.status);
    console.log('响应数据:', registerData);

    if (!registerResponse.ok) {
      console.log('\n✅ 返回了错误（预期行为）');
      console.log('错误消息:', registerData.error);
    } else {
      console.log('\n❌ 注册成功（不应该发生）');
    }
  } catch (error) {
    console.error('请求失败:', error.message);
  }
}

/**
 * 测试场景2: 使用已经注册过的手机号
 */
async function testRegisterWithDuplicatePhone() {
  console.log('\n\n=== 测试场景：使用已注册的手机号 ===\n');

  // 首先创建一个用户
  const phone1 = '0988888888';
  const username1 = 'user1';
  const password1 = 'Pass1234';

  // 发送短信
  console.log('1. 为电话号码发送短信:', phone1);
  const smsResponse = await fetch('http://localhost:3001/api/auth/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phone1 })
  });
  
  if (!smsResponse.ok) {
    console.error('SMS发送失败');
    return;
  }
  console.log('✓ SMS已发送');

  // 获取验证码
  await new Promise(resolve => setTimeout(resolve, 2000));
  const Database = (await import('better-sqlite3')).default;
  const path = (await import('path')).default;
  const dbPath = path.join(process.cwd(), 'data.db');
  const db = new Database(dbPath);
  const otp = db.prepare(`
    SELECT code FROM otp_codes 
    WHERE phone = ? 
    ORDER BY created_at DESC LIMIT 1
  `).get(phone1);
  
  if (!otp) {
    console.error('未找到OTP');
    db.close();
    return;
  }
  
  const code1 = otp.code;
  console.log('2. 获取到验证码:', code1);

  // 验证码
  const verifyResponse = await fetch('http://localhost:3001/api/auth/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phone1, code: code1 })
  });
  
  if (!verifyResponse.ok) {
    console.error('验证失败');
    db.close();
    return;
  }
  console.log('✓ 验证码已验证');

  // 注册第一个用户
  const register1Response = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username1,
      password: password1,
      phone: phone1,
      email: 'user1@example.com'
    })
  });
  
  const register1Data = await register1Response.json();
  if (register1Response.ok) {
    console.log('✓ 第一个用户注册成功');
  } else {
    console.error('第一个用户注册失败:', register1Data.error);
    db.close();
    return;
  }

  // 现在尝试用同一个手机号注册另一个用户
  console.log('\n3. 尝试用同一个手机号注册新用户...');
  
  // 再次发送短信
  const smsResponse2 = await fetch('http://localhost:3001/api/auth/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phone1 })
  });
  
  if (!smsResponse2.ok) {
    console.log('✓ SMS发送被正确拒绝：', (await smsResponse2.json()).error);
    db.close();
    return;
  }

  db.close();
}

await testRegisterWithoutVerification();
await testRegisterWithDuplicatePhone();
console.log('\n测试完成！\n');
