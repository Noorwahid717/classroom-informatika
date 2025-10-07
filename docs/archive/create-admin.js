require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminRecords() {
  try {
    console.log('Creating admin records in the Admin table...')
    
    // Create admin record with correct password hash
    const hashedPassword = await bcrypt.hash('admin123!@#', 12)
    
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@smawahidiyah.edu' },
      update: {
        password: hashedPassword
      },
      create: {
        email: 'admin@smawahidiyah.edu',
        password: hashedPassword,
        name: 'Super Admin GEMA',
        role: 'SUPER_ADMIN'
      }
    })
    
    console.log('Admin record created/updated:', admin)
    
    // Verify password
    const testPassword = 'admin123!@#'
    const isValid = await bcrypt.compare(testPassword, admin.password)
    console.log('Password verification test:', isValid)
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
    await prisma.$disconnect()
  }
}

createAdminRecords()