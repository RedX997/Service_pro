import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// COMPLETE MOCK DATA - INCLUDES EVERYTHING
// From all pages + Reports analytics data
// ============================================

const mockClients = [
  // Main clients
  { name: 'ABC Enterprises', email: 'rajesh@abc.com', phone: '+91 98765 43210', company: 'ABC Enterprises', address: 'Mumbai, Maharashtra', status: 'active' },
  { name: 'XYZ Solutions Pvt Ltd', email: 'priya@xyz.com', phone: '+91 87654 32109', company: 'XYZ Solutions Pvt Ltd', address: 'Delhi, India', status: 'active' },
  { name: 'Patel & Associates', email: 'amit@patel.com', phone: '+91 76543 21098', company: 'Patel & Associates', address: 'Ahmedabad, Gujarat', status: 'active' },
  // Unassigned clients
  { name: 'Tech Solutions Ltd', email: 'contact@techsolutions.com', phone: '+91 98765 11122', company: 'Tech Solutions Ltd', address: 'Bangalore, Karnataka', status: 'active' },
  { name: 'Global Traders', email: 'info@globaltraders.com', phone: '+91 98765 22233', company: 'Global Traders', address: 'Chennai, Tamil Nadu', status: 'active' },
  { name: 'Sunrise Enterprises', email: 'contact@sunrise.com', phone: '+91 98765 33344', company: 'Sunrise Enterprises', address: 'Pune, Maharashtra', status: 'active' },
];

const mockEmployees = [
  { name: 'Ankit Sharma', email: 'ankit@servicepro.com', phone: '+91 98765 11111', role: 'Senior Associate', department: 'GST Services', status: 'active' },
  { name: 'Priya Mehta', email: 'priya@servicepro.com', phone: '+91 98765 22222', role: 'Manager', department: 'Income Tax', status: 'active' },
  { name: 'Rahul Verma', email: 'rahul@servicepro.com', phone: '+91 98765 33333', role: 'Associate', department: 'Audit', status: 'active' },
  { name: 'Kavita Reddy', email: 'kavita@servicepro.com', phone: '+91 98765 44444', role: 'Associate', department: 'GST Services', status: 'active' },
  { name: 'Suresh Kumar', email: 'suresh@servicepro.com', phone: '+91 98765 55555', role: 'Senior Associate', department: 'Tax Consultation', status: 'active' },
];

const mockVisitors = [
  { name: 'Rajesh Kumar', email: 'rajesh.k@example.com', phone: '+91 98765 43210', purpose: 'GST Registration Inquiry', status: 'active' },
  { name: 'Priya Sharma', email: 'priya.s@example.com', phone: '+91 87654 32109', purpose: 'ITR Filing', status: 'active' },
  { name: 'Amit Patel', email: 'amit.p@example.com', phone: '+91 76543 21098', purpose: 'Company Registration', status: 'active' },
  { name: 'Sunita Verma', email: 'sunita.v@example.com', phone: '+91 65432 10987', purpose: 'ITR Filing', status: 'active' },
];

// Helper function to create time entries for employee performance (Reports page data)
function generateMonthlyTimeEntries(employees: any[], clients: any[]) {
  const entries: any[] = [];
  const services = ['gst-filing', 'itr-filing', 'audit', 'registration', 'consultation'];
  
  // Generate entries to match Reports page employee performance
  // Ankit: 145h, Priya: 162h, Rahul: 128h, Kavita: 136h, Suresh: 98h
  const targetHours = [145, 162, 128, 136, 98];
  
  employees.forEach((emp, empIndex) => {
    const hoursNeeded = targetHours[empIndex] || 100;
    let hoursGenerated = 0;
    let dayOffset = 0;
    
    while (hoursGenerated < hoursNeeded) {
      const duration = Math.floor(Math.random() * 4 + 2) * 60; // 2-6 hours
      const clientIndex = Math.floor(Math.random() * clients.length);
      const serviceIndex = Math.floor(Math.random() * services.length);
      
      const startDate = new Date('2024-01-01');
      startDate.setDate(startDate.getDate() + dayOffset);
      startDate.setHours(9 + Math.floor(Math.random() * 6)); // 9 AM - 3 PM
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + duration);
      
      entries.push({
        employeeId: emp.id,
        clientId: clients[clientIndex].id,
        serviceId: services[serviceIndex],
        startTime: startDate,
        endTime: endDate,
        duration: duration,
        notes: `Work on ${services[serviceIndex]} for ${clients[clientIndex].name}`,
      });
      
      hoursGenerated += duration / 60;
      dayOffset++;
    }
  });
  
  return entries;
}

