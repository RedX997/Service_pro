import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Get all employees
  const employees = await prisma.employee.findMany({
    select: { email: true, role: true, name: true },
  });

  console.log(`Found ${employees.length} employees`);

  let updated = 0;
  for (const emp of employees) {
    if (!emp.email) continue;

    // Find matching user by email
    const user = await prisma.user.findUnique({ where: { email: emp.email } });
    if (!user) continue;

    // Update job_title on the user
    await prisma.user.update({
      where: { id: user.id },
      data: { job_title: emp.role },
    });

    console.log(`  ✅ ${emp.name} (${emp.email}) → job_title: ${emp.role}`);
    updated++;
  }

  console.log(`\nUpdated ${updated} users with job titles`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
