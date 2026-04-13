import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Get all tasks - Using POST (PUSH)
router.post('/list', async (req, res) => {
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
                        avatarUrl: true,
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

// Get today's tasks - Using POST (PUSH)
router.post('/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tasks = await prisma.task.findMany({
            where: {
                OR: [
                    {
                        dueDate: {
                            gte: today,
                            lt: tomorrow,
                        },
                    },
                    {
                        dueDate: {
                            lt: today,
                        },
                        status: {
                            not: 'completed',
                        },
                    },
                ],
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        department: true,
                        avatarUrl: true,
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
            orderBy: { dueDate: 'asc' },
        });
        res.json(tasks);
    } catch (error: any) {
        console.error('Error fetching today tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get tasks for a specific employee - Using POST (PUSH)
router.post('/employee/:employeeId', async (req, res) => {
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
                        avatarUrl: true,
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
        
        // If assignedTo is a placeholder or missing, use the first employee
        let assignedTo = req.body.assignedTo;
        if (!assignedTo || assignedTo === 'current-user-id') {
            const firstEmployee = await prisma.employee.findFirst();
            if (!firstEmployee) {
                return res.status(400).json({ error: 'No employees found to assign task' });
            }
            assignedTo = firstEmployee.id;
        }
        
        const task = await prisma.task.create({
            data: {
                ...req.body,
                assignedTo,
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        department: true,
                        avatarUrl: true,
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
                        avatarUrl: true,
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

// Get task statistics - Using POST (PUSH)
router.post('/stats/:employeeId', async (req, res) => {
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