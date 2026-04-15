import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Get all departments - POST (PUSH)
router.post('/list', async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                memberOf: {
                    include: {
                        employee: { select: { status: true } }
                    }
                }
            }
        });

        const departmentsWithCounts = departments.map((dept) => {
            // Count active employees via junction table
            const activeCount = dept.memberOf.filter(
                (m) => m.employee.status === 'active'
            ).length;

            return {
                id: dept.id,
                name: dept.name,
                description: dept.description,
                employees: activeCount,
                services: dept.services,
                activeClients: dept.activeClients,
                createdAt: dept.createdAt,
                updatedAt: dept.updatedAt,
            };
        });

        res.json(departmentsWithCounts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create department
router.post('/', async (req, res) => {
    try {
        const department = await prisma.department.create({
            data: req.body,
        });
        res.json(department);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update department
router.patch('/:id', async (req, res) => {
    try {
        const department = await prisma.department.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(department);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete department
router.delete('/:id', async (req, res) => {
    try {
        await prisma.department.delete({
            where: { id: req.params.id },
        });
        res.json({ message: 'Department deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get department by ID - POST (PUSH)
router.post('/details/:id', async (req, res) => {
    try {
        const department = await prisma.department.findUnique({
            where: { id: req.params.id },
        });
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json(department);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
