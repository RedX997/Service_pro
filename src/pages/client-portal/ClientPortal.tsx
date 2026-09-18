/**
 * ClientPortal.tsx — Main entry point for the CA Client Portal
 * Accessed via /client/* routes
 * Uses email/password authentication
 */
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ClientPortalLayout from './ClientPortalLayout';
import ClientDashboard from './ClientDashboard';
import ClientServices from './ClientServices';
import ClientDeadlines from './ClientDeadlines';
import ClientProfilePage from './ClientProfilePage';
import ClientMessages from './ClientMessages';
import ClientPortalAuthPage from './ClientPortalAuthPage';

const STORAGE_KEY = 'client_portal_session';
const TOKEN_KEY = 'client_portal_token';

export default function ClientPortal() {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    if (clientId) {
      // Fetch client name for display
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      fetch(`${API_URL}/client-portal/profile`, {
        headers: { 'x-client-id': clientId, 'Content-Type': 'application/json' },
      })
        .then(r => r.json())
        .then(d => setClientName(d.client?.name || 'Client'))
        .catch(() => setClientName('Client'));
    }
  }, [clientId]);

  const handleLogin = (id: string, name: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setClientId(id);
    setClientName(name);
    navigate('/client/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setClientId(null);
    setClientName('');
    navigate('/client/login');
  };

  const handleSwitchCompany = (newClientId: string) => {
    localStorage.setItem(STORAGE_KEY, newClientId);
    setClientId(newClientId);
    navigate('/client/dashboard');
  };

  if (!clientId) {
    return (
      <Routes>
        <Route path="login" element={<ClientPortalAuthPage onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/client/login" replace />} />
      </Routes>
    );
  }

  return (
    <ClientPortalLayout
      clientId={clientId}
      clientName={clientName}
      onLogout={handleLogout}
      onSwitchCompany={handleSwitchCompany}
    >
      <Routes>
        <Route path="dashboard" element={<ClientDashboard clientId={clientId} />} />
        <Route path="services" element={<ClientServices clientId={clientId} />} />
        <Route path="deadlines" element={<ClientDeadlines clientId={clientId} />} />
        <Route path="profile" element={<ClientProfilePage clientId={clientId} />} />
        <Route path="messages" element={<ClientMessages clientId={clientId} clientName={clientName} />} />
        <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
      </Routes>
    </ClientPortalLayout>
  );
}
