import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { prisma } from './lib/prisma.js';

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server
 * @param httpServer - HTTP server instance from Express
 */
export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: true, // Allow all origins in development
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware - SIMPLIFIED FOR MESSAGING
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const userId = socket.handshake.auth.userId;
      
      // For messaging system, we'll skip strict authentication for now
      // In production, verify JWT token here
      
      if (!userId) {
        console.log('⚠️  No userId provided, allowing connection anyway');
        socket.data.userId = 'anonymous';
        socket.data.userName = 'Anonymous User';
        socket.data.userRole = 'guest';
        return next();
      }

      // Try to find employee by UUID (only if userId looks like a UUID, not an integer)
      const isUUID = typeof userId === 'string' && userId.includes('-');
      const employee = isUUID ? await prisma.employee.findUnique({
        where: { id: userId }
      }) : null;

      if (employee) {
        socket.data.userId = employee.id;
        socket.data.userName = employee.name;
        socket.data.userRole = 'employee';
        console.log(`✅ Employee authenticated: ${employee.name}`);
        return next();
      }

      // If not found as employee, try as client (also UUID only)
      const client = isUUID ? await prisma.client.findUnique({
        where: { id: userId }
      }) : null;

      if (client) {
        socket.data.userId = client.id;
        socket.data.userName = client.name;
        socket.data.userRole = 'client';
        console.log(`✅ Client authenticated: ${client.name}`);
        return next();
      }

      // If neither found, allow connection anyway for development
      console.log(`⚠️  User ${userId} not found, allowing connection anyway`);
      socket.data.userId = userId;
      socket.data.userName = 'Unknown User';
      socket.data.userRole = 'guest';
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      // Allow connection even on error for development
      socket.data.userId = 'error';
      socket.data.userName = 'Error User';
      socket.data.userRole = 'guest';
      next();
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const userName = socket.data.userName;
    const userRole = socket.data.userRole;

    console.log(`✅ User connected: ${userName} (ID: ${userId}, Role: ${userRole})`);

    // Join user-specific room (use string ID for UUID support)
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    console.log(`   → Joined room: ${userRoom}`);

    // Join role-based room
    const roleRoom = `role:${userRole}`;
    socket.join(roleRoom);
    console.log(`   → Joined room: ${roleRoom}`);

    // ========== MESSAGING EVENTS ==========

    // User goes online
    socket.on('user:online', async (data: { userId: string; userType: string }) => {
      try {
        await prisma.userStatus.upsert({
          where: { userId: data.userId },
          update: {
            isOnline: true,
            lastSeen: new Date(),
            socketId: socket.id,
          },
          create: {
            userId: data.userId,
            userType: data.userType,
            isOnline: true,
            socketId: socket.id,
          },
        });

        // Broadcast online status
        socket.broadcast.emit('user:status', {
          userId: data.userId,
          isOnline: true,
        });

        console.log(`🟢 User ${data.userId} is online`);
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    });

    // Join conversation room
    socket.on('conversation:join', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`💬 User ${userId} joined conversation: ${conversationId}`);
    });

    // Leave conversation room
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`👋 User ${userId} left conversation: ${conversationId}`);
    });

    // Typing indicator
    socket.on('typing:start', (data: { conversationId: string; userId: string; userName: string }) => {
      socket.to(data.conversationId).emit('typing:start', {
        userId: data.userId,
        userName: data.userName,
      });
    });

    socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
      socket.to(data.conversationId).emit('typing:stop', {
        userId: data.userId,
      });
    });

    // Message sent (real-time broadcast)
    socket.on('message:send', (message: any) => {
      socket.to(message.conversationId).emit('message:new', message);
      console.log(`📨 Message sent in conversation ${message.conversationId}`);
    });

    // Message delivered acknowledgment
    socket.on('message:delivered', (data: { messageId: string; conversationId: string }) => {
      socket.to(data.conversationId).emit('message:delivered', data);
    });

    // Message read acknowledgment
    socket.on('message:read', (data: { messageId: string; conversationId: string }) => {
      socket.to(data.conversationId).emit('message:read', data);
    });

    // ========== END MESSAGING EVENTS ==========

    // ========== EMPLOYEE EVENTS ==========
    // NOTE: EMPLOYEE_CREATED is a server-originated broadcast event.
    // It is emitted by the cascade-admin route via getIO().emit('EMPLOYEE_CREATED', payload)
    // whenever a new employee credential is created by a Cascade Super Admin.
    // All connected dashboard clients listen for this event via useEmployeeSocket hook.
    // ========== END EMPLOYEE EVENTS ==========

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${userName} (ID: ${userId})`);

      // Update user status to offline (only if userId is a valid UUID)
      if (userId && userId !== 'anonymous' && userId !== 'error') {
        try {
          await prisma.userStatus.updateMany({
            where: { socketId: socket.id },
            data: {
              isOnline: false,
              lastSeen: new Date(),
              socketId: null,
            },
          });

          // Broadcast offline status
          socket.broadcast.emit('user:status', {
            userId: userId.toString(),
            isOnline: false,
          });

          console.log(`🔴 User ${userId} is offline`);
        } catch (error) {
          console.error('Error updating offline status:', error);
        }
      }
    });

    // Optional: Handle client acknowledgment
    socket.on('notification:received', (notificationId) => {
      console.log(`📬 Notification ${notificationId} received by user ${userId}`);
    });
  });

  console.log('🔌 Socket.io server initialized');
  return io;
}

/**
 * Get Socket.io server instance
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket() first.');
  }
  return io;
}

/**
 * Emit notification to a specific user
 * @param userId - Target user ID
 * @param event - Event name (default: 'notification')
 * @param data - Notification data
 */
export function emitToUser(userId: number, event: string = 'notification', data: any): void {
  try {
    const io = getIO();
    const room = `user:${userId}`;
    io.to(room).emit(event, data);
    console.log(`📤 Emitted '${event}' to user ${userId}`);
  } catch (error) {
    console.error(`Failed to emit to user ${userId}:`, error);
  }
}

/**
 * Emit notification to all users with a specific role
 * @param role - Target role (super_admin, manager, receptionist)
 * @param event - Event name (default: 'notification')
 * @param data - Notification data
 */
export function emitToRole(role: string, event: string = 'notification', data: any): void {
  try {
    const io = getIO();
    const room = `role:${role}`;
    io.to(room).emit(event, data);
    console.log(`📤 Emitted '${event}' to role '${role}'`);
  } catch (error) {
    console.error(`Failed to emit to role ${role}:`, error);
  }
}

/**
 * Emit notification to multiple users
 * @param userIds - Array of user IDs
 * @param event - Event name (default: 'notification')
 * @param data - Notification data
 */
export function emitToUsers(userIds: number[], event: string = 'notification', data: any): void {
  userIds.forEach(userId => emitToUser(userId, event, data));
}

/**
 * Broadcast notification to all connected users
 * @param event - Event name (default: 'notification')
 * @param data - Notification data
 */
export function broadcastToAll(event: string = 'notification', data: any): void {
  try {
    const io = getIO();
    io.emit(event, data);
    console.log(`📢 Broadcasted '${event}' to all users`);
  } catch (error) {
    console.error('Failed to broadcast:', error);
  }
}
