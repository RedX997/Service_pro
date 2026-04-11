/**
 * Railway Migration Seed Script
 * 
 * This script reads all data from your LOCAL database and inserts it into
 * the new Railway database.
 * 
 * Usage:
 *   DATABASE_URL="your-railway-postgres-url" node seed-railway.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Railway seed...\n');

  // ─── 1. ROLES ───────────────────────────────────────────────────────────────
  console.log('📌 Seeding roles...');
  const roles = [
    { role_name: 'super_admin' },
    { role_name: 'manager' },
    { role_name: 'receptionist' },
    { role_name: 'cascade_admin' },
  ];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { role_name: role.role_name },
      update: {},
      create: role,
    });
  }
  console.log(`  ✅ ${roles.length} roles seeded`);

  // ─── 2. USERS ────────────────────────────────────────────────────────────────
  console.log('📌 Seeding users...');
  const users = [
    // Super Admin
    {
      name: 'Admin User',
      email: 'admin@servicepro.com',
      password: 'admin123',
      role_name: 'super_admin',
      personal_email: null,
      is_active: true,
      job_title: null,
    },
    // Manager
    {
      name: 'Manager User',
      email: 'manager@servicepro.com',
      password: 'manager123',
      role_name: 'manager',
      personal_email: null,
      is_active: true,
      job_title: null,
    },
    // Receptionist
    {
      name: 'Receptionist User',
      email: 'receptionist@servicepro.com',
      password: 'receptionist123',
      role_name: 'receptionist',
      personal_email: null,
      is_active: true,
      job_title: null,
    },
    // Cascade Admin
    {
      name: 'Cascade Admin',
      email: 'cascade@admin.com',
      // bcrypt hash of 'CascadeAdmin@123'
      password: '$2b$10$T7zIuWZlP9.TKQPkzohkPeCt3EJ7Rt5JYItbw8vBAwN.voM.6Eo2S',
      role_name: 'cascade_admin',
      personal_email: null,
      is_active: true,
      job_title: null,
    },
    // Employees linked as users
    {
      name: 'Suresh Kumar',
      email: 'suresh@servicepro.com',
      password: 'suresh123',
      role_name: 'receptionist',
      personal_email: null,
      is_active: true,
      job_title: 'Senior Associate',
    },
    {
      name: 'Priya Mehta',
      email: 'priya@servicepro.com',
      password: 'priya123',
      role_name: 'receptionist',
      personal_email: null,
      is_active: true,
      job_title: 'Manager',
    },
    {
      name: 'Ankit Sharma',
      email: 'ankit@servicepro.com',
      password: 'ankit123',
      role_name: 'receptionist',
      personal_email: null,
      is_active: true,
      job_title: 'Senior Associate',
    },
    {
      name: 'Kavita Reddy',
      email: 'kavita@servicepro.com',
      password: 'kavita123',
      role_name: 'receptionist',
      personal_email: null,
      is_active: true,
      job_title: 'Associate',
    },
    {
      name: 'Rahul Verma',
      email: 'rahul@servicepro.com',
      password: 'rahul123',
      role_name: 'receptionist',
      personal_email: null,
      is_active: true,
      job_title: 'Associate',
    },
  ];

  for (const u of users) {
    const role = await prisma.role.findUnique({ where: { role_name: u.role_name } });
    if (!role) { console.warn(`  ⚠️ Role not found: ${u.role_name}`); continue; }
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: u.password,
        role_id: role.id,
        personal_email: u.personal_email,
        is_active: u.is_active,
        job_title: u.job_title,
      },
    });
  }
  console.log(`  ✅ ${users.length} users seeded`);

  // ─── 3. DEPARTMENTS ──────────────────────────────────────────────────────────
  console.log('📌 Seeding departments...');
  const departments = [
    { name: 'Tax & Compliance', description: 'GST, Income Tax, TDS filings', employees: 3, services: 5, activeClients: 45 },
    { name: 'Audit & Assurance', description: 'Statutory and internal audits', employees: 2, services: 3, activeClients: 28 },
    { name: 'Advisory', description: 'Business and financial advisory', employees: 2, services: 4, activeClients: 32 },
    { name: 'Accounts', description: 'Bookkeeping and accounting services', employees: 3, services: 6, activeClients: 67 },
  ];
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }
  console.log(`  ✅ ${departments.length} departments seeded`);

  // ─── 4. EMPLOYEES ────────────────────────────────────────────────────────────
  console.log('📌 Seeding employees...');
  const employees = [
    { name: 'Suresh Kumar', email: 'suresh@servicepro.com', phone: '9876543210', mobile: '9876543210', role: 'Senior Associate', department: 'Tax & Compliance', status: 'active' },
    { name: 'Priya Mehta', email: 'priya@servicepro.com', phone: '9876543211', mobile: '9876543211', role: 'Manager', department: 'Audit & Assurance', status: 'active' },
    { name: 'Ankit Sharma', email: 'ankit@servicepro.com', phone: '9876543212', mobile: '9876543212', role: 'Senior Associate', department: 'Advisory', status: 'active' },
    { name: 'Kavita Reddy', email: 'kavita@servicepro.com', phone: '9876543213', mobile: '9876543213', role: 'Associate', department: 'Accounts', status: 'active' },
    { name: 'Rahul Verma', email: 'rahul@servicepro.com', phone: '9876543214', mobile: '9876543214', role: 'Associate', department: 'Tax & Compliance', status: 'active' },
  ];
  for (const emp of employees) {
    const existing = await prisma.employee.findFirst({ where: { email: emp.email } });
    if (!existing) {
      await prisma.employee.create({ data: emp });
    }
  }
  console.log(`  ✅ ${employees.length} employees seeded`);

  // ─── 5. CLIENTS ──────────────────────────────────────────────────────────────
  console.log('📌 Seeding clients...');
  const clients = [
    { name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '9876501001', company: 'Kumar Enterprises', status: 'active', services: ['GST Filing', 'Income Tax'] },
    { name: 'Priya Sharma', email: 'priya.s@example.com', phone: '9876501002', company: 'Sharma & Co', status: 'active', services: ['Audit', 'Bookkeeping'] },
    { name: 'Amit Patel', email: 'amit@example.com', phone: '9876501003', company: 'Patel Industries', status: 'active', services: ['GST Filing', 'TDS'] },
    { name: 'Sunita Verma', email: 'sunita@example.com', phone: '9876501004', company: 'Verma Traders', status: 'active', services: ['Income Tax', 'Advisory'] },
    { name: 'Ravi Gupta', email: 'ravi@example.com', phone: '9876501005', company: 'Gupta Solutions', status: 'active', services: ['Bookkeeping', 'GST Filing'] },
    { name: 'Meena Joshi', email: 'meena@example.com', phone: '9876501006', company: 'Joshi & Associates', status: 'active', services: ['Audit', 'Income Tax'] },
    { name: 'Vikram Singh', email: 'vikram@example.com', phone: '9876501007', company: 'Singh Constructions', status: 'active', services: ['GST Filing', 'TDS', 'Audit'] },
    { name: 'Ananya Das', email: 'ananya@example.com', phone: '9876501008', company: 'Das Textiles', status: 'active', services: ['Bookkeeping', 'Advisory'] },
  ];
  for (const client of clients) {
    const existing = await prisma.client.findFirst({ where: { email: client.email } });
    if (!existing) {
      await prisma.client.create({ data: client });
    }
  }
  console.log(`  ✅ ${clients.length} clients seeded`);

  console.log('\n✅ Railway seed complete!');
  console.log('\nLogin credentials:');
  console.log('  Super Admin:   admin@servicepro.com / admin123');
  console.log('  Manager:       manager@servicepro.com / manager123');
  console.log('  Receptionist:  receptionist@servicepro.com / receptionist123');
  console.log('  Cascade Admin: cascade@admin.com / CascadeAdmin@123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
