/**
 * 用户测试：使用具体的账号信息测试注册
 */

const testData = {
  username: '0931239181',
  phone: '0931239181',
  password: 'Qwer1234',
  email: 'test0931239181@example.com'
};

async function testRegistration() {
  console.log('\n=== 用户账号测试 ===');
  console.log('用户名:', testData.username);
  console.log('手机号:', testData.phone);
  console.log('密码:', testData.password);
  console.log('邮箱:', testData.email);
  console.log('');

  // 步骤1: 发送短信验证码
  console.log('📱 步骤1: 发送短信验证码到', testData.phone);
  console.log('正在连接SUBMAIL服务...\n');
  
  try {
    const smsResponse = await fetch('http://localhost:3001/api/auth/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testData.phone })
    });
    
    const smsData = await smsResponse.json();
    
    if (smsResponse.ok) {
      console.log('✅ SMS已成功发送！');
      console.log('响应:', smsData);
      console.log('');
      console.log('📧 请检查您的手机短信，应该会收到从榕台海峽快運发送的验证码');
      console.log('验证码格式: 【榕台海峽快運】您的驗證碼：XXXXXX，請在10分鐘內輸入。');
      console.log('');
      console.log('请提供您收到的6位验证码，我将继续进行验证和注册。');
      console.log('');
    } else {
      console.error('❌ SMS发送失败!');
      console.error('错误信息:', smsData.error);
      return;
    }
  } catch (error) {
    console.error('❌ 发送请求失败:', error.message);
    return;
  }
}

// 执行测试
testRegistration().catch(console.error);
