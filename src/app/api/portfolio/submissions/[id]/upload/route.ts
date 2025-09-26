import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import JSZip from 'jszip'
import { promises as fs } from 'fs'
import path from 'path'
import {
  PORTFOLIO_FILE_SIZE_LIMIT,
  PORTFOLIO_MAX_EDITOR_SIZE,
  isStaticAsset
} from '@/lib/portfolio'
import { PortfolioArtifactType, PortfolioSubmissionStatus } from '@prisma/client'

function assertEditorLength(label: string, content: string) {
  if (content.length > PORTFOLIO_MAX_EDITOR_SIZE) {
    throw new Error(`${label} dari arsip melebihi batas ${PORTFOLIO_MAX_EDITOR_SIZE} karakter`)
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.userType !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'File arsip wajib diunggah' }, { status: 400 })
  }

  if (file.size > PORTFOLIO_FILE_SIZE_LIMIT) {
    return NextResponse.json({ error: 'Ukuran file melebihi 10MB' }, { status: 400 })
  }

  const submission = await prisma.portfolioSubmission.findUnique({
    where: { id }
  })

  if (!submission || submission.studentId !== session.user.id) {
    return NextResponse.json({ error: 'Submission tidak ditemukan' }, { status: 404 })
  }

  const isEditableStatus =
    submission.status === PortfolioSubmissionStatus.DRAFT ||
    submission.status === PortfolioSubmissionStatus.RETURNED

  if (!isEditableStatus) {
    return NextResponse.json({ error: 'Submission sudah terkunci' }, { status: 409 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  let indexHtml = ''
  const cssFiles: string[] = []
  const jsFiles: string[] = []
  const entries: { path: string; size: number }[] = []
  let indexFound = false

  try {
    const zip = await JSZip.loadAsync(buffer)

    const entryPromises: Promise<void>[] = []

    zip.forEach((relativePath, zipEntry) => {
      if (zipEntry.dir) return

      const sanitizedPath = relativePath.replace(/\\+/g, '/').replace(/^\//, '')

      if (sanitizedPath.includes('..') || path.isAbsolute(sanitizedPath)) {
        throw new Error(`Path tidak valid di dalam arsip: ${sanitizedPath}`)
      }

      if (!isStaticAsset(sanitizedPath)) {
        throw new Error(`File non-statis terdeteksi: ${sanitizedPath}`)
      }

      const entryMeta = zipEntry as unknown as {
        uncompressedSize?: number
        _data?: { uncompressedSize?: number }
      }

      entries.push({
        path: sanitizedPath,
        size: entryMeta.uncompressedSize ?? entryMeta._data?.uncompressedSize ?? 0
      })

      if (sanitizedPath.toLowerCase().endsWith('index.html')) {
        indexFound = true
        entryPromises.push(
          zipEntry.async('string').then(content => {
            indexHtml = content
          })
        )
      } else if (sanitizedPath.toLowerCase().endsWith('.css')) {
        entryPromises.push(
          zipEntry.async('string').then(content => {
            cssFiles.push(content)
          })
        )
      } else if (sanitizedPath.toLowerCase().endsWith('.js')) {
        entryPromises.push(
          zipEntry.async('string').then(content => {
            jsFiles.push(content)
          })
        )
      }
    })

    await Promise.all(entryPromises)
  } catch (error) {
    console.error('Failed parsing zip archive', error)
    return NextResponse.json({ error: 'Arsip tidak valid atau rusak' }, { status: 400 })
  }

  if (!indexFound || !indexHtml) {
    return NextResponse.json({ error: 'Arsip harus memiliki file index.html' }, { status: 400 })
  }

  try {
    assertEditorLength('HTML', indexHtml)
    assertEditorLength('CSS', cssFiles.join('\n'))
    assertEditorLength('JavaScript', jsFiles.join('\n'))
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'portfolio', submission.id)
  await fs.mkdir(uploadDir, { recursive: true })

  const filename = `portfolio-${Date.now()}.zip`
  const filePath = path.join(uploadDir, filename)
  await fs.writeFile(filePath, buffer)

  const publicPath = path
    .join('/uploads/portfolio', submission.id, filename)
    .replace(/\\/g, '/')

  const metadata = {
    source: 'upload',
    uploadedAt: new Date().toISOString(),
    totalFiles: entries.length,
    entries
  }

  const updated = await prisma.portfolioSubmission.update({
    where: { id: submission.id },
    data: {
      draftArtifact: PortfolioArtifactType.UPLOAD,
      draftArchivePath: publicPath,
      draftArchiveSize: buffer.length,
      draftHtml: indexHtml,
      draftCss: cssFiles.join('\n'),
      draftJs: jsFiles.join('\n'),
      draftMetadata: JSON.stringify(metadata)
    }
  })

  return NextResponse.json({
    success: true,
    data: {
      id: updated.id,
      draft: {
        artifactType: PortfolioArtifactType.UPLOAD,
        archivePath: publicPath,
        archiveSize: buffer.length,
        html: indexHtml,
        css: cssFiles.join('\n'),
        js: jsFiles.join('\n'),
        metadata
      }
    }
  })
}
