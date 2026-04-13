import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface SupportTicket {
    id: string;
    userId: number;
    subject: string;
    message: string;
    category: string;
    priority: string;
    status: string;
    adminReply?: string;
    resolvedAt?: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        name: string;
        role?: {
            role_name: string;
        };
    };
}

// Get all support tickets - Using POST (PUSH)
export const useSupportTickets = () => {
    return useQuery({
        queryKey: ['support-tickets'],
        queryFn: () => apiClient.post<SupportTicket[]>('/support/list', {}),
    });
};

// Get tickets for user - Using POST (PUSH)
export const useUserSupportTickets = (userId?: number) => {
    return useQuery({
        queryKey: ['support-tickets', 'user', userId],
        queryFn: () => apiClient.post<SupportTicket[]>(`/support/user/${userId}`, {}),
        enabled: !!userId,
    });
};

export const useCreateSupportTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ticket: Partial<SupportTicket>) => apiClient.post<SupportTicket>('/support', ticket),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
        },
    });
};

export const useUpdateSupportTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<SupportTicket> }) => 
            apiClient.patch<SupportTicket>(`/support/${id}`, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
        },
    });
};
export const useReplyToSupportTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reply }: { id: string; reply: string }) => 
            apiClient.post<SupportTicket>(`/support/reply/${id}`, { reply }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
        },
    });
};
