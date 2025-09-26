'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus,
  Users,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  BookOpen,
  Settings,
  Eye,
  Edit,
  Copy
} from 'lucide-react'
import Link from 'next/link'
import CreateClassModal from '@/components/CreateClassModal'

interface Class {
  id: string
  name: string
  description?: string
  code: string
  semester: string
  year: string
  isActive: boolean
  createdAt: string
  _count: {
    enrollments: number
    assignments: number
  }
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate?: string
  isPublished: boolean
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
  user: {
    name: string
    email: string
  }
  assignment: {
    title: string
    class: {
      name: string
    }
  }
  grades: Array<{
    score: number
    maxScore: number
  }>
}

interface DashboardStats {
  totalClasses: number
  totalStudents: number
  totalAssignments: number
  pendingGrades: number
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    pendingGrades: 0
  })
  const [classes, setClasses] = useState<Class[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      let classesData: Class[] = []
      let assignmentsData: Assignment[] = []
      let submissionsData: Submission[] = []

      // Load classes
      try {
        const classesResponse = await fetch('/api/classes')
        if (classesResponse.ok) {
          const classesResult = await classesResponse.json()
          if (classesResult.success) {
            classesData = classesResult.data || []
          }
        }
      } catch (error) {
        console.log('Failed to load classes:', error)
      }

      // Load assignments
      try {
        const assignmentsResponse = await fetch('/api/assignments')
        if (assignmentsResponse.ok) {
          const assignmentsResult = await assignmentsResponse.json()
          if (assignmentsResult.success) {
            assignmentsData = assignmentsResult.data || []
          }
        }
      } catch (error) {
        console.log('Failed to load assignments:', error)
      }

      // Load recent submissions
      try {
        const submissionsResponse = await fetch('/api/submissions')
        if (submissionsResponse.ok) {
          const submissionsResult = await submissionsResponse.json()
          if (submissionsResult.success) {
            submissionsData = submissionsResult.data?.slice(0, 10) || []
          }
        }
      } catch (error) {
        console.log('Failed to load submissions:', error)
      }

      // Set the data
      setClasses(classesData)
      setAssignments(assignmentsData)
      setRecentSubmissions(submissionsData)

      // Calculate stats after setting the data
      const totalClasses = classesData.length
      const totalStudents = classesData.reduce((sum, cls) => sum + (cls._count?.enrollments || 0), 0)
      const totalAssignments = assignmentsData.length
      const pendingGrades = submissionsData.filter(s => s.status === 'SUBMITTED').length

      setStats({
        totalClasses,
        totalStudents,
        totalAssignments,
        pendingGrades
      })

    } catch (err) {
      console.error('Dashboard load error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
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

  const copyClassCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy class code:', err)
    }
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

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button onClick={loadDashboardData} variant="outline" className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Manage your classes, assignments, and student submissions</p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateClassModal onClassCreated={loadDashboardData} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Active classes this semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled across all classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Total assignments created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingGrades}</div>
            <p className="text-xs text-muted-foreground">
              Submissions awaiting grades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="submissions">Recent Submissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Classes */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Classes</CardTitle>
                <CardDescription>Your most recently created classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classes.slice(0, 5).map((cls) => (
                    <div key={cls.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{cls.name}</h4>
                        <p className="text-sm text-gray-600">{cls.code} • {cls._count.enrollments} students</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={cls.isActive ? 'default' : 'secondary'}>
                          {cls.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/classes/${cls.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest student submissions requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSubmissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{submission.user.name}</h4>
                        <p className="text-sm text-gray-600">
                          {submission.assignment.title} • {submission.assignment.class.name}
                        </p>
                        {submission.submittedAt && (
                          <p className="text-xs text-gray-500">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(submission.status)}>
                          {getStatusIcon(submission.status)}
                          <span className="ml-1">{submission.status}</span>
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/submissions/${submission.id}/grade`}>
                            {submission.status === 'SUBMITTED' ? 'Grade' : 'View'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Classes</h2>
            <CreateClassModal onClassCreated={loadDashboardData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <Card key={cls.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                    <Badge variant={cls.isActive ? 'default' : 'secondary'}>
                      {cls.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{cls.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Class Code:</span>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 px-2 py-1 rounded">{cls.code}</code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyClassCode(cls.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{cls._count.enrollments}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Assignments:</span>
                      <span className="font-medium">{cls._count.assignments}</span>
                    </div>

                    <div className="flex items-center space-x-2 pt-4">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/dashboard/classes/${cls.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Assignments</h2>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>
                        {assignment.class.name} ({assignment.class.code})
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={assignment.isPublished ? 'default' : 'secondary'}>
                        {assignment.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      {assignment.dueDate && (
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due {new Date(assignment.dueDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{assignment._count.submissions} submissions</span>
                      <span>Created {new Date(assignment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/assignments/${assignment.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Submissions</h2>

          <div className="grid grid-cols-1 gap-4">
            {recentSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{submission.user.name}</h4>
                      <p className="text-sm text-gray-600">{submission.user.email}</p>
                      <p className="text-sm text-gray-600">
                        {submission.assignment.title} • {submission.assignment.class.name}
                      </p>
                      {submission.submittedAt && (
                        <p className="text-xs text-gray-500">
                          Submitted {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {submission.grades.length > 0 && (
                        <div className="text-right">
                          <div className="font-medium">
                            {submission.grades.reduce((sum, g) => sum + g.score, 0)}/
                            {submission.grades.reduce((sum, g) => sum + g.maxScore, 0)}
                          </div>
                          <div className="text-xs text-gray-500">Grade</div>
                        </div>
                      )}
                      
                      <Badge className={getStatusColor(submission.status)}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1">{submission.status}</span>
                      </Badge>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/submissions/${submission.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        {submission.status === 'SUBMITTED' && (
                          <Button size="sm" asChild>
                            <Link href={`/dashboard/submissions/${submission.id}/grade`}>
                              Grade Now
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-600">
                  Detailed analytics and insights about your classes and student performance will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}