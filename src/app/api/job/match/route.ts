import { NextResponse } from 'next/server';
import { matchResumeToJob } from '@/lib/gemini';
import { recordJobMatchEvent } from '@/lib/db';
import { getOrCreateVisitorId } from '@/lib/visitor';
import { getUserFromRequest } from '@/lib/userSession';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeText, jobTitle, company, jobDescription } = body;

    const result = await matchResumeToJob(
      resumeText || '',
      jobTitle || 'Target Role',
      company || 'Target Company',
      jobDescription || ''
    );

    // Persist to database
    try {
      const user = getUserFromRequest(req);
      const visitorId = getOrCreateVisitorId(req);
      recordJobMatchEvent({
        visitorId,
        userId: user?.id,
        jobTitle: jobTitle || 'Target Role',
        company: company || 'Target Company',
        matchScore: result.overallMatchScore,
        matchedSkills: (result.matchedSkills || []).map((s: any) => typeof s === 'string' ? s : s.skill),
        partialSkills: (result.partialSkills || []).map((s: any) => typeof s === 'string' ? s : s.skill),
        missingSkills: (result.missingSkills || []).map((s: any) => typeof s === 'string' ? s : s.skill),
      });
    } catch (dbErr: any) {
      console.log('[DB Event Error] Failed to persist job match:', dbErr?.message);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('API /api/job/match error:', err);
    return NextResponse.json(
      { message: 'Unable to evaluate job match at this time.' },
      { status: 500 }
    );
  }
}