async function main() {
  console.log('🌱 Starting COMPLETE database seed...');
  console.log('📦 Includes ALL data from entire application + Reports analytics');
  console.log('');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.timeEntry.deleteMany();
  await prisma.message.deleteMany();
  await prisma.visitor.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.client.deleteMany();
  await prisma.department.deleteMany();
  console.log('✅ Existing data cleared');
  console.log('');

  // Seed Departments
  console.log('🏢 Seeding departments...');
  const departments = await Promise.all([
    prisma.department.create({ 
      data: { 
        name: 'GST Services', 
        description: 'GST registration, filing, and compliance services',
        employees: 2,
        services: 5,
        activeClients: 10
      } 
    }),
    prisma.department.create({ 
      data: { 
        name: 'Income Tax', 
        description: 'Income tax return filing and tax planning',
        employees: 3,
        services: 8,
        activeClients: 15
      } 
    }),
    prisma.department.create({ 
      data: { 
        name: 'Company Registration', 
        description: 'Company incorporation and registration services',
        employees: 2,
        services: 6,
        activeClients: 8
      } 
    }),
    prisma.department.create({ 
      data: { 
        name: 'Audit Services', 
        description: 'Internal and statutory audit services',
        employees: 4,
        services: 7,
        activeClients: 12
      } 
    }),
  ]);
  console.log(`✅ Created ${departments.length} departments`);
  console.log('');

  // Seed Clients
  console.log('👥 Seeding clients...');
  const clients = await Promise.all(
    mockClients.map((client) => prisma.client.create({ data: client }))
  );
  console.log(`✅ Created ${clients.length} clients`);
  console.log('');

  // Seed Employees
  console.log('👨‍💼 Seeding employees...');
  const employees = await Promise.all(
    mockEmployees.map((employee) => prisma.employee.create({ data: employee }))
  );
  console.log(`✅ Created ${employees.length} employees`);
  console.log('');

  // Seed Visitors
  console.log('👋 Seeding visitors...');
  const visitors = await Promise.all(
    mockVisitors.map((visitor, index) =>
      prisma.visitor.create({
        data: {
          ...visitor,
          hostId: employees[index % employees.length].id,
        },
      })
    )
  );
  console.log(`✅ Created ${visitors.length} visitors`);
  console.log('');

  // Seed Messages
  console.log('💬 Seeding messages...');
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        content: 'Hi, I need help with my GST filing for this month.',
        senderId: employees[0].id,
        senderType: 'client',
        clientId: clients[0].id,
        isRead: false,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Sure! I can help you with that. Please share your sales and purchase invoices.',
        senderId: employees[0].id,
        senderType: 'employee',
        clientId: clients[0].id,
        isRead: true,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Need urgent update on GST filing status',
        senderId: employees[0].id,
        senderType: 'client',
        clientId: clients[0].id,
        isRead: false,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Documents submitted, waiting for confirmation',
        senderId: employees[1].id,
        senderType: 'client',
        clientId: clients[1].id,
        isRead: false,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Query regarding tax deductions',
        senderId: employees[2].id,
        senderType: 'client',
        clientId: clients[2].id,
        isRead: false,
      },
    }),
  ]);
  console.log(`✅ Created ${messages.length} messages`);
  console.log('');

  // Seed Time Entries (Historical data for Reports)
  console.log('⏱️  Seeding time entries (historical data for reports)...');
  console.log('   This will generate entries to match Reports page analytics...');
  
  const timeEntryData = generateMonthlyTimeEntries(employees, clients);
  
  // Batch create time entries
  let created = 0;
  for (const entry of timeEntryData) {
    await prisma.timeEntry.create({ data: entry });
    created++;
    if (created % 50 === 0) {
      console.log(`   Progress: ${created}/${timeEntryData.length} entries...`);
    }
  }
  
  console.log(`✅ Created ${timeEntryData.length} time entries`);
  
  // Calculate totals
  const totalMinutes = timeEntryData.reduce((sum, entry) => sum + entry.duration, 0);
  const totalHours = Math.round(totalMinutes / 60);
  console.log(`   📊 Total billable hours: ${totalHours}h`);
  console.log('');

  // Employee performance summary
  console.log('📈 Employee Performance Summary:');
  for (let i = 0; i < employees.length; i++) {
    const empEntries = timeEntryData.filter(e => e.employeeId === employees[i].id);
    const empHours = Math.round(empEntries.reduce((sum, e) => sum + e.duration, 0) / 60);
    console.log(`   - ${employees[i].name}: ${empHours}h`);
  }
  console.log('');

  // Summary
  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📊 Final Summary:');
  console.log(`   - Clients: ${clients.length}`);
  console.log(`   - Employees: ${employees.length}`);
  console.log(`   - Visitors: ${visitors.length}`);
  console.log(`   - Messages: ${messages.length}`);
  console.log(`   - Time Entries: ${timeEntryData.length}`);
  console.log(`   - Total Billable Hours: ${totalHours}h`);
  console.log('');
  console.log('✅ ALL data preserved including Reports analytics!');
  console.log('');
  console.log('📋 Reports Page Will Show:');
  console.log('   - Revenue data (calculated from time entries)');
  console.log('   - Client growth (based on client count)');
  console.log('   - Service distribution (based on time entries)');
  console.log('   - Employee performance (matches target hours)');
  console.log('');
  console.log('Next steps:');
  console.log('1. Set VITE_USE_API=true in .env');
  console.log('2. Start backend: cd server && npm run dev');
  console.log('3. Start frontend: npm run dev');
  console.log('4. Check Reports page - all analytics will be calculated from real data!');
}

main()
  .catch((e: Error) => {
    console.error('❌ Error seeding database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
