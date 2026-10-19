import { NextResponse } from 'next/server';
import { executeJobSearch } from '@/lib/jobs/search';
import { JobSearchParams } from '@/lib/jobs/types';
import { recordJobSearchEvent } from '@/lib/db';
import { getOrCreateVisitorId } from '@/lib/visitor';
import { getUserFromRequest } from '@/lib/userSession';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const params: JobSearchParams = {
      keywords: searchParams.get('q') || searchParams.get('keywords') || '',
      location: searchParams.get('location') || '',
      radiusKm: searchParams.get('radius') ? Number(searchParams.get('radius')) : undefined,
      workplaceType: (searchParams.get('workplace') as JobSearchParams['workplaceType']) || 'all',
      employmentType: (searchParams.get('type') as JobSearchParams['employmentType']) || 'all',
      experienceLevel: (searchParams.get('experience') as JobSearchParams['experienceLevel']) || 'all',
      salaryMin: searchParams.get('salaryMin') ? Number(searchParams.get('salaryMin')) : undefined,
      postedWithinDays: searchParams.get('days') ? Number(searchParams.get('days')) : undefined,
      sortBy: (searchParams.get('sortBy') as JobSearchParams['sortBy']) || 'relevance',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 15,
      bypassCache: searchParams.get('refresh') === 'true',
    };

    // If resume skills passed in query string (comma separated)
    const skillsParam = searchParams.get('skills');
    if (skillsParam) {
      params.resumeSkills = skillsParam.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const results = await executeJobSearch(params);

    // Record job search event in database
    try {
      const user = getUserFromRequest(req);
      const visitorId = getOrCreateVisitorId(req);
      recordJobSearchEvent({
        visitorId,
        userId: user?.id,
        query: params.keywords || (params.resumeSkills ? params.resumeSkills.join(', ') : 'All Opportunities'),
        location: params.location || 'India',
        provider: results.activeSources?.[0] || 'LinkedIn',
        resultsCount: results.totalJobs || (results.jobs ? results.jobs.length : 0),
      });
    } catch (dbErr) {
      console.error('[DB Event Error] Failed to persist job search:', dbErr);
    }

    return NextResponse.json(results);
  } catch (err: unknown) {
    console.error('[API /api/jobs/search GET Error]:', err);
    return NextResponse.json(
      { message: 'Live job search is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);

    const params: JobSearchParams = {
      keywords: body.keywords || searchParams.get('q') || '',
      location: body.location || searchParams.get('location') || '',
      radiusKm: body.radiusKm ? Number(body.radiusKm) : undefined,
      workplaceType: body.workplaceType || 'all',
      employmentType: body.employmentType || 'all',
      experienceLevel: body.experienceLevel || 'all',
      salaryMin: body.salaryMin ? Number(body.salaryMin) : undefined,
      postedWithinDays: body.postedWithinDays ? Number(body.postedWithinDays) : undefined,
      sortBy: body.sortBy || 'relevance',
      page: body.page ? Number(body.page) : 1,
      limit: body.limit ? Number(body.limit) : 15,
      bypassCache: Boolean(body.bypassCache || searchParams.get('refresh') === 'true'),
      // Personalized candidate resume context
      resumeSkills: Array.isArray(body.resumeSkills) ? body.resumeSkills : undefined,
      resumeHeadline: body.resumeHeadline,
      resumeYearsExp: body.resumeYearsExp,
      candidateContext: body.candidateContext,
    };

    const results = await executeJobSearch(params);

    // Record job search event in database
    try {
      const user = getUserFromRequest(req);
      const visitorId = getOrCreateVisitorId(req);
      recordJobSearchEvent({
        visitorId,
        userId: user?.id,
        query: params.keywords || (params.resumeSkills ? params.resumeSkills.join(', ') : 'All Opportunities'),
        location: params.location || 'India',
        provider: results.activeSources?.[0] || 'LinkedIn',
        resultsCount: results.totalJobs || (results.jobs ? results.jobs.length : 0),
      });
    } catch (dbErr) {
      console.error('[DB Event Error] Failed to persist job search (POST):', dbErr);
    }

    return NextResponse.json(results);
  } catch (err: unknown) {
    console.error('[API /api/jobs/search POST Error]:', err);
    return NextResponse.json(
      { message: 'Live job search is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
