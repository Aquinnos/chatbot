import { NextRequest, NextResponse } from 'next/server';

export function withAuth(middleware: (request: NextRequest) => NextResponse) {
  return async (request: NextRequest) => {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    const publicPaths = ['/auth/login', '/auth/register', '/'];
    if (publicPaths.includes(pathname)) {
      if (
        token &&
        (pathname === '/auth/login' || pathname === '/auth/register')
      ) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return middleware(request);
    }

    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return middleware(request);
  };
}
