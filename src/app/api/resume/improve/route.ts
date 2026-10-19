import { NextResponse } from 'next/server';
import { improveResumeSection } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sectionName, originalContent } = body;

    if (!originalContent) {
      return NextResponse.json({ message: 'Content is required.' }, { status: 400 });
    }

    const result = await improveResumeSection(sectionName || 'section', originalContent);
    return NextResponse.json(result);
  } catch (err) {
    console.error('API /api/resume/improve error:', err);
    return NextResponse.json(
      { message: 'Unable to improve resume content at this moment.' },
      { status: 500 }
    );
  }
}
