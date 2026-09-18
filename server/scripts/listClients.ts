import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
    },
  });

  console.log('\n📋 Available Clients:\n');
  clients.forEach((client, index) => {
    console.log(`${index + 1}. ${client.name}`);
    console.log(`   Client ID: ${client.id}`);
    console.log(`   Email: ${client.email}`);
    console.log(`   Phone: ${client.phone}`);
    console.log(`   Company: ${client.company}`);
    console.log('');
  });

  console.log(`Total clients: ${clients.length}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
