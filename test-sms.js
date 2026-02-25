/**
 * SMS Diagnostic Test
 * This script tests SMS verification code sending
 */

const API_BASE = 'http://localhost:3001/api';

async function testSMSSending() {
  console.log('🔍 Starting SMS Diagnostic Test...\n');

  // Test 1: Valid phone format
  const testPhone = '0912345678';
  
  console.log(`📱 Test Phone: ${testPhone}`);
  console.log(`🌍 E164 Format: +886${testPhone.substring(1)}\n`);

  try {
    console.log('📤 Sending SMS request...');
    const response = await fetch(`${API_BASE}/auth/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: testPhone }),
    });

    const data = await response.json();
    
    console.log(`✅ Response Status: ${response.status}`);
    console.log(`📋 Response Data:`, JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SMS sent successfully!');
      
      // Test 2: Try to verify with a dummy code
      console.log('\n📝 Now testing code verification endpoint...');
      const verifyResponse = await fetch(`${API_BASE}/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: testPhone, code: '000000' }),
      });
      
      const verifyData = await verifyResponse.json();
      console.log(`Verify Response:`, JSON.stringify(verifyData, null, 2));
    } else {
      console.log('\n❌ SMS sending failed!');
      
      if (data.error) {
        console.log(`Error: ${data.error}`);
        
        // Provide troubleshooting suggestions
        console.log('\n🔧 Troubleshooting:');
        if (data.error.includes('SUBMAIL')) {
          console.log('- Check SUBMAIL_APPID and SUBMAIL_APPKEY in .env');
          console.log('- Verify account has SMS balance');
          console.log('- Check if country/number is allowed');
        } else if (data.error.includes('registered')) {
          console.log('- This phone number is already registered');
          console.log('- Use a different phone number for testing');
        } else if (data.error.includes('format')) {
          console.log('- Phone format must be 09xxxxxxxx (10 digits)');
        }
      }
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure backend server is running on port 3001');
    console.log('- Check firewall settings');
    console.log('- Verify API_BASE URL is correct');
  }
}

// Run the test
testSMSSending().then(() => {
  console.log('\n✅ Diagnostic test completed');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
