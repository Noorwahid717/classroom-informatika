const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('Checking database connection...')
    
    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: {
        email: 'admin@smawahidiyah.edu'
      }
    })
    
    console.log('Admin record:', admin)
    
    if (admin) {
      // Test password verification
      const testPassword = 'admin123!@#'
      const isValid = await bcrypt.compare(testPassword, admin.password)
      console.log('Password test with admin123!@#:', isValid)
    }
    
    // Check all admins
    const allAdmins = await prisma.admin.findMany()
    console.log('All admin records:', allAdmins.length)
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('Database error:', error)
    await prisma.$disconnect()
  }
}

checkDatabase()