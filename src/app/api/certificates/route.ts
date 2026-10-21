import { NextResponse } from 'next/server';
import { getCertificateByCode } from '@/server/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code')?.trim() || '';

    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'Verification code is required.' },
        { status: 400 }
      );
    }

    const cert = await getCertificateByCode(code);

    if (!cert) {
      return NextResponse.json(
        { valid: false, message: 'Certificate not found or invalid verification code.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      verificationCode: cert.certificateCode,
      userName: cert.userName,
      skill: cert.skill,
      score: cert.score,
      totalQuestions: cert.totalQuestions,
      percentage: cert.percentage,
      issuedAt: cert.issueDate,
      verificationStatus: cert.verificationStatus,
      issuer: 'Smart Resume AI Career Intelligence',
    });
  } catch (err) {
    console.error('API /api/certificates error:', err);
    return NextResponse.json({ message: 'Certificate verification failed.' }, { status: 500 });
  }
}
