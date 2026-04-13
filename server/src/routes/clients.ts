import express from 'express';
import { prisma } from '../lib/prisma.js';
import { notify } from '../helpers/notify.js';
import { logClientActivity, ClientActivityAction, generateUpdateDescription, getEmployeeName } from '../helpers/logClientActivity.js';

const router = express.Router();

// Get all clients - POST (PUSH)
router.post('/list', async (req, res) => {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(clients);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get global activity history - POST (PUSH)
router.post('/all-activity', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        
        const activities = await prisma.clientActivityLog.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: {
                            select: {
                                role_name: true
                            }
                        }
                    }
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                        company: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        
        res.json(activities);
    } catch (error: any) {
        console.error('Error fetching global activity:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create client
router.post('/', async (req, res) => {
    try {
        console.log('Creating client with data:', req.body);
        console.log('assignedEmployee field:', req.body.assignedEmployee);
        console.log('services field:', req.body.services);
        
        const client = await prisma.client.create({
            data: req.body,
        });
        
        console.log('Client created successfully:', client);
        console.log('Created client assignedEmployee:', client.assignedEmployee);
        
        // 📝 LOG ACTIVITY: Client Created
        const employeeName = client.assignedEmployee ? await getEmployeeName(client.assignedEmployee) : null;
        await logClientActivity({
            clientId: client.id,
            performedBy: req.body.performedBy || 5, // TODO: Get from authenticated user
            action: ClientActivityAction.CLIENT_CREATED,
            description: `Client ${client.name} was created${employeeName ? ` and assigned to ${employeeName}` : ''}`,
            metadata: {
                initialStatus: client.status,
                assignedEmployee: client.assignedEmployee,
                assignedEmployeeName: employeeName,
                services: client.services,
                company: client.company,
                email: client.email,
                phone: client.phone
            }
        });
        
        // Send notifications about new client
        // 1. Notify managers and admins (oversight)
        await notify({
            role: 'manager',
            type: 'system',
            title: 'New Client Added',
            message: `${client.name} has been added as a new client`,
            data: { 
                clientId: client.id,
                clientName: client.name,
                company: client.company
            },
            priority: 'normal',
            actionUrl: '/clients'
        });
        
        await notify({
            role: 'super_admin',
            type: 'system',
            title: 'New Client Added',
            message: `${client.name} has been added as a new client`,
            data: { 
                clientId: client.id,
                clientName: client.name,
                company: client.company
            },
            priority: 'normal',
            actionUrl: '/clients'
        });
        
        // If client is assigned to an employee, notify them
        if (client.assignedEmployee) {
            const employee = await prisma.employee.findUnique({
                where: { id: client.assignedEmployee }
            });
            
            if (employee && employee.email) {
                // Find user account for this employee (if they have one)
                const user = await prisma.user.findUnique({
                    where: { email: employee.email }
                });
                
                if (user) {
                    await notify({
                        userId: user.id,
                        type: 'system',
                        title: 'New Client Assigned',
                        message: `You have been assigned to client: ${client.name}${client.company ? ` (${client.company})` : ''}`,
                        data: {
                            clientId: client.id,
                            clientName: client.name,
                            company: client.company,
                            employeeId: employee.id,
                            employeeName: employee.name
                        },
                        priority: 'high',
                        actionUrl: '/clients'
                    });
                }
            }
        }
        
        console.log('✅ Notifications sent for new client');
        
        res.json(client);
    } catch (error: any) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update client
router.patch('/:id', async (req, res) => {
    try {
        console.log('Updating client:', req.params.id, req.body);
        
        // Get the old client data to check for changes
        const oldClient = await prisma.client.findUnique({
            where: { id: req.params.id }
        });
        
        if (!oldClient) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        const client = await prisma.client.update({
            where: { id: req.params.id },
            data: req.body,
        });
        
        console.log('Client updated successfully:', client.id);
        
        const performedBy = req.body.performedBy || 5; // TODO: Get from authenticated user
        
        // 📝 LOG ACTIVITY: Check what changed and log accordingly
        
        // Check for status change
        if (oldClient.status !== client.status) {
            await logClientActivity({
                clientId: client.id,
                performedBy,
                action: ClientActivityAction.STATUS_CHANGED,
                description: `Status changed from ${oldClient.status} to ${client.status}`,
                metadata: {
                    from: oldClient.status,
                    to: client.status
                }
            });
        }
        
        // Check for employee assignment/unassignment
        if (oldClient.assignedEmployee !== client.assignedEmployee) {
            const oldEmployeeName = oldClient.assignedEmployee ? await getEmployeeName(oldClient.assignedEmployee) : null;
            const newEmployeeName = client.assignedEmployee ? await getEmployeeName(client.assignedEmployee) : null;
            
            if (!oldClient.assignedEmployee && client.assignedEmployee) {
                // Employee assigned (was null, now has value)
                await logClientActivity({
                    clientId: client.id,
                    performedBy,
                    action: ClientActivityAction.EMPLOYEE_ASSIGNED,
                    description: `Assigned to ${newEmployeeName}`,
                    metadata: {
                        previousAssignee: null,
                        newAssignee: newEmployeeName,
                        previousAssigneeId: null,
                        newAssigneeId: client.assignedEmployee
                    }
                });
            } else if (oldClient.assignedEmployee && !client.assignedEmployee) {
                // Employee unassigned (had value, now null)
                await logClientActivity({
                    clientId: client.id,
                    performedBy,
                    action: ClientActivityAction.EMPLOYEE_UNASSIGNED,
                    description: `Unassigned from ${oldEmployeeName}`,
                    metadata: {
                        previousAssignee: oldEmployeeName,
                        previousAssigneeId: oldClient.assignedEmployee
                    }
                });
            } else {
                // Employee reassigned (changed from one to another)
                await logClientActivity({
                    clientId: client.id,
                    performedBy,
                    action: ClientActivityAction.EMPLOYEE_ASSIGNED,
                    description: `Reassigned from ${oldEmployeeName} to ${newEmployeeName}`,
                    metadata: {
                        previousAssignee: oldEmployeeName,
                        newAssignee: newEmployeeName,
                        previousAssigneeId: oldClient.assignedEmployee,
                        newAssigneeId: client.assignedEmployee
                    }
                });
            }
            
            // Notify managers and admins about reassignment
            await notify({
                role: 'manager',
                type: 'system',
                title: 'Client Reassigned',
                message: `${client.name} has been reassigned`,
                data: {
                    clientId: client.id,
                    clientName: client.name,
                    oldEmployeeId: oldClient.assignedEmployee,
                    newEmployeeId: client.assignedEmployee
                },
                priority: 'high',
                actionUrl: '/clients'
            });
            
            await notify({
                role: 'super_admin',
                type: 'system',
                title: 'Client Reassigned',
                message: `${client.name} has been reassigned`,
                data: {
                    clientId: client.id,
                    clientName: client.name,
                    oldEmployeeId: oldClient.assignedEmployee,
                    newEmployeeId: client.assignedEmployee
                },
                priority: 'high',
                actionUrl: '/clients'
            });
            
            // Notify old employee (if they had one)
            if (oldClient.assignedEmployee) {
                const oldEmployee = await prisma.employee.findUnique({
                    where: { id: oldClient.assignedEmployee }
                });
                
                if (oldEmployee && oldEmployee.email) {
                    const oldUser = await prisma.user.findUnique({
                        where: { email: oldEmployee.email }
                    });
                    
                    if (oldUser) {
                        await notify({
                            userId: oldUser.id,
                            type: 'system',
                            title: 'Client Unassigned',
                            message: `Client ${client.name} has been unassigned from you`,
                            data: {
                                clientId: client.id,
                                clientName: client.name
                            },
                            priority: 'normal',
                            actionUrl: '/clients'
                        });
                    }
                }
            }
            
            // Notify new employee
            if (client.assignedEmployee) {
                const newEmployee = await prisma.employee.findUnique({
                    where: { id: client.assignedEmployee }
                });
                
                if (newEmployee && newEmployee.email) {
                    const newUser = await prisma.user.findUnique({
                        where: { email: newEmployee.email }
                    });
                    
                    if (newUser) {
                        await notify({
                            userId: newUser.id,
                            type: 'system',
                            title: 'New Client Assigned',
                            message: `You have been assigned to client: ${client.name}`,
                            data: {
                                clientId: client.id,
                                clientName: client.name,
                                employeeId: newEmployee.id,
                                employeeName: newEmployee.name
                            },
                            priority: 'high',
                            actionUrl: '/clients'
                        });
                    }
                }
            }
        }
        
        // Check for services changes
        const oldServices = oldClient.services || [];
        const newServices = client.services || [];
        const addedServices = newServices.filter(s => !oldServices.includes(s));
        const removedServices = oldServices.filter(s => !newServices.includes(s));
        
        for (const service of addedServices) {
            await logClientActivity({
                clientId: client.id,
                performedBy,
                action: ClientActivityAction.SERVICE_ADDED,
                description: `Service added: ${service}`,
                metadata: {
                    serviceName: service,
                    services: newServices
                }
            });
        }
        
        for (const service of removedServices) {
            await logClientActivity({
                clientId: client.id,
                performedBy,
                action: ClientActivityAction.SERVICE_REMOVED,
                description: `Service removed: ${service}`,
                metadata: {
                    serviceName: service,
                    services: newServices
                }
            });
        }
        
        // Check for other field changes
        const fieldsToCheck = ['name', 'email', 'phone', 'company', 'address'];
        const fieldLabels = {
            name: 'Name',
            email: 'Email',
            phone: 'Phone',
            company: 'Company',
            address: 'Address'
        };
        
        const changes = [];
        for (const field of fieldsToCheck) {
            if (oldClient[field] !== client[field]) {
                changes.push({
                    field,
                    fieldLabel: fieldLabels[field],
                    oldValue: oldClient[field],
                    newValue: client[field]
                });
            }
        }
        
        if (changes.length > 0) {
            const changeDescriptions = changes.map(c => `${c.fieldLabel} updated`).join(', ');
            await logClientActivity({
                clientId: client.id,
                performedBy,
                action: ClientActivityAction.CLIENT_UPDATED,
                description: changeDescriptions,
                metadata: { changes }
            });
        }
        
        res.json(client);
    } catch (error: any) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get client by ID - POST (PUSH)
router.post('/details/:id', async (req, res) => {
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

// Get client activity history - POST (PUSH)
router.post('/:id/activity/list', async (req, res) => {
    try {
        const clientId = req.params.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        
        // Get activity logs with user information
        const activities = await prisma.clientActivityLog.findMany({
            where: { clientId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: {
                            select: {
                                role_name: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });
        
        // Get total count for pagination
        const total = await prisma.clientActivityLog.count({
            where: { clientId }
        });
        
        res.json({
            activities,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error('Error fetching client activity:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete client
router.delete('/:id', async (req, res) => {
    try {
        // Get client data before deletion
        const client = await prisma.client.findUnique({
            where: { id: req.params.id }
        });
        
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        const performedBy = req.body.performedBy || req.query.performedBy || 5; // TODO: Get from authenticated user
        
        // 📝 LOG ACTIVITY: Client Deleted (before actual deletion)
        await logClientActivity({
            clientId: client.id,
            performedBy: parseInt(performedBy as string),
            action: ClientActivityAction.CLIENT_DELETED,
            description: `Client ${client.name} was deleted`,
            metadata: {
                deletedClientData: {
                    name: client.name,
                    email: client.email,
                    phone: client.phone,
                    company: client.company,
                    status: client.status,
                    assignedEmployee: client.assignedEmployee
                }
            }
        });
        
        // Now delete the client
        await prisma.client.delete({
            where: { id: req.params.id },
        });
        
        res.json({ message: 'Client deleted', clientName: client.name });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
