import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';
import { getUserImprovements, recordUserImprovement } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const improvements = await getUserImprovements(user.id);
    return NextResponse.json({ improvements });
  } catch (err) {
    console.error('Error fetching user improvements:', err);
    return NextResponse.json({ message: 'Failed to fetch improvements' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const { resumeId, category, title, beforeText, afterText } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ message: 'Title is required.' }, { status: 400 });
    }

    if (!afterText || typeof afterText !== 'string' || !afterText.trim()) {
      return NextResponse.json({ message: 'Improved text is required.' }, { status: 400 });
    }

    const improvement = await recordUserImprovement(user.id, {
      resumeId: resumeId ? String(resumeId).trim() : null,
      category: category ? String(category).trim().slice(0, 100) : 'ATS Optimization',
      title: title.trim().slice(0, 255),
      beforeText: beforeText ? String(beforeText).trim() : 'Previous phrasing',
      afterText: afterText.trim(),
    });

    return NextResponse.json({ success: true, improvement }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error recording improvement:', msg);

    if (/forbidden|permission|do not own/i.test(msg)) {
      return NextResponse.json({ message: msg }, { status: 403 });
    }

    return NextResponse.json({ message: msg || 'Failed to record improvement' }, { status: 500 });
  }
}
