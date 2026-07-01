import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

export function middleware(req: NextRequest) {
  const authEnabled = process.env.AUTH_ENABLED === 'true'
  if (!authEnabled) return NextResponse.next()

  const { pathname } = req.nextUrl

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Allow cron job endpoints (authenticated via CRON_SECRET, not cookie)
  if (pathname.startsWith('/api/jobs/')) {
    return NextResponse.next()
  }

  const session = req.cookies.get('respfrias_session')
  if (!session || session.value !== process.env.APP_PASSWORD) {
    // Return 401 JSON for API routes so fetch callers can handle it gracefully
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }
    // For non-GET page requests (e.g. server actions after cookie expiry), use 303
    // so the browser switches to GET and renders the login page correctly
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    const status = req.method === 'GET' ? 302 : 303
    return NextResponse.redirect(loginUrl, status)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
