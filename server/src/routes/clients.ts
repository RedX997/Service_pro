import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Get all clients
router.get('/', async (req, res) => {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(clients);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create client
router.post('/', async (req, res) => {
    try {
        const client = await prisma.client.create({
            data: req.body,
        });
        res.json(client);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update client
router.patch('/:id', async (req, res) => {
    try {
        console.log('Updating client:', req.params.id, req.body);
        
        const client = await prisma.client.update({
            where: { id: req.params.id },
            data: req.body,
        });
        
        console.log('Client updated successfully:', client.id);
        res.json(client);
    } catch (error: any) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get client by ID
router.get('/:id', async (req, res) => {
    try {
        const client = await prisma.client.findUnique({
            where: { id: req.params.id },
        });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.json(client);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete client
router.delete('/:id', async (req, res) => {
    try {
        await prisma.client.delete({
            where: { id: req.params.id },
        });
        res.json({ message: 'Client deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
