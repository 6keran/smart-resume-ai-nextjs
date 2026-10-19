import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';
import { getUserAssessments } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const assessments = getUserAssessments(user.id);
    return NextResponse.json({ assessments });
  } catch (err) {
    console.error('Error fetching user assessments:', err);
    return NextResponse.json({ message: 'Failed to fetch assessments' }, { status: 500 });
  }
}
