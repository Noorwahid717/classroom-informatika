import { HTMLHint } from 'htmlhint'
import stylelint from 'stylelint'
import * as ESLint from 'eslint'

export interface LintResult {
  file: string
  errors: LintError[]
  warnings: LintWarning[]
  score: number
  maxScore: number
}

export interface LintError {
  line: number
  column: number
  message: string
  rule: string
  severity: 'error' | 'warning'
}

export interface LintWarning {
  line: number
  column: number  
  message: string
  rule: string
}

export interface ValidationSummary {
  totalFiles: number
  totalErrors: number
  totalWarnings: number
  overallScore: number
  results: LintResult[]
  htmlValidation: boolean
  cssValidation: boolean
  jsValidation: boolean
}

// HTML validation using HTMLHint
const htmlRules = {
  'tagname-lowercase': true,
  'attr-lowercase': true,
  'attr-value-double-quotes': true,
  'doctype-first': true,
  'tag-pair': true,
  'spec-char-escape': true,
  'id-unique': true,
  'src-not-empty': true,
  'title-require': true,
  'alt-require': true,
  'doctype-html5': true,
  'id-class-value': 'dash',
  'style-disabled': false,
  'inline-style-disabled': false,
  'inline-script-disabled': false,
  'space-tab-mixed-disabled': 'space',
  'id-class-ad-disabled': true,
  'attr-unsafe-chars': true
}

export async function validateHTML(filename: string, content: string): Promise<LintResult> {
  const messages = HTMLHint.verify(content, htmlRules)
  
  const errors: LintError[] = []
  const warnings: LintWarning[] = []
  
  messages.forEach(msg => {
    const item = {
      line: msg.line,
      column: msg.col,
      message: msg.message,
      rule: msg.rule.id
    }
    
    if (msg.type === 'error') {
      errors.push({ ...item, severity: 'error' as const })
    } else {
      warnings.push(item)
    }
  })
  
  // Calculate score (100 - (errors * 10) - (warnings * 2))
  const score = Math.max(0, 100 - (errors.length * 10) - (warnings.length * 2))
  
  return {
    file: filename,
    errors,
    warnings,
    score,
    maxScore: 100
  }
}

// CSS validation using Stylelint
const cssConfig = {
  rules: {
    'block-no-empty': true,
    'color-no-invalid-hex': true,
    'comment-no-empty': true,
    'declaration-block-no-duplicate-properties': true,
    'declaration-block-no-shorthand-property-overrides': true,
    'font-family-no-duplicate-names': true,
    'function-calc-no-unspaced-operator': true,
    'function-linear-gradient-no-nonstandard-direction': true,
    'keyframe-declaration-no-important': true,
    'media-feature-name-no-unknown': true,
    'no-duplicate-at-import-rules': true,
    'no-duplicate-selectors': true,
    'no-empty-source': true,
    'no-extra-semicolons': true,
    'no-invalid-double-slash-comments': true,
    'property-no-unknown': true,
    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-element-no-unknown': true,
    'selector-type-no-unknown': true,
    'string-no-newline': true,
    'unit-no-unknown': true,
    'at-rule-no-unknown': true,
    'indentation': 2,
    'max-empty-lines': 2,
    'no-eol-whitespace': true
  }
}

