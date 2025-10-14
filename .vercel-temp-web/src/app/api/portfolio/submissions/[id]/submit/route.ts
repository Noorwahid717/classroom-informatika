/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  PortfolioArtifactType,
  PortfolioSubmissionStatus
} from '@/lib/portfolio'
import { AuthorizationError, assertRole, requireSession } from '@/lib/rbac'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await requireSession()
    assertRole(session, ['STUDENT'])

    // prisma client saat ini belum mengekspos modul portfolio, jadi gunakan cast sementara.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const portfolioDb = prisma as any

    const submission = await portfolioDb.portfolioSubmission.findUnique({
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

    const version = await portfolioDb.portfolioVersion.create({
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

    const updated = await portfolioDb.portfolioSubmission.update({
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
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Failed to submit portfolio', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
