import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Get all support tickets (Admin view) - POST (PUSH)
router.post('/list', async (req, res) => {
    try {
        const tickets = await (prisma as any).supportTicket.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: {
                            select: {
                                role_name: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(tickets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get tickets for a specific user - POST (PUSH)
router.post('/user/:userId', async (req, res) => {
    try {
        const tickets = await (prisma as any).supportTicket.findMany({
            where: { userId: parseInt(req.params.userId) },
            orderBy: { createdAt: 'desc' },
        });
        res.json(tickets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create a support ticket
router.post('/', async (req, res) => {
    try {
        const { userId, subject, message, category, priority } = req.body;
        const ticket = await (prisma as any).supportTicket.create({
            data: {
                userId: parseInt(userId),
                subject,
                message,
                category,
                priority: priority || 'medium',
                status: 'open'
            },
        });
        res.json(ticket);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Admin reply to ticket
router.post('/reply/:id', async (req, res) => {
    try {
        const { reply } = req.body;
        const ticket = await (prisma as any).supportTicket.update({
            where: { id: req.params.id },
            data: {
                adminReply: reply,
                status: 'resolved',
                resolvedAt: new Date()
            },
        });

        // Create notification for the user
        try {
            await (prisma as any).notification.create({
                data: {
                    userId: ticket.userId,
                    type: 'system',
                    title: 'Support Ticket Resolved',
                    message: `Your ticket "${ticket.subject}" has been resolved. Click to view response.`,
                    priority: 'normal',
                    actionUrl: '/support'
                }
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
            // Don't fail the whole request if notification fails
        }

        res.json(ticket);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update ticket status
router.patch('/:id', async (req, res) => {
    try {
        const ticket = await (prisma as any).supportTicket.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(ticket);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
