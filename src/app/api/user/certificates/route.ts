import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';
import { getUserCertificates, getCertificateByCode } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    // If code is requested, anyone can verify a public certificate by its code
    if (code) {
      const cert = getCertificateByCode(code);
      if (!cert) {
        return NextResponse.json({ message: 'Certificate not found' }, { status: 404 });
      }
      return NextResponse.json({ certificate: cert });
    }

    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const certificates = getUserCertificates(user.id);
    return NextResponse.json({ certificates });
  } catch (err) {
    console.error('Error fetching certificates:', err);
    return NextResponse.json({ message: 'Failed to fetch certificates' }, { status: 500 });
  }
}
