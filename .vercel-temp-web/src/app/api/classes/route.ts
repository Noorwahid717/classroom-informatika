import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthorizationError, assertPermission, requireSession } from '@/lib/rbac'

interface ClassWithDetails {
  id: string;
  [key: string]: unknown;
}

// GET /api/classes - List classes for current user
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    assertPermission(session, 'class:read')

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || 'all'

    let classes: ClassWithDetails[] = []

    if (role === 'owner' || session.user.role === 'MENTOR' || session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
      // Get classes owned by this user
      classes = await prisma.class.findMany({
        where: { ownerId: session.user.id },
        include: {
          owner: { select: { name: true, email: true } },
          _count: { select: { enrollments: true, assignments: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    if (role === 'enrolled' || role === 'all') {
      // Get classes where user is enrolled
      const enrolledClasses = await prisma.class.findMany({
        where: {
          enrollments: {
            some: {
              userId: session.user.id,
              status: 'ACTIVE'
            }
          }
        },
        include: {
          owner: { select: { name: true, email: true } },
          _count: { select: { enrollments: true, assignments: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

      classes = [...classes, ...enrolledClasses]
    }

    // Remove duplicates
    const uniqueClasses = classes.filter((cls: ClassWithDetails, index: number, self: ClassWithDetails[]) => 
      index === self.findIndex((c: ClassWithDetails) => c.id === cls.id)
    )

    return NextResponse.json({ 
      success: true, 
      data: uniqueClasses 
    })

  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/classes - Create new class
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    assertPermission(session, 'class:manage')

    const body = await request.json()
    const { name, description, semester, year } = body

    if (!name || !semester || !year) {
      return NextResponse.json(
        { error: 'Name, semester, and year are required' },
        { status: 400 }
      )
    }

    // Generate unique class code
    const code = `${name.toUpperCase().replace(/\s+/g, '-')}-${year}`

    const newClass = await prisma.class.create({
      data: {
        name,
        description,
        code,
        semester,
        year,
        ownerId: session.user.id,
      },
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { enrollments: true, assignments: true } }
      }
    })

    return NextResponse.json({
      success: true,
      data: newClass
    }, { status: 201 })

  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating class:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}