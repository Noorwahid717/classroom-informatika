import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/assignments - List assignments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const userId = searchParams.get('userId')

        const whereClause: Record<string, unknown> = {}

    if (classId) {
      whereClause.classId = classId
    }

    // If user is a student, only show assignments from enrolled classes
    if (session.user.role === 'STUDENT') {
      const enrolledClasses = await prisma.enrollment.findMany({
        where: { 
          userId: session.user.id,
          status: 'ACTIVE'
        },
        select: { classId: true }
      })

      whereClause.classId = {
        in: enrolledClasses.map((e: { classId: string }) => e.classId)
      }
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        class: {
          select: { name: true, code: true }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: assignments
    })

  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/assignments - Create new assignment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only teachers and admins can create assignments
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      classId,
      title,
      description,
      instructions,
      maxFileSize,
      allowedFileTypes,
      rubric,
      dueDate,
      isPublished = false
    } = body

    if (!classId || !title || !description) {
      return NextResponse.json(
        { error: 'Class ID, title, and description are required' },
        { status: 400 }
      )
    }

    // Verify user owns the class
    const classOwnership = await prisma.class.findFirst({
      where: {
        id: classId,
        ownerId: session.user.id
      }
    })

    if (!classOwnership) {
      return NextResponse.json(
        { error: 'You do not own this class' },
        { status: 403 }
      )
    }

    const assignment = await prisma.assignment.create({
      data: {
        classId,
        title,
        description,
        instructions,
        maxFileSize: maxFileSize || 10485760, // 10MB default
        allowedFileTypes: allowedFileTypes || '.html,.css,.js,.png,.jpg,.jpeg,.gif,.svg',
        rubric: rubric || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        isPublished
      },
      include: {
        class: {
          select: { name: true, code: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: assignment
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}