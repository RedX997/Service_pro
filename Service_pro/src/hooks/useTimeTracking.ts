import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TimeEntry, ActiveTimer } from '@/types';
import { timeTrackingService } from '@/services';

export const useTimeEntries = () => {
  return useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => timeTrackingService.getAll(),
  });
};

export const useActiveTimer = (employeeId: string) => {
  return useQuery({
    queryKey: ['activeTimer', employeeId],
    queryFn: () => timeTrackingService.getActiveTimer(employeeId),
    refetchInterval: 1000, // Update every second
  });
};

export const useStartTimer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (timer: Omit<ActiveTimer, 'id' | 'startTime' | 'createdAt'>) =>
      timeTrackingService.startTimer(timer),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activeTimer', variables.employeeId] });
    },
  });
};

export const useStopTimer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, notes }: { employeeId: string; notes?: string }) =>
      timeTrackingService.stopTimer(employeeId, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activeTimer', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });
};

export const useUpdateTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TimeEntry> }) =>
      timeTrackingService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });
};

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => timeTrackingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });
};
