import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Message } from '@/types';
import { messageService } from '@/services';

export const useMessages = () => {
  return useQuery({
    queryKey: ['messages'],
    queryFn: () => messageService.getAll(),
    refetchInterval: 5000, // Refresh every 5 seconds for real-time feel
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: Omit<Message, 'id' | 'timestamp' | 'createdAt'>) =>
      messageService.create(message as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messageService.markAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messageService.delete(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};
