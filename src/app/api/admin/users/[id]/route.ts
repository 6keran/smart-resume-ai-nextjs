import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken, deleteUserAndData } from '@/server/db';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sra_admin_session')?.value;

    const admin = verifyAdminToken(token);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized. Administrator credentials required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json(
        { message: 'Target user ID is required.' },
        { status: 400 }
      );
    }

    const result = await deleteUserAndData(id.trim(), {
      id: admin.sub,
      email: admin.email,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error in DELETE /api/admin/users/[id]:', errorMsg);

    if (errorMsg.includes('not found')) {
      return NextResponse.json({ message: errorMsg }, { status: 404 });
    }
    if (errorMsg.includes('Action prohibited')) {
      return NextResponse.json({ message: errorMsg }, { status: 403 });
    }

    return NextResponse.json(
      { message: errorMsg || 'Failed to delete user account.' },
      { status: 500 }
    );
  }
}
