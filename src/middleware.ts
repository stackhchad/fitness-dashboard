import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/sign-in', '/_next', '/favicon.ico', '/api/auth'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for auth token cookie
  const token =
    req.cookies.get('neon-auth-session-token')?.value ??
    req.cookies.get('neon_auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
