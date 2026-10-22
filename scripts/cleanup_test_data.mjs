import { DatabaseSync } from 'node:sqlite';
import Module from 'node:module';

// Intercept server-only for script execution
const origLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === 'server-only') {
    return {};
  }
  return origLoad.apply(this, [id, ...args]);
};

const { deleteUserAndData, getDb } = await import('../src/server/db/index.ts');

const args = process.argv.slice(2);
const isConfirmed = args.includes('--confirm-cleanup');

console.log('================================================================');
console.log('SMART RESUME AI: TEST DATA AUDIT & CLEANUP TOOL');
console.log('================================================================');
console.log(`Execution Mode: ${isConfirmed ? 'LIVE EXECUTION (DELETION AUTHORIZED)' : 'DRY-RUN AUDIT (SAFE - NO WRITES)'}`);
console.log('================================================================\n');

async function runAudit() {
  const db = getDb();

  // Find candidate test accounts (excluding admin accounts)
  const testCandidates = await db.prepare(`
    SELECT u.id, u.name, u.email, u.created_at
    FROM users u
    WHERE (
      LOWER(u.email) LIKE '%@example.com'
      OR LOWER(u.email) LIKE '%test%'
      OR LOWER(u.name) LIKE '%test%'
      OR LOWER(u.id) LIKE '%test%'
    )
    AND u.id NOT IN (SELECT id FROM admin_users)
    AND (u.email IS NULL OR LOWER(u.email) NOT IN (SELECT LOWER(email) FROM admin_users))
    ORDER BY u.created_at DESC
  `).all();

  console.log(`Found ${testCandidates.length} candidate accounts matching test patterns.\n`);

  if (testCandidates.length === 0) {
    console.log('No test data detected in users table.');
    return;
  }

  console.log('Sample test accounts identified:');
  for (const c of testCandidates.slice(0, 10)) {
    console.log(`  - [ID: ${c.id}] ${c.name} (${c.email || 'No email'}) [Created: ${c.created_at}]`);
  }
  if (testCandidates.length > 10) {
    console.log(`  ... and ${testCandidates.length - 10} more accounts.\n`);
  }

  if (!isConfirmed) {
    console.log('\n================================================================');
    console.log('DRY RUN SUMMARY:');
    console.log(`To delete these ${testCandidates.length} test records with cascade purge and audit trails, run:`);
    console.log('  node scripts/cleanup_test_data.mjs --confirm-cleanup');
    console.log('================================================================\n');
    return;
  }

  console.log('\nExecuting cascade purge for test accounts...\n');
  const adminActor = { id: 'adm_cleanup_system', email: 'system-audit@smartresume.ai' };
  let deletedCount = 0;

  for (const candidate of testCandidates) {
    try {
      await deleteUserAndData(candidate.id, adminActor);
      deletedCount++;
    } catch (err) {
      console.error(`Failed to delete ${candidate.id}:`, err.message);
    }
  }

  console.log(`\n✓ Successfully removed ${deletedCount} of ${testCandidates.length} test accounts and purged their associated child records.`);
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
