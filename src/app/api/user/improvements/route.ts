import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';
import { getUserImprovements } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const improvements = getUserImprovements(user.id);
    return NextResponse.json({ improvements });
  } catch (err) {
    console.error('Error fetching user improvements:', err);
    return NextResponse.json({ message: 'Failed to fetch improvements' }, { status: 500 });
  }
}
