'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  Upload,
  Eye,
  Award,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download
} from 'lucide-react'
import Link from 'next/link'

interface Enrollment {
  id: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  joinedAt: string
  class: {
    id: string
    name: string
    code: string
    description?: string
    owner: {
      name: string
    }
  }
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate?: string
  isPublished: boolean
  maxFileSize: number
  allowedFileTypes: string
  createdAt: string
  class: {
    name: string
    code: string
  }
  _count: {
    submissions: number
  }
}

interface Submission {
  id: string
  status: 'DRAFT' | 'SUBMITTED' | 'GRADED' | 'RETURNED'
  submittedAt?: string
  fileName?: string
  fileSize?: number
  assignment: {
    id: string
    title: string
    dueDate?: string
    class: {
      name: string
      code: string
    }
  }
  grades: Array<{
    id: string
    score: number
    maxScore: number
    feedback?: string
  }>
}

interface StudentStats {
  totalClasses: number
  totalAssignments: number
  completedAssignments: number
  averageGrade: number
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<StudentStats>({
    totalClasses: 0,
    totalAssignments: 0,
    completedAssignments: 0,
    averageGrade: 0
  })
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [joinClassCode, setJoinClassCode] = useState('')
  const [joiningClass, setJoiningClass] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load enrollments
      const enrollmentsResponse = await fetch('/api/enrollments')
      if (enrollmentsResponse.ok) {
        const enrollmentsResult = await enrollmentsResponse.json()
        if (enrollmentsResult.success) {
          setEnrollments(enrollmentsResult.data)
        }
      }

      // Load assignments
      const assignmentsResponse = await fetch('/api/assignments')
      if (assignmentsResponse.ok) {
        const assignmentsResult = await assignmentsResponse.json()
        if (assignmentsResult.success) {
          setAssignments(assignmentsResult.data)
        }
      }

      // Load submissions
      const submissionsResponse = await fetch('/api/submissions')
      if (submissionsResponse.ok) {
        const submissionsResult = await submissionsResponse.json()
        if (submissionsResult.success) {
          setSubmissions(submissionsResult.data)
        }
      }

