import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// GET /api/comments - List comments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('submissionId')

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      )
    }

    // Verify access to submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            class: {
              select: { ownerId: true }
            }
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Check access permissions
    const canAccess = 
      session.user.id === submission.userId || // Own submission
      session.user.id === submission.assignment.class.ownerId || // Class owner
      session.user.role === 'ADMIN' // Admin

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const comments = await prisma.comment.findMany({
      where: { submissionId },
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: comments
    })

  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/comments - Create new comment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      submissionId,
      content,
      isPrivate = false
    } = body

    if (!submissionId || !content) {
      return NextResponse.json(
        { error: 'Submission ID and content are required' },
        { status: 400 }
      )
    }

    // Verify submission exists and user can comment
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            class: {
              select: { ownerId: true }
            }
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Check access permissions
    const canComment = 
      session.user.id === submission.userId || // Own submission
      session.user.id === submission.assignment.class.ownerId || // Class owner
      session.user.role === 'ADMIN' // Admin

    if (!canComment) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const comment = await prisma.comment.create({
      data: {
        submissionId,
        userId: session.user.id,
        content
      },
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: comment
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}