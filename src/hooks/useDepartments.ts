import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export interface Department {
  id: string;
  name: string;
  description: string | null;
  employees: number;
  services: number;
  activeClients: number;
  createdAt: string;
  updatedAt: string;
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Department[]>('/departments');
      setDepartments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch departments');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (department: Partial<Department>) => {
    try {
      const newDepartment = await apiClient.post<Department>('/departments', department);
      setDepartments([newDepartment, ...departments]);
      return newDepartment;
    } catch (err: any) {
      setError(err.message || 'Failed to create department');
      throw err;
    }
  };

  const updateDepartment = async (id: string, updates: Partial<Department>) => {
    try {
      const updated = await apiClient.patch<Department>(`/departments/${id}`, updates);
      setDepartments(departments.map(d => d.id === id ? updated : d));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update department');
      throw err;
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      await apiClient.delete(`/departments/${id}`);
      setDepartments(departments.filter(d => d.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete department');
      throw err;
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    refetch: fetchDepartments,
  };
}
