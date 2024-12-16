import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/reset-password', '/verify-email', '/auth/action']
  
  // If the path is public, allow access
  if (publicPaths.includes(path)) {
    return NextResponse.next()
  }

  // For non-public paths, let the client-side Firebase Auth handle the authentication
  // This will automatically redirect to login if not authenticated
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
} 