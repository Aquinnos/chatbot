import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

function middleware() {
  return NextResponse.next();
}

// Apply the authentication middleware to all routes
export default withAuth(middleware);

// Match all routes except for static files, api routes, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
