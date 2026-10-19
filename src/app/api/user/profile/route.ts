import { NextResponse } from 'next/server';
import { updateUserProfile, changeUserPassword } from '@/lib/db';
import { getUserFromRequest } from '@/lib/userSession';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return NextResponse.json({ message: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, email } = body;

    const updated = updateUserProfile(user.id, { name, email });

    const response = NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        lastLoginAt: updated.lastLoginAt,
      },
    });

    response.cookies.set('sra_user_name', encodeURIComponent(updated.name), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('Error updating user profile:', err);
    return NextResponse.json(
      { message: err.message || 'Failed to update profile.' },
      { status: 400 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, currentPassword, newPassword } = body;

    if (action === 'change-password' || (currentPassword && newPassword)) {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { message: 'Both current password and new password are required.' },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { message: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      changeUserPassword(user.id, currentPassword, newPassword);

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully.',
      });
    }

    // Default to updating profile name / email
    const updated = updateUserProfile(user.id, { name: body.name, email: body.email });
    return NextResponse.json({
      success: true,
      user: updated,
    });
  } catch (err: any) {
    console.error('Error in profile POST action:', err);
    return NextResponse.json(
      { message: err.message || 'Operation failed.' },
      { status: 400 }
    );
  }
}
