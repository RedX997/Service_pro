/**
 * Seed Users for Production Database
 * 
 * This script creates the test users in your Render PostgreSQL database.
 * Run this ONCE after deploying to Render.
 * 
 * NOTE: Passwords are stored in plain text (no bcrypt) as per current auth implementation
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testUsers = [
  {
    name: 'Super Admin',
    email: 'admin@servicepro.com',
    password: 'admin123',
    role_id: 1 // super_admin
  },
  {
    name: 'Manager User',
    email: 'manager@servicepro.com',
    password: 'manager123',
    role_id: 2 // manager
  },
  {
    name: 'Receptionist User',
    email: 'receptionist@servicepro.com',
    password: 'receptionist123',
    role_id: 3 // receptionist
  }
];

async function seedUsers() {
  console.log('🌱 Starting user seeding...\n');

  try {
    // Check if roles exist
    const roles = await prisma.role.findMany();
    console.log(`📊 Found ${roles.length} roles in database`);
    
    if (roles.length === 0) {
      console.log('⚠️  No roles found! Creating roles first...');
      
      // Create roles
      await prisma.role.createMany({
        data: [
          { id: 1, role_name: 'super_admin' },
          { id: 2, role_name: 'manager' },
          { id: 3, role_name: 'receptionist' }
        ],
        skipDuplicates: true
      });
      
      console.log('✅ Roles created');
    }

    // Create users
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (existingUser) {
          console.log(`⏭️  User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Create user (plain text password - matches auth.ts implementation)
        const user = await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: userData.password, // Plain text password
            role_id: userData.role_id
          },
          include: {
            role: true
          }
        });

        console.log(`✅ Created user: ${user.email} (${user.role.role_name})`);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎉 User seeding complete!');
    console.log('\n📋 Test Credentials:');
    console.log('Super Admin: admin@servicepro.com / admin123');
    console.log('Manager: manager@servicepro.com / manager123');
    console.log('Receptionist: receptionist@servicepro.com / receptionist123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedUsers()
  .then(() => {
    console.log('\n✅ Seeding script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding script failed:', error);
    process.exit(1);
  });
