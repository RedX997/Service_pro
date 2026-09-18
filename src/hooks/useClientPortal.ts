import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

function portalHeaders(clientId: string) {
  return { 'Content-Type': 'application/json', 'x-client-id': clientId };
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export const useClientDashboard = (clientId: string) =>
  useQuery({
    queryKey: ['client-portal-dashboard', clientId],
    queryFn: async () => {
      const r = await fetch(`${API_URL}/client-portal/dashboard`, { headers: portalHeaders(clientId) });
      if (!r.ok) throw new Error('Failed to load dashboard');
      return r.json();
    },
    enabled: !!clientId,
    refetchInterval: 30000,
  });

// ── Profile ────────────────────────────────────────────────────────────────────
export const useClientProfile = (clientId: string) =>
  useQuery({
    queryKey: ['client-portal-profile', clientId],
    queryFn: async () => {
      const r = await fetch(`${API_URL}/client-portal/profile`, { headers: portalHeaders(clientId) });
      if (!r.ok) throw new Error('Failed to load profile');
      return r.json();
    },
    enabled: !!clientId,
  });

export const useSaveClientProfile = (clientId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const r = await fetch(`${API_URL}/client-portal/profile`, {
        method: 'POST',
        headers: portalHeaders(clientId),
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error('Failed to save profile');
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-portal-profile', clientId] }),
  });
};

// ── Services ───────────────────────────────────────────────────────────────────
export const useClientServices = (clientId: string) =>
  useQuery({
    queryKey: ['client-portal-services', clientId],
    queryFn: async () => {
      const r = await fetch(`${API_URL}/client-portal/services`, { headers: portalHeaders(clientId) });
      if (!r.ok) throw new Error('Failed to load services');
      return r.json();
    },
    enabled: !!clientId,
    refetchInterval: 15000,
  });

// ── Deadlines ──────────────────────────────────────────────────────────────────
export const useClientDeadlines = (clientId: string, all = false) =>
  useQuery({
    queryKey: ['client-portal-deadlines', clientId, all],
    queryFn: async () => {
      const r = await fetch(`${API_URL}/client-portal/deadlines${all ? '?all=true' : ''}`, {
        headers: portalHeaders(clientId),
      });
      if (!r.ok) throw new Error('Failed to load deadlines');
      return r.json();
    },
    enabled: !!clientId,
    refetchInterval: 60000,
  });

// ── Companies ──────────────────────────────────────────────────────────────────
export const useClientCompanies = (clientId: string) =>
  useQuery({
    queryKey: ['client-portal-companies', clientId],
    queryFn: async () => {
      const r = await fetch(`${API_URL}/client-portal/companies`, { headers: portalHeaders(clientId) });
      if (!r.ok) throw new Error('Failed to load companies');
      return r.json();
    },
    enabled: !!clientId,
  });
