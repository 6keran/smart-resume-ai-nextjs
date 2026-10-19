import { NextResponse } from 'next/server';
import { executeJobSearch } from '@/lib/jobs/search';
import { JobSearchParams } from '@/lib/jobs/types';

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
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    };

    const skillsParam = searchParams.get('skill') || searchParams.get('skills');
    if (skillsParam) {
      params.resumeSkills = skillsParam.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const response = await executeJobSearch(params);
    return NextResponse.json(response.jobs);
  } catch (err: unknown) {
    console.error('API /api/jobs error:', err);
    return NextResponse.json({ message: 'Live job search is temporarily unavailable.' }, { status: 500 });
  }
}
