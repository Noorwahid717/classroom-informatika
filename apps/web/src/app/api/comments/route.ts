import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthorizationError, assertPermission, requireSession } from '@/lib/rbac'

// GET /api/comments - List comments
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    assertPermission(session, 'submission:read')

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
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
    const isClassOwner = session.user.id === submission.assignment.class.ownerId
    const isOwner = session.user.id === submission.userId
    const canAccess = isOwner || isClassOwner || isAdmin

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
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
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
    const session = await requireSession()
    assertPermission(session, 'submission:read')

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
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
    const isClassOwner = session.user.id === submission.assignment.class.ownerId
    const isOwner = session.user.id === submission.userId
    const canComment = isOwner || isClassOwner || isAdmin

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
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}