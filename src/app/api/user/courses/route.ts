import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';
import { getUserCourses, updateUserCourseProgress } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const courses = getUserCourses(user.id);
    return NextResponse.json({ courses });
  } catch (err) {
    console.error('Error fetching courses:', err);
    return NextResponse.json({ message: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, lessonsCompleted } = body;

    if (!courseId || typeof lessonsCompleted !== 'number') {
      return NextResponse.json(
        { message: 'Course ID and lessonsCompleted (number) are required.' },
        { status: 400 }
      );
    }

    const progress = updateUserCourseProgress(user.id, courseId, lessonsCompleted);
    return NextResponse.json({
      success: true,
      message: 'Course progress updated.',
      progress,
    });
  } catch (err: any) {
    console.error('Error updating course progress:', err);
    return NextResponse.json(
      { message: err.message || 'Failed to update progress' },
      { status: 400 }
    );
  }
}
