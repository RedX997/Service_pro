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

// PRODUCTION HARDCODED - No environment variables needed
const API_BASE_URL = 'https://servicepro-backend.onrender.com/api';
const API_URL = API_BASE_URL;
const SOCKET_URL = 'https://servicepro-backend.onrender.com';

console.log('🔔 NotificationContext initialized (HARDCODED):', {
  API_URL,
  SOCKET_URL
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from REST API
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      console.log('🔔 No user, skipping notification fetch');
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    console.log('🔔 Fetching notifications for user:', user.id, 'from:', API_URL);

    try {
      const url = `${API_URL}/notifications?userId=${user.id}&limit=50`;
      console.log('🔔 Fetching from URL:', url);
      
      const response = await fetch(url);
      console.log('🔔 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔔 Response error:', errorText);
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      console.log('🔔 Fetched notifications:', data);
      
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      
      console.log('🔔 Set notifications:', data.notifications?.length, 'unread:', data.unreadCount);
    } catch (error) {
      console.error('🔔 Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initialize Socket.io connection
  useEffect(() => {
    console.log('🔔 NotificationContext: Initializing...', { user });
    
    if (!user) {
      // Disconnect socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    console.log('🔔 NotificationContext: User logged in, connecting socket...', user.id);

    // Connect to Socket.io server
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: 'dummy-token', // In production, use real JWT token
        userId: user.id
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to notification server');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from notification server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for incoming notifications
    newSocket.on('notification', (notification: Notification) => {
      console.log('📬 New notification received:', notification);

      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show toast notification
      const priorityEmoji = {
        low: '📝',
        normal: '📬',
        high: '⚠️',
        urgent: '🚨'
      }[notification.priority] || '📬';

      toast(notification.title, {
        description: notification.message,
        icon: priorityEmoji,
        action: notification.actionUrl ? {
          label: 'View',
          onClick: () => {
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            }
          }
        } : undefined,
        duration: notification.priority === 'urgent' ? 10000 : 5000
      });

      // Optional: Send acknowledgment to server
      newSocket.emit('notification:received', notification.id);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark single notification as read
  const markAsRead = async (id: number) => {
    if (!user) return;

    try {
      console.log('🔔 Marking notification as read:', id, 'for user:', user.id);
      
      const response = await fetch(`${API_URL}/notifications/${id}/read?userId=${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🔔 Mark as read response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to mark as read:', errorText);
        throw new Error('Failed to mark as read');
      }

      const data = await response.json();
      console.log('✅ Marked as read successfully:', data);

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/notifications/read-all?userId=${user.id}`, {
        method: 'PATCH'
      });

      if (!response.ok) throw new Error('Failed to mark all as read');

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  // Delete notification
  const deleteNotification = async (id: number) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/notifications/${id}?userId=${user.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      // Update local state
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
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
