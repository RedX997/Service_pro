import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

/**
 * POST /api/notifications/list (PUSH)
 * Fetch notifications for the logged-in user
 */
router.post('/list', async (req, res) => {
  try {
    // In production, extract userId from JWT token
    // For now, we'll get it from query params or headers
    const userId = parseInt(req.body.userId as string || req.query.userId as string || req.headers['x-user-id'] as string);

    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const unreadOnly = req.query.unreadOnly === 'true';

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false })
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });

    res.json({
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = parseInt(req.query.userId as string || req.headers['x-user-id'] as string);

    console.log('📝 Mark as read request:', { notificationId, userId });

    if (!userId || isNaN(userId)) {
      console.log('❌ User ID missing or invalid');
      return res.status(401).json({ error: 'User ID required' });
    }

    if (isNaN(notificationId)) {
      console.log('❌ Notification ID invalid');
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    console.log('📝 Found notification:', notification);

    if (!notification) {
      console.log('❌ Notification not found');
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      console.log('❌ Unauthorized - notification belongs to different user');
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Mark as read
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    console.log('✅ Notification marked as read:', updated.id);

    res.json({
      success: true,
      notification: updated
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the logged-in user
 */
router.patch('/read-all', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string || req.headers['x-user-id'] as string);

    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true
      }
    });

    res.json({
      success: true,
      count: result.count,
      message: `Marked ${result.count} notifications as read`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a single notification
 */
router.delete('/:id', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = parseInt(req.query.userId as string || req.headers['x-user-id'] as string);

    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (isNaN(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: notificationId }
    });

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

/**
 * POST /api/notifications/stats (PUSH)
 * Get notification statistics for the logged-in user
 */
router.post('/stats', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string || req.headers['x-user-id'] as string);

    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const [total, unread, byType, byPriority] = await Promise.all([
      // Total notifications
      prisma.notification.count({ where: { userId } }),
      
      // Unread count
      prisma.notification.count({ where: { userId, read: false } }),
      
      // Count by type
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: true
      }),
      
      // Count by priority
      prisma.notification.groupBy({
        by: ['priority'],
        where: { userId, read: false },
        _count: true
      })
    ]);

    res.json({
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>)
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
});

export default router;
