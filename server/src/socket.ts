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

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // For now, we'll extract userId from token payload
      // In production, verify JWT signature here
      const userId = parseInt(socket.handshake.auth.userId);
      
      if (!userId || isNaN(userId)) {
        return next(new Error('Invalid user ID'));
      }

      // Verify user exists in database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user data to socket
      socket.data.userId = user.id;
      socket.data.userName = user.name;
      socket.data.userRole = user.role.role_name;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const userName = socket.data.userName;
    const userRole = socket.data.userRole;

    console.log(`✅ User connected: ${userName} (ID: ${userId}, Role: ${userRole})`);

    // Join user-specific room
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    console.log(`   → Joined room: ${userRoom}`);

    // Join role-based room
    const roleRoom = `role:${userRole}`;
    socket.join(roleRoom);
    console.log(`   → Joined room: ${roleRoom}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${userName} (ID: ${userId})`);
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
