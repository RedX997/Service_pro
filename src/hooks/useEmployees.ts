import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Employee } from '@/types';
import { employeeService } from '@/services';

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll(),
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
