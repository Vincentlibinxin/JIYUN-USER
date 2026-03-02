/**
 * 使用用户提供的验证码继续注册流程
 */

const testData = {
  username: '0931239181',
  phone: '0931239181',
  password: 'Qwer1234',
  email: 'test0931239181@example.com',
  verificationCode: '533694'
};

async function continueRegistration() {
  console.log('\n=== 继续注册流程 ===');
  console.log('手机号:', testData.phone);
  console.log('验证码:', testData.verificationCode);
  console.log('');

  // 步骤1: 验证代码
  console.log('✔️ 步骤1: 验证验证码...');
  try {
    const verifyResponse = await fetch('http://localhost:3007/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phone: testData.phone, 
        code: testData.verificationCode 
      })
    });
    
    const verifyData = await verifyResponse.json();
    console.log('响应状态码:', verifyResponse.status);
    console.log('响应数据:', verifyData);

    if (!verifyResponse.ok) {
      console.error('❌ 验证码验证失败!');
      console.error('错误:', verifyData.error);
      return;
    }
    console.log('✅ 验证码验证成功!\n');
  } catch (error) {
    console.error('❌ 验证请求失败:', error.message);
    return;
  }

  // 步骤2: 注册账户
  console.log('✔️ 步骤2: 提交注册表单...');
  console.log('发送数据:');
  console.log('  - username:', testData.username);
  console.log('  - password:', testData.password);
  console.log('  - phone:', testData.phone);
  console.log('  - email:', testData.email);
  console.log('');

  try {
    const registerResponse = await fetch('http://localhost:3007/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testData.username,
        password: testData.password,
        phone: testData.phone,
        email: testData.email
      })
    });

    const registerData = await registerResponse.json();
    console.log('响应状态码:', registerResponse.status);
    console.log('');

    if (registerResponse.ok) {
      console.log('✅✅✅ 注册成功！✅✅✅');
      console.log('');
      console.log('用户信息:');
      console.log('  用户ID:', registerData.user.id);
      console.log('  用户名:', registerData.user.username);
      console.log('  手机号:', registerData.user.phone);
      console.log('  邮箱:', registerData.user.email);
      console.log('');
      console.log('Token已生成:');
      console.log('  ' + registerData.token);
      console.log('');
      console.log('💡 您现在可以使用这个账号在应用中登录:');
      console.log('   用户名: ' + testData.username);
      console.log('   密码: ' + testData.password);
      console.log('');
    } else {
      console.log('❌ 注册失败!');
      console.log('错误:', registerData.error);
      console.log('响应数据:', registerData);
    }
  } catch (error) {
    console.error('❌ 注册请求失败:', error.message);
  }
}

continueRegistration().catch(console.error);
