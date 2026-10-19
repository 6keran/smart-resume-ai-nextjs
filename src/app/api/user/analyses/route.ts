import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';
import { getUserAnalyses } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const analyses = getUserAnalyses(user.id);
    return NextResponse.json({ analyses });
  } catch (err) {
    console.error('Error fetching user analyses:', err);
    return NextResponse.json({ message: 'Failed to fetch analyses' }, { status: 500 });
  }
}
