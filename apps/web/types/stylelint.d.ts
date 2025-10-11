declare module 'stylelint' {
  export interface Warning {
    line: number
    column: number
    text: string
    rule: string
    severity: 'error' | 'warning'
  }

  export interface LintResultItem {
    warnings: Warning[]
  }

  export interface LintResult {
    results: LintResultItem[]
  }

  export function lint(options: { code: string; config: unknown; formatter?: string }): Promise<LintResult>

  const stylelint: {
    lint: typeof lint
  }

  export default stylelint
}