export async function validateCSS(filename: string, content: string): Promise<LintResult> {
  try {
    const result = await stylelint.lint({
      code: content,
      config: cssConfig,
      formatter: 'json'
    })
    
    const errors: LintError[] = []
    const warnings: LintWarning[] = []
    
    result.results.forEach(fileResult => {
      fileResult.warnings.forEach(warning => {
        const item = {
          line: warning.line,
          column: warning.column,
          message: warning.text,
          rule: warning.rule
        }
        
        if (warning.severity === 'error') {
          errors.push({ ...item, severity: 'error' as const })
        } else {
          warnings.push(item)
        }
      })
    })
    
    const score = Math.max(0, 100 - (errors.length * 8) - (warnings.length * 3))
    
    return {
      file: filename,
      errors,
      warnings,
      score,
      maxScore: 100
    }
  } catch (error) {
    return {
      file: filename,
      errors: [{
        line: 1,
        column: 1,
        message: `CSS validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        rule: 'validation-error',
        severity: 'error' as const
      }],
      warnings: [],
      score: 0,
      maxScore: 100
    }
  }
}

// JavaScript validation using ESLint
const jsConfig = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script'
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-undef': 'warn',
    'no-console': 'off',
    'semi': ['error', 'always'],
    'quotes': ['warn', 'single'],
    'indent': ['warn', 2],
    'no-multiple-empty-lines': ['warn', { max: 2 }],
    'no-trailing-spaces': 'warn',
    'eol-last': 'warn',
    'no-var': 'warn',
    'prefer-const': 'warn',
    'no-duplicate-imports': 'error',
    'no-unreachable': 'error',
    'valid-typeof': 'error',
    'no-dupe-keys': 'error',
    'no-dupe-args': 'error',
    'no-func-assign': 'error',
    'no-invalid-regexp': 'error'
  }
}

export async function validateJS(filename: string, content: string): Promise<LintResult> {
  try {
    const eslint = new ESLint.ESLint({
      overrideConfig: jsConfig as Record<string, unknown>
    })
    
    const results = await eslint.lintText(content, { filePath: filename })
    
    const errors: LintError[] = []
    const warnings: LintWarning[] = []
    
    results.forEach(result => {
      result.messages.forEach(message => {
        const item = {
          line: message.line || 1,
          column: message.column || 1,
          message: message.message,
          rule: message.ruleId || 'unknown'
        }
        
        if (message.severity === 2) {
          errors.push({ ...item, severity: 'error' as const })
        } else {
          warnings.push(item)
        }
      })
    })
    
    const score = Math.max(0, 100 - (errors.length * 12) - (warnings.length * 4))
    
    return {
      file: filename,
      errors,
      warnings,
      score,
      maxScore: 100
    }
  } catch (error) {
    return {
      file: filename,
      errors: [{
        line: 1,
        column: 1,
        message: `JavaScript validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        rule: 'validation-error',
        severity: 'error' as const
      }],
      warnings: [],
      score: 0,
      maxScore: 100
    }
  }
}

// Main validation function
export async function validateSubmission(files: { [path: string]: string }): Promise<ValidationSummary> {
  const results: LintResult[] = []
  let htmlValidation = false
  let cssValidation = false
  let jsValidation = false
  
  for (const [filepath, content] of Object.entries(files)) {
    const extension = filepath.split('.').pop()?.toLowerCase()
    
    let result: LintResult
    
    switch (extension) {
      case 'html':
        result = await validateHTML(filepath, content)
        htmlValidation = true
        break
      case 'css':
        result = await validateCSS(filepath, content)
        cssValidation = true
        break
      case 'js':
        result = await validateJS(filepath, content)
        jsValidation = true
        break
      default:
        continue // Skip unknown file types
    }
    
    results.push(result)
  }
  
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0)
  const overallScore = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0
  
  return {
    totalFiles: results.length,
    totalErrors,
    totalWarnings,
    overallScore,
    results,
    htmlValidation,
    cssValidation,
    jsValidation
  }
}

// Generate validation report
export function generateValidationReport(summary: ValidationSummary): string {
  let report = `## Validation Report\n\n`
  
  report += `**Overall Score: ${summary.overallScore}/100**\n\n`
  report += `- Files validated: ${summary.totalFiles}\n`
  report += `- Total errors: ${summary.totalErrors}\n`
  report += `- Total warnings: ${summary.totalWarnings}\n\n`
  
  if (summary.totalErrors > 0 || summary.totalWarnings > 0) {
    report += `### Issues Found:\n\n`
    
    summary.results.forEach(result => {
      if (result.errors.length > 0 || result.warnings.length > 0) {
        report += `#### ${result.file} (Score: ${result.score}/${result.maxScore})\n\n`
        
        result.errors.forEach(error => {
          report += `❌ **Error** (Line ${error.line}, Col ${error.column}): ${error.message} \`[${error.rule}]\`\n\n`
        })
        
        result.warnings.forEach(warning => {
          report += `⚠️ **Warning** (Line ${warning.line}, Col ${warning.column}): ${warning.message} \`[${warning.rule}]\`\n\n`
        })
      }
    })
  } else {
    report += `✅ **Great job!** No issues found in your code.\n\n`
  }
  
  // Recommendations
  if (summary.overallScore < 70) {
    report += `### Recommendations:\n\n`
    report += `- Review and fix the errors listed above\n`
    report += `- Consider addressing warnings to improve code quality\n`
    report += `- Test your code in a browser to ensure it works as expected\n\n`
  }
  
  return report
}