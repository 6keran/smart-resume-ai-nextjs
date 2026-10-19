import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';
import { getUserSkills, addUserSkill, deleteUserSkill, getUserSkillsStatus } from '@/lib/db';
import { INITIAL_USER_SKILLS } from '@/lib/mockData';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const wantCatalog = url.searchParams.get('catalog') === 'true';

    const user = getUserFromRequest(req);
    if (!user) {
      if (wantCatalog) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ success: true, skills: INITIAL_USER_SKILLS });
    }

    if (wantCatalog) {
      const skills = getUserSkillsStatus(user.id);
      return NextResponse.json({ skills });
    }

    const skills = getUserSkills(user.id);
    return NextResponse.json({ success: true, skills });
  } catch (err) {
    console.error('Error fetching user skills:', err);
    return NextResponse.json({ message: 'Failed to fetch user skills' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Please sign in to save skills.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, category = 'Technical', claimDirectly = true } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Skill name is required.' }, { status: 400 });
    }

    const skill = addUserSkill(user.id, name.trim(), category, claimDirectly);
    return NextResponse.json({ success: true, skill });
  } catch (err) {
    console.error('Error adding user skill:', err);
    return NextResponse.json({ message: 'Failed to add skill' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Please sign in to remove skills.' }, { status: 401 });
    }

    let skillIdOrName: string | null = null;

    // Check query params
    const url = new URL(req.url);
    skillIdOrName = url.searchParams.get('id') || url.searchParams.get('skill') || url.searchParams.get('name');

    // Check body if not in query params
    if (!skillIdOrName) {
      const body = await req.json().catch(() => ({}));
      skillIdOrName = body.id || body.skillId || body.name || body.skillName;
    }

    if (!skillIdOrName || typeof skillIdOrName !== 'string') {
      return NextResponse.json({ message: 'Skill ID or name is required.' }, { status: 400 });
    }

    const result = deleteUserSkill(user.id, skillIdOrName.trim());

    if (!result.success) {
      return NextResponse.json({ message: result.error || 'Skill not found in user profile or unauthorized.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Skill "${result.deletedSkill?.name}" removed from profile.`,
      deletedSkill: result.deletedSkill,
    });
  } catch (err) {
    console.error('Error deleting user skill:', err);
    return NextResponse.json({ message: 'Failed to delete skill' }, { status: 500 });
  }
}
