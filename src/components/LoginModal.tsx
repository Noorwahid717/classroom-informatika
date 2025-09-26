'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserCheck, GraduationCap, AlertCircle } from 'lucide-react'
// import { useToast } from '@/components/ui/Toast'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  // const { toast } = useToast()

  const [adminForm, setAdminForm] = useState({
    email: '',
    password: ''
  })

  const [studentForm, setStudentForm] = useState({
    studentId: '',
    password: ''
  })

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('admin', {
        email: adminForm.email,
        password: adminForm.password,
        redirect: false
      })

      if (result?.error) {
        setError('Email atau password salah')
      } else {
        onClose()
        window.location.href = '/dashboard/teacher'
      }
    } catch (error) {
      console.error('Admin login error:', error)
      setError('Terjadi kesalahan saat login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('student', {
        studentId: studentForm.studentId,
        password: studentForm.password,
        redirect: false
      })

      if (result?.error) {
        setError('Student ID atau password salah')
      } else {
        onClose()
        window.location.href = '/dashboard/student'
      }
    } catch (error) {
      console.error('Student login error:', error)
      setError('Terjadi kesalahan saat login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl text-center">
            Login ke Classroom Informatika
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4" />
                <span>Siswa</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4" />
                <span>Guru/Admin</span>
              </TabsTrigger>
            </TabsList>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <TabsContent value="student" className="mt-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Login Siswa</CardTitle>
                  <CardDescription>
                    Masukkan Student ID dan password yang diberikan guru
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        type="text"
                        placeholder="Contoh: 2024001"
                        value={studentForm.studentId}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, studentId: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentPassword">Password</Label>
                      <Input
                        id="studentPassword"
                        type="password"
                        placeholder="Masukkan password"
                        value={studentForm.password}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Masuk...' : 'Masuk sebagai Siswa'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin" className="mt-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Login Guru/Admin</CardTitle>
                  <CardDescription>
                    Masukkan email dan password admin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="adminEmail">Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="admin@smawahidiyah.edu"
                        value={adminForm.email}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminPassword">Password</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        placeholder="Masukkan password"
                        value={adminForm.password}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Masuk...' : 'Masuk sebagai Guru/Admin'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Belum punya akun? Hubungi admin untuk registrasi</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}