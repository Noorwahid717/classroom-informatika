import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// GET /api/assignments/[id] - Get assignment details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: assignmentId } = await params

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: {
          select: { 
            name: true, 
            code: true,
            ownerId: true
          }
        },
        submissions: {
          where: session.user.role === 'TEACHER' || session.user.role === 'ADMIN' 
            ? {} 
            : { userId: session.user.id },
          include: {
            user: {
              select: { name: true, email: true }
            },
            grades: true
          },
          orderBy: { submittedAt: 'desc' }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Check if student is enrolled in the class
    if (session.user.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: session.user.id,
          classId: assignment.classId,
          status: 'ACTIVE'
        }
      })

      if (!enrollment && !assignment.isPublished) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    return NextResponse.json({
      success: true,
      data: assignment
    })

  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/assignments/[id] - Update assignment
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only teachers and admins can update assignments
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: assignmentId } = await params
    const body = await request.json()
    const {
      title,
      description,
      instructions,
      maxFileSize,
      allowedFileTypes,
      rubric,
      dueDate,
      isPublished
    } = body

    // Verify user owns the class
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: {
          select: { ownerId: true }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    if (assignment.class.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not own this assignment' },
        { status: 403 }
      )
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(instructions && { instructions }),
        ...(maxFileSize && { maxFileSize }),
        ...(allowedFileTypes && { allowedFileTypes }),
        ...(rubric !== undefined && { rubric }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(isPublished !== undefined && { isPublished })
      },
      include: {
        class: {
          select: { name: true, code: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedAssignment
    })

  } catch (error) {
    console.error('Error updating assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/assignments/[id] - Delete assignment
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only teachers and admins can delete assignments
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: assignmentId } = await params

    // Verify user owns the class
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: {
          select: { ownerId: true }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    if (assignment.class.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not own this assignment' },
        { status: 403 }
      )
    }

    // Delete assignment and all related data (submissions, grades, comments)
    await prisma.assignment.delete({
      where: { id: assignmentId }
    })

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}