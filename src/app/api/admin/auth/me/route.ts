import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sra_admin_session')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      admin: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (err) {
    console.error('Admin me error:', err);
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}
