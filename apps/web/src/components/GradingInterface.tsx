'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Save, 
  MessageSquare, 
  Star, 
  CheckCircle, 
  Clock, 
  User,
  FileText,
  Code,
  Eye,
  Download,
  Send
} from 'lucide-react'
import CodePreview from '@/components/CodePreview'
import ValidationResults from '@/components/ValidationResults'

interface RubricCriterion {
  id: string
  name: string
  description: string
  maxScore: number
  weight: number
}

interface RubricScore {
  criterionId: string
  score: number
  feedback: string
}

interface Submission {
  id: string
  assignmentId: string
  userId: string
  status: 'DRAFT' | 'SUBMITTED' | 'GRADED' | 'RETURNED'
  previewPath?: string
  zipPath?: string
  zipSize?: number
  submittedAt?: string
  user: {
    name: string
    email: string
  }
  assignment: {
    title: string
    rubric?: RubricCriterion[]
    class: {
      name: string
      code: string
    }
  }
  grades: Array<{
    id: string
    criterion: string
    score: number
    maxScore: number
    feedback?: string
    gradedBy: {
      name: string
    }
  }>
}

interface GradingInterfaceProps {
  submissionId: string
  onGradeSubmitted?: (grade: { id: string; score: number; feedback?: string }) => void
}

