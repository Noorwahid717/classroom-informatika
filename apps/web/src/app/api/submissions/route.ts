import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthorizationError, assertPermission, requireSession } from '@/lib/rbac'
import { put } from '@/lib/blob-storage'
import JSZip from 'jszip'
import type { JSZipFile } from 'jszip'

// GET /api/submissions - List submissions
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    assertPermission(session, 'submission:read')

    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')
    const userId = searchParams.get('userId')

    const whereClause: Record<string, unknown> = {}

    if (assignmentId) {
      whereClause.assignmentId = assignmentId
    }

    // Role-based filtering
    if (session.user.role === 'STUDENT') {
      whereClause.userId = session.user.id
    } else if (userId) {
      whereClause.userId = userId
    }

    const submissions = await prisma.submission.findMany({
      where: whereClause,
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
        },
        grades: {
          include: {
            gradedBy: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: submissions
    })

  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/submissions - Create new submission
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    assertPermission(session, 'submission:create')

    const formData = await request.formData()
    const assignmentId = formData.get('assignmentId') as string
    const file = formData.get('file') as File
    const description = formData.get('description') as string

    if (!assignmentId || !file) {
      return NextResponse.json(
        { error: 'Assignment ID and file are required' },
        { status: 400 }
      )
    }

    // Verify assignment exists and user can submit
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: true
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Check if student is enrolled
    if (session.user.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: session.user.id,
          classId: assignment.classId,
          status: 'ACTIVE'
        }
      })

      if (!enrollment) {
        return NextResponse.json({ error: 'Not enrolled in class' }, { status: 403 })
      }
    }

    // Check file size
    if (file.size > assignment.maxFileSize) {
      return NextResponse.json(
        { error: `File size exceeds limit of ${assignment.maxFileSize} bytes` },
        { status: 400 }
      )
    }

    // Validate ZIP file and extract contents
    const fileStructure: Record<string, unknown> = {}
    let hasHTML = false

    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)

      for (const [path, zipEntry] of Object.entries(zip.files) as [string, JSZipFile][]) {
        if (!zipEntry.dir) {
          const extension = path.split('.').pop()?.toLowerCase()
          if (extension === 'html') hasHTML = true
          
          const size = zipEntry.uncompressedSize ?? zipEntry._data?.uncompressedSize ?? 0
          fileStructure[path] = {
            size,
            type: extension || 'unknown'
          }
        }
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid ZIP file' },
        { status: 400 }
      )
    }

    if (!hasHTML) {
      return NextResponse.json(
        { error: 'ZIP file must contain at least one HTML file' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const fileName = `${session.user.id}/${assignmentId}/${Date.now()}-${file.name}`
    const blob = await put(fileName, file, {
      access: 'public',
    })

    // Check for existing submission
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        userId: session.user.id
      }
    })

    const submissionData = {
      assignmentId,
      userId: session.user.id,
      fileName: file.name,
      fileSize: file.size,
      fileUrl: blob.url,
      fileStructure,
      description: description || null,
      submittedAt: new Date()
    }

    let submission
    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: submissionData,
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
      })
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: submissionData,
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
      })
    }

    return NextResponse.json({
      success: true,
      data: submission
    }, { status: 201 })

  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
