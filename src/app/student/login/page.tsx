'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User, GraduationCap } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

export default function StudentLoginPage() {
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingMessage, setLoadingMessage] = useState('')
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ show: false, message: '', type: 'info' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setLoadingMessage('Memverifikasi data siswa...')

    try {
      console.log('Attempting student login with ID:', studentId)
      
      // Show loading feedback
      setToast({
        show: true,
        message: 'Memverifikasi data siswa...',
        type: 'info'
      })
      
      // Use NextAuth signIn with student provider
      const result = await signIn('student', {
        studentId,
        password,
        redirect: false
      })

      console.log('Student login result:', result)
      
      if (result?.error) {
        console.error('Student login failed:', result.error)
        setError('NIS atau password salah. Silakan periksa data Anda.')
        setToast({
          show: true,
          message: 'Login gagal! Periksa NIS dan password Anda.',
          type: 'error'
        })
        setIsLoading(false)
        setLoadingMessage('')
      } else if (result?.ok) {
        console.log('Student login successful, redirecting to dashboard...')
        setLoadingMessage('Login berhasil! Mengalihkan ke dashboard...')
        setToast({
          show: true,
          message: '🎉 Selamat datang di GEMA! Mengalihkan ke dashboard...',
          type: 'success'
        })
        
        // Manual redirect to student dashboard
        setTimeout(() => {
          console.log('Redirecting to student dashboard...')
          window.location.href = '/student/dashboard'
        }, 1500)
      } else {
        console.error('Unexpected student login result:', result)
        setError('Login gagal. Silakan coba lagi.')
        setToast({
          show: true,
          message: 'Terjadi masalah saat login. Silakan coba lagi.',
          type: 'warning'
        })
        setIsLoading(false)
        setLoadingMessage('')
      }
      
    } catch (error) {
      console.error('Student login error:', error)
      setError('Terjadi kesalahan saat login. Silakan coba lagi.')
      setToast({
        show: true,
        message: 'Terjadi kesalahan sistem. Silakan coba lagi.',
        type: 'error'
      })
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-blue-600 to-purple-500 flex items-center justify-center p-4">
      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={4000}
      />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-xl">
            <GraduationCap className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Login Siswa</h1>
          <p className="text-green-100 text-lg">GEMA - SMA Wahidiyah Kediri</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Masuk Siswa</h2>
            <p className="text-gray-600">Akses materi dan tugas pembelajaran</p>
          </div>

          {/* Loading Status */}
          {loadingMessage && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-blue-600 font-medium">{loadingMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                NIS / Student ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Masukkan NIS Anda"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Masukkan password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:from-green-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Masuk...
                </div>
              ) : (
                '🎓 Masuk Siswa'
              )}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Belum punya akun?{' '}
                <Link 
                  href="/student/register" 
                  className="text-green-600 hover:text-green-700 font-semibold transition-colors"
                >
                  Daftar di sini
                </Link>
              </p>
            </div>

            {/* Admin Login Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Login sebagai admin?{' '}
                <Link 
                  href="/admin/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Admin Login
                </Link>
              </p>
            </div>
          </form>
        </motion.div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="text-white/80 hover:text-white transition-colors inline-flex items-center"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}