'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  PortfolioRubricCriterion,
  PortfolioSubmissionStatus
} from '@prisma/client'
import { buildSandboxedPreview, RUBRIC_WEIGHTS, RubricKey } from '@/lib/portfolio'
import { PreviewFrame } from '@/components/portfolio/PreviewFrame'
import { StatusBadge } from '@/components/portfolio/StatusBadge'

interface AdminPortfolioSubmission {
  id: string
  status: PortfolioSubmissionStatus
  title: string
  summary?: string | null
  classLevel: string
  tags: string[]
  submittedAt?: string | null
  updatedAt: string
  grade?: number | null
  student: {
    id: string
    name: string
    email: string
    classLevel?: string | null
  }
  task: {
    id: string
    title: string
    tags: string[]
  }
  latestVersion: {
    id: string
    html?: string | null
    css?: string | null
    js?: string | null
    artifactType: string
    archivePath?: string | null
    createdAt: string
  } | null
  evaluation: {
    id: string
    overallScore: number
    status: PortfolioSubmissionStatus
    rubricScores: {
      id: string
      criterion: PortfolioRubricCriterion
      score: number
      maxScore: number
      comment?: string | null
    }[]
    overallNote?: string | null
  } | null
}

interface ApiResponse<T> {
  success?: boolean
  data?: T
  error?: string
}

const RUBRIC_LABELS: Record<PortfolioRubricCriterion, string> = {
  HTML_STRUCTURE: 'Struktur & Semantik HTML',
  CSS_RESPONSIVE: 'Styling & Responsif CSS',
  JS_INTERACTIVITY: 'Interaktivitas JavaScript',
  CODE_QUALITY: 'Kebersihan Kode & Aksesibilitas',
  CREATIVITY_BRIEF: 'Kreativitas & Kesesuaian Brief'
}

const DEFAULT_SCORES: Record<PortfolioRubricCriterion, number> = {
  HTML_STRUCTURE: 0,
  CSS_RESPONSIVE: 0,
  JS_INTERACTIVITY: 0,
  CODE_QUALITY: 0,
  CREATIVITY_BRIEF: 0
}

const DEFAULT_COMMENTS: Record<PortfolioRubricCriterion, string> = {
  HTML_STRUCTURE: '',
  CSS_RESPONSIVE: '',
  JS_INTERACTIVITY: '',
  CODE_QUALITY: '',
  CREATIVITY_BRIEF: ''
}

