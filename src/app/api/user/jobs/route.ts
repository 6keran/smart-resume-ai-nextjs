import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';
import { getUserJobMatches } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const matches = getUserJobMatches(user.id);
    return NextResponse.json({ matches });
  } catch (err) {
    console.error('Error fetching job matches:', err);
    return NextResponse.json({ message: 'Failed to fetch job matches' }, { status: 500 });
  }
}
