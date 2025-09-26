import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// POST /api/enrollments - Enroll in a class
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { classCode } = body

    if (!classCode) {
      return NextResponse.json(
        { error: 'Class code is required' },
        { status: 400 }
      )
    }

    // Find class by code
    const classToEnroll = await prisma.class.findUnique({
      where: { code: classCode }
    })

    if (!classToEnroll) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        classId: classToEnroll.id
      }
    })

    if (existingEnrollment) {
      if (existingEnrollment.status === 'ACTIVE') {
        return NextResponse.json(
          { error: 'Already enrolled in this class' },
          { status: 400 }
        )
      } else {
        // Reactivate enrollment
        const enrollment = await prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: { 
            status: 'ACTIVE'
          },
          include: {
            class: {
              select: { name: true, code: true, description: true }
            }
          }
        })

        return NextResponse.json({
          success: true,
          data: enrollment
        })
      }
    }

    // Create new enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        classId: classToEnroll.id,
        status: 'ACTIVE'
      },
      include: {
        class: {
          select: { name: true, code: true, description: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: enrollment
    }, { status: 201 })

  } catch (error) {
    console.error('Error enrolling in class:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/enrollments - List user's enrollments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const status = searchParams.get('status') as 'ACTIVE' | 'INACTIVE' | null

    const whereClause: Record<string, unknown> = {}

    if (session.user.role === 'STUDENT') {
      whereClause.userId = session.user.id
    }

    if (classId) {
      whereClause.classId = classId
    }

    if (status) {
      whereClause.status = status
    }

    const enrollments = await prisma.enrollment.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true }
        },
        class: {
          select: { 
            name: true, 
            code: true, 
            description: true,
            owner: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: enrollments
    })

  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}