export default function AdminPortfolioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState<AdminPortfolioSubmission[]>([])
  const [selected, setSelected] = useState<AdminPortfolioSubmission | null>(null)
  const [classFilter, setClassFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')

  const [scores, setScores] = useState<Record<PortfolioRubricCriterion, number>>({
    ...DEFAULT_SCORES
  })
  const [comments, setComments] = useState<Record<PortfolioRubricCriterion, string>>({
    ...DEFAULT_COMMENTS
  })
  const [overallNote, setOverallNote] = useState('')
  const [previewDoc, setPreviewDoc] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const hydrateForm = useCallback((record: AdminPortfolioSubmission) => {
    if (record.evaluation) {
      const nextScores: Record<PortfolioRubricCriterion, number> = { ...DEFAULT_SCORES }
      const nextComments: Record<PortfolioRubricCriterion, string> = { ...DEFAULT_COMMENTS }
      record.evaluation.rubricScores.forEach(score => {
        nextScores[score.criterion] = score.score
        nextComments[score.criterion] = score.comment ?? ''
      })
      setScores(nextScores)
      setComments(nextComments)
      setOverallNote(record.evaluation.overallNote ?? '')
    } else {
      setScores({ ...DEFAULT_SCORES })
      setComments({ ...DEFAULT_COMMENTS })
      setOverallNote('')
    }

    const doc = buildSandboxedPreview({
      html: record.latestVersion?.html ?? '',
      css: record.latestVersion?.css ?? '',
      js: record.latestVersion?.js ?? ''
    })
    setPreviewDoc(doc)
  }, [])

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (classFilter) params.set('classLevel', classFilter)
      if (statusFilter) params.set('status', statusFilter)
      if (tagFilter) params.set('tag', tagFilter)

      const response = await fetch(`/api/portfolio/submissions/admin?${params.toString()}`)
      if (!response.ok) {
        setError('Gagal memuat data pengumpulan')
        return
      }
      const payload: ApiResponse<AdminPortfolioSubmission[]> = await response.json()
      const data = Array.isArray(payload.data) ? payload.data : []
      setSubmissions(data)
      if (data.length > 0) {
        const first = data[0]
        setSelected(first)
        hydrateForm(first)
      } else {
        setSelected(null)
      }
    } catch (err) {
      console.error(err)
      setError('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }, [classFilter, statusFilter, tagFilter, hydrateForm])

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.userType !== 'admin') {
      router.push('/admin/login')
      return
    }

    fetchSubmissions()
  }, [status, session, router, fetchSubmissions])

  const totalScore = useMemo(() => {
    return (Object.keys(scores) as RubricKey[]).reduce((sum, key) => sum + (scores[key] ?? 0), 0)
  }, [scores])

  const totalMax = useMemo(() => {
    return (Object.keys(RUBRIC_WEIGHTS) as RubricKey[]).reduce(
      (sum, key) => sum + RUBRIC_WEIGHTS[key],
      0
    )
  }, [])

  async function handleSelect(record: AdminPortfolioSubmission) {
    setSelected(record)
    setMessage(null)
    setError(null)
    hydrateForm(record)
  }

  async function handleEvaluationSubmit(statusToApply: PortfolioSubmissionStatus) {
    if (!selected || !selected.latestVersion) {
      setError('Versi portfolio belum tersedia untuk dinilai')
      return
    }

    setSaving(true)
    setMessage(null)
    setError(null)

    try {
      const payload = {
        status: statusToApply,
        overallNote,
        versionId: selected.latestVersion.id,
        scores: (Object.keys(scores) as RubricKey[]).map(key => ({
          criterion: key,
          score: scores[key],
          comment: comments[key]
        }))
      }

      const response = await fetch(`/api/portfolio/submissions/${selected.id}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errPayload = await response.json()
        throw new Error(errPayload.error || 'Gagal menyimpan penilaian')
      }

      const result: ApiResponse<{ evaluation: NonNullable<AdminPortfolioSubmission['evaluation']> }> =
        await response.json()

      const updated: AdminPortfolioSubmission = {
        ...selected,
        status: statusToApply,
        grade: statusToApply === PortfolioSubmissionStatus.GRADED ? totalScore : null,
        evaluation: result.data?.evaluation ?? null
      }

      setSelected(updated)
      setSubmissions(prev => prev.map(item => (item.id === updated.id ? updated : item)))
      setMessage('Penilaian tersimpan dan notifikasi telah dikirim')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan penilaian')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Memuat data pengumpulan portfolio...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Penilaian Web Portfolio</h1>
        <p className="text-sm text-gray-600 mt-1">
          Tinjau pengumpulan siswa, berikan komentar rubric, dan kirim nilai final secara terstruktur.
        </p>
      </header>

      <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 flex flex-wrap gap-3 items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              Daftar Pengumpulan
            </h2>
            <p className="text-xs text-gray-500">
              Filter berdasarkan kelas, status, atau tag untuk menemukan karya tertentu.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Filter kelas"
              value={classFilter}
              onChange={event => setClassFilter(event.target.value)}
              className="w-32 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              aria-label="Filter kelas"
            />
            <select
              value={statusFilter}
              onChange={event => setStatusFilter(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              aria-label="Filter status"
            >
              <option value="">Semua status</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="RETURNED">Returned</option>
              <option value="GRADED">Graded</option>
            </select>
            <input
              type="text"
              placeholder="Filter tag"
              value={tagFilter}
              onChange={event => setTagFilter(event.target.value)}
              className="w-36 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              aria-label="Filter tag"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Siswa
                </th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Judul Portfolio
                </th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Skor
                </th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Terakhir diperbarui
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {submissions.map(item => (
                <tr
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`cursor-pointer hover:bg-blue-50 ${
                    selected?.id === item.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-medium">{item.student.name}</div>
                    <div className="text-xs text-gray-500">{item.student.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.title}</td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.grade != null ? `${item.grade} / ${totalMax}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(item.updatedAt).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected ? (
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900">Detail Portfolio</h2>
              <dl className="mt-4 text-sm text-gray-700 space-y-2">
                <div className="flex justify-between">
                  <dt>Siswa</dt>
                  <dd className="text-right">
                    <div className="font-medium text-gray-900">{selected.student.name}</div>
                    <div className="text-xs text-gray-500">{selected.student.email}</div>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Kelas</dt>
                  <dd>{selected.classLevel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Tugas</dt>
                  <dd className="text-right">
                    <div className="font-medium text-gray-900">{selected.task.title}</div>
                    <div className="text-xs text-gray-500">Tag: {selected.task.tags.join(', ') || '—'}</div>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Ringkasan</dt>
                  <dd className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                    {selected.summary || '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Status saat ini</dt>
                  <dd><StatusBadge status={selected.status} /></dd>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <dt>Dikirim</dt>
                  <dd>{selected.submittedAt ? new Date(selected.submittedAt).toLocaleString('id-ID') : '—'}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Pratinjau</h2>
                <span className="text-xs text-gray-500">Versi terkunci</span>
              </div>
              <div className="h-96">
                {previewDoc ? (
                  <PreviewFrame documentString={previewDoc} title={`Preview ${selected.title}`} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    Versi belum tersedia.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Penilaian Rubric</h2>
              <p className="text-sm text-gray-600">
                Isi skor untuk setiap kriteria dan berikan komentar spesifik agar siswa tahu apa yang perlu ditingkatkan.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={event => {
                event.preventDefault()
                handleEvaluationSubmit(PortfolioSubmissionStatus.GRADED)
              }}
            >
              {(Object.keys(RUBRIC_WEIGHTS) as RubricKey[]).map(key => (
                <fieldset key={key} className="border border-gray-200 rounded-lg p-4">
                  <legend className="text-sm font-semibold text-gray-800">
                    {RUBRIC_LABELS[key]} <span className="text-xs text-gray-500">(maks {RUBRIC_WEIGHTS[key]} poin)</span>
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr] sm:items-center">
                    <label className="text-sm font-medium text-gray-700" htmlFor={`score-${key}`}>
                      Skor
                    </label>
                    <input
                      id={`score-${key}`}
                      type="number"
                      min={0}
                      max={RUBRIC_WEIGHTS[key]}
                      value={scores[key] ?? 0}
                      onChange={event =>
                        setScores(prev => ({
                          ...prev,
                          [key]: Number(event.target.value)
                        }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <label className="text-sm font-medium text-gray-700" htmlFor={`comment-${key}`}>
                      Komentar
                    </label>
                    <textarea
                      id={`comment-${key}`}
                      value={comments[key] ?? ''}
                      onChange={event =>
                        setComments(prev => ({
                          ...prev,
                          [key]: event.target.value
                        }))
                      }
                      rows={2}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Berikan umpan balik spesifik"
                    />
                  </div>
                </fieldset>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="overall-note">
                  Catatan umum
                </label>
                <textarea
                  id="overall-note"
                  value={overallNote}
                  onChange={event => setOverallNote(event.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Sorot kelebihan karya dan rekomendasi perbaikan"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Total skor: {totalScore} / {totalMax}
                  </p>
                  <p className="text-xs text-gray-500">
                    Skor otomatis dijumlahkan berdasarkan bobot rubric.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleEvaluationSubmit(PortfolioSubmissionStatus.RETURNED)}
                    className="inline-flex items-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-60"
                  >
                    Kembalikan untuk Revisi
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-60"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Penilaian'}
                  </button>
                </div>
              </div>
            </form>

            {message && <p className="text-sm text-emerald-700" role="status">{message}</p>}
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          </div>
        </section>
      ) : (
        <p className="text-sm text-gray-500">Pilih salah satu pengumpulan untuk melihat detail.</p>
      )}
    </div>
  )
}
