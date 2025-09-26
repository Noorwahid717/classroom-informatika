import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import {
  PortfolioRubricCriterion,
  PortfolioSubmissionStatus
} from '@prisma/client'
import { RUBRIC_WEIGHTS, clampScore, RubricKey } from '@/lib/portfolio'
import { sendPortfolioNotification } from '@/lib/email'

type ScoreInput = {
  criterion: string
  score: number
  comment?: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.userType !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  let payload: unknown

  try {
    payload = await request.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Payload must be an object' }, { status: 400 })
  }

  const body = payload as Record<string, unknown>
  const statusInput = typeof body.status === 'string' ? body.status.toUpperCase() : 'GRADED'
  const allowedStatuses: PortfolioSubmissionStatus[] = [
    PortfolioSubmissionStatus.GRADED,
    PortfolioSubmissionStatus.RETURNED
  ]

  if (!allowedStatuses.includes(statusInput as PortfolioSubmissionStatus)) {
    return NextResponse.json({ error: 'Status penilaian tidak valid' }, { status: 400 })
  }

  const evaluationStatus = statusInput as PortfolioSubmissionStatus

  const overallNote = typeof body.overallNote === 'string' ? body.overallNote.trim() : undefined
  const scoresInput = Array.isArray(body.scores) ? (body.scores as ScoreInput[]) : []

  const submission = await prisma.portfolioSubmission.findUnique({
    where: { id },
    include: {
      student: true,
      lastVersion: true
    }
  })

  if (!submission) {
    return NextResponse.json({ error: 'Submission tidak ditemukan' }, { status: 404 })
  }

  if (!submission.lastVersionId && !body.versionId) {
    return NextResponse.json({ error: 'Belum ada versi terkunci untuk dinilai' }, { status: 400 })
  }

  const versionId = typeof body.versionId === 'string' ? body.versionId : submission.lastVersionId

  if (!versionId) {
    return NextResponse.json({ error: 'Versi portfolio tidak ditemukan' }, { status: 400 })
  }

  const rubricCriteria = Object.values(PortfolioRubricCriterion)

  const rubricScores = rubricCriteria.map(criterion => {
    const entry = scoresInput.find(item => item.criterion === criterion)
    const rawScore = entry && typeof entry.score === 'number' ? entry.score : 0
    const comment = entry && typeof entry.comment === 'string' ? entry.comment.trim() : undefined
    const key = criterion as RubricKey
    const maxScore = RUBRIC_WEIGHTS[key]

    return {
      criterion,
      score: clampScore(rawScore, maxScore),
      maxScore,
      comment: comment && comment.length > 0 ? comment : null
    }
  })

  const totalScore = rubricScores.reduce((sum, score) => sum + score.score, 0)

  let evaluation

  try {
    evaluation = await prisma.$transaction(async tx => {
      const version = await tx.portfolioVersion.findUnique({ where: { id: versionId } })

      if (!version) {
        throw new Error('Versi portfolio tidak ditemukan')
      }

    let record = await tx.portfolioEvaluation.findUnique({ where: { versionId } })

    if (record) {
      await tx.portfolioRubricScore.deleteMany({ where: { evaluationId: record.id } })
      record = await tx.portfolioEvaluation.update({
        where: { id: record.id },
        data: {
          reviewerId: session.user.id,
          overallScore: totalScore,
          overallNote,
          status: evaluationStatus
        }
      })
    } else {
      record = await tx.portfolioEvaluation.create({
        data: {
          submissionId: submission.id,
          versionId,
          reviewerId: session.user.id,
          overallScore: totalScore,
          overallNote,
          status: evaluationStatus
        }
      })
    }

    await tx.portfolioRubricScore.createMany({
      data: rubricScores.map(score => ({
        evaluationId: record!.id,
        criterion: score.criterion,
        score: score.score,
        maxScore: score.maxScore,
        comment: score.comment
      }))
    })

    await tx.portfolioSubmission.update({
      where: { id: submission.id },
      data: {
        status: evaluationStatus,
        reviewerId: session.user.id,
        reviewerNote: overallNote,
        grade: evaluationStatus === PortfolioSubmissionStatus.GRADED ? totalScore : null,
        returnedAt: evaluationStatus === PortfolioSubmissionStatus.RETURNED ? new Date() : null
      }
    })

    const rubric = await tx.portfolioRubricScore.findMany({
      where: { evaluationId: record.id }
    })

    return {
      evaluation: record,
      rubric
    }
    })
  } catch (error) {
    console.error('Failed to save portfolio evaluation', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }

  await sendPortfolioNotification({
    to: submission.student.email,
    subject:
      evaluationStatus === PortfolioSubmissionStatus.GRADED
        ? 'Penilaian tugas Web Portfolio kamu sudah tersedia'
        : 'Tugas Web Portfolio kamu perlu revisi',
    message:
      evaluationStatus === PortfolioSubmissionStatus.GRADED
        ? 'Selamat! Portfolio kamu sudah dinilai. Silakan cek detail skor dan masukan dari guru.'
        : 'Portfolio kamu dikembalikan untuk revisi. Mohon perhatikan komentar guru dan kirim ulang sebelum tenggat.',
    metadata: {
      submissionId: submission.id,
      status: evaluationStatus,
      totalScore
    }
  })

  return NextResponse.json({
    success: true,
    data: {
      evaluation: {
        id: evaluation.evaluation.id,
        overallScore: evaluation.evaluation.overallScore,
        overallNote: evaluation.evaluation.overallNote,
        status: evaluation.evaluation.status,
        rubricScores: evaluation.rubric
      }
    }
  })
}
