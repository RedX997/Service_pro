import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        department: true,
                    },
                },
                assigner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                        company: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(tasks);
    } catch (error: any) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get tasks for a specific employee
router.get('/employee/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        const tasks = await prisma.task.findMany({
            where: { assignedTo: employeeId },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        department: true,
                    },
                },
                assigner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                        company: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(tasks);
    } catch (error: any) {
        console.error('Error fetching employee tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create task
router.post('/', async (req, res) => {
    try {
        console.log('Creating task with data:', req.body);
        
        const task = await prisma.task.create({
            data: req.body,
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        department: true,
                    },
                },
                assigner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                        company: true,
                    },
                },
            },
        });
        
        console.log('Task created successfully:', task);
        res.json(task);
    } catch (error: any) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update task
router.patch('/:id', async (req, res) => {
    try {
        console.log('Updating task:', req.params.id, req.body);
        
        const task = await prisma.task.update({
            where: { id: req.params.id },
            data: req.body,
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        department: true,
                    },
                },
                assigner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                        company: true,
                    },
                },
            },
        });
        
        console.log('Task updated successfully:', task.id);
        res.json(task);
    } catch (error: any) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete task
router.delete('/:id', async (req, res) => {
    try {
        await prisma.task.delete({
            where: { id: req.params.id },
        });
        res.json({ message: 'Task deleted' });
    } catch (error: any) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get task statistics for an employee
router.get('/stats/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        const stats = await prisma.task.groupBy({
            by: ['status'],
            where: { assignedTo: employeeId },
            _count: {
                status: true,
            },
        });
        
        // Get overdue tasks count
        const overdueTasks = await prisma.task.count({
            where: {
                assignedTo: employeeId,
                dueDate: {
                    lt: new Date(),
                },
                status: {
                    not: 'completed',
                },
            },
        });
        
        res.json({
            statusBreakdown: stats,
            overdueTasks,
        });
    } catch (error: any) {
        console.error('Error fetching task stats:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;