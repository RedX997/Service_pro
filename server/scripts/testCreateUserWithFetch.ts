async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/cascade-admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': '12'
      },
      body: JSON.stringify({
        fullName: 'Test Email Delivery',
        personalEmail: 'redx13503@gmail.com', // Verified email to check delivery logic
        role: 'receptionist'
      })
    });
    const data = await res.json();
    console.log('✅ Response:', res.status, data);
  } catch (err: any) {
    console.error('❌ Error:', err.message);
  }
}

test();
