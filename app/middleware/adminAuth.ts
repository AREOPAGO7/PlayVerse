import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the route is an admin route
  if (request.nextUrl.pathname.startsWith('/pages/admin')) {
    // Skip login page from middleware
    if (request.nextUrl.pathname === '/pages/admin/login') {
      return NextResponse.next()
    }

    // Check for admin authentication
    const isAuthenticated = request.cookies.get('adminAuth')?.value === 'true'
    
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/pages/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/pages/admin/:path*'
}