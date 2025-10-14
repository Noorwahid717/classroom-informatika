import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Returns a simple auth cookie for a seeded user. Enable with ENABLE_TEST_ENDPOINTS=true
export async function POST(req: NextRequest) {
  const enabled = ['1', 'true', 'yes'].includes((process.env.ENABLE_TEST_ENDPOINTS ?? '').toLowerCase())
  if (!enabled) {
    return NextResponse.json({ message: 'Not allowed' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { role = 'student', id } = body || {}

    let user: any = null
    if (role === 'admin' || role === 'teacher') {
      user = await prisma.user.findUnique({ where: { email: 'admin@smawahidiyah.edu' } })
    } else {
      // Try legacy `student` model first if present, otherwise fall back to users table
      const prismaAny = prisma as any
      if (prismaAny.student && typeof prismaAny.student.findUnique === 'function') {
        user = await prismaAny.student.findUnique({ where: { studentId: '000000' } })
      } else {
        user = await prisma.user.findUnique({ where: { email: 'student+e2e@smawahidiyah.edu' } })
      }
    }

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Create a minimal session object and set it as a cookie. The app expects NextAuth-style session but
    // for tests we just set a cookie named `e2e_session` that our Playwright helper will read.
    const sessionPayload = {
      id: user.id ?? user.studentId,
      email: user.email,
      name: user.name ?? user.fullName,
      role: user.role ?? 'STUDENT',
      userType: role === 'admin' ? 'admin' : 'student'
    }

    const res = NextResponse.json({ message: 'OK', session: sessionPayload })
    // set cookie for Playwright to copy; short lived
    res.cookies.set('e2e_session', JSON.stringify(sessionPayload), { httpOnly: false, path: '/', maxAge: 60 * 60 })
    return res
  } catch (err) {
    console.error('session error', err)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}
