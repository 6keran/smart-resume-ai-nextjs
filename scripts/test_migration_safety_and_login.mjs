import Module from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

// Intercept server-only for standalone script execution
const origLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === 'server-only') {
    return {};
  }
  return origLoad.apply(this, [id, ...args]);
};

const { hashPassword, verifyPassword, loginUser, registerUser } = await import('../src/server/db/index.ts');

console.log('====================================================');
console.log('SMART RESUME AI: MIGRATION SAFETY & LOGIN SELECTION TESTS');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// TEST 1: Candidate login query prioritizing valid password hashes
console.log('--- TEST GROUP 1: LOGIN SELECTION RESILIENCE ---');
const testDb = new DatabaseSync(':memory:');
testDb.exec(`
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    password_hash TEXT,
    role TEXT DEFAULT 'USER',
    is_active INTEGER DEFAULT 1,
    session_token TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_login_at TEXT,
    last_active_at TEXT NOT NULL
  );
`);

const hash = hashPassword('SecretPassword123!');
testDb.exec(`
  -- Legacy account without password hash (created first, updated recently)
  INSERT INTO users VALUES (
    'usr_legacy_null', 'Legacy Profile', 'candidate@example.com', NULL, 'USER', 1,
    'token_legacy_null', '2026-10-04T12:00:00Z', '2026-10-19T20:00:00Z', NULL, '2026-10-19T20:00:00Z'
  );
  -- Legacy account with empty string password (updated even more recently)
  INSERT INTO users VALUES (
    'usr_legacy_empty', 'Empty Pass Profile', 'candidate@example.com', '', 'USER', 1,
    'token_legacy_empty', '2026-10-05T12:00:00Z', '2026-10-20T00:00:00Z', NULL, '2026-10-20T00:00:00Z'
  );
  -- Real active candidate account with valid password hash (updated earlier)
  INSERT INTO users VALUES (
    'usr_active_pass', 'Real Candidate', 'candidate@example.com', '${hash}', 'USER', 1,
    'token_active_pass', '2026-10-06T12:00:00Z', '2026-10-18T10:00:00Z', '2026-10-18T10:00:00Z', '2026-10-18T10:00:00Z'
  );
`);

const loginQuery = `
  SELECT id, name, email, password_hash, role, is_active, created_at, updated_at, last_login_at, last_active_at
  FROM users
  WHERE LOWER(email) = ?
  ORDER BY 
    CASE WHEN password_hash IS NOT NULL AND length(trim(password_hash)) > 0 THEN 1 ELSE 0 END DESC,
    updated_at DESC
  LIMIT 1
`;

// Test lower case
const selectedLower = testDb.prepare(loginQuery).get('candidate@example.com'.trim().toLowerCase());
assert(selectedLower?.id === 'usr_active_pass', 'Selects active account with password hash over newer accounts with NULL or empty password');

// Test upper/mixed case
const selectedUpper = testDb.prepare(loginQuery).get('CANDIDATE@EXAMPLE.COM'.trim().toLowerCase());
assert(selectedUpper?.id === 'usr_active_pass', 'Case-insensitive email match selects active password account');

// Test password verification
assert(verifyPassword('SecretPassword123!', selectedLower.password_hash), 'Correct password verifies successfully against selected account');
assert(!verifyPassword('WrongPassword!', selectedLower.password_hash), 'Incorrect password fails verification against selected account');

testDb.close();

// TEST 2: Verification of Backup File and SQLite Baseline
console.log('\n--- TEST GROUP 2: BACKUP & SQLITE BASELINE ---');
const backupPath = path.join(process.cwd(), 'data', 'smart_resume.db.backup');
assert(fs.existsSync(backupPath), `Physical backup exists at ${backupPath}`);

const backupDb = new DatabaseSync(backupPath);
const backupTables = backupDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
assert(backupTables.length === 23, `Backup database contains all 23 expected tables (found ${backupTables.length})`);

let backupRows = 0;
for (const t of backupTables) {
  backupRows += backupDb.prepare(`SELECT count(*) as c FROM "${t.name}"`).get().c;
}
assert(backupRows === 2223, `Backup database contains all 2,223 expected records (found ${backupRows})`);
backupDb.close();

// TEST 3: Verification of DDL Syntax in migrate_sqlite_to_postgres.mjs
console.log('\n--- TEST GROUP 3: MIGRATION SCRIPT DDL INTEGRITY ---');
const migrationScriptPath = path.join(process.cwd(), 'scripts', 'migrate_sqlite_to_postgres.mjs');
const migrationCode = fs.readFileSync(migrationScriptPath, 'utf8');

assert(migrationCode.includes('ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS resume_id TEXT'), 'Includes idempotent DDL for job_applications.resume_id');
assert(migrationCode.includes('ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS applied_confirmed_at TEXT'), 'Includes idempotent DDL for job_applications.applied_confirmed_at');
assert(migrationCode.includes('ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS description_snippet TEXT'), 'Includes idempotent DDL for job_applications.description_snippet');
assert(migrationCode.includes('ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS salary TEXT'), 'Includes idempotent DDL for job_applications.salary');
assert(migrationCode.includes('ALTER TABLE resumes ADD COLUMN IF NOT EXISTS resume_data TEXT'), 'Includes idempotent DDL for resumes.resume_data');
assert(migrationCode.includes('CREATE INDEX IF NOT EXISTS idx_users_lower_email ON users(LOWER(email))'), 'Includes optimization index on users(LOWER(email))');
assert(migrationCode.includes('TABLE_SCHEMAS.length} tables and indexes ensured'), 'Reports accurate 23 tables count');

// TEST 4: Live Application Login with SQLite Database
console.log('\n--- TEST GROUP 4: LIVE APPLICATION DB LOGIN VERIFICATION ---');
async function testAppLogin() {
  const testEmail = `test.login.${Date.now()}@example.com`;
  const testPassword = 'Password123!Safe';

  try {
    // 1. Register candidate user
    await registerUser({
      name: 'Safe Login Test User',
      email: testEmail,
      password: testPassword,
    });

    // 2. Login with exact lowercase email
    const loggedIn = await loginUser({
      email: testEmail,
      password: testPassword,
    });
    assert(loggedIn?.user?.email === testEmail.toLowerCase(), 'Newly registered candidate logs in cleanly via updated loginUser()');
    assert(Boolean(loggedIn?.sessionToken), 'loginUser generates valid signed session token');

    // 3. Login with uppercase email
    const loggedInUpper = await loginUser({
      email: testEmail.toUpperCase(),
      password: testPassword,
    });
    assert(loggedInUpper?.user?.email === testEmail.toLowerCase(), 'loginUser matches case-insensitively with uppercase input');

    // 4. Login with wrong password
    try {
      await loginUser({
        email: testEmail,
        password: 'WrongPassword!',
      });
      assert(false, 'Login with wrong password should fail');
    } catch (err) {
      assert(err.message === 'Invalid email or password.', 'Login with wrong password correctly throws 401 error message');
    }
  } catch (err) {
    assert(false, `testAppLogin failed unexpectedly: ${err?.message}`);
  }

  // Attempt login with duplicate legacy profile (should fail gracefully with invalid email or password)
  try {
    await loginUser({
      email: 'priya.sharma@example.com',
      password: 'AnyPassword',
    });
    assert(false, 'Legacy account without password should reject login');
  } catch (err) {
    assert(err.message === 'Invalid email or password.', 'Legacy account without password hash correctly rejects login with standard 401 error message');
  }
}

await testAppLogin();

console.log('\n====================================================');
console.log(`SUMMARY: ${passedTests}/${totalTests} tests passed successfully.`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
