import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    const res = NextResponse.json({
      authenticated: Boolean(user),
      user: user || null,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
  } catch (err) {
    console.error('Error in /api/auth/me:', err);
    const res = NextResponse.json({
      authenticated: false,
      user: null,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
  }
}