      // Calculate stats
      const totalClasses = enrollments.filter(e => e.status === 'ACTIVE').length
      const totalAssignments = assignments.length
      const completedAssignments = submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'GRADED').length
      
      const gradedSubmissions = submissions.filter(s => s.grades.length > 0)
      const averageGrade = gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, s) => {
            const totalScore = s.grades.reduce((total, g) => total + g.score, 0)
            const maxScore = s.grades.reduce((total, g) => total + g.maxScore, 0)
            return sum + (maxScore > 0 ? (totalScore / maxScore) * 100 : 0)
          }, 0) / gradedSubmissions.length
        : 0

      setStats({
        totalClasses,
        totalAssignments,
        completedAssignments,
        averageGrade: Math.round(averageGrade)
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const joinClass = async () => {
    if (!joinClassCode.trim()) return

    setJoiningClass(true)
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classCode: joinClassCode.trim()
        })
      })

      if (response.ok) {
        setJoinClassCode('')
        await loadDashboardData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to join class')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join class')
    } finally {
      setJoiningClass(false)
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800'
      case 'GRADED': return 'bg-green-100 text-green-800'
      case 'RETURNED': return 'bg-yellow-100 text-yellow-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case 'SUBMITTED': return <Clock className="h-4 w-4" />
      case 'GRADED': return <CheckCircle className="h-4 w-4" />
      case 'RETURNED': return <AlertCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const isOverdue = (dueDate?: string): boolean => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const getDaysUntilDue = (dueDate?: string): number => {
    if (!dueDate) return Infinity
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Track your assignments, grades, and class progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Enter class code"
              value={joinClassCode}
              onChange={(e) => setJoinClassCode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={joinClass} disabled={joiningClass || !joinClassCode.trim()}>
              {joiningClass ? 'Joining...' : 'Join Class'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Active enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Across all classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Submitted assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.averageGrade}%</div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="submissions">My Submissions</TabsTrigger>
          <TabsTrigger value="classes">My Classes</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Assignments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assignments</CardTitle>
                <CardDescription>Assignments due soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments
                    .filter(a => a.dueDate && !isOverdue(a.dueDate))
                    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                    .slice(0, 5)
                    .map((assignment) => {
                      const daysUntil = getDaysUntilDue(assignment.dueDate)
                      const hasSubmission = submissions.some(s => s.assignment.id === assignment.id)
                      
                      return (
                        <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{assignment.title}</h4>
                            <p className="text-sm text-gray-600">{assignment.class.name}</p>
                            <p className="text-xs text-gray-500">
                              Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {hasSubmission ? (
                              <Badge variant="outline" className="text-green-700 border-green-300">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Submitted
                              </Badge>
                            ) : (
                              <Badge variant="outline" className={daysUntil <= 3 ? "text-red-700 border-red-300" : ""}>
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/assignments/${assignment.id}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Grades */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Grades</CardTitle>
                <CardDescription>Your latest graded submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions
                    .filter(s => s.status === 'GRADED' && s.grades.length > 0)
                    .slice(0, 5)
                    .map((submission) => {
                      const totalScore = submission.grades.reduce((sum, g) => sum + g.score, 0)
                      const maxScore = submission.grades.reduce((sum, g) => sum + g.maxScore, 0)
                      const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
                      
                      return (
                        <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{submission.assignment.title}</h4>
                            <p className="text-sm text-gray-600">{submission.assignment.class.name}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <div className="font-bold text-lg">{totalScore}/{maxScore}</div>
                              <div className={`text-sm ${percentage >= 70 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {percentage}%
                              </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/submissions/${submission.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Assignments</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {assignments.map((assignment) => {
              const hasSubmission = submissions.some(s => s.assignment.id === assignment.id)
              const submission = submissions.find(s => s.assignment.id === assignment.id)
              const isAssignmentOverdue = isOverdue(assignment.dueDate)
              const daysUntil = getDaysUntilDue(assignment.dueDate)
              
              return (
                <Card key={assignment.id} className={isAssignmentOverdue && !hasSubmission ? 'border-red-200' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>
                          {assignment.class.name} ({assignment.class.code})
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {assignment.dueDate && (
                          <Badge variant="outline" className={isAssignmentOverdue && !hasSubmission ? 'border-red-300 text-red-700' : ''}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {isAssignmentOverdue ? 'Overdue' : `Due in ${daysUntil} days`}
                          </Badge>
                        )}
                        {hasSubmission && (
                          <Badge className={getStatusColor(submission!.status)}>
                            {getStatusIcon(submission!.status)}
                            <span className="ml-1">{submission!.status}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Max file size: {(assignment.maxFileSize / 1024 / 1024).toFixed(1)}MB</span>
                        <span>Types: {assignment.allowedFileTypes}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/assignments/${assignment.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Link>
                        </Button>
                        {!hasSubmission ? (
                          <Button size="sm" asChild>
                            <Link href={`/assignments/${assignment.id}/submit`}>
                              <Upload className="h-4 w-4 mr-1" />
                              Submit
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/submissions/${submission!.id}`}>
                              View Submission
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-4">
          <h2 className="text-xl font-semibold">My Submissions</h2>

          <div className="grid grid-cols-1 gap-4">
            {submissions.map((submission) => {
              const totalScore = submission.grades.reduce((sum, g) => sum + g.score, 0)
              const maxScore = submission.grades.reduce((sum, g) => sum + g.maxScore, 0)
              const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
              
              return (
                <Card key={submission.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{submission.assignment.title}</h4>
                        <p className="text-sm text-gray-600">
                          {submission.assignment.class.name} ({submission.assignment.class.code})
                        </p>
                        {submission.submittedAt && (
                          <p className="text-xs text-gray-500">
                            Submitted {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        )}
                        {submission.fileName && (
                          <p className="text-xs text-gray-500">
                            File: {submission.fileName} ({(submission.fileSize! / 1024).toFixed(1)}KB)
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {submission.grades.length > 0 && (
                          <div className="text-right">
                            <div className="font-bold">{totalScore}/{maxScore}</div>
                            <div className={`text-sm ${percentage >= 70 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {percentage}%
                            </div>
                          </div>
                        )}
                        
                        <Badge className={getStatusColor(submission.status)}>
                          {getStatusIcon(submission.status)}
                          <span className="ml-1">{submission.status}</span>
                        </Badge>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/submissions/${submission.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Classes</h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Enter class code"
                value={joinClassCode}
                onChange={(e) => setJoinClassCode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={joinClass} disabled={joiningClass || !joinClassCode.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Join Class
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{enrollment.class.name}</CardTitle>
                  <CardDescription>
                    {enrollment.class.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Teacher:</span>
                      <span className="font-medium">{enrollment.class.owner.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Class Code:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded">{enrollment.class.code}</code>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={enrollment.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Joined:</span>
                      <span>{new Date(enrollment.joinedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <Button className="w-full mt-4" asChild>
                      <Link href={`/classes/${enrollment.class.id}`}>
                        View Class
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-4">
          <h2 className="text-xl font-semibold">Grade Overview</h2>

          <div className="grid grid-cols-1 gap-4">
            {submissions
              .filter(s => s.grades.length > 0)
              .map((submission) => {
                const totalScore = submission.grades.reduce((sum, g) => sum + g.score, 0)
                const maxScore = submission.grades.reduce((sum, g) => sum + g.maxScore, 0)
                const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
                
                return (
                  <Card key={submission.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{submission.assignment.title}</CardTitle>
                          <CardDescription>
                            {submission.assignment.class.name} ({submission.assignment.class.code})
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">{totalScore}/{maxScore}</div>
                          <div className={`text-lg ${percentage >= 70 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {percentage}%
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {submission.grades.map((grade) => (
                          <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{(grade as { criterion?: string }).criterion || 'Overall'}</h4>
                              {grade.feedback && (
                                <p className="text-sm text-gray-600 mt-1">{grade.feedback}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{grade.score}/{grade.maxScore}</div>
                              <div className="text-sm text-gray-500">
                                {Math.round((grade.score / grade.maxScore) * 100)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <span className="text-sm text-gray-500">
                          Submitted {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/submissions/${submission.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}