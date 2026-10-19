import { NextResponse } from 'next/server';
import { getRealAdminStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = getRealAdminStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error('API /api/dashboard error:', err);
    return NextResponse.json({ message: 'Error retrieving dashboard metrics.' }, { status: 500 });
  }
}
