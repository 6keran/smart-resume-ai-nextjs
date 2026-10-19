import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Please provide both email and password.' },
        { status: 400 }
      );
    }

    const { user, sessionToken } = loginUser({
      email,
      password,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      user,
    });

    response.cookies.set('sra_user_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    response.cookies.set('sra_user_name', encodeURIComponent(user.name), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.log('[Auth Login Error]:', err?.message || String(err));
    return NextResponse.json(
      { message: err?.message || 'Invalid email or password.' },
      { status: 401 }
    );
  }
}
