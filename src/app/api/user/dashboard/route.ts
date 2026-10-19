import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';
import { getUserDashboardData } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = getUserDashboardData(user.id);
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      ...data,
    });
  } catch (err) {
    console.error('Error fetching user dashboard data:', err);
    return NextResponse.json({ message: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
