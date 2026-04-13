import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Get all employees - POST (PUSH)
router.post('/list', async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(employees);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create employee
router.post('/', async (req, res) => {
    try {
        const employee = await prisma.employee.create({
            data: req.body,
        });
        res.json(employee);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update employee
router.patch('/:id', async (req, res) => {
    try {
        const employee = await prisma.employee.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(employee);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get employee by ID - POST (PUSH)
router.post('/details/:id', async (req, res) => {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id: req.params.id },
        });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json(employee);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete employee
router.delete('/:id', async (req, res) => {
    try {
        const employee = await prisma.employee.delete({
            where: { id: req.params.id },
        });
        res.json(employee);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
