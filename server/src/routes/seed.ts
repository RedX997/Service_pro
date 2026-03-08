import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.post('/run', async (req, res) => {
  try {
    // Check if already seeded
    const existingDepts = await prisma.department.count();
    if (existingDepts > 0) {
      return res.json({ message: 'Database already seeded' });
    }

    // Create departments
    const departments = await Promise.all([
      prisma.department.create({ data: { name: 'Sales', description: 'Sales team' } }),
      prisma.department.create({ data: { name: 'Support', description: 'Customer support' } }),
      prisma.department.create({ data: { name: 'Engineering', description: 'Development team' } }),
    ]);

    // Create employees
    await prisma.employee.createMany({
      data: [
        {
          name: 'John Manager',
          email: 'manager@example.com',
          phone: '555-0001',
          role: 'manager',
          departmentId: departments[0].id,
          status: 'active',
        },
        {
          name: 'Sarah Receptionist',
          email: 'receptionist@example.com',
          phone: '555-0002',
          role: 'receptionist',
          departmentId: departments[1].id,
          status: 'active',
        },
        {
          name: 'Mike Employee',
          email: 'employee@example.com',
          phone: '555-0003',
          role: 'employee',
          departmentId: departments[2].id,
          status: 'active',
        },
      ],
    });

    // Create clients
    await prisma.client.createMany({
      data: [
        {
          name: 'Acme Corp',
          email: 'contact@acme.com',
          phone: '555-1001',
          company: 'Acme Corporation',
          status: 'active',
        },
        {
          name: 'Tech Solutions',
          email: 'info@techsolutions.com',
          phone: '555-1002',
          company: 'Tech Solutions Inc',
          status: 'active',
        },
      ],
    });

    res.json({ message: 'Database seeded successfully!' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

export default router;
