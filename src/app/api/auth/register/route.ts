import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/db';
import { getOrCreateVisitorId } from '@/lib/visitor';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password, confirmPassword } = body;

    // 1. Validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return NextResponse.json(
        { message: 'Please provide a valid full name with at least 2 characters.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Passwords do not match. Please verify your password.' },
        { status: 400 }
      );
    }

    const visitorId = getOrCreateVisitorId(req);

    // 2. Register user in DB
    const { user, sessionToken } = registerUser({
      name: fullName.trim(),
      email: email.trim(),
      password,
      visitorId,
    });

    // 3. Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully.',
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
    console.log('[Auth Registration Error]:', err?.message || String(err));
    const isConflict = (err?.message || '').toLowerCase().includes('already exists');
    return NextResponse.json(
      { message: err?.message || 'Registration failed. Please try again.' },
      { status: isConflict ? 409 : 400 }
    );
  }
}
