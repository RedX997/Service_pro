import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_URL = API_BASE_URL;
const SOCKET_URL = API_BASE_URL.replace('/api', '');

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from REST API - Updated to use POST (PUSH)
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      // Changed to POST /list as requested earlier
      const response = await fetch(`${API_URL}/notifications/list`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': String(user.id)
        },
        body: JSON.stringify({ 
          userId: user.id,
          limit: 50 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('🔔 Error fetching notifications:', error);
      // Silently fail to avoid toast floods during auth transitions
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: 'dummy-token',
        userId: user.id,
        role: user.role,
        userName: user.name,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    newSocket.on('connect', () => {
      console.log('✅ Notification socket connected successfully to', SOCKET_URL, 'Socket ID:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Notification socket connection error:', error);
    });

    newSocket.on('notification', (notification: Notification) => {
      console.log('🔔 Real-time notification received:', notification);
      setNotifications(prev => {
        // Avoid duplicate entries if both role and user room emitted
        if (notification.id && prev.some(n => n.id === notification.id)) {
          return prev;
        }
        return [notification, ...prev];
      });
      setUnreadCount(prev => prev + 1);

      const priorityEmoji = {
        low: '📝',
        normal: '📬',
        high: '⚠️',
        urgent: '🚨'
      }[notification.priority] || '📬';

      toast(notification.title, {
        description: notification.message,
        icon: priorityEmoji,
        duration: notification.priority === 'urgent' ? 10000 : 5000
      });
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read?userId=${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to mark as read');

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/notifications/read-all?userId=${user.id}`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to mark all as read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: number) => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/notifications/${id}?userId=${user.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
