import {
  PortfolioRubricCriterion,
  RUBRIC_WEIGHTS,
} from '@/lib/portfolio'

const RUBRIC_LABELS: Record<PortfolioRubricCriterion, string> = {
  HTML_STRUCTURE: 'Struktur & Semantik HTML',
  CSS_RESPONSIVE: 'Styling & Responsif CSS',
  JS_INTERACTIVITY: 'Interaktivitas JavaScript',
  CODE_QUALITY: 'Kebersihan Kode & Aksesibilitas',
  CREATIVITY_BRIEF: 'Kreativitas & Kesesuaian Brief'
}

interface RubricScoreRow {
  criterion: PortfolioRubricCriterion
  score: number
  maxScore: number
  comment?: string | null
}

interface RubricTableProps {
  scores: RubricScoreRow[]
}

export function RubricTable({ scores }: RubricTableProps) {
  if (!scores || scores.length === 0) {
    return (
      <p className="text-sm text-gray-500" role="status">
        Belum ada penilaian rubric.
      </p>
    )
  }

  const totalScore = scores.reduce((sum, score) => sum + score.score, 0)
  const totalMax = Object.values(RUBRIC_WEIGHTS).reduce((sum, weight) => sum + weight, 0)

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Kriteria
            </th>
            <th scope="col" className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
              Skor
            </th>
            <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Catatan
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {scores.map(score => (
            <tr key={score.criterion}>
              <th
                scope="row"
                className="px-4 py-3 text-sm font-medium text-gray-900 align-top"
              >
                <div>{RUBRIC_LABELS[score.criterion]}</div>
                <div className="text-xs text-gray-500">Bobot {RUBRIC_WEIGHTS[score.criterion]} poin</div>
              </th>
              <td className="px-4 py-3 text-sm text-gray-700 text-right align-top">
                {score.score} / {score.maxScore}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 align-top">
                {score.comment ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-sm font-semibold text-gray-900 text-right" scope="row">
              Total
            </th>
            <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
              {totalScore} / {totalMax}
            </td>
            <td className="px-4 py-3" aria-hidden />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
