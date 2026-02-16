import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get current time in New York
  const now = new Date()
  // Use Intl.DateTimeFormat for robust time extraction
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    hour12: false,
  })
  
  const currentHour = parseInt(formatter.format(now), 10) % 24
  
  // Define Sundown window: 21:00 (9 PM) to 04:00 (4 AM)
  // Logic: If hour >= 21 OR hour < 4, it is sundown.
  const isSundown = currentHour >= 21 || currentHour < 4

  const isSundownPage = request.nextUrl.pathname === '/sundown'
  
  // Exclude static assets, API, and Next.js internals
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|ico|svg|json)$/)
  ) {
    return NextResponse.next()
  }

  // ENFORCEMENT
  if (isSundown) {
    // If it's sundown and we are NOT on the sundown page, redirect to it.
    if (!isSundownPage) {
      return NextResponse.redirect(new URL('/sundown', request.url))
    }
  } else {
    // If it's NOT sundown and we ARE on the sundown page, redirect back to home.
    if (isSundownPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
