import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addRBACRoles() {
  try {
    console.log('🔐 Adding RBAC roles...')
    
    // Insert default roles
    const roles = await prisma.role.createMany({
      data: [
        { role_name: 'super_admin' },
        { role_name: 'manager' },
        { role_name: 'receptionist' }
      ],
      skipDuplicates: true
    })
    
    console.log('✅ RBAC roles added successfully!')
    console.log('📋 Available roles:')
    
    const allRoles = await prisma.role.findMany()
    allRoles.forEach(role => {
      console.log(`   - ${role.role_name} (ID: ${role.id})`)
    })
    
  } catch (error) {
    console.error('❌ Error adding RBAC roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addRBACRoles()