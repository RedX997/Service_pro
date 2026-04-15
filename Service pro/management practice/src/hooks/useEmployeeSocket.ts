/**
 * useEmployeeSocket
 *
 * Connects to the Socket.io server and listens for:
 *  - EMPLOYEE_CREATED              → invalidates employees + departments cache
 *  - EMPLOYEE_ASSIGNED_TO_DEPARTMENT → invalidates departments cache for that dept
 *
 * Mounted once in DashboardLayout — one connection per browser session.
 */

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { Employee } from '@/types';

const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

export interface EmployeeCreatedPayload {
  employee: Employee & { departments: string[] };
  departments: string[];
  createdAt: string;
  message: string;
}

export interface EmployeeAssignedToDeptPayload {
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
}

export function useEmployeeSocket(userId?: string) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastCreatedEmployee, setLastCreatedEmployee] =
    useState<EmployeeCreatedPayload | null>(null);

  useEffect(() => {
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

    socket.on('connect_error', (err) =>
      console.warn('[EmployeeSocket] connect_error:', err.message)
    );

    // ── EMPLOYEE_CREATED ─────────────────────────────────────────────────
    socket.on('EMPLOYEE_CREATED', (payload: EmployeeCreatedPayload) => {
      console.log('🎉 [EmployeeSocket] EMPLOYEE_CREATED', payload);

      // Optimistic prepend — instant UI update before refetch
      queryClient.setQueryData<Employee[]>(['employees'], (old) => {
        if (!old) return [payload.employee];
        if (old.some((e) => e.id === payload.employee.id)) return old;
        return [payload.employee, ...old];
      });

      // Invalidate employees so any stale data is refreshed
      queryClient.invalidateQueries({ queryKey: ['employees'] });

      // Invalidate departments — counts changed
      queryClient.invalidateQueries({ queryKey: ['departments'] });

      setLastCreatedEmployee(payload);
    });

    // ── EMPLOYEE_ASSIGNED_TO_DEPARTMENT ──────────────────────────────────
    socket.on(
      'EMPLOYEE_ASSIGNED_TO_DEPARTMENT',
      (payload: EmployeeAssignedToDeptPayload) => {
        console.log('🏢 [EmployeeSocket] EMPLOYEE_ASSIGNED_TO_DEPARTMENT', payload);
        // Refresh department list so employee counts update in real-time
        queryClient.invalidateQueries({ queryKey: ['departments'] });
      }
    );

    return () => {
      socket.off('EMPLOYEE_CREATED');
      socket.off('EMPLOYEE_ASSIGNED_TO_DEPARTMENT');
      socket.disconnect();
    };
  }, [userId, queryClient]);

  return { isConnected, lastCreatedEmployee };
}
