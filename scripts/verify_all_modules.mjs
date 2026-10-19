import assert from 'node:assert';

const BASE = 'http://localhost:3000';

async function run() {
  console.log('--- 1. Testing Registration and User Auth Flow ---');
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  
  // Register
  const regRes = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      fullName: 'Test Verification User',
      targetRole: 'Full Stack Engineer'
    })
  });
  console.log('Register status:', regRes.status);
  const regJson = await regRes.json();
  console.log('Register response:', regJson.success ? 'Success' : regJson);
  assert.strictEqual(regRes.status, 200, 'Registration should return 200');
  
  const regCookie = regRes.headers.get('set-cookie');
  console.log('Got user session cookie on register:', Boolean(regCookie));
  
  // Login
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword
    })
  });
  console.log('Login status:', loginRes.status);
  const loginCookie = loginRes.headers.get('set-cookie');
  assert.strictEqual(loginRes.status, 200, 'Login should return 200');
  
  // Profile check with cookie
  const cookieVal = loginCookie.split(';')[0];
  const profileRes = await fetch(`${BASE}/api/user/profile`, {
    headers: { Cookie: cookieVal }
  });
  console.log('User profile fetch status:', profileRes.status);
  const profileJson = await profileRes.json();
  console.log('User name:', profileJson.user?.name);
  assert.strictEqual(profileJson.user?.name, 'Test Verification User');

  console.log('\n--- 2. Testing Admin Auth Flow ---');
  const adminRes = await fetch(`${BASE}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'kiran81232@gmail.com',
      password: 'kiran@69'
    })
  });
  console.log('Admin login status:', adminRes.status);
  const adminCookie = adminRes.headers.get('set-cookie');
  assert.strictEqual(adminRes.status, 200, 'Admin login should succeed with 200');
  const adminCookieVal = adminCookie.split(';')[0];
  
  // Admin stats check
  const adminStatsRes = await fetch(`${BASE}/api/admin/stats`, {
    headers: { Cookie: adminCookieVal }
  });
  console.log('Admin stats status:', adminStatsRes.status);
  const adminStatsJson = await adminStatsRes.json();
  console.log('Admin stats total users:', adminStatsJson.stats?.totalUsers);
  assert.ok(adminStatsRes.ok, 'Admin stats should be accessible with admin cookie');

  console.log('\n--- 3. Testing Public Endpoints and Builder ---');
  const builderRes = await fetch(`${BASE}/builder`);
  console.log('Builder page status:', builderRes.status);
  assert.strictEqual(builderRes.status, 200, 'Builder page should return 200');

  const jobsRes = await fetch(`${BASE}/api/jobs/search?q=developer&loc=Remote`, {
    headers: { Cookie: cookieVal }
  });
  console.log('Jobs search status:', jobsRes.status);
  const jobsJson = await jobsRes.json();
  console.log('Jobs returned count:', jobsJson.jobs?.length ?? 0);
  assert.strictEqual(jobsRes.status, 200, 'Job search should return 200');

  console.log('\n--- ALL MODULE VERIFICATIONS PASSED SUCCESSFULLY! ---');
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
