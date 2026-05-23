import { updateSession } from '@/utils/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Update the supabase session to ensure the cookie is refreshed
  const response = await updateSession(request)

  const { pathname } = request.nextUrl

  // Protected routes require authentication
  const protectedRoutes = ['/dashboard', '/create', '/chat', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Check if user has an active session from the cookie
    const supabaseCookie = request.cookies.get('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token')
    
    // In a real app we'd verify the token with Supabase, but for middleware 
    // simply checking the cookie's existence is a fast initial check before Server Components
    if (!supabaseCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect_to', pathname)
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
