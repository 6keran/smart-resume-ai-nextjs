import { NextResponse } from 'next/server';
import { matchResumeToJob } from '@/lib/gemini';
import { validateResumeDocument } from '@/lib/resumeValidator';
import { recordJobMatchEvent } from '@/lib/db';
import { getOrCreateVisitorId } from '@/lib/visitor';
import { getUserFromRequest } from '@/lib/userSession';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeText, jobTitle, company, jobDescription, allowUncertainOverride } = body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return NextResponse.json(
        { message: 'Resume content is required for job matching.' },
        { status: 400 }
      );
    }

    // Enforce document validation to prevent non-resume documents from bypassing validation
    const validation = validateResumeDocument(resumeText, { allowUncertainOverride: Boolean(allowUncertainOverride) });
    if (!validation.isValid) {
      return NextResponse.json(
        {
          message: validation.message,
          validation,
        },
        { status: 422 }
      );
    }

    const result = await matchResumeToJob(
      resumeText,
      jobTitle || 'Target Role',
      company || 'Target Company',
      jobDescription || ''
    );

    // Persist to database
    try {
      const user = await getUserFromRequest(req);
      const visitorId = await getOrCreateVisitorId(req);
      await recordJobMatchEvent({
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
