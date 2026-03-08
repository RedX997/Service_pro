import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Get all messages
router.get('/', async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                client: true,
                employee: true,
            },
        });
        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create message
router.post('/', async (req, res) => {
    try {
        const message = await prisma.message.create({
            data: req.body,
            include: {
                client: true,
                employee: true,
            },
        });
        res.json(message);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Mark as read
router.patch('/:id/read', async (req, res) => {
    try {
        const message = await prisma.message.update({
            where: { id: req.params.id },
            data: { isRead: true },
            include: {
                client: true,
                employee: true,
            },
        });
        res.json(message);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete message
router.delete('/:id', async (req, res) => {
    try {
        await prisma.message.delete({
            where: { id: req.params.id },
        });
        res.json({ message: 'Message deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
