import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';

function verifyPassword(password, storedHash) {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

function getDb() {
  return new DatabaseSync('data/smart_resume.db');
}

const BASE_URL = 'http://localhost:3000';

async function testKiranAdmin() {
  console.log('==================================================');
  console.log('TESTING INITIAL ADMIN CREDENTIALS (.env.local)');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Direct SQLite Check: Verify user exists and password is NOT stored plaintext
  try {
    const db = getDb();
    const admin = db.prepare('SELECT id, email, password_hash, role, is_active FROM admin_users WHERE email = ?')
      .get('kiran81232@gmail.com');

    assert(Boolean(admin), 'Admin record for kiran81232@gmail.com exists in database');
    assert(admin?.password_hash !== 'kiran@69', 'Admin password is NOT stored in plaintext');
    assert(admin?.password_hash.includes(':'), 'Admin password hash uses salt:hash format');
    
    // Verify scrypt hash validity
    const isValidHash = verifyPassword('kiran@69', admin.password_hash);
    assert(isValidHash === true, 'Stored scrypt hash verifies correctly against password "kiran@69"');
    
    // Check no duplicate admin accounts for kiran81232@gmail.com
    const duplicates = db.prepare('SELECT COUNT(*) as count FROM admin_users WHERE email = ?')
      .get('kiran81232@gmail.com');
    assert(duplicates.count === 1, `Exactly 1 admin record exists (No duplicates: count=${duplicates.count})`);
  } catch (err) {
    assert(false, `Database inspection failed: ${err.message}`);
  }

  // 2. HTTP Login with invalid password
  try {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'kiran81232@gmail.com', password: 'wrongpassword' }),
    });
    assert(res.status === 401, 'Login with incorrect password returns 401 Unauthorized');
    const data = await res.json();
    assert(data.message === 'Invalid email or password.', 'Generic error message returned without leaking user existence');
  } catch (err) {
    assert(false, `Invalid password test failed: ${err.message}`);
  }

  // 3. HTTP Login with valid credentials from .env.local
  let sessionCookie = '';
  try {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'kiran81232@gmail.com', password: 'kiran@69' }),
    });
    assert(res.status === 200, 'Login with valid credentials returns HTTP 200');
    const data = await res.json();
    assert(data.admin?.email === 'kiran81232@gmail.com', `Logged in admin email confirmed: ${data.admin?.email}`);
    assert(data.admin?.role === 'ADMIN', `Admin role confirmed: ${data.admin?.role}`);

    const setCookie = res.headers.get('set-cookie') || '';
    const match = setCookie.match(/sra_admin_session=([^;]+)/);
    if (match) {
      sessionCookie = match[1];
      assert(true, 'Secure session cookie sra_admin_session received in response header');
    } else {
      assert(false, 'Session cookie was not received');
    }
  } catch (err) {
    assert(false, `Valid login test failed: ${err.message}`);
  }

  // 4. Access /admin/dashboard with authenticated session
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Cookie: `sra_admin_session=${sessionCookie}` },
    });
    assert(res.status === 200, `Authenticated access to /admin/dashboard succeeds with HTTP 200`);
    const html = await res.text();
    assert(html.includes('Admin Console'), 'Admin dashboard HTML rendered with Admin Console');
    assert(html.includes('kiran81232@gmail.com'), 'Authenticated admin email rendered in dashboard');
    assert(!html.includes('kiran@69'), 'Password is NEVER present in rendered HTML');
  } catch (err) {
    assert(false, `Dashboard access test failed: ${err.message}`);
  }

  // 5. Access /admin/dashboard WITHOUT session cookie
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, { redirect: 'manual' });
    assert(
      res.status === 307 || res.status === 302,
      `Unauthenticated access to /admin/dashboard is blocked and redirected (HTTP ${res.status})`
    );
    const location = res.headers.get('location') || '';
    assert(location.includes('/admin/login'), `Redirect target is /admin/login (Got: ${location})`);
  } catch (err) {
    assert(false, `Unauthenticated redirect test failed: ${err.message}`);
  }

  // 6. Test subpages route protection
  const subroutes = ['/admin/users', '/admin/resumes', '/admin/skills', '/admin/assessments', '/admin/jobs', '/admin/feedback', '/admin/settings'];
  for (const route of subroutes) {
    try {
      const res = await fetch(`${BASE_URL}${route}`, { redirect: 'manual' });
      assert(
        res.status === 307 || res.status === 302,
        `Unauthenticated ${route} redirects to /admin/login (HTTP ${res.status})`
      );
    } catch (err) {
      assert(false, `Subroute ${route} test failed: ${err.message}`);
    }
  }

  // 7. Test Sign Out
  try {
    const res = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
      method: 'POST',
      headers: { Cookie: `sra_admin_session=${sessionCookie}` },
    });
    assert(res.status === 200, 'Sign Out endpoint returns HTTP 200');
    const setCookie = res.headers.get('set-cookie') || '';
    assert(setCookie.includes('Max-Age=0') || setCookie.includes('expires='), 'Session cookie expired/cleared upon logout');

    // After sign out, /admin/dashboard must no longer be accessible
    const postLogoutRes = await fetch(`${BASE_URL}/admin/dashboard`, { redirect: 'manual' });
    assert(
      postLogoutRes.status === 307 || postLogoutRes.status === 302,
      'After sign out, /admin/dashboard is inaccessible and redirects to /admin/login'
    );
  } catch (err) {
    assert(false, `Sign out test failed: ${err.message}`);
  }

  console.log('\n==================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) process.exit(1);
}

testKiranAdmin();
