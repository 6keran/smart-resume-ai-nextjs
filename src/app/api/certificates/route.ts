import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code') || '';

    // Sample verification response
    return NextResponse.json({
      valid: true,
      verificationCode: code || 'SRA-VER-2024-9102',
      userName: 'Verified Candidate',
      skill: 'Python',
      score: 9,
      passingScore: 7,
      issuedAt: '2024-02-10',
      verificationStatus: 'VERIFIED',
      issuer: 'Smart Resume AI Career Intelligence',
    });
  } catch (err) {
    console.error('API /api/certificates error:', err);
    return NextResponse.json({ message: 'Certificate verification failed.' }, { status: 500 });
  }
}
