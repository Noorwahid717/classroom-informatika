import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    
    // Check if user is trying to access dashboard routes
    if (pathname.startsWith('/dashboard')) {
      
      // If no token, redirect to homepage
      if (!token) {
        const loginUrl = new URL('/', req.url)
        loginUrl.searchParams.set('callbackUrl', req.url)
        return NextResponse.redirect(loginUrl)
      }
      
      // Check access to teacher dashboard
      if (pathname.startsWith('/dashboard/teacher')) {
        if ((token.role !== 'SUPER_ADMIN' && token.role !== 'ADMIN') || token.userType !== 'admin') {
          return NextResponse.redirect(new URL('/', req.url))
        }
      }
      
      // Check access to student dashboard  
      if (pathname.startsWith('/dashboard/student')) {
        if (token.role !== 'STUDENT' || token.userType !== 'student') {
          return NextResponse.redirect(new URL('/', req.url))
        }
      }
    }
    
    // Only redirect from homepage if user is logged in and not already on dashboard
    if (pathname === '/' && token && !req.nextUrl.searchParams.has('callbackUrl')) {
      if (token.userType === 'admin') {
        return NextResponse.redirect(new URL('/dashboard/teacher', req.url))
      }
      if (token.userType === 'student') {
        return NextResponse.redirect(new URL('/dashboard/student', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Always allow access to homepage and auth routes
        if (pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
          return true
        }
        
        // For dashboard routes, require valid token
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        // Allow access to all other routes (API, etc.)
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*']
}
