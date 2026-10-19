import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifyAdminToken,
  getAdminUsers,
  getAdminUserDetail,
  getAdminVisitors,
  getAdminResumeAnalyses,
  getAdminVerifiedSkills,
  getAdminAssessments,
  getAdminJobSearches,
  getAdminJobMatches,
  getAdminFeedback,
  getVisitorActivity,
} from '@/lib/db';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sra_admin_session')?.value;

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'users';
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 100;
    const filter = searchParams.get('filter') || undefined;
    const id = searchParams.get('id') || undefined;

    switch (type) {
      case 'users':
        return NextResponse.json({ data: getAdminUsers(limit) });
      case 'user_detail':
        if (!id) return NextResponse.json({ message: 'User ID required' }, { status: 400 });
        return NextResponse.json({ data: getAdminUserDetail(id) });
      case 'visitors':
        return NextResponse.json({ data: getAdminVisitors(limit) });
      case 'visitor_activity':
        if (!id) return NextResponse.json({ message: 'Visitor ID required' }, { status: 400 });
        return NextResponse.json({ data: getVisitorActivity(id) });
      case 'resumes':
      case 'analyses':
        return NextResponse.json({ data: getAdminResumeAnalyses(limit) });
      case 'skills':
        return NextResponse.json({ data: getAdminVerifiedSkills(limit) });
      case 'assessments':
        return NextResponse.json({ data: getAdminAssessments(limit) });
      case 'jobs':
        return NextResponse.json({ data: getAdminJobSearches(limit) });
      case 'matches':
        return NextResponse.json({ data: getAdminJobMatches(limit) });
      case 'feedback':
        return NextResponse.json({ data: getAdminFeedback(limit, filter) });
      default:
        return NextResponse.json({ message: `Unknown record type: ${type}` }, { status: 400 });
    }
  } catch (err) {
    console.error('API /api/admin/records error:', err);
    return NextResponse.json({ message: 'Failed to retrieve records.' }, { status: 500 });
  }
}
