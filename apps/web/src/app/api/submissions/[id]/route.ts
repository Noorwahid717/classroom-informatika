import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthorizationError, assertPermission, requireSession } from '@/lib/rbac'
import JSZip from 'jszip'
import type { JSZipFile } from 'jszip'

// GET /api/submissions/[id] - Get submission details and preview
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession()
    assertPermission(session, 'submission:read')

    const { id: submissionId } = await params
    const { searchParams } = new URL(request.url)
    const preview = searchParams.get('preview') === 'true'

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: { name: true, email: true }
        },
        assignment: {
          include: {
            class: {
              select: { name: true, code: true, ownerId: true }
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

    // If preview requested, extract and return file contents
    if (preview) {
      try {
        const response = await fetch(submission.zipPath || '')
        const arrayBuffer = await response.arrayBuffer()
        const zip = await JSZip.loadAsync(arrayBuffer)

        const files: { [key: string]: string } = {}
        const entries = Object.entries(zip.files) as [string, JSZipFile][]

        for (const [path, zipEntry] of entries) {
          if (!zipEntry.dir) {
            const content = await zipEntry.async('string')
            files[path] = content
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            ...submission,
            preview: {
              files,
              structure: Object.keys(files)
            }
          }
        })
      } catch (error) {
        console.error('Error extracting ZIP for preview:', error)
        return NextResponse.json({
          success: true,
          data: {
            ...submission,
            preview: { error: 'Could not extract ZIP contents' }
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: submission
    })

  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error fetching submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/submissions/[id] - Delete submission
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession()
    assertPermission(session, 'submission:read')

    const { id: submissionId } = await params

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

    // Check if user can delete (own submission or class owner or admin)
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
    const isClassOwner = session.user.id === submission.assignment.class.ownerId
    const isOwner = session.user.id === submission.userId
    const canDelete = isOwner || isClassOwner || isAdmin

    if (!canDelete) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete submission (this will cascade to grades and comments)
    await prisma.submission.delete({
      where: { id: submissionId }
    })

    // Note: Vercel Blob cleanup could be added here if needed
    // await del(submission.fileUrl)

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully'
    })

  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error deleting submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
