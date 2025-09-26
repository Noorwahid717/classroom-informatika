import { randomBytes } from 'crypto'
import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

const isProduction = process.env.NODE_ENV === 'production'

const resolveSecret = () => {
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET
  }

  const fallbackSecret = process.env.AUTH_SECRET || process.env.SECRET
  if (fallbackSecret) {
    if (isProduction) {
      console.warn(
        'NEXTAUTH_SECRET is not set. Falling back to AUTH_SECRET/SECRET. Please rotate credentials as soon as possible.'
      )
    }
    return fallbackSecret
  }

  if (!isProduction) {
    return randomBytes(32).toString('hex')
  }

  console.error(
    'NEXTAUTH_SECRET is missing in production. Authentication will fail until the environment variable is configured.'
  )
  return undefined
}

const resolveCookieDomain = () => {
  if (!isProduction) {
    return undefined
  }

  const domainFromEnv = process.env.NEXTAUTH_COOKIE_DOMAIN
  if (domainFromEnv) {
    return domainFromEnv
  }

  const urlFromEnv = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL

  if (!urlFromEnv) {
    return undefined
  }

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

type AuthOptionsWithTrustHost = AuthOptions & {
  trustHost?: boolean
}

export const authOptions: AuthOptionsWithTrustHost = {
  secret: resolvedSecret,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Try admin table first
          const admin = await prisma.admin.findUnique({
            where: {
              email: credentials.email
            }
          })

          // If not found in admin table, try user table with ADMIN role
          if (!admin) {
            const user = await prisma.user.findFirst({
              where: {
                email: credentials.email,
                role: 'ADMIN'
              }
            })

            if (user) {
              const isPasswordValid = await verifyPassword(
                credentials.password,
                user.password || ''
              )

              if (!isPasswordValid) {
                return null
              }

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
            credentials.password,
            admin.password
          )

          if (!isPasswordValid) {
            return null
          }
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
        if (!credentials?.studentId || !credentials?.password) {
          return null
        }

        const student = await prisma.student.findUnique({
          where: {
            studentId: credentials.studentId
          }
        })

        if (!student || student.status !== 'active') {
          return null
        }

        const isPasswordValid = await verifyPassword(
          credentials.password,
          student.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Update last login
        // Student login successful - no additional update needed

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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        domain: resolveCookieDomain()
      }
    }
  },
  pages: {
    signIn: '/',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.userType = user.userType
        token.studentId = user.studentId
        token.class = user.class
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...(session.user ?? {}),
          id: token.sub ?? session.user?.id ?? '',
          role: (token.role as string | undefined) ?? session.user?.role ?? 'GUEST',
          userType: (token.userType as string | undefined) ?? session.user?.userType,
          studentId: (token.studentId as string | undefined) ?? session.user?.studentId,
          class: (token.class as string | undefined) ?? session.user?.class
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // If url starts with /, it's a relative path
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // If url has same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      // Default to homepage
      return baseUrl
    }
  }
}
