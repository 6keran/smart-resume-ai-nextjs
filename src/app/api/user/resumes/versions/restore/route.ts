import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';
import { restoreResumeVersion } from '@/lib/db';

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
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }

    const { versionId } = body;

    if (!versionId || typeof versionId !== 'string' || !versionId.trim()) {
      return NextResponse.json({ message: 'Valid versionId string is required' }, { status: 400 });
    }

    const result = await restoreResumeVersion(user.id, versionId.trim());

    return NextResponse.json({
      success: true,
      message: result.message,
      resumeData: result.resumeData,
      newVersion: result.newVersion,
      restoredFromVersionNumber: result.restoredFromVersionNumber,
      preRestoreCheckpoint: result.preRestoreCheckpoint,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error restoring resume version:', msg);

    if (/forbidden|permission|own this resume/i.test(msg)) {
      return NextResponse.json({ message: msg }, { status: 403 });
    }
    if (/not found/i.test(msg)) {
      return NextResponse.json({ message: msg }, { status: 404 });
    }
    if (/bad request/i.test(msg)) {
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    return NextResponse.json({ message: msg || 'Failed to restore version' }, { status: 500 });
  }
}
