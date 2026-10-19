import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';
import { getUserSingleAnalysis } from '@/lib/db';

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const analysis = getUserSingleAnalysis(user.id, id);

    if (!analysis) {
      return NextResponse.json(
        { message: 'Analysis not found or you do not have permission to view it.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('Error fetching single analysis:', err);
    return NextResponse.json({ message: 'Failed to fetch analysis' }, { status: 500 });
  }
}
