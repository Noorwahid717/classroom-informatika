import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// Dev-only seeding endpoint. Enable with ENABLE_TEST_ENDPOINTS=true
export async function POST(req: NextRequest) {
  // Allow this endpoint when ENABLE_TEST_ENDPOINTS is explicitly enabled.
  // In CI we set ENABLE_TEST_ENDPOINTS=1, and Next.js runs in production mode there,
  // so don't block purely on NODE_ENV === 'production'. Treat common truthy values
  // as enabling the endpoint.
  const enabled = ['1', 'true', 'yes'].includes((process.env.ENABLE_TEST_ENDPOINTS ?? '').toLowerCase())
  if (!enabled) {
    return NextResponse.json({ message: 'Not allowed' }, { status: 403 })
  }

  try {
    const adminEmail = 'admin@smawahidiyah.edu'
    const adminPassword = 'admin123!@#'
    const studentId = '000000'
    const studentPassword = 'password'

    // Upsert admin user into the users table (teachers/admins)
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: 'E2E Admin',
        role: 'ADMIN',
        passwordHash: await hashPassword(adminPassword)
      },
      create: {
        id: 'e2e-admin',
        email: adminEmail,
        name: 'E2E Admin',
        role: 'ADMIN',
        passwordHash: await hashPassword(adminPassword)
      }
    })

    // Create a student user in the users table (some code paths expect `student` model,
    // but current Prisma schema represents all users in `User` with role STUDENT)
    await prisma.user.upsert({
      where: { email: 'student+e2e@smawahidiyah.edu' },
      update: {
        name: 'E2E Student',
        role: 'STUDENT',
        passwordHash: await hashPassword(studentPassword)
      },
      create: {
        id: 'e2e-student',
        email: 'student+e2e@smawahidiyah.edu',
        name: 'E2E Student',
        role: 'STUDENT',
        passwordHash: await hashPassword(studentPassword)
      }
    })

  // Return seeded credentials so CI callers can use them. These are only returned
  // when ENABLE_TEST_ENDPOINTS is enabled.
  return NextResponse.json({ message: 'Seeded test users', adminEmail, adminPassword, studentId, studentPassword })
  } catch (err) {
    console.error('Seed error', err)
    return NextResponse.json({ message: 'Seed failed' }, { status: 500 })
  }
}
