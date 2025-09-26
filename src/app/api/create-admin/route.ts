import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Creating admin record...')
    
    const adminPassword = await hashPassword('admin123!@#')
    
    // Create admin in Admin table
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@smawahidiyah.edu' },
      update: { 
        password: adminPassword,
        name: 'Super Admin GEMA',
        role: 'SUPER_ADMIN'
      },
      create: {
        email: 'admin@smawahidiyah.edu',
        password: adminPassword,
        name: 'Super Admin GEMA',
        role: 'SUPER_ADMIN'
      }
    })

    console.log('Admin created/updated:', admin)

    // Also create in User table for backup
    const userAdmin = await prisma.user.upsert({
      where: { email: 'admin@smawahidiyah.edu' },
      update: {
        password: adminPassword,
        role: 'ADMIN'
      },
      create: {
        email: 'admin@smawahidiyah.edu',
        password: adminPassword,
        name: 'Super Admin GEMA',
        role: 'ADMIN'
      }
    })

    console.log('User admin created/updated:', userAdmin)

    return NextResponse.json({ 
      success: true, 
      message: 'Admin records created successfully',
      admin: { id: admin.id, email: admin.email, name: admin.name },
      userAdmin: { id: userAdmin.id, email: userAdmin.email, name: userAdmin.name }
    })

  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create admin records',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}