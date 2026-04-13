const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const departments = [
    {
      name: 'Income Tax',
      description: 'Handles all income tax related services and filings',
      employees: 5,
      services: 3,
      activeClients: 25,
    },
    {
      name: 'GST',
      description: 'Manages GST filings, corrections, and registrations',
      employees: 3,
      services: 4,
      activeClients: 10,
    },
    {
      name: 'Corporate Law',
      description: 'Assists with company formation and legal compliance',
      employees: 2,
      services: 5,
      activeClients: 12,
    },
    {
      name: 'Auditing',
      description: 'Performs internal and statutory audits for businesses',
      employees: 0,
      services: 2,
      activeClients: 0,
    }
  ];

  console.log('Seeding departments...');

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {
        description: dept.description,
        employees: dept.employees,
        services: dept.services,
        activeClients: dept.activeClients,
      },
      create: dept,
    });
  }

  console.log('✅ Departments seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
