import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Get all time entries
router.get('/', async (req, res) => {
    try {
        const timeEntries = await prisma.timeEntry.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                employee: true,
                client: true,
            },
        });
        res.json(timeEntries);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get active timer for employee
router.get('/active/:employeeId', async (req, res) => {
    try {
        // In this simple implementation, we assume the latest entry without an endTime is the active timer
        // Note: The schema definition of TimeEntry doesn't explicitly distinguish "ActiveTimer" as a separate table
        // in the initial plan, but the service logic suggests it might be treated differently.
        // However, looking at the schema, TimeEntry has startTime and endTime.
        // If endTime is null, it's active.

        const activeEntry = await prisma.timeEntry.findFirst({
            where: {
                employeeId: req.params.employeeId,
                endTime: null
            },
            orderBy: { startTime: 'desc' }
        });

        // transform to match frontend expectation of ActiveTimer if needed, 
        // or just return null if none.
        res.json(activeEntry);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Start timer
router.post('/start', async (req, res) => {
    try {
        console.log('Start timer request body:', req.body);
        
        const { employeeId, clientId, serviceId, notes } = req.body;

        // Validate required fields
        if (!employeeId || !clientId || !serviceId) {
            console.error('Missing required fields:', { employeeId, clientId, serviceId });
            return res.status(400).json({ 
                error: 'Missing required fields: employeeId, clientId, serviceId' 
            });
        }

        // Check if employee exists
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId }
        });
        
        if (!employee) {
            console.error('Employee not found:', employeeId);
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Check if client exists
        const client = await prisma.client.findUnique({
            where: { id: clientId }
        });
        
        if (!client) {
            console.error('Client not found:', clientId);
            return res.status(404).json({ error: 'Client not found' });
        }

        // Check if already active
        const existing = await prisma.timeEntry.findFirst({
            where: {
                employeeId: employeeId,
                endTime: null
            }
        });

        if (existing) {
            console.log('Timer already active for employee:', employeeId);
            return res.status(400).json({ error: 'Timer already active for this employee' });
        }

        const timer = await prisma.timeEntry.create({
            data: {
                employeeId,
                clientId,
                serviceId,
                startTime: new Date(),
                notes: notes || null,
                endTime: null,
                duration: null,
            },
            include: {
                employee: true,
                client: true,
            }
        });
        
        console.log('Timer started successfully:', timer.id);
        res.json(timer);
    } catch (error: any) {
        console.error('Start timer error:', error);
        res.status(500).json({ error: error.message, details: error.toString() });
    }
});

// Stop timer
router.post('/stop', async (req, res) => {
    try {
        const { employeeId, notes } = req.body;
        const activeEntry = await prisma.timeEntry.findFirst({
            where: {
                employeeId: employeeId,
                endTime: null
            }
        });

        if (!activeEntry) {
            return res.status(404).json({ error: 'No active timer found' });
        }

        const endTime = new Date();
        const durationCount = Math.floor((endTime.getTime() - activeEntry.startTime.getTime()) / (1000 * 60));

        const updated = await prisma.timeEntry.update({
            where: { id: activeEntry.id },
            data: {
                endTime,
                duration: durationCount,
                notes: notes || activeEntry.notes
            },
            include: {
                employee: true,
                client: true
            }
        });

        res.json(updated);

    } catch (error: any) {
        console.error('Stop timer error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create manual time entry
router.post('/', async (req, res) => {
    try {
        const { employeeId, clientId, serviceId, startTime, endTime, duration, notes } = req.body;

        // Validate required fields
        if (!employeeId || !clientId || !serviceId) {
            return res.status(400).json({ 
                error: 'Missing required fields: employeeId, clientId, serviceId' 
            });
        }

        const entry = await prisma.timeEntry.create({
            data: {
                employeeId,
                clientId,
                serviceId,
                startTime: startTime ? new Date(startTime) : new Date(),
                endTime: endTime ? new Date(endTime) : null,
                duration: duration || null,
                notes: notes || null,
            },
            include: {
                employee: true,
                client: true,
            }
        });
        
        res.json(entry);
    } catch (error: any) {
        console.error('Create time entry error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update time entry
router.patch('/:id', async (req, res) => {
    try {
        const entry = await prisma.timeEntry.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(entry);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete time entry
router.delete('/:id', async (req, res) => {
    try {
        await prisma.timeEntry.delete({
            where: { id: req.params.id },
        });
        res.json({ message: 'Time entry deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
