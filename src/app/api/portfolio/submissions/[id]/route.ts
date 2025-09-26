import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { normalizeTags } from '@/lib/portfolio'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const submission = await prisma.portfolioSubmission.findUnique({
    where: { id },
    include: {
      student: true,
      task: true,
      versions: {
        orderBy: { createdAt: 'desc' }
      },
      evaluations: {
        orderBy: { createdAt: 'desc' },
        include: { rubricScores: true }
      }
    }
  })

  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  const isOwner = session.user.userType === 'student' && submission.studentId === session.user.id
  const isAdmin = session.user.userType === 'admin'

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const data = {
    id: submission.id,
    status: submission.status,
    title: submission.title,
    summary: submission.summary,
    classLevel: submission.classLevel,
    tags: normalizeTags(submission.tags),
    submittedAt: submission.submittedAt,
    returnedAt: submission.returnedAt,
    draft: {
      html: submission.draftHtml,
      css: submission.draftCss,
      js: submission.draftJs,
      artifactType: submission.draftArtifact,
      archivePath: submission.draftArchivePath,
      archiveSize: submission.draftArchiveSize,
      metadata: submission.draftMetadata
    },
    student: {
      id: submission.student.id,
      name: submission.student.fullName,
      email: submission.student.email,
      classLevel: submission.student.class
    },
    task: {
      id: submission.task.id,
      title: submission.task.title,
      instructions: submission.task.instructions,
      tags: normalizeTags(submission.task.tags)
    },
    versions: submission.versions.map(version => ({
      id: version.id,
      title: version.title,
      summary: version.summary,
      classLevel: version.classLevel,
      tags: normalizeTags(version.tags),
      html: version.html,
      css: version.css,
      js: version.js,
      artifactType: version.artifactType,
      archivePath: version.archivePath,
      archiveSize: version.archiveSize,
      metadata: version.metadata,
      createdAt: version.createdAt,
      lockedAt: version.lockedAt
    })),
    evaluations: submission.evaluations.map(evaluation => ({
      id: evaluation.id,
      overallScore: evaluation.overallScore,
      overallNote: evaluation.overallNote,
      status: evaluation.status,
      createdAt: evaluation.createdAt,
      rubricScores: evaluation.rubricScores
    }))
  }

  return NextResponse.json({ success: true, data })
}
