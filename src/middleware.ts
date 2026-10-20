import { NextResponse, type NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/sessionAuth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminCookie = request.cookies.get('sra_admin_session')?.value;
  const userCookie = request.cookies.get('sra_user_session')?.value;

  // Cryptographically verify token signatures and expiration before trusting any session claims
  const adminPayload = await verifySessionToken(adminCookie);
  const userPayload = await verifySessionToken(userCookie);

  const hasValidAdminSession = Boolean(adminPayload && adminPayload.role === 'ADMIN');
  const hasValidUserSession = Boolean(userPayload && (userPayload.role === 'USER' || userPayload.role === 'ADMIN'));

  // 1. Static and Internal Next.js files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Public Legal & Compliance Pages (Accessible without authentication)
  const isPublicLegalPage = pathname === '/privacy' || pathname === '/terms';
  if (isPublicLegalPage) {
    return NextResponse.next();
  }

  // 3. Public Auth Routes & APIs
  const isUserAuthPage = pathname === '/login' || pathname === '/register';
  const isAdminAuthPage = pathname === '/admin/login';
  const PUBLIC_AUTH_APIS = new Set([
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/me',
    '/api/admin/auth/login',
    '/api/admin/auth/logout',
  ]);
  const normalizedPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const isPublicAuthApi = PUBLIC_AUTH_APIS.has(normalizedPath);

  if (isPublicAuthApi) {
    return NextResponse.next();
  }

  // 3. Admin Authentication Flow
  if (isAdminAuthPage) {
    if (hasValidAdminSession && !request.nextUrl.searchParams.has('from')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (pathname === '/admin') {
    if (hasValidAdminSession) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (pathname.startsWith('/admin')) {
    if (!hasValidAdminSession) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      const res = NextResponse.redirect(loginUrl);
      if (adminCookie) res.cookies.delete('sra_admin_session');
      return res;
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/admin')) {
    if (!hasValidAdminSession) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 4. User Auth Pages
  if (isUserAuthPage) {
    if (hasValidUserSession && !request.nextUrl.searchParams.has('from')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 5. Protected API routes (all other /api/*)
  if (pathname.startsWith('/api/')) {
    if (!hasValidUserSession) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 6. ALL OTHER APPLICATION ROUTES (including '/', '/builder', '/dashboard', '/analyzer', '/improver', '/skills', '/jobs', '/job-match', etc.)
  if (!hasValidUserSession) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname + request.nextUrl.search);
    }
    const res = NextResponse.redirect(loginUrl);
    if (userCookie) {
      res.cookies.delete('sra_user_session');
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static image/asset files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
};
