import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Client } from '@/types';
import { clientService } from '@/services';

// React Query hooks
export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAll(),
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
