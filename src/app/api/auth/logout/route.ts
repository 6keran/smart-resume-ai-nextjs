import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logoutUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    let token: string | undefined;

    try {
      const cookieStore = await cookies();
      token = cookieStore.get('sra_user_session')?.value;
    } catch {
      // fallback
    }

    if (!token) {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/sra_user_session=([^;]+)/);
      if (match && match[1]) {
        token = match[1].trim();
      }
    }

    if (token) {
      logoutUser(token);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });

    response.cookies.set('sra_user_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    response.cookies.set('sra_user_name', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    console.log('[Auth Logout Error]:', err?.message || String(err));
    return NextResponse.json(
      { success: false, message: 'Logout failed. Please try again.' },
      { status: 500 }
    );
  }
}
