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
        // Only pick valid Employee fields to avoid Prisma unknown field errors
        const { name, email, phone, mobile, role, department, status, avatarUrl } = req.body;
        const data: any = {};
        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email;
        if (phone !== undefined) data.phone = phone;
        if (mobile !== undefined) data.mobile = mobile;
        if (role !== undefined) data.role = role;
        if (department !== undefined) data.department = department;
        if (status !== undefined) data.status = status;
        if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

        const employee = await prisma.employee.update({
            where: { id: req.params.id },
            data,
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
        // Delete related records first to avoid FK constraint errors
        await prisma.timeEntry.deleteMany({ where: { employeeId: req.params.id } });
        await prisma.message.deleteMany({ where: { senderId: req.params.id } });
        await prisma.conversation.deleteMany({ where: { employeeId: req.params.id } });
        const employee = await prisma.employee.delete({
            where: { id: req.params.id },
        });
        res.json(employee);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
