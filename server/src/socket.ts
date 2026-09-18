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
      origin: function(origin: any, callback: any) {
        if (!origin) return callback(null, true);

        const envOrigins = process.env.FRONTEND_URL
          ? process.env.FRONTEND_URL.split(',').map((s: string) => s.trim())
          : [];

        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://localhost:8080',
          'https://servicepro-frontend-one.vercel.app',
          'https://service-pro-chi.vercel.app',
          'https://deskflo.pages.dev',
          'https://deskflo.netlify.app',
          ...envOrigins
        ];

        const allowedPatterns = [
          /^https:\/\/.*\.vercel\.app$/,
          /^https:\/\/.*\.pages\.dev$/,
          /^https:\/\/.*\.netlify\.app$/,
          /^https:\/\/.*\.railway\.app$/,
          /^file:\/\//
        ];

        if (allowedOrigins.includes(origin) || allowedPatterns.some(p => p.test(origin))) {
          return callback(null, true);
        }

        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  // Authentication middleware - SUPPORT BOTH SYSTEM USERS (INTEGER) AND EMPLOYEES/CLIENTS (UUID)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const userId = socket.handshake.auth.userId;
      const clientRole = socket.handshake.auth.role;
      const clientName = socket.handshake.auth.userName;

      if (!userId) {
        console.log('⚠️  No userId provided, allowing anonymous connection');
        socket.data.userId = 'anonymous';
        socket.data.userName = 'Anonymous User';
        socket.data.userRole = 'guest';
        return next();
      }

      // 1. Check if numeric user ID (System User: Super Admin, Manager, Receptionist, Cascade Admin)
      const numericUserId = typeof userId === 'number' ? userId : parseInt(String(userId), 10);
      if (!isNaN(numericUserId) && String(userId) === String(numericUserId)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: numericUserId },
          include: { role: true }
        });

        if (dbUser) {
          socket.data.userId = dbUser.id;
          socket.data.userName = dbUser.name;
          socket.data.userRole = dbUser.role?.role_name || clientRole || 'super_admin';
          console.log(`✅ System User authenticated: ${dbUser.name} (ID: ${dbUser.id}, Role: ${socket.data.userRole})`);
          return next();
        }
      }

      // 2. Try to find employee by UUID
      const isUUID = typeof userId === 'string' && userId.includes('-');
      if (isUUID) {
        const employee = await prisma.employee.findUnique({
          where: { id: userId }
        });

        if (employee) {
          socket.data.userId = employee.id;
          socket.data.userName = employee.name;
          socket.data.userRole = 'employee';
          console.log(`✅ Employee authenticated: ${employee.name}`);
          return next();
        }

        // 3. Try to find client by UUID
        const client = await prisma.client.findUnique({
          where: { id: userId }
        });

        if (client) {
          socket.data.userId = client.id;
          socket.data.userName = client.name;
          socket.data.userRole = 'client';
          console.log(`✅ Client authenticated: ${client.name}`);
          return next();
        }
      }

      // 4. Fallback: Authenticate with client-provided role
      socket.data.userId = userId;
      socket.data.userName = clientName || 'User';
      socket.data.userRole = clientRole || 'staff';
      console.log(`ℹ️ Connected with client-provided role: ${socket.data.userRole} (User ID: ${userId})`);
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.data.userId = 'error';
      socket.data.userName = 'Error User';
      socket.data.userRole = socket.handshake.auth.role || 'guest';
      next();
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const userName = socket.data.userName;
    const userRole = socket.data.userRole;

    console.log(`✅ User connected: ${userName} (ID: ${userId}, Role: ${userRole})`);

    // Join user-specific rooms (both string and numeric keys)
    socket.join(`user:${userId}`);
    socket.join(String(userId));
    console.log(`   → Joined room: user:${userId}`);

    // Join role-based room
    if (userRole && userRole !== 'guest') {
      socket.join(`role:${userRole}`);
      console.log(`   → Joined room: role:${userRole}`);
    }

    // Super Admin gets all staff notifications
    if (userRole === 'super_admin') {
      socket.join('role:manager');
      socket.join('role:receptionist');
      console.log(`   → Super Admin joined all staff role rooms`);
    }

    // All authenticated staff join 'role:staff'
    if (['super_admin', 'manager', 'receptionist', 'cascade_admin', 'employee', 'staff'].includes(userRole)) {
      socket.join('role:staff');
    }

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
