/**
 * 浏览器中使用的诊断脚本 - 通过浏览器console执行
 * 这会测试各个注册步骤，并显示具体的API响应
 */

(async function() {
  const uniqueId = Date.now();
  const testPhone = `09${String(uniqueId).slice(-8)}`;
  const testUsername = `testuser${uniqueId}`;
  const testPassword = 'TestPass123';
  const testEmail = `test${uniqueId}@example.com`;

  console.log('%c=== 浏览器中的注册诊断 ===', 'color: #00ff00; font-size: 16px; font-weight: bold');
  console.log('用户名:', testUsername);
  console.log('手机号:', testPhone);
  console.log('密码:', testPassword);

  // 测试1: 发送SMS
  console.log('\n%c步骤1: 测试发送SMS...', 'color: #0099ff; font-weight: bold');
  try {
    const smsResponse = await fetch('http://localhost:3001/api/auth/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone })
    });
    
    const smsData = await smsResponse.json();
    console.log('响应状态:', smsResponse.status);
    console.log('响应数据:', smsData);
    
    if (!smsResponse.ok) {
      console.error('%c❌ SMS发送失败', 'color: red');
      return;
    }
    console.log('%c✓ SMS已发送', 'color: green');
  } catch (error) {
    console.error('%c❌ 请求失败:', 'color: red', error);
    return;
  }

  // 测试2: 等待并获取验证码（模拟用户输入）
  console.log('\n%c步骤2: 获取验证码...', 'color: #0099ff; font-weight: bold');
  
  // 在真实的浏览器中，用户会通过短信收到验证码
  // 这里我们使用一个假的验证码来测试验证端点
  const testCode = '000000';
  console.log('使用测试验证码:', testCode);

  // 测试3: 验证代码
  console.log('\n%c步骤3: 验证代码...', 'color: #0099ff; font-weight: bold');
  try {
    const verifyResponse = await fetch('http://localhost:3001/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone, code: testCode })
    });
    
    const verifyData = await verifyResponse.json();
    console.log('响应状态:', verifyResponse.status);
    console.log('响应数据:', verifyData);
    
    if (!verifyResponse.ok) {
      console.log('%c验证代码失败（预期行为，测试码无效）', 'color: orange');
      console.log('错误:', verifyData.error);
    } else {
      console.log('%c✓ 验证码已验证', 'color: green');
    }
  } catch (error) {
    console.error('%c❌ 验证请求失败:', 'color: red', error);
  }

  // 测试4: 注册（使用无效的验证码）
  console.log('\n%c步骤4: 尝试注册（未通过验证码）...', 'color: #0099ff; font-weight: bold');
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
    console.log('响应状态:', registerResponse.status);
    console.log('响应数据:', registerData);
    
    if (!registerResponse.ok) {
      console.log('%c❌ 注册失败（预期行为）', 'color: blue');
      console.log('错误:', registerData.error);
    } else {
      console.log('%c✓ 注册成功', 'color: green');
    }
  } catch (error) {
    console.error('%c❌ 注册请求失败:', 'color: red', error);
  }

  console.log('\n%c=== 诊断完成 ===', 'color: #00ff00; font-size: 16px; font-weight: bold');
  console.log('%c提示: 如果看到任何红色错误，说明有问题', 'color: orange');
})();
