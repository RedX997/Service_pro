import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.post('/run', async (req, res) => {
  try {
    // Check if already seeded
    const existingClients = await prisma.client.count();
    if (existingClients > 2) {
      return res.json({ message: 'Database already has data', clients: existingClients });
    }

    // Clear minimal seed data if exists
    await prisma.timeEntry.deleteMany();
    await prisma.message.deleteMany();
    await prisma.visitor.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.client.deleteMany();
    await prisma.department.deleteMany();

    // Create departments
    await prisma.department.createMany({
      data: [
        { name: 'GST Services', description: 'GST registration, filing, and compliance services', employees: 2, services: 5, activeClients: 10 },
        { name: 'Income Tax', description: 'Income tax return filing and tax planning', employees: 3, services: 8, activeClients: 15 },
        { name: 'Company Registration', description: 'Company incorporation and registration services', employees: 2, services: 6, activeClients: 8 },
        { name: 'Audit Services', description: 'Internal and statutory audit services', employees: 4, services: 7, activeClients: 12 },
      ]
    });

    // Create clients
    const clients = await Promise.all([
      prisma.client.create({ data: { name: 'ABC Enterprises', email: 'rajesh@abc.com', phone: '+91 98765 43210', company: 'ABC Enterprises', address: 'Mumbai, Maharashtra', status: 'active', services: [] } }),
      prisma.client.create({ data: { name: 'XYZ Solutions Pvt Ltd', email: 'priya@xyz.com', phone: '+91 87654 32109', company: 'XYZ Solutions Pvt Ltd', address: 'Delhi, India', status: 'active', services: [] } }),
      prisma.client.create({ data: { name: 'Patel & Associates', email: 'amit@patel.com', phone: '+91 76543 21098', company: 'Patel & Associates', address: 'Ahmedabad, Gujarat', status: 'active', services: [] } }),
      prisma.client.create({ data: { name: 'Tech Solutions Ltd', email: 'contact@techsolutions.com', phone: '+91 98765 11122', company: 'Tech Solutions Ltd', address: 'Bangalore, Karnataka', status: 'active', services: [] } }),
      prisma.client.create({ data: { name: 'Global Traders', email: 'info@globaltraders.com', phone: '+91 98765 22233', company: 'Global Traders', address: 'Chennai, Tamil Nadu', status: 'active', services: [] } }),
      prisma.client.create({ data: { name: 'Sunrise Enterprises', email: 'contact@sunrise.com', phone: '+91 98765 33344', company: 'Sunrise Enterprises', address: 'Pune, Maharashtra', status: 'active', services: [] } }),
    ]);

    // Create employees
    const employees = await Promise.all([
      prisma.employee.create({ data: { name: 'Ankit Sharma', email: 'ankit@servicepro.com', phone: '+91 98765 11111', role: 'Senior Associate', department: 'GST Services', status: 'active' } }),
      prisma.employee.create({ data: { name: 'Priya Mehta', email: 'priya@servicepro.com', phone: '+91 98765 22222', role: 'Manager', department: 'Income Tax', status: 'active' } }),
      prisma.employee.create({ data: { name: 'Rahul Verma', email: 'rahul@servicepro.com', phone: '+91 98765 33333', role: 'Associate', department: 'Audit', status: 'active' } }),
      prisma.employee.create({ data: { name: 'Kavita Reddy', email: 'kavita@servicepro.com', phone: '+91 98765 44444', role: 'Associate', department: 'GST Services', status: 'active' } }),
      prisma.employee.create({ data: { name: 'Suresh Kumar', email: 'suresh@servicepro.com', phone: '+91 98765 55555', role: 'Senior Associate', department: 'Tax Consultation', status: 'active' } }),
    ]);

    // Create visitors
    await Promise.all([
      prisma.visitor.create({ data: { name: 'Rajesh Kumar', email: 'rajesh.k@example.com', phone: '+91 98765 43210', purpose: 'GST Registration Inquiry', hostId: employees[0].id, status: 'active' } }),
      prisma.visitor.create({ data: { name: 'Priya Sharma', email: 'priya.s@example.com', phone: '+91 87654 32109', purpose: 'ITR Filing', hostId: employees[1].id, status: 'active' } }),
      prisma.visitor.create({ data: { name: 'Amit Patel', email: 'amit.p@example.com', phone: '+91 76543 21098', purpose: 'Company Registration', hostId: employees[2].id, status: 'active' } }),
      prisma.visitor.create({ data: { name: 'Sunita Verma', email: 'sunita.v@example.com', phone: '+91 65432 10987', purpose: 'ITR Filing', hostId: employees[3].id, status: 'active' } }),
    ]);

    res.json({ 
      message: 'Database seeded with complete data!',
      created: {
        departments: 4,
        employees: 5,
        clients: 6,
        visitors: 4
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
