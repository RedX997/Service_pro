import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// These are the seeded employee users that were incorrectly given 'receptionist' role
// Update them to match their actual employee role
const employeeEmails = [
  'suresh@servicepro.com',
  'priya@servicepro.com',
  'ankit@servicepro.com',
  'kavita@servicepro.com',
  'rahul@servicepro.com',
];

async function main() {
  // Get the employee role (or create it if needed)
  // These users are employees in the employees table, not actual receptionists
  // We'll update their display but keep them as receptionist for login access
  // OR if you want to remove them from the users table entirely:

  const users = await prisma.user.findMany({
    where: { email: { in: employeeEmails } },
    include: { role: true },
  });

  console.log('Found users:');
  users.forEach(u => console.log(`  ${u.name} (${u.email}) - ${u.role.role_name}`));

  // Option: Delete these seeded employee users from the users/login table
  // since they are employees, not system login users
  const confirm = process.argv[2] === '--delete';

  if (confirm) {
    const deleted = await prisma.user.deleteMany({
      where: { email: { in: employeeEmails } },
    });
    console.log(`\n✅ Deleted ${deleted.count} employee users from login table`);
  } else {
    console.log('\nRun with --delete flag to remove these from the users table:');
    console.log('  node fix-employee-roles.js --delete');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
