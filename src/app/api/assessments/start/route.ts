import { NextResponse } from 'next/server';
import { startAssessmentAttempt } from '@/lib/db';
import { getOrCreateVisitorId } from '@/lib/visitor';
import { getUserFromRequest } from '@/lib/userSession';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const skill = (body.skill as string) || 'Python';
    const user = getUserFromRequest(req);
    const visitorId = getOrCreateVisitorId(req);

    const result = startAssessmentAttempt(skill, visitorId, user?.id);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('API /api/assessments/start error:', err);
    return NextResponse.json({ message: 'Unable to start assessment.' }, { status: 500 });
  }
}
