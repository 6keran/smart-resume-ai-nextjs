async function testAllPages() {
  console.log('=== VERIFYING ALL HTML PAGES RENDER WITH AUTH SESSION ===\n');
  const baseUrl = 'http://localhost:3000';
  
  // 1. Register candidate
  const email = `page_test_${Date.now()}@career.test`;
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Dashboard Tester',
      email,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }),
  });
  const setCookie = regRes.headers.get('set-cookie') || '';
  const match = setCookie.match(/sra_user_session=([^;]+)/);
  if (!match) throw new Error('Failed to get session cookie');
  const cookie = `sra_user_session=${match[1]}`;

  const publicPages = [
    '/',
    '/analyzer',
    '/improver',
    '/builder',
    '/jobs',
    '/job-match',
    '/skills',
    '/feedback',
    '/login',
    '/register',
    '/admin/login',
  ];

  for (const page of publicPages) {
    const res = await fetch(`${baseUrl}${page}`);
    const html = await res.text();
    console.log(`Public Page: ${page} -> Status ${res.status} (Length: ${html.length} bytes)`);
    if (res.status !== 200) {
      throw new Error(`Public page ${page} failed with status ${res.status}`);
    }
  }

  const pages = [
    '/dashboard',
    '/dashboard/resumes',
    '/dashboard/analyses',
    '/dashboard/improvements',
    '/dashboard/jobs',
    '/dashboard/applications',
    '/dashboard/skills',
    '/dashboard/assessments',
    '/dashboard/certificates',
    '/dashboard/courses',
    '/dashboard/profile',
  ];

  for (const page of pages) {
    const res = await fetch(`${baseUrl}${page}`, {
      headers: { cookie },
    });
    const html = await res.text();
    console.log(`User Page: ${page} -> Status ${res.status} (Length: ${html.length} bytes)`);
    if (res.status !== 200) {
      throw new Error(`User page ${page} failed with status ${res.status}`);
    }
  }

  // Admin pages with admin cookie
  const adminRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'kiran81232@gmail.com',
      password: 'kiran@69',
    }),
  });
  const adminCookie = adminRes.headers.get('set-cookie') || '';
  const adminMatch = adminCookie.match(/sra_admin_session=([^;]+)/);
  if (!adminMatch) throw new Error('Failed to get admin session');
  const adminCookieHeader = `sra_admin_session=${adminMatch[1]}`;

  const adminPages = [
    '/admin/dashboard',
    '/admin/users',
    '/admin/resumes',
    '/admin/assessments',
    '/admin/jobs',
    '/admin/feedback',
    '/admin/settings',
  ];

  for (const page of adminPages) {
    const res = await fetch(`${baseUrl}${page}`, {
      headers: { cookie: adminCookieHeader },
    });
    const html = await res.text();
    console.log(`Admin Page: ${page} -> Status ${res.status} (Length: ${html.length} bytes)`);
    if (res.status !== 200) {
      throw new Error(`Admin page ${page} failed with status ${res.status}`);
    }
  }

  console.log('\n=== ALL USER AND ADMIN DASHBOARD PAGES RENDERED SUCCESSFULLY (200 OK)! ===');
}

testAllPages().catch((e) => {
  console.error('Page verification failed:', e);
  process.exit(1);
});
