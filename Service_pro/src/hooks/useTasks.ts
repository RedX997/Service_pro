import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  assignedBy?: string;
  clientId?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  assignee: {
    id: string;
    name: string;
    email?: string;
    role: string;
    department?: string;
  };
  assigner?: {
    id: string;
    name: string;
    email?: string;
    role: string;
  };
  client?: {
    id: string;
    name: string;
    company?: string;
  };
}

export interface TaskStats {
  statusBreakdown: Array<{
    status: string;
    _count: {
      status: number;
    };
  }>;
  overdueTasks: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  assignedBy?: string;
  clientId?: string;
  dueDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  clientId?: string;
  dueDate?: string;
  completedAt?: string;
}

// Get all tasks - Using POST (PUSH) as requested
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiClient.post<Task[]>('/tasks/list'),
  });
}

// Get tasks for a specific employee - Using POST (PUSH)
export function useEmployeeTasks(employeeId: string) {
  return useQuery({
    queryKey: ['tasks', 'employee', employeeId],
    queryFn: () => apiClient.post<Task[]>(`/tasks/employee/${employeeId}`),
    enabled: !!employeeId,
  });
}

// Get task statistics for an employee - Using POST (PUSH)
export function useTaskStats(employeeId: string) {
  return useQuery({
    queryKey: ['tasks', 'stats', employeeId],
    queryFn: () => apiClient.post<TaskStats>(`/tasks/stats/${employeeId}`),
    enabled: !!employeeId,
  });
}

// Create task
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTaskData) => apiClient.post<Task>('/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Update task
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTaskData }) => 
      apiClient.patch<Task>(`/tasks/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Delete task
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}