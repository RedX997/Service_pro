import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function findAbhishek() {
  const users = await prisma.user.findMany({
    where: { name: { contains: 'abhishek', mode: 'insensitive' } },
    select: { id: true, name: true, email: true, personal_email: true, created_at: true }
  });
  console.log('--- Search Results for Abhishek ---');
  console.log(JSON.stringify(users, null, 2));

  const creds = await prisma.cascadeCredential.findMany({
    where: { full_name: { contains: 'abhishek', mode: 'insensitive' } }
  });
  console.log('--- Credential Logs for Abhishek ---');
  console.log(JSON.stringify(creds, null, 2));
}

findAbhishek().finally(() => prisma.$disconnect());
