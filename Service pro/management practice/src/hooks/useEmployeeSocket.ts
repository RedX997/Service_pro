/**
 * useEmployeeSocket
 *
 * Connects to the Socket.io server and listens for EMPLOYEE_CREATED events.
 * On receipt, the React Query 'employees' cache is invalidated so every component
 * using useEmployees() re-fetches and shows the new record immediately.
 *
 * Also stores the most-recently-created employee for components that want to
 * show a toast or banner without re-fetching.
 */

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { Employee } from '@/types';

const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

export interface EmployeeCreatedPayload {
  employee: Employee;
  createdAt: string;
  message: string;
}

/**
 * Mount this hook once at a high level (e.g. DashboardLayout or App).
 * It returns the latest EMPLOYEE_CREATED payload and a flag for whether
 * the socket is currently connected.
 */
export function useEmployeeSocket(userId?: string) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastCreatedEmployee, setLastCreatedEmployee] =
    useState<EmployeeCreatedPayload | null>(null);

  useEffect(() => {
    // Connect (or reuse) socket
    const socket = io(SOCKET_URL, {
      auth: { token: 'dashboard', userId: userId ?? 'dashboard' },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 [EmployeeSocket] connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ [EmployeeSocket] disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[EmployeeSocket] connect_error:', err.message);
    });

    // ── Main event ────────────────────────────────────────────────────────
    socket.on('EMPLOYEE_CREATED', (payload: EmployeeCreatedPayload) => {
      console.log('🎉 [EmployeeSocket] EMPLOYEE_CREATED received', payload);

      // 1. Update React Query cache — invalidate so every useEmployees() refetches
      queryClient.invalidateQueries({ queryKey: ['employees'] });

      // 2. Optimistic prepend: add the new employee to cached data immediately
      //    so the UI updates even before the refetch completes
      queryClient.setQueryData<Employee[]>(['employees'], (old) => {
        if (!old) return [payload.employee];
        // Guard against duplicates
        if (old.some((e) => e.id === payload.employee.id)) return old;
        return [payload.employee, ...old];
      });

      // 3. Expose the last event so consuming components can show toasts
      setLastCreatedEmployee(payload);
    });

    return () => {
      socket.off('EMPLOYEE_CREATED');
      socket.disconnect();
    };
  }, [userId, queryClient]);

  return { isConnected, lastCreatedEmployee };
}
