import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAppointments() {
  console.log('🌱 Starting appointment seeding...\n');

  try {
    // Get employees and clients
    const employees = await prisma.employee.findMany();
    const clients = await prisma.client.findMany();

    if (employees.length === 0 || clients.length === 0) {
      console.log('⚠️  No employees or clients found. Please run the main seed first.');
      return;
    }

    console.log(`📊 Found ${employees.length} employees and ${clients.length} clients\n`);

    // Sample appointments
    const appointmentsData = [
      {
        clientIndex: 0,
        employeeIndex: 0,
        contactPerson: 'Rajesh Kumar',
        date: new Date(), // Today
        time: '10:00 AM',
        duration: '1h',
        type: 'in-person',
        purpose: 'GST Consultation',
        status: 'scheduled',
        location: 'Office - Conference Room A',
        notes: 'Bring previous year GST returns',
      },
      {
        clientIndex: 1,
        employeeIndex: 1,
        contactPerson: 'Priya Sharma',
        date: new Date(), // Today
        time: '11:30 AM',
        duration: '30m',
        type: 'video',
        purpose: 'Document Review',
        status: 'scheduled',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        notes: 'Review annual financial statements',
      },
      {
        clientIndex: 2,
        employeeIndex: 2,
        contactPerson: 'Amit Patel',
        date: new Date(), // Today
        time: '02:00 PM',
        duration: '1h',
        type: 'phone',
        purpose: 'Tax Planning Discussion',
        status: 'scheduled',
        phoneNumber: '+91 98765 43210',
        notes: 'Discuss tax saving strategies for FY 2025-26',
      },
      {
        clientIndex: 3,
        employeeIndex: 3,
        contactPerson: 'Sunita Verma',
        date: new Date(), // Today
        time: '04:00 PM',
        duration: '45m',
        type: 'in-person',
        purpose: 'Annual Audit Meeting',
        status: 'scheduled',
        location: 'Client Office',
        notes: 'Final audit report presentation',
      },
      {
        clientIndex: 4,
        employeeIndex: 0,
        contactPerson: 'Ravi Kumar',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '09:00 AM',
        duration: '1h 30m',
        type: 'video',
        purpose: 'Quarterly Business Review',
        status: 'scheduled',
        meetingLink: 'https://meet.google.com/xyz-abcd-efg',
        notes: 'Q4 performance review and planning for next quarter',
      },
      {
        clientIndex: 5,
        employeeIndex: 1,
        contactPerson: 'Meera Singh',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '11:00 AM',
        duration: '1h',
        type: 'in-person',
        purpose: 'Company Registration',
        status: 'scheduled',
        location: 'Office - Meeting Room B',
        notes: 'New company incorporation documents',
      },
      {
        clientIndex: 6,
        employeeIndex: 2,
        contactPerson: 'Vikram Reddy',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        time: '10:30 AM',
        duration: '45m',
        type: 'phone',
        purpose: 'TDS Return Filing',
        status: 'scheduled',
        phoneNumber: '+91 98765 12345',
        notes: 'Quarterly TDS return filing assistance',
      },
      {
        clientIndex: 7,
        employeeIndex: 3,
        contactPerson: 'Anjali Gupta',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        time: '03:00 PM',
        duration: '1h',
        type: 'video',
        purpose: 'Financial Planning Session',
        status: 'scheduled',
        meetingLink: 'https://meet.google.com/fin-plan-123',
        notes: 'Investment and tax planning for next financial year',
      },
    ];

    let created = 0;

    for (const aptData of appointmentsData) {
      const client = clients[aptData.clientIndex];
      const employee = employees[aptData.employeeIndex];

      if (!client || !employee) {
        console.log(`⚠️  Skipping appointment - client or employee not found`);
        continue;
      }

      const appointment = await prisma.appointment.create({
        data: {
          clientId: client.id,
          employeeId: employee.id,
          contactPerson: aptData.contactPerson,
          date: aptData.date,
          time: aptData.time,
          duration: aptData.duration,
          type: aptData.type,
          purpose: aptData.purpose,
          status: aptData.status,
          notes: aptData.notes || null,
          meetingLink: aptData.meetingLink || null,
          location: aptData.location || null,
          phoneNumber: aptData.phoneNumber || null,
        },
      });

      console.log(`✅ Created appointment: ${employee.name} ↔ ${client.name} - ${aptData.purpose}`);
      console.log(`   Date: ${aptData.date.toLocaleDateString()}, Time: ${aptData.time}, Type: ${aptData.type}`);
      created++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${created} appointments`);
    console.log('\n✅ Appointment seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding appointments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedAppointments()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
