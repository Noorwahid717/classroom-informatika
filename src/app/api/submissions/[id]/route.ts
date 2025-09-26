import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import JSZip from 'jszip'

// GET /api/submissions/[id] - Get submission details and preview
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    const canAccess = 
      session.user.id === submission.userId || // Own submission
      session.user.id === submission.assignment.class.ownerId || // Class owner
      session.user.role === 'ADMIN' // Admin

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // If preview requested, extract and return file contents
    if (preview) {
      try {
        const response = await fetch(submission.zipPath || '')
        const arrayBuffer = await response.arrayBuffer()
        const zip = new JSZip()
        const zipContent = await zip.loadAsync(arrayBuffer)

        const files: { [key: string]: string } = {}
        
        for (const [path, zipEntry] of Object.entries(zipContent.files)) {
          if (!zipEntry.dir) {
            const content = await zipEntry.async('text')
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
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    const canDelete = 
      session.user.id === submission.userId ||
      session.user.id === submission.assignment.class.ownerId ||
      session.user.role === 'ADMIN'

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
    console.error('Error deleting submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}