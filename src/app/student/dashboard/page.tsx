'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  BookOpen,
  Upload,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  FileText,
  GraduationCap,
  Code
} from 'lucide-react'

type ApiResponse<T> = {
  success?: boolean
  data?: T
}

interface ClassroomAssignmentResponse {
  id: string
  title: string
  description: string
  subject: string
  dueDate: string
  status: string
  maxSubmissions: number
  submissionCount?: number
  instructions?: string[]
}

interface ClassroomSubmissionResponse {
  id: string
  assignmentId: string
  fileName: string
  filePath: string
  submittedAt: string
  studentId: string
  status?: string
  isLate?: boolean
  grade?: number | null
  feedback?: string | null
}

interface Submission {
  id: string
  assignmentId: string
  fileName: string
  filePath: string
  submittedAt: string
  studentId: string
  status?: string
  isLate?: boolean
  grade?: number
  feedback?: string
}

interface Assignment {
  id: string
  title: string
  description: string
  subject: string
  dueDate: string
  status: string
  maxSubmissions: number
  submissionCount?: number
  instructions?: string[]
  submissions: Submission[]
}

function StudentDashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('assignments')

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/classroom/assignments')
      const result: ApiResponse<ClassroomAssignmentResponse[]> | null =
        response.ok ? await response.json() : null
      const assignmentsPayload =
        result?.success && Array.isArray(result.data) ? result.data : []

      let studentSubmissions: Submission[] = []
      if (session?.user?.id) {
        try {
          const submissionsResponse = await fetch(
            `/api/classroom/submissions?studentId=${encodeURIComponent(session.user.id)}`
          )

          if (submissionsResponse.ok) {
            const submissionsResult: ApiResponse<
              ClassroomSubmissionResponse[]
            > = await submissionsResponse.json()

            if (
              submissionsResult?.success &&
              Array.isArray(submissionsResult.data)
            ) {
              studentSubmissions = submissionsResult.data.map(
                (submission: ClassroomSubmissionResponse) => ({
                  id: submission.id,
                  assignmentId: submission.assignmentId,
                  fileName: submission.fileName,
                  filePath: submission.filePath,
                  submittedAt: submission.submittedAt,
                  studentId: submission.studentId,
                  status: submission.status,
                  isLate: submission.isLate,
                  grade: submission.grade ?? undefined,
                  feedback: submission.feedback ?? undefined
                })
              )
            }
          }
        } catch (error) {
          console.error('Error fetching student submissions:', error)
        }
      }

      const normalizedAssignments: Assignment[] = assignmentsPayload.map(
        (assignment: ClassroomAssignmentResponse) => ({
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          subject: assignment.subject,
          dueDate: assignment.dueDate,
          status: assignment.status,
          maxSubmissions: assignment.maxSubmissions,
          submissionCount: assignment.submissionCount,
          instructions: assignment.instructions ?? [],
          submissions: studentSubmissions.filter(
            submission => submission.assignmentId === assignment.id
          )
        })
      )

      setAssignments(normalizedAssignments)
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.userType !== 'student') {
      router.push('/student/login')
      return
    }

    fetchAssignments()
  }, [session, status, router, fetchAssignments])

  const getAssignmentStatus = (assignment: Assignment) => {
    const dueDate = new Date(assignment.dueDate)
    const now = new Date()
    const submitted = assignment.submissions.some(s => s.studentId === session?.user.id)
    
    if (submitted) return { status: 'submitted', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle }
    if (dueDate < now) return { status: 'overdue', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle }
    return { status: 'pending', color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.userType !== 'student') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg mr-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Siswa</h1>
                <p className="text-sm text-gray-600">GEMA - SMA Wahidiyah Kediri</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                <p className="text-xs text-gray-600">
                  {session.user.studentId} • {session.user.class}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-8 text-white mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Selamat Datang, {session.user.name}! 🎉</h2>
              <p className="text-blue-100 text-lg">
                Kelas {session.user.class} • NIS {session.user.studentId}
              </p>
              <p className="text-blue-100 mt-2">
                Siap untuk belajar dan mengerjakan tugas hari ini?
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="w-16 h-16 text-white/80" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tugas</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignments.filter(a => a.submissions.some(s => s.studentId === session.user.id)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg mr-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignments.filter(a => !a.submissions.some(s => s.studentId === session.user.id)).length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('assignments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'assignments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Tugas & Assignments
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'portfolio'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Code className="w-4 h-4 inline mr-2" />
                Web Portfolio
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'assignments' ? (
              assignments.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Tugas</h3>
                  <p className="text-gray-600">Tugas akan muncul di sini ketika guru memberikan assignment.</p>
                </div>
              ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const statusInfo = getAssignmentStatus(assignment)
                  const StatusIcon = statusInfo.icon
                  
                  return (
                    <div
                      key={assignment.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 mr-3">
                              {assignment.title}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.status === 'submitted' ? 'Sudah Dikumpulkan' : 
                               statusInfo.status === 'overdue' ? 'Terlambat' : 'Belum Dikumpulkan'}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{assignment.description}</p>
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {assignment.subject}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Deadline: {formatDate(assignment.dueDate)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-6">
                          {statusInfo.status === 'submitted' ? (
                            <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Sudah Dikumpulkan
                            </span>
                          ) : (
                            <button
                              onClick={() => router.push(`/student/assignments/${assignment.id}`)}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Tugas
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              )
            ) : activeTab === 'portfolio' ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 max-w-md mx-auto">
                  <Code className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Web Portfolio</h3>
                  <p className="text-gray-600 mb-6">
                    Buat dan kirim portfolio web HTML, CSS, JavaScript kamu untuk dinilai oleh guru.
                  </p>
                  <button
                    onClick={() => router.push('/student/portfolio')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-flex items-center"
                  >
                    <Code className="w-5 h-5 mr-2" />
                    Mulai Buat Portfolio
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(StudentDashboardContent), {
  ssr: false
})