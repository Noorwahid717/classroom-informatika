'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users,
  FileText,
  BookOpen,
  AlertCircle,
} from 'lucide-react'

export default function SimpleTeacherDashboard() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {session.user.name}!</h1>
              <p className="text-gray-600 mt-2">Teacher Dashboard - GEMA Classroom</p>
              <p className="text-sm text-gray-500 mt-1">
                Role: {session.user.role} | Email: {session.user.email}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Login successful!</p>
              <p className="text-xs text-gray-400">Authentication working properly</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                Active classes this semester
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">
                Enrolled across all classes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Total assignments created
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">5</div>
              <p className="text-xs text-muted-foreground">
                Submissions awaiting grades
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Welcome Message */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-green-600">🎉 Login Berhasil!</CardTitle>
              <CardDescription>Authentication system berfungsi dengan baik</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">✅ Masalah Teratasi</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Admin login berhasil</li>
                    <li>• Session tersimpan dengan benar</li>
                    <li>• Dashboard dapat diakses</li>
                    <li>• Authentication flow berjalan normal</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">📝 Session Info</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Name:</strong> {session.user.name}</p>
                    <p><strong>Email:</strong> {session.user.email}</p>
                    <p><strong>Role:</strong> {session.user.role}</p>
                    <p><strong>User Type:</strong> {session.user.userType}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-medium">Create Class</h4>
                  <p className="text-xs text-gray-600">Start a new class</p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <FileText className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-medium">New Assignment</h4>
                  <p className="text-xs text-gray-600">Create assignment</p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Users className="h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-medium">Manage Students</h4>
                  <p className="text-xs text-gray-600">View enrollments</p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <AlertCircle className="h-8 w-8 text-orange-600 mb-2" />
                  <h4 className="font-medium">Grade Submissions</h4>
                  <p className="text-xs text-gray-600">Review pending work</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            GEMA Classroom - SMA Wahidiyah | Dashboard berfungsi normal
          </p>
        </div>
      </div>
    </div>
  )
}