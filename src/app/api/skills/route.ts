import { NextResponse } from 'next/server';
import { INITIAL_USER_SKILLS } from '@/lib/mockData';

export async function GET() {
  try {
    return NextResponse.json(INITIAL_USER_SKILLS);
  } catch (err) {
    console.error('API /api/skills error:', err);
    return NextResponse.json({ message: 'Error retrieving skills.' }, { status: 500 });
  }
}
