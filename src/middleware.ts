import { NextResponse, type NextRequest } from 'next/server';

function getTokenPayload(token: string | undefined): any | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const json = Buffer.from(parts[0], 'base64url').toString('utf8');
    const payload = JSON.parse(json);
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminCookie = request.cookies.get('sra_admin_session')?.value;
  const userCookie = request.cookies.get('sra_user_session')?.value;

  const adminPayload = getTokenPayload(adminCookie);
  const userPayload = getTokenPayload(userCookie);

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

  // 2. Public Auth Routes & APIs
  const isUserAuthPage = pathname === '/login' || pathname === '/register';
  const isAdminAuthPage = pathname === '/admin/login';
  const isPublicAuthApi =
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/api/auth/me') ||
    pathname.startsWith('/api/admin/auth/login') ||
    pathname.startsWith('/api/admin/auth/logout') ||
    pathname.startsWith('/api/admin/auth/me');

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
