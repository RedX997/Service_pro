import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Employee } from '@/types';
import { employeeService } from '@/services';
import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace('/api', '');

export const useEmployees = () => {
  const queryClient = useQueryClient();

  // Listen for real-time employee creation from cascade admin
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('employee:created', () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    });
    socket.on('user:created', () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    });
    return () => { socket.disconnect(); };
  }, [queryClient]);

  return useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll(),
    refetchInterval: 30000, // also poll every 30s as fallback
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employee: Omit<Employee, 'id' | 'joinDate' | 'createdAt'>) =>
      employeeService.create(employee as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Employee> }) =>
      employeeService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
