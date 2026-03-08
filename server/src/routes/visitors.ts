import express from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Get all visitors
router.get('/', async (req, res) => {
    try {
        const visitors = await prisma.visitor.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(visitors);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create visitor
router.post('/', async (req, res) => {
    try {
        const visitor = await prisma.visitor.create({
            data: req.body,
        });
        res.json(visitor);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update visitor
router.patch('/:id', async (req, res) => {
    try {
        const visitor = await prisma.visitor.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(visitor);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Checkout visitor
router.post('/:id/checkout', async (req, res) => {
    try {
        const visitor = await prisma.visitor.update({
            where: { id: req.params.id },
            data: {
                checkOutTime: new Date(),
                status: 'completed',
            },
        });
        res.json(visitor);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Convert visitor to client
router.post('/:id/convert', async (req, res) => {
    const visitorId = req.params.id;
    const { name, email, phone, company, address, status, services, assignedEmployee, lastContact } = req.body;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Update visitor status
            const visitor = await tx.visitor.update({
                where: { id: visitorId },
                data: {
                    status: 'converted',
                    checkOutTime: new Date(),
                },
            });

            // Create client
            const client = await tx.client.create({
                data: {
                    name,
                    email,
                    phone,
                    company: company || null,
                    address: address || null,
                    status: status || 'active',
                    services: services || [],
                    assignedEmployee: assignedEmployee || null,
                    lastContact: lastContact ? new Date(lastContact) : null,
                } as any, // Type assertion to bypass TypeScript error
            });

            return { visitor, client };
        });

        res.json({ visitor: result.visitor, clientId: result.client.id });
    } catch (error: any) {
        console.error('Convert visitor error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete visitor
router.delete('/:id', async (req, res) => {
    try {
        const visitor = await prisma.visitor.delete({
            where: { id: req.params.id },
        });
        res.json(visitor);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
