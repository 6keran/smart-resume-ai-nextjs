import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';
import { getUserResumes } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const resumes = getUserResumes(user.id);
    return NextResponse.json({ resumes });
  } catch (err) {
    console.error('Error fetching user resumes:', err);
    return NextResponse.json({ message: 'Failed to fetch resumes' }, { status: 500 });
  }
}