export default function GradingInterface({ 
  submissionId, 
  onGradeSubmitted 
}: GradingInterfaceProps) {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Grading state
  const [rubricScores, setRubricScores] = useState<{ [criterionId: string]: RubricScore }>({})
  const [overallFeedback, setOverallFeedback] = useState('')
  const [currentView, setCurrentView] = useState<'preview' | 'code' | 'validation'>('preview')
  
  // Comments state
  const [comments, setComments] = useState<Array<{ id: string; content: string; author: { name: string } }>>([])
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)

  // Load submission data
  useEffect(() => {
    loadSubmission()
    loadComments()
  }, [submissionId])

  const loadSubmission = async () => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}?preview=true`)
      if (!response.ok) {
        throw new Error('Failed to load submission')
      }

      const result = await response.json()
      if (result.success) {
        setSubmission(result.data)
        
        // Initialize rubric scores from existing grades
        if (result.data.assignment.rubric && result.data.grades) {
          const scores: { [criterionId: string]: RubricScore } = {}
          result.data.assignment.rubric.forEach((criterion: RubricCriterion) => {
            const existingGrade = result.data.grades.find((g: { criterion: string }) => g.criterion === criterion.id)
            scores[criterion.id] = {
              criterionId: criterion.id,
              score: existingGrade?.score || 0,
              feedback: existingGrade?.feedback || ''
            }
          })
          setRubricScores(scores)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submission')
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/comments?submissionId=${submissionId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setComments(result.data)
        }
      }
    } catch (err) {
      console.error('Failed to load comments:', err)
    }
  }

  const handleRubricScoreChange = (criterionId: string, field: 'score' | 'feedback', value: string | number) => {
    setRubricScores(prev => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        criterionId,
        [field]: value
      }
    }))
  }

  const calculateTotalScore = (): { score: number; maxScore: number } => {
    if (!submission?.assignment.rubric) return { score: 0, maxScore: 0 }

    let totalScore = 0
    let totalMaxScore = 0

    submission.assignment.rubric.forEach(criterion => {
      const rubricScore = rubricScores[criterion.id]
      if (rubricScore) {
        totalScore += (rubricScore.score * criterion.weight)
        totalMaxScore += (criterion.maxScore * criterion.weight)
      }
    })

    return {
      score: Math.round(totalScore),
      maxScore: Math.round(totalMaxScore)
    }
  }

  const submitGrade = async () => {
    if (!submission) return

    setSaving(true)
    try {
      // Submit individual criterion grades
      for (const [criterionId, rubricScore] of Object.entries(rubricScores)) {
        const criterion = submission.assignment.rubric?.find(c => c.id === criterionId)
        if (!criterion) continue

        await fetch('/api/grades', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            submissionId,
            score: rubricScore.score,
            maxScore: criterion.maxScore,
            feedback: rubricScore.feedback,
            rubricScores: { [criterionId]: rubricScore }
          })
        })
      }

      // Add overall feedback as comment if provided
      if (overallFeedback.trim()) {
        await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            submissionId,
            content: overallFeedback,
            isPrivate: false
          })
        })
      }

      // Calculate and submit final grade
      const { score, maxScore } = calculateTotalScore()
      
      onGradeSubmitted?.({
        id: submissionId,
        score: score,
        feedback: overallFeedback
      })

      // Reload submission to show updated grades
      await loadSubmission()
      await loadComments()
      
      setOverallFeedback('')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit grade')
    } finally {
      setSaving(false)
    }
  }

  const addComment = async () => {
    if (!newComment.trim()) return

    setIsAddingComment(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submissionId,
          content: newComment,
          isPrivate: false
        })
      })

      if (response.ok) {
        setNewComment('')
        await loadComments()
      }
    } catch (err) {
      console.error('Failed to add comment:', err)
    } finally {
      setIsAddingComment(false)
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800'
      case 'GRADED': return 'bg-green-100 text-green-800'
      case 'RETURNED': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case 'SUBMITTED': return <Clock className="h-4 w-4" />
      case 'GRADED': return <CheckCircle className="h-4 w-4" />
      case 'RETURNED': return <Send className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading submission...</p>
        </div>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error || 'Submission not found'}</p>
        </CardContent>
      </Card>
    )
  }

  const { score: totalScore, maxScore: totalMaxScore } = calculateTotalScore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{submission.user.name}</span>
              </CardTitle>
              <CardDescription>
                {submission.assignment.title} • {submission.assignment.class.name}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(submission.status)}>
                {getStatusIcon(submission.status)}
                <span className="ml-1">{submission.status}</span>
              </Badge>
              {submission.submittedAt && (
                <span className="text-sm text-gray-500">
                  Submitted {new Date(submission.submittedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* View Toggle */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Submission Content</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={currentView === 'preview' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentView('preview')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant={currentView === 'code' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentView('code')}
                  >
                    <Code className="h-4 w-4 mr-1" />
                    Code
                  </Button>
                  <Button
                    variant={currentView === 'validation' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentView('validation')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Validation
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentView === 'preview' && (
                <CodePreview 
                  submissionId={submissionId}
                  className="min-h-96"
                />
              )}
              {currentView === 'code' && (
                <CodePreview 
                  submissionId={submissionId}
                  className="min-h-96"
                />
              )}
              {currentView === 'validation' && (
                <ValidationResults 
                  submissionId={submissionId}
                />
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Existing Comments */}
                {comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {(comment.author as { name: string; role?: string }).role || 'User'}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date((comment as { createdAt?: string }).createdAt || Date.now()).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}

                {/* Add New Comment */}
                <div className="border-t pt-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={addComment}
                      disabled={!newComment.trim() || isAddingComment}
                      size="sm"
                    >
                      {isAddingComment ? 'Adding...' : 'Add Comment'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grading Panel */}
        <div className="space-y-6">
          {/* Score Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Grade Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {totalScore}/{totalMaxScore}
                </div>
                <div className="text-sm text-gray-600">
                  {totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rubric Grading */}
          {submission.assignment.rubric && (
            <Card>
              <CardHeader>
                <CardTitle>Rubric Grading</CardTitle>
                <CardDescription>
                  Grade each criterion individually
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {submission.assignment.rubric.map((criterion) => (
                    <div key={criterion.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{criterion.name}</h4>
                        <span className="text-sm text-gray-500">
                          Weight: {criterion.weight}x
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{criterion.description}</p>
                      
                      {/* Score Input */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max={criterion.maxScore}
                          value={rubricScores[criterion.id]?.score || 0}
                          onChange={(e) => handleRubricScoreChange(
                            criterion.id, 
                            'score', 
                            parseInt(e.target.value) || 0
                          )}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-500">
                          / {criterion.maxScore}
                        </span>
                      </div>

                      {/* Feedback Input */}
                      <textarea
                        value={rubricScores[criterion.id]?.feedback || ''}
                        onChange={(e) => handleRubricScoreChange(
                          criterion.id, 
                          'feedback', 
                          e.target.value
                        )}
                        placeholder={`Feedback for ${criterion.name}...`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overall Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={overallFeedback}
                onChange={(e) => setOverallFeedback(e.target.value)}
                placeholder="Provide overall feedback for the student..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit Grade */}
          <Button
            onClick={submitGrade}
            disabled={saving}
            className="w-full"
            size="lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving Grade...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Submit Grade
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}