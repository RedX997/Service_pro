import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface Appointment {
  id: string;
  clientId: string;
  employeeId: string;
  contactPerson: string;
  date: string;
  time: string;
  duration: string;
  type: 'in-person' | 'video' | 'phone';
  purpose: string;
  notes?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  meetingLink?: string;
  location?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  clientId: string;
  employeeId: string;
  contactPerson: string;
  date: string;
  time: string;
  duration: string;
  type: 'in-person' | 'video' | 'phone';
  purpose: string;
  notes?: string;
  meetingLink?: string;
  location?: string;
  phoneNumber?: string;
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all appointments
  const fetchAppointments = async (filters?: {
    employeeId?: string;
    clientId?: string;
    status?: string;
    date?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.employeeId) params.append('employeeId', filters.employeeId);
      if (filters?.clientId) params.append('clientId', filters.clientId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.date) params.append('date', filters.date);

      const response = await fetch(`${API_URL}/appointments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');

      const data = await response.json();
      setAppointments(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's appointments
  const fetchTodayAppointments = async (employeeId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (employeeId) params.append('employeeId', employeeId);

      const response = await fetch(`${API_URL}/appointments/today?${params}`);
      if (!response.ok) throw new Error('Failed to fetch today\'s appointments');

      const data = await response.json();
      setAppointments(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load today\'s appointments',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create appointment
  const createAppointment = async (data: CreateAppointmentData) => {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create appointment');
      }

      const newAppointment = await response.json();
      
      // Optimistically update local state
      setAppointments(prev => [...prev, newAppointment]);

      toast({
        title: 'Success',
        description: 'Appointment created successfully',
      });

      return newAppointment;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Update appointment
  const updateAppointment = async (id: string, data: Partial<CreateAppointmentData>) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update appointment');
      }

      const updated = await response.json();
      
      // Update local state
      setAppointments(prev =>
        prev.map(apt => (apt.id === id ? updated : apt))
      );

      toast({
        title: 'Success',
        description: 'Appointment updated successfully',
      });

      return updated;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Cancel appointment
  const cancelAppointment = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}/cancel`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to cancel appointment');

      const updated = await response.json();
      
      // Update local state
      setAppointments(prev =>
        prev.map(apt => (apt.id === id ? updated : apt))
      );

      toast({
        title: 'Success',
        description: 'Appointment cancelled successfully',
      });

      return updated;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Start appointment
  const startAppointment = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}/start`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to start appointment');

      const updated = await response.json();
      
      // Update local state
      setAppointments(prev =>
        prev.map(apt => (apt.id === id ? updated : apt))
      );

      return updated;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Complete appointment
  const completeAppointment = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}/complete`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to complete appointment');

      const updated = await response.json();
      
      // Update local state
      setAppointments(prev =>
        prev.map(apt => (apt.id === id ? updated : apt))
      );

      toast({
        title: 'Success',
        description: 'Appointment marked as completed',
      });

      return updated;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Delete appointment
  const deleteAppointment = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete appointment');

      // Remove from local state
      setAppointments(prev => prev.filter(apt => apt.id !== id));

      toast({
        title: 'Success',
        description: 'Appointment deleted successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Load appointments on mount
  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    fetchTodayAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    startAppointment,
    completeAppointment,
    deleteAppointment,
    refetch: fetchTodayAppointments,
  };
}
