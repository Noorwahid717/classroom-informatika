'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  FileText,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

interface ValidationError {
  line: number
  column: number
  message: string
  rule: string
  severity: 'error' | 'warning'
}

interface ValidationResult {
  file: string
  errors: ValidationError[]
  warnings: ValidationError[]
  score: number
  maxScore: number
}

interface ValidationSummary {
  totalFiles: number
  totalErrors: number
  totalWarnings: number
  overallScore: number
  results: ValidationResult[]
  htmlValidation: boolean
  cssValidation: boolean
  jsValidation: boolean
}

interface ValidationResultsProps {
  submissionId: string
  initialData?: ValidationSummary
  onValidationComplete?: (summary: ValidationSummary) => void
}

export default function ValidationResults({ 
  submissionId, 
  initialData,
  onValidationComplete 
}: ValidationResultsProps) {
  const [summary, setSummary] = useState<ValidationSummary | null>(initialData || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load validation results
  const loadValidationResults = async () => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}/validate`)
      if (!response.ok) {
        throw new Error('Failed to load validation results')
      }

      const result = await response.json()
      if (result.success && result.data.checkSummary?.validationResults) {
        setSummary(result.data.checkSummary.validationResults)
      } else {
        setSummary(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load validation results')
    }
  }

  // Run validation
  const runValidation = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/submissions/${submissionId}/validate`, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Validation failed')
      }

      const result = await response.json()
      if (result.success) {
        setSummary(result.data.summary)
        onValidationComplete?.(result.data.summary)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed')
    } finally {
      setLoading(false)
    }
  }

  // Load existing results on mount
  useEffect(() => {
    if (!initialData) {
      loadValidationResults()
    }
  }, [submissionId])

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Get score trend icon
  const getScoreTrend = (score: number): React.ReactElement => {
    if (score >= 90) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (score >= 70) return <Minus className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  // Get file type icon
  const getFileTypeIcon = (filename: string): React.ReactElement => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'html': return <FileText className="h-4 w-4 text-orange-500" />
      case 'css': return <FileText className="h-4 w-4 text-blue-500" />
      case 'js': return <FileText className="h-4 w-4 text-yellow-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            Validation Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={runValidation} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Validation
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Code Validation</CardTitle>
          <CardDescription>
            Run automated checks on your HTML, CSS, and JavaScript files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No validation results yet</p>
            <Button 
              onClick={runValidation} 
              disabled={loading}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Run Validation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              {getScoreTrend(summary.overallScore)}
              <span className="ml-2">Validation Results</span>
            </div>
            <Button 
              onClick={runValidation} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(summary.overallScore)}`}>
                {summary.overallScore}
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>

            {/* Files Validated */}
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">
                {summary.totalFiles}
              </div>
              <div className="text-sm text-gray-600">Files Validated</div>
            </div>

            {/* Errors */}
            <div className="text-center">
              <div className="text-2xl font-semibold text-red-600">
                {summary.totalErrors}
              </div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>

            {/* Warnings */}
            <div className="text-center">
              <div className="text-2xl font-semibold text-yellow-600">
                {summary.totalWarnings}
              </div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
          </div>

          {/* File Type Badges */}
          <div className="flex items-center space-x-2 mt-4">
            <span className="text-sm text-gray-600">Validated:</span>
            {summary.htmlValidation && (
              <Badge variant="secondary">HTML</Badge>
            )}
            {summary.cssValidation && (
              <Badge variant="secondary">CSS</Badge>
            )}
            {summary.jsValidation && (
              <Badge variant="secondary">JavaScript</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Results */}
      {summary.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>File Results</CardTitle>
            <CardDescription>
              Detailed validation results for each file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={summary.results[0]?.file} className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                {summary.results.map((result) => (
                  <TabsTrigger 
                    key={result.file} 
                    value={result.file}
                    className="flex items-center space-x-2"
                  >
                    {getFileTypeIcon(result.file)}
                    <span className="truncate">
                      {result.file.split('/').pop()}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {summary.results.map((result) => (
                <TabsContent key={result.file} value={result.file} className="mt-4">
                  <div className="space-y-4">
                    {/* File Score */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getFileTypeIcon(result.file)}
                        <span className="font-medium">{result.file}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className={`text-xl font-bold ${getScoreColor(result.score)}`}>
                          {result.score}/{result.maxScore}
                        </div>
                        {getScoreTrend(result.score)}
                      </div>
                    </div>

                    {/* Issues */}
                    {(result.errors.length > 0 || result.warnings.length > 0) ? (
                      <div className="space-y-3">
                        {/* Errors */}
                        {result.errors.map((error, index) => (
                          <div key={`error-${index}`} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="destructive" className="text-xs">
                                  Error
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  Line {error.line}, Column {error.column}
                                </span>
                                <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                                  {error.rule}
                                </code>
                              </div>
                              <p className="text-sm text-red-800">{error.message}</p>
                            </div>
                          </div>
                        ))}

                        {/* Warnings */}
                        {result.warnings.map((warning, index) => (
                          <div key={`warning-${index}`} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                                  Warning
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  Line {warning.line}, Column {warning.column}
                                </span>
                                <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                                  {warning.rule}
                                </code>
                              </div>
                              <p className="text-sm text-yellow-800">{warning.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-green-600">
                        <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                        <p className="font-medium">Perfect! No issues found.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}