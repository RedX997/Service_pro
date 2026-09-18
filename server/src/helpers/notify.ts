import { prisma } from '../lib/prisma.js';
import { emitToUser, emitToRole } from '../socket.js';

export interface NotifyOptions {
  userId?: number;           // Send to specific user
  role?: string;             // Send to all users with this role
  type: string;              // Notification type: visitor, message, appointment, timer, task, system
  title: string;             // Short heading
  message: string;           // Detailed message
  data?: Record<string, any>; // Additional metadata (clientId, visitorId, etc.)
  priority?: 'low' | 'normal' | 'high' | 'urgent'; // Priority level
  actionUrl?: string;        // Optional URL to navigate when clicked
  expiresAt?: Date;          // Optional expiration date
}

/**
 * Create and emit a notification
 * 
 * This function:
 * 1. Saves the notification to the database
 * 2. Emits it in real-time via Socket.io
 * 
 * You can specify either userId (for specific user) or role (for all users with that role),
 * or both (notification saved for specific user but also broadcasted to role).
 * 
 * @param options - Notification options
 * @returns Created notification(s)
 * 
 * @example
 * // Notify specific user
 * await notify({
 *   userId: 5,
 *   type: 'message',
 *   title: 'New Message',
 *   message: 'You have a new message from John Doe',
 *   data: { messageId: '123', senderId: '456' },
 *   actionUrl: '/messages'
 * });
 * 
 * @example
 * // Notify all managers
 * await notify({
 *   role: 'manager',
 *   type: 'visitor',
 *   title: 'New Visitor',
 *   message: 'A new visitor has checked in',
 *   data: { visitorId: '789' },
 *   priority: 'high'
 * });
 */
export async function notify(options: NotifyOptions) {
  const {
    userId,
    role,
    type,
    title,
    message,
    data,
    priority = 'normal',
    actionUrl,
    expiresAt
  } = options;

  try {
    // Validate required fields
    if (!type || !title || !message) {
      throw new Error('type, title, and message are required');
    }

    if (!userId && !role) {
      throw new Error('Either userId or role must be specified');
    }

    const notifications: any[] = [];

    // If userId is specified, create notification for that user
    if (userId) {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          data: data || {},
          priority,
          actionUrl,
          expiresAt,
          read: false
        }
      });

      notifications.push(notification);

      // Emit to specific user via Socket.io
      emitToUser(userId, 'notification', notification);
      console.log(`✅ Notification created and emitted to user ${userId}`);
    }

    // If role is specified, create notifications for all users with that role
    if (role) {
      // Find all users with the specified role
      const roleRecord = await prisma.role.findUnique({
        where: { role_name: role },
        include: { users: true }
      });

      if (roleRecord && roleRecord.users.length > 0) {
        // Create notification for each user with this role
        const roleNotifications = await Promise.all(
          roleRecord.users.map(user =>
            prisma.notification.create({
              data: {
                userId: user.id,
                type,
                title,
                message,
                data: data || {},
                priority,
                actionUrl,
                expiresAt,
                read: false
              }
            })
          )
        );

        notifications.push(...roleNotifications);

        // Emit to role room via Socket.io (broadcasts to all connected users with that role)
        const payload = {
          type,
          title,
          message,
          data,
          priority,
          actionUrl,
          createdAt: new Date()
        };

        emitToRole(role, 'notification', payload);

        // Also emit to each individual user's room to ensure dual delivery
        roleRecord.users.forEach((u, index) => {
          emitToUser(u.id, 'notification', roleNotifications[index] || payload);
        });

        console.log(`✅ Notifications created and emitted to role '${role}' and ${roleRecord.users.length} user rooms`);
      } else {
        console.warn(`⚠️ No users found with role '${role}'`);
      }
    }

    return notifications.length === 1 ? notifications[0] : notifications;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
}

/**
 * Notify multiple specific users
 * @param userIds - Array of user IDs
 * @param options - Notification options (without userId)
 */
export async function notifyUsers(
  userIds: number[],
  options: Omit<NotifyOptions, 'userId' | 'role'>
) {
  const notifications = await Promise.all(
    userIds.map(userId => notify({ ...options, userId }))
  );
  return notifications;
}

/**
 * Get user ID by email (helper for finding users)
 * @param email - User email
 * @returns User ID or null
 */
export async function getUserIdByEmail(email: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });
  return user?.id || null;
}

/**
 * Get all user IDs with a specific role
 * @param roleName - Role name (super_admin, manager, receptionist)
 * @returns Array of user IDs
 */
export async function getUserIdsByRole(roleName: string): Promise<number[]> {
  const role = await prisma.role.findUnique({
    where: { role_name: roleName },
    include: { users: { select: { id: true } } }
  });
  return role?.users.map(u => u.id) || [];
}
