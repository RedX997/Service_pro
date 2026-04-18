import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function findAdmin() {
  const admin = await prisma.user.findFirst({
    where: { role: { role_name: 'cascade_admin' } },
    select: { id: true, name: true, email: true }
  });
  console.log('Admin:', JSON.stringify(admin, null, 2));
}

findAdmin().finally(() => prisma.$disconnect());
