import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { PortfolioArtifactType, PortfolioSubmissionStatus } from '@prisma/client'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.userType !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const submission = await prisma.portfolioSubmission.findUnique({
    where: { id },
    include: {
      task: true
    }
  })

  if (!submission || submission.studentId !== session.user.id) {
    return NextResponse.json({ error: 'Submission tidak ditemukan' }, { status: 404 })
  }

  const isEditableStatus =
    submission.status === PortfolioSubmissionStatus.DRAFT ||
    submission.status === PortfolioSubmissionStatus.RETURNED

  if (!isEditableStatus) {
    return NextResponse.json({ error: 'Submission sudah dikirim' }, { status: 409 })
  }

  if (submission.draftArtifact === PortfolioArtifactType.EDITOR) {
    if (!submission.draftHtml || submission.draftHtml.trim().length === 0) {
      return NextResponse.json({ error: 'Isi HTML belum tersedia. Simpan draft terlebih dahulu.' }, { status: 400 })
    }
  } else if (submission.draftArtifact === PortfolioArtifactType.UPLOAD) {
    if (!submission.draftArchivePath) {
      return NextResponse.json({ error: 'Arsip proyek belum tersimpan.' }, { status: 400 })
    }
  }

  const lockedAt = new Date()

  const version = await prisma.portfolioVersion.create({
    data: {
      submissionId: submission.id,
      title: submission.title,
      summary: submission.summary,
      classLevel: submission.classLevel,
      tags: submission.tags,
      html: submission.draftHtml,
      css: submission.draftCss,
      js: submission.draftJs,
      artifactType: submission.draftArtifact,
      archivePath: submission.draftArchivePath,
      archiveSize: submission.draftArchiveSize ?? undefined,
      metadata: submission.draftMetadata,
      lockedAt
    }
  })

  const updated = await prisma.portfolioSubmission.update({
    where: { id: submission.id },
    data: {
      status: PortfolioSubmissionStatus.SUBMITTED,
      submittedAt: lockedAt,
      returnedAt: null,
      lastVersionId: version.id,
      grade: null,
      reviewerId: null,
      reviewerNote: null
    }
  })

  return NextResponse.json({
    success: true,
    data: {
      id: updated.id,
      status: updated.status,
      submittedAt: updated.submittedAt,
      version: {
        id: version.id,
        artifactType: version.artifactType,
        lockedAt: version.lockedAt
      }
    }
  })
}
