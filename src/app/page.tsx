'use client'

import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3,
  Code,
  Trophy,
  GraduationCap,
  ArrowRight,
  LogIn,

} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import LoginModal from '@/components/LoginModal'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    // Redirect authenticated users to their appropriate dashboard
    if (session) {
      if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
        router.push('/dashboard/teacher')
      } else if (session.user.role === 'STUDENT') {
        router.push('/dashboard/student')
      }
    }
  }, [session, router])

  const handleSignIn = () => {
    setShowLoginModal(true)
  }

  const features = [
    {
      icon: FileText,
      title: 'Upload Tugas',
      description: 'Upload project HTML, CSS, dan JavaScript dalam format ZIP'
    },
    {
      icon: Code,
      title: 'Preview Kode',
      description: 'Lihat dan edit kode langsung dengan Monaco Editor'
    },
    {
      icon: BarChart3,
      title: 'Penilaian Otomatis',
      description: 'Sistem validasi kode otomatis dengan HTMLHint, Stylelint, ESLint'
    },
    {
      icon: Trophy,
      title: 'Rubrik Grading',
      description: 'Penilaian berbasis kriteria yang fair dan konsisten'
    },
    {
      icon: Users,
      title: 'Manajemen Kelas',
      description: 'Guru dapat mengelola kelas dan siswa dengan mudah'
    },
    {
      icon: BookOpen,
      title: 'Progress Tracking',
      description: 'Pantau kemajuan belajar siswa secara real-time'
    }
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Classroom Informatika</h1>
                <p className="text-sm text-gray-600">SMA Wahidiyah Kediri</p>
              </div>
            </div>
            
            {!session && (
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={handleSignIn}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Sistem Penilaian{' '}
              <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                Informatika
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Platform pembelajaran interaktif untuk mata pelajaran Informatika dengan 
              sistem upload tugas ZIP, preview kode real-time, dan penilaian otomatis.
            </p>
            
            {!session && (
              <div className="flex items-center justify-center space-x-4">
                <Button onClick={handleSignIn} size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <LogIn className="w-5 h-5 mr-2" />
                  Masuk ke Sistem
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fitur Unggulan</h2>
            <p className="text-lg text-gray-600">
              Sistem pembelajaran Informatika yang modern dan interaktif
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Siswa Aktif', value: '150+', icon: Users },
              { label: 'Tugas Dikumpulkan', value: '500+', icon: FileText },
              { label: 'Kelas Aktif', value: '12', icon: BookOpen },
              { label: 'Guru Pengajar', value: '8', icon: GraduationCap }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!session && (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-green-500">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Siap Memulai Pembelajaran?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Bergabunglah dengan sistem pembelajaran Informatika yang modern
              </p>
              <Button 
                onClick={handleSignIn}
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Masuk Sekarang
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Classroom Informatika</h3>
                  <p className="text-sm text-gray-400">SMA Wahidiyah Kediri</p>
                </div>
              </div>
              <p className="text-gray-400">
                Sistem pembelajaran Informatika modern dengan teknologi terdepan
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <div className="space-y-2 text-gray-400">
                <p>📧 smaswahidiyah@gmail.com</p>
                <p>📍 Jl. KH. Wahid Hasyim, Kediri</p>
                <p>📱 Instagram: @smawahidiyah_official</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Fitur</h4>
              <div className="space-y-2 text-gray-400">
                <p>• Upload Tugas ZIP</p>
                <p>• Preview Kode Real-time</p>
                <p>• Penilaian Otomatis</p>
                <p>• Dashboard Interaktif</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SMA Wahidiyah Kediri. Sistem Classroom Informatika.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  )
}