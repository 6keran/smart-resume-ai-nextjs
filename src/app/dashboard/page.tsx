import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/userSession';
import { getUserDashboardData } from '@/lib/db';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export const metadata = {
  title: 'My Career Dashboard | Smart Resume AI',
  description: 'Personal career intelligence, resume ATS scoring, verified skills, and job application tracking.',
};

export const dynamic = 'force-dynamic';

export default async function UserDashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/login?from=/dashboard');
  }

  const data = await getUserDashboardData(user.id);

  return <DashboardContent user={user} data={data} />;
}
