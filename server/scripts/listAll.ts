import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listEverything() {
  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { created_at: 'desc' }
  });
  console.log(`--- Total Users: ${users.length} ---`);
  users.forEach(u => console.log(`${u.id}: ${u.name} (${u.email}) - ${u.role.role_name}`));

  const credentials = await prisma.cascadeCredential.findMany({
    orderBy: { created_at: 'desc' }
  });
  console.log(`--- Total Credentials: ${credentials.length} ---`);
  credentials.forEach(c => console.log(`${c.id}: ${c.full_name} (${c.system_email}) - Personal: ${c.personal_email}`));
}

listEverything().finally(() => prisma.$disconnect());
