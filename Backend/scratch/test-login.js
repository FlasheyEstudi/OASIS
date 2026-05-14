
const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'juan@oasis.ni',
      password: 'Oasis2025!'
    });
    console.log('Login success:', response.status, response.data);
  } catch (error) {
    console.error('Login failed:', error.response?.status, error.response?.data || error.message);
  }
}

testLogin();
