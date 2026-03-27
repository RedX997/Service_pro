import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Ensure cascade_admin role exists
  const role = await prisma.role.upsert({
    where: { role_name: 'cascade_admin' },
    update: {},
    create: { role_name: 'cascade_admin' },
  });

  console.log('✅ Role:', role.role_name);

  // Hash password
  const plainPassword = 'CascadeAdmin@123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Create or update the cascade admin user
  const user = await prisma.user.upsert({
    where: { email: 'cascade@admin.com' },
    update: { password: hashedPassword },
    create: {
      name: 'Cascade Admin',
      email: 'cascade@admin.com',
      password: hashedPassword,
      role_id: role.id,
    },
  });

  console.log('✅ Cascade Admin user created/updated');
  console.log('   Email:    cascade@admin.com');
  console.log('   Password: CascadeAdmin@123');
  console.log('   User ID:', user.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
