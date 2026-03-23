import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderType: 'employee' | 'client';
  clientId: string;
  isRead: boolean;
  isDelivered: boolean;
  isEdited: boolean;
  replyToId?: string;
  reactions?: Record<string, string>;
  timestamp: string;
  deliveredAt?: string;
  readAt?: string;
  editedAt?: string;
  replyTo?: {
    id: string;
    content: string;
    senderId: string;
    senderType: string;
  };
}

interface TypingUser {
  userId: string;
  userName: string;
}

interface UserStatus {
  userId: string;
  isOnline: boolean;
}

export function useMessaging(userId: string, userType: 'employee' | 'client') {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket.io connection
  useEffect(() => {
    console.log('Initializing messaging socket...', { userId, userType, SOCKET_URL });

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: 'temp-token', // TODO: Use real JWT token
        userId: userId,
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✅ Messaging socket connected');
      setIsConnected(true);
      
      // Announce online status
      newSocket.emit('user:online', { userId, userType });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Messaging socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for new messages
    newSocket.on('message:new', (message: Message) => {
      console.log('📨 New message received:', message);
      setMessages((prev) => [...prev, message]);
      
      // Auto-mark as delivered if we're the recipient
      if (message.senderId !== userId) {
        markAsDelivered(message.id, message.conversationId);
      }
    });

    // Listen for delivery confirmations
    newSocket.on('message:delivered', (data: { messageId: string; deliveredAt: string }) => {
      console.log('✓ Message delivered:', data.messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, isDelivered: true, deliveredAt: data.deliveredAt }
            : msg
        )
      );
    });

    // Listen for read confirmations
    newSocket.on('message:read', (data: { messageId: string; readAt: string }) => {
      console.log('✓✓ Message read:', data.messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        )
      );
    });

    // Listen for conversation read (all messages)
    newSocket.on('conversation:read', (data: { conversationId: string; userId: string }) => {
      console.log('✓✓ Conversation read:', data.conversationId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.conversationId === data.conversationId && msg.senderId === userId
            ? { ...msg, isRead: true, readAt: new Date().toISOString() }
            : msg
        )
      );
    });

    // Listen for typing indicators
    newSocket.on('typing:start', (data: TypingUser) => {
      setTypingUsers((prev) => {
        if (prev.find((u) => u.userId === data.userId)) return prev;
        return [...prev, data];
      });
    });

    newSocket.on('typing:stop', (data: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    // Listen for user status changes
    newSocket.on('user:status', (data: UserStatus) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isOnline) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    // Listen for message edits
    newSocket.on('message:edited', (data: { messageId: string; content: string; editedAt: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, content: data.content, isEdited: true, editedAt: data.editedAt }
            : msg
        )
      );
    });

    // Listen for message deletions
    newSocket.on('message:deleted', (data: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
    });

    // Listen for reactions
    newSocket.on('message:reaction', (data: { messageId: string; userId: string; emoji: string }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            const reactions = { ...(msg.reactions || {}) };
            reactions[data.userId] = data.emoji;
            return { ...msg, reactions };
          }
          return msg;
        })
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId, userType]);

  // Join conversation room
  const joinConversation = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('conversation:join', conversationId);
      console.log('💬 Joined conversation:', conversationId);
    }
  }, [socket]);

  // Leave conversation room
  const leaveConversation = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('conversation:leave', conversationId);
      console.log('👋 Left conversation:', conversationId);
    }
  }, [socket]);

  // Send typing indicator
  const startTyping = useCallback((conversationId: string, userName: string) => {
    if (socket) {
      socket.emit('typing:start', { conversationId, userId, userName });
      
      // Auto-stop typing after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(conversationId);
      }, 3000);
    }
  }, [socket, userId]);

  const stopTyping = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('typing:stop', { conversationId, userId });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [socket, userId]);

  // Send message
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    clientId: string,
    senderType: 'employee' | 'client',
    replyToId?: string
  ) => {
    try {
      // Save to database first
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content,
          senderId: userId,
          senderType,
          clientId,
          replyToId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const message = await response.json();
      
      // Emit via Socket.io for real-time delivery
      if (socket) {
        socket.emit('message:send', message);
      }

      // Add to local state
      setMessages((prev) => [...prev, message]);

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [socket, userId]);

  // Mark message as delivered
  const markAsDelivered = useCallback(async (messageId: string, conversationId: string) => {
    try {
      await fetch(`${API_URL}/messages/${messageId}/delivered`, {
        method: 'PATCH',
      });

      if (socket) {
        socket.emit('message:delivered', { messageId, conversationId });
      }
    } catch (error) {
      console.error('Error marking message as delivered:', error);
    }
  }, [socket]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string, conversationId: string) => {
    try {
      await fetch(`${API_URL}/messages/${messageId}/read`, {
        method: 'PATCH',
      });

      if (socket) {
        socket.emit('message:read', { messageId, conversationId });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, [socket]);

  // Mark all messages in conversation as read
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      await fetch(`${API_URL}/messages/conversation/${conversationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }, [userId]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string, limit = 50, before?: string) => {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (before) params.append('before', before);

      const response = await fetch(`${API_URL}/messages/conversation/${conversationId}?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const loadedMessages = await response.json();
      setMessages(loadedMessages);
      return loadedMessages;
    } catch (error) {
      console.error('Error loading messages:', error);
      throw error;
    }
  }, []);

  return {
    socket,
    isConnected,
    messages,
    typingUsers,
    onlineUsers,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    sendMessage,
    markAsRead,
    markConversationAsRead,
    loadMessages,
  };
}
