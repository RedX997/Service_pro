import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    console.log('🔐 Creating test users for RBAC system...')
    
    // Get role IDs
    const roles = await prisma.role.findMany()
    const roleMap = {}
    roles.forEach(role => {
      roleMap[role.role_name] = role.id
    })
    
    console.log('📋 Available roles:', roleMap)
    
    // Create test users
    const testUsers = [
      {
        name: 'Super Admin User',
        email: 'admin@servicepro.com',
        password: 'admin123', // In production, this should be hashed
        role_id: roleMap['super_admin']
      },
      {
        name: 'Manager User',
        email: 'manager@servicepro.com', 
        password: 'manager123',
        role_id: roleMap['manager']
      },
      {
        name: 'Receptionist User',
        email: 'receptionist@servicepro.com',
        password: 'receptionist123', 
        role_id: roleMap['receptionist']
      }
    ]
    
    for (const userData of testUsers) {
      try {
        const user = await prisma.user.create({
          data: userData,
          include: { role: true }
        })
        console.log(`✅ Created user: ${user.name} (${user.role.role_name})`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  User already exists: ${userData.email}`)
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error.message)
        }
      }
    }
    
    console.log('\n🎉 Test users setup complete!')
    console.log('\n📝 Login Credentials:')
    console.log('Super Admin: admin@servicepro.com / admin123')
    console.log('Manager: manager@servicepro.com / manager123') 
    console.log('Receptionist: receptionist@servicepro.com / receptionist123')
    
  } catch (error) {
    console.error('❌ Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()