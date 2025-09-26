'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const errorDetails: Record<
  string,
  {
    title: string
    description: string
    hint?: string
  }
> = {
  Configuration: {
    title: 'Konfigurasi Server Bermasalah',
    description:
      'Aplikasi tidak dapat menyelesaikan proses autentikasi karena konfigurasi NextAuth tidak lengkap.',
    hint:
      'Pastikan variabel lingkungan NEXTAUTH_SECRET telah diatur dan domain produksi tercantum pada NEXTAUTH_URL atau aktifkan AUTH_TRUST_HOST.'
  },
  AccessDenied: {
    title: 'Akses Ditolak',
    description: 'Anda tidak memiliki izin untuk masuk dengan kredensial tersebut.'
  },
  Verification: {
    title: 'Tautan Verifikasi Tidak Berlaku',
    description: 'Tautan verifikasi sudah pernah digunakan atau telah kedaluwarsa.'
  },
  Default: {
    title: 'Terjadi Kesalahan Autentikasi',
    description: 'Terjadi masalah saat memproses permintaan masuk. Silakan coba lagi.'
  }
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const errorKey = searchParams.get('error') || 'Default'
  const error = errorDetails[errorKey] || errorDetails.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {error.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error.description}
          </p>
          {error.hint ? (
            <p className="mt-4 text-center text-xs text-amber-600">
              {error.hint}
            </p>
          ) : null}
        </div>
        <div className="text-center">
          <Link 
            href="/"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Return to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <span className="text-sm text-gray-500">Memuat informasi error…</span>
        </div>
      )}
    >
      <AuthErrorContent />
    </Suspense>
  )
}