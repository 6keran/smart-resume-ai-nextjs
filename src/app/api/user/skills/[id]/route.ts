import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';
import { deleteUserSkill } from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Please sign in to remove skills.' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'Skill ID is required.' }, { status: 400 });
    }

    const result = deleteUserSkill(user.id, decodeURIComponent(id));
    if (!result.success) {
      return NextResponse.json({ message: result.error || 'Skill not found in user profile or unauthorized.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Skill "${result.deletedSkill?.name}" removed from profile.`,
      deletedSkill: result.deletedSkill,
    });
  } catch (err) {
    console.error('Error deleting user skill by id param:', err);
    return NextResponse.json({ message: 'Failed to delete skill' }, { status: 500 });
  }
}
