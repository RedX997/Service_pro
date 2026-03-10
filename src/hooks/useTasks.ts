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

// Get all tasks
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Task[]> => {
      const response = await apiClient.get('/tasks');
      return response.data;
    },
  });
}

// Get tasks for a specific employee
export function useEmployeeTasks(employeeId: string) {
  return useQuery({
    queryKey: ['tasks', 'employee', employeeId],
    queryFn: async (): Promise<Task[]> => {
      const response = await apiClient.get(`/tasks/employee/${employeeId}`);
      return response.data;
    },
    enabled: !!employeeId,
  });
}

// Get task statistics for an employee
export function useTaskStats(employeeId: string) {
  return useQuery({
    queryKey: ['tasks', 'stats', employeeId],
    queryFn: async (): Promise<TaskStats> => {
      const response = await apiClient.get(`/tasks/stats/${employeeId}`);
      return response.data;
    },
    enabled: !!employeeId,
  });
}

// Create task
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTaskData): Promise<Task> => {
      const response = await apiClient.post('/tasks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Update task
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTaskData }): Promise<Task> => {
      const response = await apiClient.patch(`/tasks/${id}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Delete task
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}