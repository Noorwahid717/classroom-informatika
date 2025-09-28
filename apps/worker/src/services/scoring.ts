interface LintResult {
  html: unknown;
  css: unknown;
  js: unknown;
}

interface PlaywrightResult {
  success: boolean;
}

export function evaluateScore(lint: LintResult, e2e: PlaywrightResult) {
  const base = 70;
  const lintBonus = lint.html instanceof Array && lint.html.length === 0 ? 15 : 5;
  const e2eBonus = e2e.success ? 15 : 0;
  return Math.min(100, base + lintBonus + e2eBonus);
}
