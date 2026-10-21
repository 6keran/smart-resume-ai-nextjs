import { NextResponse } from 'next/server';
import { getDb } from '@/server/db/adapter';

export async function GET() {
  try {
    const db = getDb();
    const skills = await db
      .prepare('SELECT id, name, slug, category, description FROM skills_catalog WHERE is_active = 1 ORDER BY category, name')
      .all();
    return NextResponse.json(skills || []);
  } catch (err) {
    console.error('API /api/skills error:', err);
    return NextResponse.json([], { status: 500 });
  }
}
