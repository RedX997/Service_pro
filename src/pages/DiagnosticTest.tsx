import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function DiagnosticTest() {
  const { user } = useAuth();
  const [apiTest, setApiTest] = useState<any>(null);
  const [envVars, setEnvVars] = useState<any>(null);

  useEffect(() => {
    // Test environment variables
    const env = {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_USE_API: import.meta.env.VITE_USE_API,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD
    };
    setEnvVars(env);

    // Test API connection
    const testApi = async () => {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      
      try {
        const response = await fetch(`${API_URL}/notifications/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id || 1 })
        });
        const data = await response.json();
        setApiTest({
          success: true,
          url: `${API_URL}/notifications?userId=${user?.id || 1}`,
          status: response.status,
          data
        });
      } catch (error: any) {
        setApiTest({
          success: false,
          url: `${API_URL}/notifications?userId=${user?.id || 1}`,
          error: error.message
        });
      }
    };

    testApi();
  }, [user]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Diagnostic Test</h1>

      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Environment Variables */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(envVars, null, 2)}
          </pre>
          {!envVars?.VITE_API_BASE_URL && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
              <p className="text-red-700 font-semibold">⚠️ VITE_API_BASE_URL is not set!</p>
              <p className="text-sm text-red-600 mt-2">
                This is why notifications aren't working. You need to add this environment variable in Vercel.
              </p>
            </div>
          )}
        </div>

        {/* API Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">API Connection Test</h2>
          {apiTest ? (
            <>
              <div className={`p-4 rounded mb-4 ${apiTest.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className={`font-semibold ${apiTest.success ? 'text-green-700' : 'text-red-700'}`}>
                  {apiTest.success ? '✅ API Connected' : '❌ API Connection Failed'}
                </p>
                <p className="text-sm mt-2">URL: {apiTest.url}</p>
                {apiTest.status && <p className="text-sm">Status: {apiTest.status}</p>}
              </div>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(apiTest, null, 2)}
              </pre>
            </>
          ) : (
            <p>Testing...</p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">How to Fix</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Go to Vercel Dashboard</li>
            <li>Click on your project: servicepro-frontend</li>
            <li>Go to Settings → Environment Variables</li>
            <li>Add: VITE_API_BASE_URL = https://servicepro-backend.onrender.com/api</li>
            <li>Add: VITE_USE_API = true</li>
            <li>Redeploy the frontend</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
