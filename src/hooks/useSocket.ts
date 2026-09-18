import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

export function useSocket(userId: string, userType: 'client' | 'employee') {
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    if (!userId || isConnectingRef.current) return;

    isConnectingRef.current = true;

    try {
      socketRef.current = io(SOCKET_URL, {
        auth: {
          userId,
          userType,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        console.log('✅ Socket connected:', socketRef.current?.id);
        socketRef.current?.emit('user:online', { userId, userType });
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }

    return () => {
      isConnectingRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, userType]);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  return {
    socket: socketRef.current,
    emit,
    on,
    off,
    isConnected: socketRef.current?.connected ?? false,
  };
}
