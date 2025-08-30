// Simple test to debug login issues
const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
        trustDevice: false
      })
    });
    
    const responseText = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', responseText);
    
    if (response.status === 500) {
      console.log('Server error detected');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testLogin();