import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Visitor } from '@/types';
import { visitorService } from '@/services';

export const useVisitors = () => {
  return useQuery({
    queryKey: ['visitors'],
    queryFn: () => visitorService.getAll(),
  });
};

export const useCreateVisitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visitor: Omit<Visitor, 'id' | 'checkInTime' | 'createdAt'>) =>
      visitorService.create(visitor as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
};

export const useUpdateVisitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Visitor> }) =>
      visitorService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
};

export const useCheckOutVisitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => visitorService.checkOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
};

export const useConvertToClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, clientData }: { id: string; clientData: any }) =>
      visitorService.convertToClient(id, clientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useDeleteVisitor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => visitorService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    },
  });
};
