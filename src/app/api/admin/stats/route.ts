import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken, getRealAdminStats, getDetailedAnalytics } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sra_admin_session')?.value;

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const stats = getRealAdminStats();
    const details = getDetailedAnalytics();

    return NextResponse.json({
      stats,
      details,
    });
  } catch (err) {
    console.error('API /api/admin/stats error:', err);
    return NextResponse.json({ message: 'Failed to retrieve admin stats.' }, { status: 500 });
  }
}
