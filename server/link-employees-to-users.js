/**
 * Link Employees to User Accounts
 * 
 * This script creates user accounts for employees so they can receive notifications.
 * Employees need matching user accounts (by email) to receive notifications.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkEmployeesToUsers() {
  console.log('🔗 Linking employees to user accounts...\n');

  try {
    // Get all employees
    const employees = await prisma.employee.findMany();
    console.log(`📊 Found ${employees.length} employees\n`);

    // Get all existing users
    const existingUsers = await prisma.user.findMany();
    const existingEmails = new Set(existingUsers.map(u => u.email));

    let created = 0;
    let skipped = 0;

    for (const employee of employees) {
      if (!employee.email) {
        console.log(`⏭️  Skipping ${employee.name} - no email`);
        skipped++;
        continue;
      }

      if (existingEmails.has(employee.email)) {
        console.log(`✅ ${employee.name} (${employee.email}) - user account exists`);
        skipped++;
        continue;
      }

      // Create user account for this employee
      // Default role: receptionist (id: 3)
      // You can change this based on employee department or position
      try {
        const user = await prisma.user.create({
          data: {
            name: employee.name,
            email: employee.email,
            password: 'employee123', // Default password - should be changed on first login
            role_id: 3 // receptionist role
          }
        });

        console.log(`✨ Created user account for ${employee.name} (${employee.email})`);
        created++;
      } catch (error) {
        console.error(`❌ Failed to create user for ${employee.name}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${created} new user accounts`);
    console.log(`   Skipped: ${skipped} (already have accounts or no email)`);
    console.log(`   Total employees: ${employees.length}`);

    if (created > 0) {
      console.log('\n🔐 Default password for new accounts: employee123');
      console.log('   Users should change this on first login');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
linkEmployeesToUsers()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
