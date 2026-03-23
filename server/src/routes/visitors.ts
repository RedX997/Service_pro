import express from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { notify } from '../helpers/notify.js';
import { logClientActivity, ClientActivityAction } from '../helpers/logClientActivity.js';

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
        
        // 📝 LOG ACTIVITY: Visitor Entered (if linked to a client)
        // Note: Visitors don't have clientId in schema yet, but we can accept it in request body
        if (req.body.clientId) {
            const performedBy = req.body.performedBy || 5; // TODO: Get from authenticated user
            await logClientActivity({
                clientId: req.body.clientId,
                performedBy,
                action: ClientActivityAction.VISITOR_ENTERED,
                description: `${visitor.name} checked in for ${visitor.purpose}`,
                metadata: {
                    visitorId: visitor.id,
                    visitorName: visitor.name,
                    purpose: visitor.purpose,
                    enteredAt: visitor.checkInTime,
                    hostId: visitor.hostId
                }
            });
        }
        
        // Send notifications about new visitor
        // 1. Notify receptionists (they handle visitors)
        await notify({
            role: 'receptionist',
            type: 'visitor',
            title: 'New Visitor Check-In',
            message: `${visitor.name} has checked in. Purpose: ${visitor.purpose}`,
            data: { 
                visitorId: visitor.id,
                visitorName: visitor.name,
                purpose: visitor.purpose
            },
            priority: 'normal',
            actionUrl: '/visitors'
        });
        
        // 2. Notify managers (operational oversight)
        await notify({
            role: 'manager',
            type: 'visitor',
            title: 'New Visitor Check-In',
            message: `${visitor.name} has checked in. Purpose: ${visitor.purpose}`,
            data: { 
                visitorId: visitor.id,
                visitorName: visitor.name,
                purpose: visitor.purpose
            },
            priority: 'normal',
            actionUrl: '/visitors'
        });
        
        // 3. Notify admins (system oversight)
        await notify({
            role: 'super_admin',
            type: 'visitor',
            title: 'New Visitor Check-In',
            message: `${visitor.name} has checked in. Purpose: ${visitor.purpose}`,
            data: { 
                visitorId: visitor.id,
                visitorName: visitor.name,
                purpose: visitor.purpose
            },
            priority: 'normal',
            actionUrl: '/visitors'
        });
        
        // If visitor has a host assigned, notify that employee
        if (visitor.hostId) {
            const host = await prisma.employee.findUnique({
                where: { id: visitor.hostId }
            });
            
            if (host && host.email) {
                const user = await prisma.user.findUnique({
                    where: { email: host.email }
                });
                
                if (user) {
                    await notify({
                        userId: user.id,
                        type: 'visitor',
                        title: 'Visitor Assigned to You',
                        message: `${visitor.name} is here to see you. Purpose: ${visitor.purpose}`,
                        data: {
                            visitorId: visitor.id,
                            visitorName: visitor.name,
                            purpose: visitor.purpose,
                            hostId: host.id,
                            hostName: host.name
                        },
                        priority: 'high',
                        actionUrl: '/visitors'
                    });
                }
            }
        }
        
        console.log('✅ Notifications sent for new visitor');
        
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
        // Get visitor data before checkout to calculate duration
        const existingVisitor = await prisma.visitor.findUnique({
            where: { id: req.params.id }
        });
        
        if (!existingVisitor) {
            return res.status(404).json({ error: 'Visitor not found' });
        }
        
        const checkOutTime = new Date();
        const duration = Math.floor((checkOutTime.getTime() - existingVisitor.checkInTime.getTime()) / 60000); // Duration in minutes
        
        const visitor = await prisma.visitor.update({
            where: { id: req.params.id },
            data: {
                checkOutTime,
                status: 'completed',
            },
        });
        
        // 📝 LOG ACTIVITY: Visitor Exited (if linked to a client)
        // Note: Visitors don't have clientId in schema yet, but we can accept it in request body
        if (req.body.clientId) {
            const performedBy = req.body.performedBy || 5; // TODO: Get from authenticated user
            await logClientActivity({
                clientId: req.body.clientId,
                performedBy,
                action: ClientActivityAction.VISITOR_EXITED,
                description: `${visitor.name} checked out after ${duration} minutes`,
                metadata: {
                    visitorId: visitor.id,
                    visitorName: visitor.name,
                    purpose: visitor.purpose,
                    enteredAt: visitor.checkInTime,
                    exitedAt: checkOutTime,
                    duration: duration,
                    durationFormatted: `${Math.floor(duration / 60)}h ${duration % 60}m`
                }
            });
        }
        
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
