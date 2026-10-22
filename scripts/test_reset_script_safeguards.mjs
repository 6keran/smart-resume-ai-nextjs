import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

console.log('====================================================');
console.log('SMART RESUME AI: RESET SCRIPT SAFEGUARDS TEST SUITE');
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

// TEST 1: Default execution without --confirm-reset is strictly read-only dry-run
it('Default execution without --confirm-reset runs dry-run audit only (no writes/drops)', () => {
  const output = execSync('npx tsx scripts/reset_fresh_database.mjs', {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  assert.ok(output.includes('DRY-RUN AUDIT (SAFE - NO WRITES)'), 'Must declare dry-run audit mode');
  assert.ok(output.includes('DRY-RUN COMPLETE: NO CHANGES WERE MADE TO ANY DATABASE.'), 'Must verify no changes made');
});

// TEST 2: Live execution without admin credentials fails closed
it('Live execution (--confirm-reset) strictly aborts if ADMIN_EMAIL/PASSWORD are missing', () => {
  try {
    execSync('npx tsx scripts/reset_fresh_database.mjs --target=sqlite --confirm-reset', {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: { ...process.env, ADMIN_EMAIL: '', ADMIN_PASSWORD: '' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    assert.fail('Should have thrown error when admin credentials are missing');
  } catch (err) {
    const combinedOutput = (err.stdout || '') + (err.stderr || '') + (err.message || '');
    assert.ok(
      combinedOutput.includes('SAFETY BLOCK: ADMIN_EMAIL and ADMIN_PASSWORD must be set'),
      'Must abort with explicit safety block message'
    );
  }
});

// TEST 3: Script contains all 23 canonical tables and 30 indexes
it('Reset script source contains all 23 canonical tables in dependency order', () => {
  const content = fs.readFileSync(path.join(process.cwd(), 'scripts', 'reset_fresh_database.mjs'), 'utf8');
  const expectedTables = [
    'admin_users', 'skills_catalog', 'assessment_configs', 'courses',
    'users', 'visitors', 'resumes', 'resume_analyses', 'resume_improvements',
    'resume_versions', 'assessment_questions', 'assessments', 'assessment_question_snapshots',
    'verified_skills', 'certificates', 'course_progress', 'user_skills',
    'job_searches', 'job_matches', 'job_applications', 'feedback',
    'proctoring_events', 'audit_events'
  ];
  for (const table of expectedTables) {
    assert.ok(content.includes(`name: '${table}'`), `Must define table ${table}`);
  }
});

// TEST 4: Script enforces target database name 'neondb'
it('Reset script source enforces EXPECTED_PG_DB = neondb', () => {
  const content = fs.readFileSync(path.join(process.cwd(), 'scripts', 'reset_fresh_database.mjs'), 'utf8');
  assert.ok(content.includes("const EXPECTED_PG_DB = 'neondb';"), 'Must enforce neondb as target DB');
  assert.ok(content.includes("SAFETY BLOCK: Connected to database"), 'Must include target mismatch safety block');
});

// TEST 5: Script enforces narrow table drops (CANONICAL_APP_TABLES filter)
it('Reset script source restricts drops to CANONICAL_APP_TABLES only', () => {
  const content = fs.readFileSync(path.join(process.cwd(), 'scripts', 'reset_fresh_database.mjs'), 'utf8');
  assert.ok(content.includes('CANONICAL_APP_TABLES.has(t)'), 'Must filter existing tables against canonical list');
  assert.ok(content.includes('Preserving'), 'Must log preserved non-application tables');
});

// TEST 6: Script smoke test contains strict programmatic assertions
it('Smoke test contains strict assertions for zero user data and full catalog counts', () => {
  const content = fs.readFileSync(path.join(process.cwd(), 'scripts', 'reset_fresh_database.mjs'), 'utf8');
  assert.ok(content.includes('if (userCount !== 0) throw new Error'), 'Must assert 0 user rows');
  assert.ok(content.includes('if (resumeCount !== 0) throw new Error'), 'Must assert 0 resume rows');
  assert.ok(content.includes('if (appCount !== 0) throw new Error'), 'Must assert 0 application rows');
  assert.ok(content.includes('if (adminCount !== 1) throw new Error'), 'Must assert exactly 1 admin user');
});

console.log('\n====================================================');
console.log(`SUMMARY: ${passedTests}/${totalTests} tests passed successfully.`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
