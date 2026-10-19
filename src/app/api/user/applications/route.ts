import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userSession';
import {
  getUserJobApplications,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
} from '@/lib/db';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const applications = getUserJobApplications(user.id);
    return NextResponse.json({ applications });
  } catch (err) {
    console.error('Error fetching job applications:', err);
    return NextResponse.json({ message: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { jobTitle, company, location, source, jobUrl, appliedAt, status, notes, jobId } = body;

    if (!jobTitle || !company) {
      return NextResponse.json(
        { message: 'Job title and Company name are required.' },
        { status: 400 }
      );
    }

    const application = createJobApplication(user.id, {
      jobId,
      jobTitle,
      company,
      location,
      source,
      jobUrl,
      appliedAt,
      status,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: 'Job application created.',
      application,
    });
  } catch (err: any) {
    console.error('Error creating job application:', err);
    return NextResponse.json(
      { message: err.message || 'Failed to create application' },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, jobTitle, company, location, source, jobUrl, appliedAt, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { message: 'Application ID is required.' },
        { status: 400 }
      );
    }

    const updated = updateJobApplication(user.id, id, {
      jobTitle,
      company,
      location,
      source,
      jobUrl,
      appliedAt,
      status,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: 'Job application updated.',
      application: updated,
    });
  } catch (err: any) {
    console.error('Error updating job application:', err);
    return NextResponse.json(
      { message: err.message || 'Failed to update application' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    let id = url.searchParams.get('id');

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json(
        { message: 'Application ID is required.' },
        { status: 400 }
      );
    }

    const deleted = deleteJobApplication(user.id, id);
    if (!deleted) {
      return NextResponse.json(
        { message: 'Application not found or unauthorized.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job application deleted.',
    });
  } catch (err: any) {
    console.error('Error deleting job application:', err);
    return NextResponse.json(
      { message: err.message || 'Failed to delete application' },
      { status: 400 }
    );
  }
}
