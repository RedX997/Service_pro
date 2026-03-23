import express from 'express';
import { prisma } from '../lib/prisma.js';
import { getIO } from '../socket.js';

const router = express.Router();

// Get all conversations for an employee
router.get('/conversations/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        const conversations = await prisma.conversation.findMany({
            where: { employeeId },
            include: {
                messages: {
                    orderBy: { timestamp: 'desc' },
                    take: 1, // Get last message
                },
            },
            orderBy: { lastMessageAt: 'desc' },
        });

        // Get client details for each conversation
        const conversationsWithClients = await Promise.all(
            conversations.map(async (conv) => {
                const client = await prisma.client.findUnique({
                    where: { id: conv.clientId },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        company: true,
                    },
                });

                return {
                    ...conv,
                    client,
                    lastMessage: conv.messages[0] || null,
                };
            })
        );

        res.json(conversationsWithClients);
    } catch (error: any) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get messages for a conversation
router.get('/conversation/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, before } = req.query;

        const messages = await prisma.message.findMany({
            where: {
                conversationId,
                ...(before && {
                    timestamp: {
                        lt: new Date(before as string),
                    },
                }),
            },
            orderBy: { timestamp: 'desc' },
            take: Number(limit),
            include: {
                replyTo: {
                    select: {
                        id: true,
                        content: true,
                        senderId: true,
                        senderType: true,
                    },
                },
            },
        });

        res.json(messages.reverse()); // Return in chronological order
    } catch (error: any) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get or create conversation between employee and client
router.post('/conversation', async (req, res) => {
    try {
        const { employeeId, clientId } = req.body;

        let conversation = await prisma.conversation.findUnique({
            where: {
                clientId_employeeId: {
                    clientId,
                    employeeId,
                },
            },
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    clientId,
                    employeeId,
                },
            });
        }

        res.json(conversation);
    } catch (error: any) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send a message
router.post('/', async (req, res) => {
    try {
        const { conversationId, content, senderId, senderType, clientId, replyToId } = req.body;

        // Create message
        const message = await prisma.message.create({
            data: {
                conversationId,
                content,
                senderId,
                senderType,
                clientId,
                replyToId: replyToId || null,
            },
            include: {
                replyTo: {
                    select: {
                        id: true,
                        content: true,
                        senderId: true,
                        senderType: true,
                    },
                },
            },
        });

        // Update conversation
        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessageId: message.id,
                lastMessageAt: message.timestamp,
                ...(senderType === 'client' && {
                    unreadCount: { increment: 1 },
                }),
            },
        });

        // Emit via Socket.io for real-time delivery
        const io = getIO();
        io.to(conversationId).emit('message:new', message);

        res.json(message);
    } catch (error: any) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark message as delivered
router.patch('/:messageId/delivered', async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await prisma.message.update({
            where: { id: messageId },
            data: {
                isDelivered: true,
                deliveredAt: new Date(),
            },
        });

        // Emit delivery status via Socket.io
        const io = getIO();
        io.to(message.conversationId).emit('message:delivered', {
            messageId: message.id,
            deliveredAt: message.deliveredAt,
        });

        res.json(message);
    } catch (error: any) {
        console.error('Error marking message as delivered:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark message as read
router.patch('/:messageId/read', async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await prisma.message.update({
            where: { id: messageId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        // Emit read status via Socket.io
        const io = getIO();
        io.to(message.conversationId).emit('message:read', {
            messageId: message.id,
            readAt: message.readAt,
        });

        res.json(message);
    } catch (error: any) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark all messages in conversation as read
router.patch('/conversation/:conversationId/read', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;

        // Mark all unread messages as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                isRead: false,
                senderId: { not: userId }, // Don't mark own messages as read
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        // Reset unread count
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { unreadCount: 0 },
        });

        // Emit read status via Socket.io
        const io = getIO();
        io.to(conversationId).emit('conversation:read', {
            conversationId,
            userId,
        });

        res.json({ success: true });
    } catch (error: any) {
        console.error('Error marking conversation as read:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add reaction to message
router.post('/:messageId/reaction', async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId, emoji } = req.body;

        const message = await prisma.message.findUnique({
            where: { id: messageId },
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Update reactions
        const reactions = (message.reactions as any) || {};
        reactions[userId] = emoji;

        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: { reactions },
        });

        // Emit reaction via Socket.io
        const io = getIO();
        io.to(message.conversationId).emit('message:reaction', {
            messageId,
            userId,
            emoji,
        });

        res.json(updatedMessage);
    } catch (error: any) {
        console.error('Error adding reaction:', error);
        res.status(500).json({ error: error.message });
    }
});

// Edit message
router.patch('/:messageId/edit', async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;

        const message = await prisma.message.update({
            where: { id: messageId },
            data: {
                content,
                isEdited: true,
                editedAt: new Date(),
            },
        });

        // Emit edit via Socket.io
        const io = getIO();
        io.to(message.conversationId).emit('message:edited', {
            messageId,
            content,
            editedAt: message.editedAt,
        });

        res.json(message);
    } catch (error: any) {
        console.error('Error editing message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete message
router.delete('/:messageId', async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await prisma.message.findUnique({
            where: { id: messageId },
        });

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        await prisma.message.delete({
            where: { id: messageId },
        });

        // Emit delete via Socket.io
        const io = getIO();
        io.to(message.conversationId).emit('message:deleted', { messageId });

        res.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Search messages
router.get('/search', async (req, res) => {
    try {
        const { query, conversationId } = req.query;

        const messages = await prisma.message.findMany({
            where: {
                ...(conversationId && { conversationId: conversationId as string }),
                content: {
                    contains: query as string,
                    mode: 'insensitive',
                },
            },
            orderBy: { timestamp: 'desc' },
            take: 50,
        });

        res.json(messages);
    } catch (error: any) {
        console.error('Error searching messages:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
