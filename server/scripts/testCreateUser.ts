import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/cascade-admin/users', {
      fullName: 'Test Verification',
      personalEmail: 'redx13503@gmail.com', // Sending back to source to verify it can send
      role: 'receptionist'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': '1' // Using an ID that should bypass checks if it's admin
      }
    });
    console.log('✅ Response:', res.status, res.data);
  } catch (err: any) {
    console.error('❌ Error:', err.response?.status, err.response?.data || err.message);
  }
}

test();
