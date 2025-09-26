import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// GET /api/grades - List grades
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('submissionId')
    const userId = searchParams.get('userId')
    const assignmentId = searchParams.get('assignmentId')

    const whereClause: {
      submissionId?: string
      submission?: {
        assignmentId?: string
        userId?: string
      }
    } = {}

    if (submissionId) {
      whereClause.submissionId = submissionId
    }

    if (assignmentId) {
      whereClause.submission = {
        assignmentId: assignmentId
      }
    }

    // Role-based filtering
    if (session.user.role === 'STUDENT') {
      whereClause.submission = {
        ...whereClause.submission,
        userId: session.user.id
      }
    } else if (userId) {
      whereClause.submission = {
        ...whereClause.submission,
        userId: userId
      }
    }

    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        submission: {
          include: {
            user: {
              select: { name: true, email: true }
            },
            assignment: {
              select: { 
                title: true,
                class: {
                  select: { name: true, code: true }
                }
              }
            }
          }
        },
        gradedBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: grades
    })

  } catch (error) {
    console.error('Error fetching grades:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/grades - Create new grade
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only teachers and admins can create grades
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      submissionId,
      score,
      maxScore,
      feedback,
      rubricScores
    } = body

    if (!submissionId || score === undefined || !maxScore) {
      return NextResponse.json(
        { error: 'Submission ID, score, and max score are required' },
        { status: 400 }
      )
    }

    // Verify submission exists and user can grade it
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

    // Check if user owns the class
    if (submission.assignment.class.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not own this class' },
        { status: 403 }
      )
    }

    // Validate score
    if (score < 0 || score > maxScore) {
      return NextResponse.json(
        { error: 'Score must be between 0 and max score' },
        { status: 400 }
      )
    }

    // Check if grade already exists
    const existingGrade = await prisma.grade.findFirst({
      where: {
        submissionId,
        gradedById: session.user.id
      }
    })

    const gradeData = {
      submissionId,
      gradedById: session.user.id,
      gradedUserId: submission.userId,
      criterion: 'Overall',
      score,
      maxScore,
      feedback: feedback || null
    }

    let grade
    if (existingGrade) {
      // Update existing grade
      grade = await prisma.grade.update({
        where: { id: existingGrade.id },
        data: gradeData,
        include: {
          submission: {
            include: {
              user: {
                select: { name: true, email: true }
              },
              assignment: {
                select: { 
                  title: true,
                  class: {
                    select: { name: true, code: true }
                  }
                }
              }
            }
          },
          gradedBy: {
            select: { name: true, email: true }
          }
        }
      })
    } else {
      // Create new grade
      grade = await prisma.grade.create({
        data: gradeData,
        include: {
          submission: {
            include: {
              user: {
                select: { name: true, email: true }
              },
              assignment: {
                select: { 
                  title: true,
                  class: {
                    select: { name: true, code: true }
                  }
                }
              }
            }
          },
          gradedBy: {
            select: { name: true, email: true }
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: grade
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating grade:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}