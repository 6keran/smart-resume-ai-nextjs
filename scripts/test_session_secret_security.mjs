import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import Module from 'node:module';

// Intercept server-only for standalone test execution
const origLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === 'server-only') {
    return {};
  }
  return origLoad.apply(this, [id, ...args]);
};

// Save original environment
const originalNodeEnv = process.env.NODE_ENV;
const originalVercel = process.env.VERCEL;
const originalSecret = process.env.ADMIN_SESSION_SECRET;

console.log('====================================================');
console.log('SMART RESUME AI: SESSION SECRET SECURITY TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✓ PASS: ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ FAIL: ${desc}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function runTests() {
  const {
    getAdminSessionSecret,
    getValidatedSessionSecret,
    createSessionToken,
    verifySessionToken,
    verifyAdminToken,
  } = await import('../src/server/db/index.ts');

  console.log('--- TEST GROUP 1: SECRET RETRIEVAL & VALIDATION IN PRODUCTION ---');

  it('In production, missing ADMIN_SESSION_SECRET returns null (fails closed)', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.VERCEL;
    delete process.env.ADMIN_SESSION_SECRET;

    const secret = getAdminSessionSecret();
    assert.equal(secret, null, 'Must return null when secret is missing in production');
  });

  it('In production, empty/whitespace ADMIN_SESSION_SECRET returns null (fails closed)', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.VERCEL;
    process.env.ADMIN_SESSION_SECRET = '   ';

    const secret = getAdminSessionSecret();
    assert.equal(secret, null, 'Must return null when secret is empty in production');
  });

  it('In production, weak ADMIN_SESSION_SECRET (< 32 chars) returns null (fails closed)', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.VERCEL;
    process.env.ADMIN_SESSION_SECRET = 'short_weak_secret_under_32'; // 26 chars

    const secret = getAdminSessionSecret();
    assert.equal(secret, null, 'Must return null when secret is < 32 chars in production');
  });

  it('In production with VERCEL=1, missing secret returns null', () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL = '1';
    delete process.env.ADMIN_SESSION_SECRET;

    const secret = getAdminSessionSecret();
    assert.equal(secret, null, 'Must return null when secret is missing in Vercel production');
  });

  it('In production, valid 32+ character secret is accepted and returned exactly', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.VERCEL;
    const strongSecret = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0'; // 40 chars
    process.env.ADMIN_SESSION_SECRET = strongSecret;

    const secret = getAdminSessionSecret();
    assert.equal(secret, strongSecret);
  });

  it('getValidatedSessionSecret is a working alias for getAdminSessionSecret', () => {
    assert.equal(getValidatedSessionSecret, getAdminSessionSecret);
  });

  console.log('\n--- TEST GROUP 2: SECRET RETRIEVAL OUTSIDE PRODUCTION ---');

  it('Outside production with missing secret, uses development-only fallback (>= 32 chars)', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.VERCEL;
    delete process.env.ADMIN_SESSION_SECRET;

    const secret = getAdminSessionSecret();
    assert.ok(secret, 'Must provide a development fallback outside production');
    assert.ok(secret.length >= 32, 'Dev fallback must be at least 32 characters');
    assert.ok(secret.includes('dev-only'), 'Dev fallback must indicate development-only usage');
  });

  it('Outside production with valid secret, uses configured secret', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.VERCEL;
    const devSecret = 'custom_dev_secret_that_is_at_least_32_chars_long';
    process.env.ADMIN_SESSION_SECRET = devSecret;

    const secret = getAdminSessionSecret();
    assert.equal(secret, devSecret);
  });

  it('Outside production with weak secret (< 32 chars), returns null (fails closed on weak secrets)', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.VERCEL;
    process.env.ADMIN_SESSION_SECRET = 'too_short';

    const secret = getAdminSessionSecret();
    assert.equal(secret, null, 'Must reject weak secret even outside production');
  });

  console.log('\n--- TEST GROUP 3: TOKEN CREATION SAFETY ---');

  it('createSessionToken throws in production when ADMIN_SESSION_SECRET is missing', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.VERCEL;
    delete process.env.ADMIN_SESSION_SECRET;

    assert.throws(
      () => createSessionToken({ id: 'adm_1', email: 'admin@example.com', role: 'ADMIN' }),
      /Session token creation failed/i,
      'Must throw error when attempting to sign without secret in production'
    );
  });

  it('createSessionToken throws in production when ADMIN_SESSION_SECRET is weak', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.VERCEL;
    process.env.ADMIN_SESSION_SECRET = 'weak_secret_123';

    assert.throws(
      () => createSessionToken({ id: 'adm_1', email: 'admin@example.com', role: 'ADMIN' }),
      /Session token creation failed/i,
      'Must throw error when attempting to sign with weak secret in production'
    );
  });

  it('createSessionToken succeeds with valid production secret and produces expected format', () => {
    process.env.NODE_ENV = 'production';
    const strongSecret = 'prod_secret_must_be_minimum_32_chars_length_123';
    process.env.ADMIN_SESSION_SECRET = strongSecret;

    const token = createSessionToken({ id: 'adm_test', email: 'admin@test.com', role: 'ADMIN' });
    assert.ok(typeof token === 'string');
    const parts = token.split('.');
    assert.equal(parts.length, 2, 'Token must contain exactly data and signature separated by dot');

    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    assert.equal(payload.sub, 'adm_test');
    assert.equal(payload.email, 'admin@test.com');
    assert.equal(payload.role, 'ADMIN');
    assert.ok(payload.exp > Date.now() + 6 * 24 * 60 * 60 * 1000, 'Expiration must be ~7 days in future');
  });

  console.log('\n--- TEST GROUP 4: TOKEN VERIFICATION RIGOR ---');

  it('verifySessionToken succeeds for valid token and returns payload', () => {
    process.env.NODE_ENV = 'production';
    const strongSecret = 'prod_secret_must_be_minimum_32_chars_length_123';
    process.env.ADMIN_SESSION_SECRET = strongSecret;

    const token = createSessionToken({ id: 'user_123', email: 'user@test.com', role: 'USER' });
    const verified = verifySessionToken(token);
    assert.ok(verified, 'Valid token must verify');
    assert.equal(verified.sub, 'user_123');
    assert.equal(verified.email, 'user@test.com');
    assert.equal(verified.role, 'USER');
  });

  it('verifySessionToken fails closed (returns null) when secret is missing in production', () => {
    process.env.NODE_ENV = 'production';
    const strongSecret = 'prod_secret_must_be_minimum_32_chars_length_123';
    process.env.ADMIN_SESSION_SECRET = strongSecret;

    const token = createSessionToken({ id: 'user_123', email: 'user@test.com', role: 'USER' });

    // Simulate secret being removed or unconfigured
    delete process.env.ADMIN_SESSION_SECRET;
    const verified = verifySessionToken(token);
    assert.equal(verified, null, 'Must fail closed and return null when secret is missing in production');
  });

  it('verifySessionToken fails closed (returns null) when secret is weak in production', () => {
    process.env.NODE_ENV = 'production';
    const strongSecret = 'prod_secret_must_be_minimum_32_chars_length_123';
    process.env.ADMIN_SESSION_SECRET = strongSecret;
    const token = createSessionToken({ id: 'user_123', email: 'user@test.com', role: 'USER' });

    // Simulate weak secret configured
    process.env.ADMIN_SESSION_SECRET = 'short';
    const verified = verifySessionToken(token);
    assert.equal(verified, null, 'Must fail closed and return null when secret is weak in production');
  });

  it('verifySessionToken rejects tampered signature', () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_SESSION_SECRET = 'prod_secret_must_be_minimum_32_chars_length_123';

    const token = createSessionToken({ id: 'user_123', email: 'user@test.com', role: 'USER' });
    const [data, signature] = token.split('.');
    // Alter last char of signature
    const tamperedSig = signature.slice(0, -1) + (signature.slice(-1) === 'a' ? 'b' : 'a');
    const tamperedToken = `${data}.${tamperedSig}`;

    const verified = verifySessionToken(tamperedToken);
    assert.equal(verified, null, 'Must reject tampered signature');
  });

  it('verifySessionToken rejects tampered payload (privilege escalation attempt)', () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_SESSION_SECRET = 'prod_secret_must_be_minimum_32_chars_length_123';

    const token = createSessionToken({ id: 'user_123', email: 'user@test.com', role: 'USER' });
    const [, signature] = token.split('.');

    // Tamper payload to role ADMIN
    const maliciousPayload = {
      sub: 'user_123',
      email: 'user@test.com',
      role: 'ADMIN',
      iat: Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    const tamperedData = Buffer.from(JSON.stringify(maliciousPayload)).toString('base64url');
    const tamperedToken = `${tamperedData}.${signature}`;

    const verified = verifySessionToken(tamperedToken);
    assert.equal(verified, null, 'Must reject payload with mismatched signature');
  });

  it('verifySessionToken rejects tokens signed with the legacy hardcoded fallback', () => {
    process.env.NODE_ENV = 'production';
    // Current production secret
    process.env.ADMIN_SESSION_SECRET = 'actual_production_secret_at_least_32_chars_long';

    // Token forged using the old removed fallback
    const legacySecret = 'smart_resume_ai_super_secret_admin_jwt_key_2026';
    const payload = {
      sub: 'adm_forged',
      email: 'hacker@test.com',
      role: 'ADMIN',
      iat: Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', legacySecret).update(data).digest('base64url');
    const forgedToken = `${data}.${signature}`;

    const verified = verifySessionToken(forgedToken);
    assert.equal(verified, null, 'Tokens signed with legacy fallback must be rejected');
  });

  it('verifySessionToken rejects expired tokens', () => {
    process.env.NODE_ENV = 'production';
    const strongSecret = 'prod_secret_must_be_minimum_32_chars_length_123';
    process.env.ADMIN_SESSION_SECRET = strongSecret;

    const expiredPayload = {
      sub: 'user_expired',
      email: 'user@test.com',
      role: 'USER',
      iat: Date.now() - 10 * 24 * 60 * 60 * 1000,
      exp: Date.now() - 1 * 1000, // expired 1s ago
    };
    const data = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
    const signature = crypto.createHmac('sha256', strongSecret).update(data).digest('base64url');
    const expiredToken = `${data}.${signature}`;

    const verified = verifySessionToken(expiredToken);
    assert.equal(verified, null, 'Expired token must return null');
  });

  it('verifySessionToken safely rejects malformed or null inputs', () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_SESSION_SECRET = 'prod_secret_must_be_minimum_32_chars_length_123';

    assert.equal(verifySessionToken(null), null);
    assert.equal(verifySessionToken(undefined), null);
    assert.equal(verifySessionToken(''), null);
    assert.equal(verifySessionToken('no-dot-token'), null);
    assert.equal(verifySessionToken('too.many.dots.here'), null);
    assert.equal(verifySessionToken('invalidbase64url.signature'), null);
  });

  console.log('\n--- TEST GROUP 5: ADMIN AUTHORIZATION RIGOR (verifyAdminToken) ---');

  it('verifyAdminToken accepts valid token with role ADMIN', () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_SESSION_SECRET = 'prod_secret_must_be_minimum_32_chars_length_123';

    const adminToken = createSessionToken({ id: 'adm_1', email: 'admin@domain.com', role: 'ADMIN' });
    const verified = verifyAdminToken(adminToken);
    assert.ok(verified, 'Admin token must verify');
    assert.equal(verified.role, 'ADMIN');
  });

  it('verifyAdminToken rejects valid token with role USER', () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_SESSION_SECRET = 'prod_secret_must_be_minimum_32_chars_length_123';

    const userToken = createSessionToken({ id: 'user_1', email: 'user@domain.com', role: 'USER' });
    const verified = verifyAdminToken(userToken);
    assert.equal(verified, null, 'User role token must be rejected by verifyAdminToken');
  });

  it('verifyAdminToken returns null for null, undefined, or empty token', () => {
    assert.equal(verifyAdminToken(null), null);
    assert.equal(verifyAdminToken(undefined), null);
    assert.equal(verifyAdminToken(''), null);
  });

  // Restore original environment
  if (originalNodeEnv !== undefined) {
    process.env.NODE_ENV = originalNodeEnv;
  } else {
    delete process.env.NODE_ENV;
  }
  if (originalVercel !== undefined) {
    process.env.VERCEL = originalVercel;
  } else {
    delete process.env.VERCEL;
  }
  if (originalSecret !== undefined) {
    process.env.ADMIN_SESSION_SECRET = originalSecret;
  } else {
    delete process.env.ADMIN_SESSION_SECRET;
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passedTests}/${totalTests} tests passed successfully.`);
  console.log('====================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
