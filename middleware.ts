import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the auth cookie
  const authCookie = request.cookies.get('auth')
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/reset-password']
  
  if (!authCookie && !publicPaths.includes(path)) {
    // Redirect to login if no auth cookie and trying to access protected route
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (authCookie && publicPaths.includes(path)) {
    // Redirect to home if authenticated and trying to access public route
    return NextResponse.redirect(new URL('/', request.url))
  }

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