import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export default function AppointmentsDebug() {
  const [logs, setLogs] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
    console.log(message);
  };

  const testConnection = async () => {
    addLog('🔍 Testing backend connection...');
    addLog(`API URL: ${API_URL}`);
    
    try {
      const healthUrl = API_URL.replace('/api', '/health');
      addLog(`Fetching: ${healthUrl}`);
      
      const response = await fetch(healthUrl);
      const data = await response.json();
      
      addLog(`✅ Backend connected: ${JSON.stringify(data)}`);
    } catch (error: any) {
      addLog(`❌ Backend connection failed: ${error.message}`);
    }
  };

  const testGetAppointments = async () => {
    addLog('🔍 Fetching appointments...');
    
    try {
      const url = `${API_URL}/appointments`;
      addLog(`Fetching: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      setAppointments(data);
      addLog(`✅ Fetched ${data.length} appointments`);
    } catch (error: any) {
      addLog(`❌ Failed to fetch appointments: ${error.message}`);
    }
  };

  const testGetEmployees = async () => {
    addLog('🔍 Fetching employees...');
    
    try {
      const url = `${API_URL}/employees`;
      addLog(`Fetching: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      setEmployees(data);
      addLog(`✅ Fetched ${data.length} employees`);
    } catch (error: any) {
      addLog(`❌ Failed to fetch employees: ${error.message}`);
    }
  };

  const testGetClients = async () => {
    addLog('🔍 Fetching clients...');
    
    try {
      const url = `${API_URL}/clients`;
      addLog(`Fetching: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      setClients(data);
      addLog(`✅ Fetched ${data.length} clients`);
    } catch (error: any) {
      addLog(`❌ Failed to fetch clients: ${error.message}`);
    }
  };

  const testCreateAppointment = async () => {
    if (employees.length === 0 || clients.length === 0) {
      addLog('❌ Please fetch employees and clients first');
      return;
    }

    addLog('🔍 Creating test appointment...');
    
    const testData = {
      clientId: clients[0].id,
      employeeId: employees[0].id,
      contactPerson: 'Debug Test Contact',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      duration: '1h',
      type: 'in-person',
      purpose: 'Debug Test Appointment',
      notes: 'Created from debug page',
    };

    addLog(`Data: ${JSON.stringify(testData, null, 2)}`);
    
    try {
      const url = `${API_URL}/appointments`;
      addLog(`POST to: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const responseText = await response.text();
      addLog(`Response status: ${response.status}`);
      addLog(`Response body: ${responseText}`);

      if (response.ok) {
        const data = JSON.parse(responseText);
        addLog(`✅ Appointment created: ${data.id}`);
        testGetAppointments(); // Refresh list
      } else {
        addLog(`❌ Failed to create appointment: ${responseText}`);
      }
    } catch (error: any) {
      addLog(`❌ Error creating appointment: ${error.message}`);
      addLog(`Stack: ${error.stack}`);
    }
  };

  useEffect(() => {
    addLog('🚀 Debug page loaded');
    addLog(`Environment: ${import.meta.env.MODE}`);
    addLog(`API URL: ${API_URL}`);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Appointments API Debug</h1>

      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={testConnection} className="w-full">
            1. Test Backend Connection
          </Button>
          <Button onClick={testGetAppointments} className="w-full">
            2. Get All Appointments
          </Button>
          <Button onClick={testGetEmployees} className="w-full">
            3. Get Employees
          </Button>
          <Button onClick={testGetClients} className="w-full">
            4. Get Clients
          </Button>
          <Button onClick={testCreateAppointment} className="w-full" variant="destructive">
            5. Create Test Appointment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Appointments: {appointments.length}</p>
            <p>Employees: {employees.length}</p>
            <p>Clients: {clients.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Console Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointments Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
            {JSON.stringify(appointments, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
