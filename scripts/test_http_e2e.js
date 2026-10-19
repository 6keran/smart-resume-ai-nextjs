async function runHttpE2ETests() {
  console.log('=== STARTING HTTP E2E ENDPOINT INTEGRATION TESTS (http://localhost:3000) ===\n');
  const baseUrl = 'http://localhost:3000';
  const ts = Date.now();

  const userEmail = `e2e_candidate_${ts}@career.test`;
  const userPassword = 'TestPassword123!';
  const userName = 'Kiran Candidate';

  // 1. Test Unauthenticated access to /dashboard -> must redirect to /login
  console.log('1. Testing Unauthenticated /dashboard protection...');
  const unauthDashRes = await fetch(`${baseUrl}/dashboard`, { redirect: 'manual' });
  console.log(`   Status: ${unauthDashRes.status}, Location: ${unauthDashRes.headers.get('location')}`);
  if (unauthDashRes.status !== 307 && unauthDashRes.status !== 302 && unauthDashRes.status !== 308) {
    throw new Error(`Expected redirect from /dashboard, got ${unauthDashRes.status}`);
  }
  const redirectTarget = unauthDashRes.headers.get('location');
  if (!redirectTarget || !redirectTarget.includes('/login')) {
    throw new Error(`Expected redirect to /login, got ${redirectTarget}`);
  }
  console.log('   ✓ Unauthenticated /dashboard successfully redirected to /login');

  // 2. Test Unauthenticated access to /admin/dashboard -> must redirect to /admin/login
  console.log('2. Testing Unauthenticated /admin/dashboard protection...');
  const unauthAdminRes = await fetch(`${baseUrl}/admin/dashboard`, { redirect: 'manual' });
  console.log(`   Status: ${unauthAdminRes.status}, Location: ${unauthAdminRes.headers.get('location')}`);
  if (unauthAdminRes.status !== 307 && unauthAdminRes.status !== 302 && unauthAdminRes.status !== 308) {
    throw new Error(`Expected redirect from /admin/dashboard, got ${unauthAdminRes.status}`);
  }
  const adminRedirect = unauthAdminRes.headers.get('location');
  if (!adminRedirect || !adminRedirect.includes('/admin/login')) {
    throw new Error(`Expected redirect to /admin/login, got ${adminRedirect}`);
  }
  console.log('   ✓ Unauthenticated /admin/dashboard successfully redirected to /admin/login');

  // 3. Test Registration
  console.log('3. Testing /api/auth/register...');
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: userName,
      email: userEmail,
      password: userPassword,
      confirmPassword: userPassword,
    }),
  });
  const regData = await regRes.json();
  console.log(`   Registration response status: ${regRes.status}, success: ${regData.success}, user: ${regData.user?.name}`);
  if (!regRes.ok || !regData.success || !regData.user?.id) {
    throw new Error('User registration failed over HTTP');
  }

  // Extract session cookie from registration
  const setCookie = regRes.headers.get('set-cookie') || '';
  const sessionMatch = setCookie.match(/sra_user_session=([^;]+)/);
  if (!sessionMatch) {
    throw new Error('Registration did not set sra_user_session cookie');
  }
  const userCookieHeader = `sra_user_session=${sessionMatch[1]}`;
  console.log('   ✓ Registration succeeded and issued HTTP-only session cookie');

  // 4. Test /api/auth/me
  console.log('4. Testing /api/auth/me with session cookie...');
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { cookie: userCookieHeader },
  });
  const meData = await meRes.json();
  if (!meData.authenticated || meData.user?.name !== userName) {
    throw new Error('/api/auth/me failed to authenticate user with session cookie');
  }
  console.log(`   ✓ Authenticated as: ${meData.user.name} (${meData.user.email})`);

  // 5. Test /api/user/dashboard
  console.log('5. Testing /api/user/dashboard...');
  const dashRes = await fetch(`${baseUrl}/api/user/dashboard`, {
    headers: { cookie: userCookieHeader },
  });
  const dashData = await dashRes.json();
  console.log(`   Dashboard metrics: Resumes=${dashData.metrics.totalResumes}, AvgATS=${dashData.metrics.avgAtsScore}, Apps=${dashData.metrics.totalApplications}`);
  if (!dashRes.ok || typeof dashData.metrics.totalResumes !== 'number') {
    throw new Error('User dashboard query failed');
  }
  console.log('   ✓ /api/user/dashboard returned valid user metrics');

  // 6. Test Job Applications CRUD
  console.log('6. Testing Job Application CRUD...');
  // Create
  const createJobRes = await fetch(`${baseUrl}/api/user/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: userCookieHeader },
    body: JSON.stringify({
      jobTitle: 'Principal Systems Architect',
      company: 'Datadog',
      location: 'Bengaluru / Remote',
      status: 'Applied',
      notes: 'Initial referral submitted',
    }),
  });
  const createJobData = await createJobRes.json();
  const createdAppId = createJobData.application?.id;
  console.log(`   Created application: id=${createdAppId}, title=${createJobData.application?.job_title}`);
  if (!createdAppId) throw new Error('Job application creation failed');

  // Update
  const updateJobRes = await fetch(`${baseUrl}/api/user/applications`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', cookie: userCookieHeader },
    body: JSON.stringify({
      id: createdAppId,
      status: 'Interview',
      notes: 'Recruiter screen scheduled',
    }),
  });
  const updateJobData = await updateJobRes.json();
  if (updateJobData.application?.status !== 'Interview') {
    throw new Error('Job application status update failed');
  }
  console.log(`   Updated application status to: ${updateJobData.application.status}`);

  // Fetch list
  const listJobRes = await fetch(`${baseUrl}/api/user/applications`, {
    headers: { cookie: userCookieHeader },
  });
  const listJobData = await listJobRes.json();
  const found = listJobData.applications.find(a => a.id === createdAppId);
  if (!found || found.status !== 'Interview') {
    throw new Error('Failed to find updated application in list');
  }
  console.log(`   ✓ Applications list verified: ${listJobData.applications.length} applications tracked`);

  // 7. Test Courses & Progress
  console.log('7. Testing Courses & Course Progress...');
  const coursesRes = await fetch(`${baseUrl}/api/user/courses`, {
    headers: { cookie: userCookieHeader },
  });
  const coursesData = await coursesRes.json();
  if (!coursesData.courses || coursesData.courses.length < 5) {
    throw new Error('Courses catalog missing expected seed courses');
  }
  console.log(`   Catalog has ${coursesData.courses.length} courses. First: "${coursesData.courses[0].title}"`);

  // Update progress
  const progressRes = await fetch(`${baseUrl}/api/user/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: userCookieHeader },
    body: JSON.stringify({
      courseId: coursesData.courses[0].id,
      lessonsCompleted: 3,
    }),
  });
  const progressData = await progressRes.json();
  if (!progressData.success || progressData.progress.lessonsCompleted !== 3) {
    throw new Error('Course progress update failed');
  }
  console.log(`   ✓ Course progress successfully recorded: ${progressData.progress.lessonsCompleted}/${progressData.progress.totalLessons} lessons (${progressData.progress.status})`);

  // 8. Test Profile & Password Change
  console.log('8. Testing Profile & Password Change...');
  const profRes = await fetch(`${baseUrl}/api/user/profile`, {
    headers: { cookie: userCookieHeader },
  });
  const profData = await profRes.json();
  if (!profRes.ok || profData.user?.name !== userName) {
    throw new Error('Profile fetch failed');
  }

  // Update profile name
  const updateProfRes = await fetch(`${baseUrl}/api/user/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', cookie: userCookieHeader },
    body: JSON.stringify({
      name: 'Kiran Dev Architect',
    }),
  });
  const updatedProfData = await updateProfRes.json();
  if (!updateProfRes.ok || updatedProfData.user?.name !== 'Kiran Dev Architect') {
    throw new Error('Profile update name failed');
  }
  console.log(`   ✓ Profile updated: ${updatedProfData.user.name}`);

  // 9. Test Logout & Login
  console.log('9. Testing Logout & Login flow...');
  const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { cookie: userCookieHeader },
  });
  console.log(`   Logout status: ${logoutRes.status}`);

  // Login
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail,
      password: userPassword,
    }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.success || loginData.user?.name !== 'Kiran Dev Architect') {
    throw new Error('Login failed with registered credentials');
  }
  console.log(`   ✓ Login verified: Welcome back ${loginData.user.name}`);

  // 10. Test Admin Authentication & System-wide Users
  console.log('10. Testing Admin Login and System-wide user catalog...');
  const adminLoginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'kiran81232@gmail.com',
      password: 'kiran@69',
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  if (!adminLoginRes.ok || !adminLoginData.success) {
    throw new Error('Admin login failed with credentials');
  }
  const adminCookie = adminLoginRes.headers.get('set-cookie') || '';
  const adminSessionMatch = adminCookie.match(/sra_admin_session=([^;]+)/);
  if (!adminSessionMatch) {
    throw new Error('Admin login did not return sra_admin_session');
  }
  const adminCookieHeader = `sra_admin_session=${adminSessionMatch[1]}`;

  const adminUsersRes = await fetch(`${baseUrl}/api/admin/records?type=users`, {
    headers: { cookie: adminCookieHeader },
  });
  const adminUsersData = await adminUsersRes.json();
  const foundCandidate = adminUsersData.data.find(u => u.email === userEmail);
  if (!foundCandidate) {
    throw new Error(`Admin could not find registered user ${userEmail}`);
  }
  console.log(`   ✓ Admin confirmed candidate: ${foundCandidate.name} (${foundCandidate.email}) with ${foundCandidate.resumes_count} resumes`);

  console.log('\n=== ALL HTTP E2E TESTS PASSED SUCCESSFULLY! ===');
}

runHttpE2ETests().catch((err) => {
  console.error('\n❌ E2E HTTP TEST FAILED:', err);
  process.exit(1);
});
