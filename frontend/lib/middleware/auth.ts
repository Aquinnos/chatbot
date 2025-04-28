import { NextRequest, NextResponse } from 'next/server';

export function withAuth(middleware: (request: NextRequest) => NextResponse) {
  return async (request: NextRequest) => {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    // Public paths that don't require authentication
    const publicPaths = ['/auth/login', '/auth/register'];
    if (publicPaths.includes(pathname)) {
      // If user is logged in and tries to access login/register pages, redirect to home
      if (token) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return middleware(request);
    }

    // Protected paths that require authentication
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return middleware(request);
  };
}
