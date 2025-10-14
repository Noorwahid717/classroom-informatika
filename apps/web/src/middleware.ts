import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';

export async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  // Proteksi dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!session || !session.user) {
      const loginUrl = new URL('/', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }
    // Role-based access
    if (pathname.startsWith('/dashboard/teacher') && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect('/');
    }
    if (pathname.startsWith('/dashboard/student') && session.user.role !== 'STUDENT') {
      return NextResponse.redirect('/');
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
