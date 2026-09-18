import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Client } from '@/types';
import { clientService } from '@/services';
import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace('/api', '');

// React Query hooks
export const useClients = () => {
  const queryClient = useQueryClient();

  // Listen for real-time client updates (assignment changes)
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('client:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    });
    socket.on('client:created', () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    });
    return () => { socket.disconnect(); };
  }, [queryClient]);

  return useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAll(),
    refetchInterval: 30000,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (client: Omit<Client, 'id' | 'createdAt'>) => clientService.create(client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Client> }) =>
      clientService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useGlobalActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: ['global-activity', limit],
    queryFn: () => clientService.getAllActivity(limit),
  });
};
