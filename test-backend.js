// Test script to check backend endpoints
import axios from 'axios';

const baseURL = 'https://servicepro-backend.onrender.com/api';

async function testEndpoints() {
    console.log('Testing backend endpoints...\n');
    
    try {
        // Test time-entries POST (start timer) with real IDs
        console.log('Testing time-entries POST (start timer) with real IDs...');
        const startTimer = await axios.post(`${baseURL}/time-entries/start`, {
            employeeId: 'ad10385f-5277-4a20-a64b-c3abdc41b6f1', // Priya Mehta (Manager)
            clientId: '4d9523ed-99ba-45ea-92ac-b63cc15b7041', // DDTC
            serviceId: 'ITR Filing',
            notes: 'Test timer'
        });
        console.log('✅ Start timer:', startTimer.data);
        
    } catch (error) {
        console.error('❌ Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
    }
}

testEndpoints();