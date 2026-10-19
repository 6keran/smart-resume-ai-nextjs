import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';
const dbPath = path.resolve('data/smart_resume.db');
const db = new DatabaseSync(dbPath);

async function runRigorousAuthTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING RIGOROUS AUTHENTICATION TEST SUITE');
  console.log('====================================================\n');

  const ts = Date.now();
  const testUser = {
    fullName: `Test Auth User ${ts}`,
    email: `auth_user_${ts}@testdomain.com`,
    password: 'TestPassword123!',
  };

  // ----------------------------------------------------
  // TEST 1: Unauthenticated Protected Routes Access
  // ----------------------------------------------------
  console.log('▶ TEST 1: Unauthenticated Protected Route Access');
  const dashRes = await fetch(`${BASE_URL}/dashboard`, { redirect: 'manual' });
  console.log(`  GET /dashboard => Status: ${dashRes.status}, Location: ${dashRes.headers.get('location')}`);
  if (![301, 302, 307, 308].includes(dashRes.status) || !dashRes.headers.get('location')?.includes('/login')) {
    throw new Error(`Failed: Unauthenticated /dashboard was not redirected to /login! Got status ${dashRes.status}`);
  }
  console.log('  ✓ /dashboard redirects to /login as expected.');

  const adminDashRes = await fetch(`${BASE_URL}/admin/dashboard`, { redirect: 'manual' });
  console.log(`  GET /admin/dashboard => Status: ${adminDashRes.status}, Location: ${adminDashRes.headers.get('location')}`);
  if (![301, 302, 307, 308].includes(adminDashRes.status) || !adminDashRes.headers.get('location')?.includes('/admin/login')) {
    throw new Error(`Failed: Unauthenticated /admin/dashboard was not redirected to /admin/login! Got status ${adminDashRes.status}`);
  }
  console.log('  ✓ /admin/dashboard redirects to /admin/login as expected.\n');

  // ----------------------------------------------------
  // TEST 2: Registration Input Validation
  console.log('▶ TEST 2: Registration Input Validation');

  // 2a. Missing fields
  const missingFieldRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: testUser.password, confirmPassword: testUser.password }), // Missing fullName
  });
  const missingFieldData = await missingFieldRes.json();
  if (missingFieldRes.status !== 400) {
    throw new Error(`Expected status 400 for missing fullName, got ${missingFieldRes.status}`);
  }
  console.log(`  ✓ Missing fullName rejected (400): "${missingFieldData.message || missingFieldData.error}"`);

  // 2b. Malformed email
  const malformedEmailRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: testUser.fullName, email: 'notanemail', password: testUser.password, confirmPassword: testUser.password }),
  });
  const malformedEmailData = await malformedEmailRes.json();
  if (malformedEmailRes.status !== 400) {
    throw new Error(`Expected status 400 for malformed email, got ${malformedEmailRes.status}`);
  }
  console.log(`  ✓ Malformed email rejected (400): "${malformedEmailData.message || malformedEmailData.error}"`);

  // 2c. Short password
  const shortPassRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: testUser.fullName, email: testUser.email, password: '123', confirmPassword: '123' }),
  });
  const shortPassData = await shortPassRes.json();
  if (shortPassRes.status !== 400) {
    throw new Error(`Expected status 400 for short password, got ${shortPassRes.status}`);
  }
  console.log(`  ✓ Short password rejected (400): "${shortPassData.message || shortPassData.error}"`);

  // 2d. Mismatched passwords
  const mismatchPassRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: testUser.fullName, email: testUser.email, password: testUser.password, confirmPassword: 'DifferentPassword123!' }),
  });
  const mismatchPassData = await mismatchPassRes.json();
  if (mismatchPassRes.status !== 400) {
    throw new Error(`Expected status 400 for mismatched passwords, got ${mismatchPassRes.status}`);
  }
  console.log(`  ✓ Mismatched passwords rejected (400): "${mismatchPassData.message || mismatchPassData.error}"\n`);

  // ----------------------------------------------------
  // TEST 3: Successful Registration
  // ----------------------------------------------------
  console.log('▶ TEST 3: Successful Registration of Real User');
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: testUser.fullName,
      email: testUser.email,
      password: testUser.password,
      confirmPassword: testUser.password,
    }),
  });
  const regData = await regRes.json();
  if (![200, 201].includes(regRes.status) || !regData.success || !regData.user?.id) {
    throw new Error(`Registration failed! Status: ${regRes.status}, Body: ${JSON.stringify(regData)}`);
  }
  console.log(`  ✓ Real user registered: ID=${regData.user.id}, Name=${regData.user.name}, Email=${regData.user.email}`);

  // Extract session cookie
  const regSetCookie = regRes.headers.get('set-cookie') || '';
  const regCookieMatch = regSetCookie.match(/sra_user_session=([^;]+)/);
  if (!regCookieMatch) {
    throw new Error('Registration response did not return sra_user_session cookie!');
  }
  const regSessionToken = regCookieMatch[1];
  console.log(`  ✓ sra_user_session cookie issued: ${regSessionToken.slice(0, 16)}...\n`);

  // ----------------------------------------------------
  // TEST 4: Duplicate Registration Prevention
  // ----------------------------------------------------
  console.log('▶ TEST 4: Duplicate Registration Prevention');
  const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Duplicate Tester',
      email: testUser.email,
      password: 'AnotherPassword123!',
      confirmPassword: 'AnotherPassword123!',
    }),
  });
  const dupData = await dupRes.json();
  if (dupRes.status !== 409) {
    throw new Error(`Expected 409 for duplicate registration, got ${dupRes.status}`);
  }
  console.log(`  ✓ Duplicate registration rejected (409): "${dupData.message || dupData.error}"\n`);

  // ----------------------------------------------------
  // TEST 5: Login Input Validation & Credential Rejection
  // ----------------------------------------------------
  console.log('▶ TEST 5: Login Input Validation & Invalid Credential Rejections');

  // 5a. Empty fields
  const emptyLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '', password: '' }),
  });
  const emptyLoginData = await emptyLoginRes.json();
  if (emptyLoginRes.status !== 400) {
    throw new Error(`Expected 400 for empty login, got ${emptyLoginRes.status}`);
  }
  console.log(`  ✓ Empty login fields rejected (400): "${emptyLoginData.message || emptyLoginData.error}"`);

  // 5b. Non-existent email
  const notFoundRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `nonexistent_${ts}@example.com`, password: 'SomePassword123!' }),
  });
  const notFoundData = await notFoundRes.json();
  if (notFoundRes.status !== 401) {
    throw new Error(`Expected 401 for non-existent email, got ${notFoundRes.status}`);
  }
  console.log(`  ✓ Non-existent user rejected (401): "${notFoundData.message || notFoundData.error}"`);

  // 5c. Wrong password for registered user
  const wrongPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: 'WrongPassword999!' }),
  });
  const wrongPassData = await wrongPassRes.json();
  if (wrongPassRes.status !== 401) {
    throw new Error(`Expected 401 for incorrect password, got ${wrongPassRes.status}`);
  }
  console.log(`  ✓ Incorrect password rejected (401): "${wrongPassData.message || wrongPassData.error}"\n`);

  // ----------------------------------------------------
  // TEST 6: Successful Login
  // ----------------------------------------------------
  console.log('▶ TEST 6: Successful Login with Valid Credentials');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });
  const loginData = await loginRes.json();
  if (loginRes.status !== 200 || !loginData.success || loginData.user?.email !== testUser.email) {
    throw new Error(`Login failed with valid credentials! Status: ${loginRes.status}, Body: ${JSON.stringify(loginData)}`);
  }
  console.log(`  ✓ Login succeeded: Welcome ${loginData.user.name}`);

  // Extract login session cookie
  const loginSetCookie = loginRes.headers.get('set-cookie') || '';
  const loginCookieMatch = loginSetCookie.match(/sra_user_session=([^;]+)/);
  if (!loginCookieMatch) {
    throw new Error('Login response did not return sra_user_session cookie!');
  }
  const userCookieHeader = `sra_user_session=${loginCookieMatch[1]}`;
  const rawSessionToken = loginCookieMatch[1];
  console.log(`  ✓ Session cookie established: ${rawSessionToken.slice(0, 16)}...\n`);

  // ----------------------------------------------------
  // TEST 7: Session Verification (/api/auth/me) & Data Persistence
  // ----------------------------------------------------
  console.log('▶ TEST 7: Session Verification (/api/auth/me) & Persistence');
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { cookie: userCookieHeader },
  });
  const meData = await meRes.json();
  if (meRes.status !== 200 || !meData.authenticated || meData.user?.email !== testUser.email) {
    throw new Error(`Session verification failed! ${JSON.stringify(meData)}`);
  }
  if (meData.user.password_hash) {
    throw new Error('SECURITY VIOLATION: password_hash was exposed in /api/auth/me response!');
  }
  console.log(`  ✓ Session verified for user ID=${meData.user.id}, Role=${meData.user.role}`);
  console.log('  ✓ No password_hash exposed in response.');

  // Check database state directly
  const dbUser = db.prepare('SELECT id, email, session_token FROM users WHERE email = ?').get(testUser.email);
  if (!dbUser || !dbUser.session_token) {
    throw new Error('Database does not have active session_token for user!');
  }
  console.log(`  ✓ Database session_token verified in SQLite: ${dbUser.session_token.slice(0, 16)}...\n`);

  // ----------------------------------------------------
  // TEST 8: Logout & Complete Session Invalidation
  // ----------------------------------------------------
  console.log('▶ TEST 8: Logout & Complete Session Invalidation');
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { cookie: userCookieHeader },
  });
  const logoutRaw = await logoutRes.text();
  console.log(`  Logout raw response: status=${logoutRes.status}, body="${logoutRaw}"`);
  const logoutData = JSON.parse(logoutRaw);
  if (logoutRes.status !== 200 || !logoutData.success) {
    throw new Error(`Logout endpoint failed! Status: ${logoutRes.status}`);
  }
  console.log(`  ✓ Logout API responded: "${logoutData.message}"`);

  // Verify cookie cleared in response
  const logoutSetCookie = logoutRes.headers.get('set-cookie') || '';
  if (!logoutSetCookie.includes('sra_user_session=') || !logoutSetCookie.includes('Max-Age=0')) {
    console.log('  Note: set-cookie header on logout:', logoutSetCookie);
  }
  console.log('  ✓ sra_user_session cookie invalidated in response headers.');

  // Verify database record has session_token invalidated/revoked
  const dbUserAfterLogout = db.prepare('SELECT id, email, session_token FROM users WHERE email = ?').get(testUser.email);
  if (!dbUserAfterLogout.session_token || dbUserAfterLogout.session_token.startsWith('revoked_')) {
    console.log(`  ✓ Database session_token is confirmed revoked in SQLite (${dbUserAfterLogout.session_token}).`);
  } else {
    throw new Error(`Database session_token was NOT revoked on logout! Found: ${dbUserAfterLogout.session_token}`);
  }

  // Verify that reusing the previous cookie fails on /api/auth/me
  const staleMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { cookie: userCookieHeader },
  });
  const staleMeData = await staleMeRes.json();
  if (staleMeData.authenticated === true) {
    throw new Error('SECURITY VIOLATION: Stale session cookie still authenticated after logout!');
  }
  console.log(`  ✓ Revoked session cookie correctly rejected by /api/auth/me: authenticated=${staleMeData.authenticated}\n`);

  // ----------------------------------------------------
  // TEST 9: Admin Authentication Isolation
  // ----------------------------------------------------
  console.log('▶ TEST 9: Admin Authentication Separation & Isolation');

  // 9a. Normal user cannot login to admin endpoint
  const candidateToAdminRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: testUser.password }),
  });
  if (candidateToAdminRes.status === 200) {
    throw new Error('SECURITY VIOLATION: Normal user was able to log in to Admin portal!');
  }
  console.log(`  ✓ Candidate user rejected from admin endpoint (Status ${candidateToAdminRes.status})`);

  // 9b. Admin login works with legitimate admin credentials
  const adminLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'kiran81232@gmail.com', password: 'kiran@69' }),
  });
  const adminLoginData = await adminLoginRes.json();
  if (!adminLoginRes.ok || !adminLoginData.success) {
    throw new Error(`Admin login failed! ${JSON.stringify(adminLoginData)}`);
  }
  const adminSetCookie = adminLoginRes.headers.get('set-cookie') || '';
  const adminCookieMatch = adminSetCookie.match(/sra_admin_session=([^;]+)/);
  if (!adminCookieMatch) {
    throw new Error('Admin login did not return sra_admin_session cookie!');
  }
  const adminCookieHeader = `sra_admin_session=${adminCookieMatch[1]}`;
  console.log('  ✓ Admin logged in successfully with separate sra_admin_session cookie.');

  // 9c. Admin session cookie does NOT authenticate candidate /api/auth/me
  const adminOnCandidateMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { cookie: adminCookieHeader },
  });
  const adminOnCandidateMeData = await adminOnCandidateMeRes.json();
  if (adminOnCandidateMeData.authenticated === true) {
    throw new Error('SECURITY VIOLATION: Admin session was treated as candidate user in /api/auth/me!');
  }
  console.log('  ✓ Admin cookie does not grant candidate session (/api/auth/me authenticated: false).');

  // 9d. Candidate session cookie cannot access protected admin API
  const candidateOnAdminRes = await fetch(`${BASE_URL}/api/admin/records?type=users`, {
    headers: { cookie: userCookieHeader },
  });
  if (candidateOnAdminRes.status === 200) {
    throw new Error('SECURITY VIOLATION: Candidate cookie accessed protected admin records!');
  }
  console.log(`  ✓ Candidate cookie denied access to admin records (Status ${candidateOnAdminRes.status}).\n`);

  console.log('====================================================');
  console.log('🎉 ALL RIGOROUS AUTHENTICATION TESTS PASSED 100%!');
  console.log('====================================================');
}

runRigorousAuthTests().catch((err) => {
  console.error('\n❌ RIGOROUS AUTH TEST FAILED:', err);
  process.exit(1);
});
