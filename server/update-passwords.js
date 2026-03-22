import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updatePasswords() {
  try {
    console.log('🔐 Updating user passwords...')
    
    // Update admin password
    await prisma.user.update({
      where: { email: 'admin@servicepro.com' },
      data: { password: 'admin123' }
    })
    console.log('✅ Updated admin password to: admin123')
    
    // Update manager password
    await prisma.user.update({
      where: { email: 'manager@servicepro.com' },
      data: { password: 'manager123' }
    })
    console.log('✅ Updated manager password to: manager123')
    
    // Update receptionist password
    await prisma.user.update({
      where: { email: 'receptionist@servicepro.com' },
      data: { password: 'receptionist123' }
    })
    console.log('✅ Updated receptionist password to: receptionist123')
    
    console.log('\n🎉 All passwords updated!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePasswords()