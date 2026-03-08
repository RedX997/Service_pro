import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    const clients = await prisma.client.count();
    const employees = await prisma.employee.count();
    const visitors = await prisma.visitor.count();
    const messages = await prisma.message.count();
    const timeEntries = await prisma.timeEntry.count();
    
    console.log('\n=== DATABASE RECORD COUNTS ===');
    console.log(`Clients: ${clients}`);
    console.log(`Employees: ${employees}`);
    console.log(`Visitors: ${visitors}`);
    console.log(`Messages: ${messages}`);
    console.log(`TimeEntries: ${timeEntries}`);
    console.log('==============================\n');
    
    // Get sample data
    const sampleClients = await prisma.client.findMany({ take: 3, select: { name: true, email: true } });
    const sampleEmployees = await prisma.employee.findMany({ take: 3, select: { name: true, email: true } });
    
    console.log('Sample Clients:', JSON.stringify(sampleClients, null, 2));
    console.log('Sample Employees:', JSON.stringify(sampleEmployees, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
