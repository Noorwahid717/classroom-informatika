export const PORTFOLIO_FILE_SIZE_LIMIT = 10 * 1024 * 1024 // 10 MB
export const PORTFOLIO_TAG_LIMIT = 8
export const PORTFOLIO_MAX_EDITOR_SIZE = 120_000

export const STATIC_FILE_EXTENSIONS = [
  'html',
  'htm',
  'css',
  'js',
  'mjs',
  'json',
  'txt',
  'md',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'webp',
  'ico',
  'woff',
  'woff2'
]

export const RUBRIC_WEIGHTS = {
  HTML_STRUCTURE: 25,
  CSS_RESPONSIVE: 25,
  JS_INTERACTIVITY: 25,
  CODE_QUALITY: 15,
  CREATIVITY_BRIEF: 10
} as const

export type RubricKey = keyof typeof RUBRIC_WEIGHTS

export function normalizeTags(value: unknown): string[] {
  if (!value) return []

  const list = Array.isArray(value)
    ? value
    : typeof value === 'string'
    ? value.split(',')
    : []

  const sanitized = list
    .map(entry => entry.trim().toLowerCase())
    .filter(entry => entry.length > 0 && entry.length <= 32)

  return Array.from(new Set(sanitized)).slice(0, PORTFOLIO_TAG_LIMIT)
}

export function clampScore(value: number, maxScore: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(Math.max(Math.round(value), 0), maxScore)
}

export function buildSandboxedPreview({
  html = '',
  css = '',
  js = ''
}: {
  html?: string | null
  css?: string | null
  js?: string | null
}): string {
  const safeHtml = html ?? ''
  const safeCss = css ?? ''
  const safeJs = js ?? ''

  const csp = [
    "default-src 'none'",
    "img-src 'self' data:",
    "style-src 'unsafe-inline'",
    "font-src 'self' data:",
    "script-src 'unsafe-inline'",
    "connect-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'none'"
  ].join('; ')

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="Content-Security-Policy" content="${csp}">
<style>${safeCss}</style>
</head>
<body>
${safeHtml}
<script>${safeJs}</script>
</body>
</html>`
}

export function isStaticAsset(filename: string): boolean {
  const cleanName = filename.toLowerCase().replace(/\\+/g, '/').split('?')[0]
  const extension = cleanName.includes('.') ? cleanName.split('.').pop() ?? '' : ''
  return STATIC_FILE_EXTENSIONS.includes(extension)
}
