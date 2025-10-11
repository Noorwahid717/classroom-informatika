import { createHash, randomBytes } from 'crypto'
import type { NextAuthConfig, Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import type { Adapter, AdapterUser } from 'next-auth/adapters'
import type { User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

type ExtendedUser = (User | AdapterUser) & {
  role?: string | null
  userType?: string | null
  studentId?: string | null
  class?: string | null
}

type ExtendedJWT = JWT & {
  role?: string
  id?: string
  userType?: string
  studentId?: string
  class?: string
}

type ExtendedSession = Session & {
  user?: Session['user'] & {
    id?: string
    role?: string
    userType?: string
    studentId?: string
    class?: string
  }
}

type AuthRole = 'SUPER_ADMIN' | 'ADMIN' | 'MENTOR' | 'STUDENT' | 'GUEST'

const isProduction = process.env.NODE_ENV === 'production'

const normalizeUrl = (url: string) => {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`
  }
  return url
}

const allowDevFallback = !isProduction || process.env.CI === '1'

const resolveAuthUrl = () => {
  const explicitAuthUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL
  if (explicitAuthUrl?.trim()) {
    return normalizeUrl(explicitAuthUrl.trim())
  }

  const fallbackSources = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    process.env.URL
  ]

  for (const candidate of fallbackSources) {
    if (candidate?.trim()) {
      return normalizeUrl(candidate.trim())
    }
  }

  if (allowDevFallback) {
    return 'http://localhost:3000'
  }

  console.error(
    'NEXTAUTH_URL is not configured. Set NEXTAUTH_URL (or NEXT_PUBLIC_SITE_URL) to the deployed site URL to enable authentication.'
  )
  return undefined
}

const setEnvIfMissing = (key: string, value?: string) => {
  if (!value) return
  if (!process.env[key] || process.env[key]?.trim() === '') {
    process.env[key] = value
  }
}

const resolvedAuthUrl = resolveAuthUrl()
setEnvIfMissing('NEXTAUTH_URL', resolvedAuthUrl)
setEnvIfMissing('NEXTAUTH_URL_INTERNAL', resolvedAuthUrl)
setEnvIfMissing('AUTH_URL', resolvedAuthUrl)

const resolveSecret = () => {
  const directSecret = process.env.NEXTAUTH_SECRET?.trim()
  if (directSecret) {
    return directSecret
  }

  const fallbackSecret = process.env.AUTH_SECRET?.trim() || process.env.SECRET?.trim()
  if (fallbackSecret) {
    if (isProduction) {
      console.warn(
        'NEXTAUTH_SECRET is not set. Falling back to AUTH_SECRET/SECRET. Please rotate credentials as soon as possible.'
      )
    }
    return fallbackSecret
  }

  if (resolvedAuthUrl) {
    const entropySources = [
      resolvedAuthUrl,
      process.env.VERCEL_DEPLOYMENT_ID,
      process.env.VERCEL_ENV,
      process.env.VERCEL_GIT_COMMIT_SHA
    ].filter((value): value is string => !!value && value.trim() !== '')

    const seed = entropySources.length > 0 ? entropySources.join('|') : resolvedAuthUrl

    const derivedSecret = createHash('sha256')
      .update(seed)
      .digest('hex')
    if (isProduction) {
      console.warn(
        'NEXTAUTH_SECRET is missing. Deriving a deterministic fallback from the authentication URL. Configure NEXTAUTH_SECRET to harden production security.'
      )
    }
    return derivedSecret
  }

  if (allowDevFallback) {
    return randomBytes(32).toString('hex')
  }

  console.error(
    'NEXTAUTH_SECRET is missing in production and no fallback could be derived. Authentication will fail until the environment variable is configured.'
  )
  return undefined
}

const resolveCookieDomain = () => {
  if (!isProduction) return undefined

  const domainFromEnv = process.env.NEXTAUTH_COOKIE_DOMAIN
  if (domainFromEnv) return domainFromEnv

  const urlFromEnv = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (!urlFromEnv) return undefined

  try {
    const hostname = new URL(urlFromEnv).hostname

    // Avoid setting cookie domain for localhost or invalid hostnames
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.localhost')
    ) {
      return undefined
    }

    return hostname
  } catch (error) {
    console.error('Failed to resolve cookie domain from URL:', urlFromEnv, error)
    return undefined
  }
}

const resolvedSecret = resolveSecret()
setEnvIfMissing('NEXTAUTH_SECRET', resolvedSecret)
const cookieDomain = resolveCookieDomain()

type AuthOptionsWithTrustHost = NextAuthConfig & {
  trustHost?: boolean
}

export const authOptions: AuthOptionsWithTrustHost = {
  secret: resolvedSecret ?? '',
  trustHost: true,
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    // Admin Login Provider
    CredentialsProvider({
      id: 'admin',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === 'string' ? credentials.email.trim() : ''
        const password = typeof credentials?.password === 'string' ? credentials.password : ''

        if (!email || !password) {
          return null
        }

        try {
          const admin = await prisma.admin.findUnique({
            where: { email }
          })

          // If not found in admin table, try user table with ADMIN role
          if (!admin) {
            const user = await prisma.user.findFirst({
              where: { email, role: 'ADMIN' }
            })

            if (user) {
              const isPasswordValid = await verifyPassword(
                password,
                user.password ?? ''
              )
              if (!isPasswordValid) return null

              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                userType: 'admin'
              }
            }

            return null
          }

          const isPasswordValid = await verifyPassword(
            password,
            admin.password ?? ''
          )
          if (!isPasswordValid) return null

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            userType: 'admin'
          }
        } catch (error) {
          console.error('Admin credentials authorization failed:', error)
          return null
        }
      }
    }),
    // Student Login Provider
    CredentialsProvider({
      id: 'student',
      name: 'Student Login',
      credentials: {
        studentId: { label: 'Student ID', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const studentId = typeof credentials?.studentId === 'string' ? credentials.studentId.trim() : ''
        const password = typeof credentials?.password === 'string' ? credentials.password : ''

        if (!studentId || !password) {
          return null
        }

        const student = await prisma.student.findUnique({
          where: { studentId }
        })
        if (!student || student.status !== 'active') return null

        const isPasswordValid = await verifyPassword(
          password,
          student.password ?? ''
        )
        if (!isPasswordValid) return null

        return {
          id: student.id,
          email: student.email,
          name: student.fullName,
          studentId: student.studentId,
          class: student.class || undefined,
          role: 'STUDENT',
          userType: 'student'
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        ...(cookieDomain ? { domain: cookieDomain } : {})
      }
    }
  },
  pages: {
    signIn: '/',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user }: { token: ExtendedJWT; user?: ExtendedUser | null }) {
      if (user) {
        if (typeof user.role === 'string') token.role = user.role
        else delete token.role

        if (user.id) token.id = user.id
        else delete token.id

        if (typeof user.userType === 'string') token.userType = user.userType
        else delete token.userType

        if (typeof user.studentId === 'string') token.studentId = user.studentId
        else delete token.studentId

        if (typeof user.class === 'string') token.class = user.class
        else delete token.class
      }
      return token
    },
    async session({ session, token }: { session: ExtendedSession; token: ExtendedJWT }) {
      if (token) {
        const existingUser = session.user ?? { id: '', email: '', name: null }
        const resolvedRole: AuthRole = (token.role as AuthRole | undefined) ?? (existingUser.role as AuthRole | undefined) ?? 'GUEST'

        const nextUser: typeof existingUser & {
          role: AuthRole
          userType?: string
          studentId?: string
          class?: string
        } = {
          ...existingUser,
          id: token.sub ?? existingUser.id ?? '',
          role: resolvedRole
        }

        const userType = (token.userType as string | undefined) ?? existingUser.userType
        if (userType !== undefined) {
          nextUser.userType = userType
        }

        const studentId = (token.studentId as string | undefined) ?? existingUser.studentId
        if (studentId !== undefined) {
          nextUser.studentId = studentId
        }

        const userClass = (token.class as string | undefined) ?? existingUser.class
        if (userClass !== undefined) {
          nextUser.class = userClass
        }

        session.user = nextUser
      }
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
}
