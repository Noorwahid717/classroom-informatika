interface StatusBadgeProps {
  status: string
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Terkirim',
  RETURNED: 'Perlu Revisi',
  GRADED: 'Dinilai'
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-200',
  RETURNED: 'bg-amber-100 text-amber-800 border-amber-200',
  GRADED: 'bg-emerald-100 text-emerald-800 border-emerald-200'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = status?.toUpperCase() ?? 'DRAFT'
  const label = STATUS_LABELS[key] ?? status
  const styles = STATUS_STYLES[key] ?? STATUS_STYLES.DRAFT

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-sm font-medium border rounded-full ${styles}`}
      aria-label={`Status pengumpulan: ${label}`}
    >
      {label}
    </span>
  )
}
