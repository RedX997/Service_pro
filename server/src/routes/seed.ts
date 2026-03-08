import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/run', async (req, res) => {
  try {
    // Check if already seeded
    const existingDepts = await prisma.department.count();
    if (existingDepts > 0) {
      return res.json({ message: 'Database already seeded', departments: existingDepts });
    }

    // Create departments
    const sales = await prisma.department.create({ 
      data: { name: 'Sales', description: 'Sales team' } 
    });
    const support = await prisma.department.create({ 
      data: { name: 'Support', description: 'Customer support' } 
    });
    const engineering = await prisma.department.create({ 
      data: { name: 'Engineering', description: 'Development team' } 
    });

    // Create employees one by one
    await prisma.employee.create({
      data: {
        name: 'John Manager',
        email: 'manager@example.com',
        phone: '555-0001',
        role: 'manager',
        department: 'Sales',
        status: 'active',
      },
    });

    await prisma.employee.create({
      data: {
        name: 'Sarah Receptionist',
        email: 'receptionist@example.com',
        phone: '555-0002',
        role: 'receptionist',
        department: 'Support',
        status: 'active',
      },
    });

    await prisma.employee.create({
      data: {
        name: 'Mike Employee',
        email: 'employee@example.com',
        phone: '555-0003',
        role: 'employee',
        department: 'Engineering',
        status: 'active',
      },
    });

    // Create clients one by one
    await prisma.client.create({
      data: {
        name: 'Acme Corp',
        email: 'contact@acme.com',
        phone: '555-1001',
        company: 'Acme Corporation',
        status: 'active',
      },
    });

    await prisma.client.create({
      data: {
        name: 'Tech Solutions',
        email: 'info@techsolutions.com',
        phone: '555-1002',
        company: 'Tech Solutions Inc',
        status: 'active',
      },
    });

    res.json({ 
      message: 'Database seeded successfully!',
      created: {
        departments: 3,
        employees: 3,
        clients: 2
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      error: 'Failed to seed database',
      details: error.message 
    });
  }
});

export default router;
