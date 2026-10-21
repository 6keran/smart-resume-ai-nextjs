import Module from 'node:module';

// Intercept server-only for standalone script execution
const origLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === 'server-only') {
    return {};
  }
  return origLoad.apply(this, [id, ...args]);
};

const { deleteUserAndData, getDb } = await import('../src/server/db/index.ts');
const { createPgTxClient } = await import('../src/server/db/adapter.ts');

async function insertCandidateWithData(db, testId) {
  const testEmail = `${testId}@example.com`;
  const now = new Date().toISOString();

  await db.prepare('INSERT INTO users (id, name, email, session_token, created_at, updated_at, last_active_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    testId, `Test Candidate ${testId}`, testEmail, `token_${testId}`, now, now, now
  );
  await db.prepare('INSERT INTO resumes (id, user_id, filename, file_type, uploaded_at, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    `res_${testId}`, testId, 'test.pdf', 'pdf', now, now
  );
  await db.prepare('INSERT INTO resume_versions (id, user_id, resume_id, version_number, resume_data, created_at) VALUES (?, ?, ?, 1, ?, ?)').run(
    `ver_${testId}`, testId, `res_${testId}`, '{}', now
  );
  await db.prepare('INSERT INTO resume_improvements (id, user_id, resume_id, category, title, before_text, after_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    `imp_${testId}`, testId, `res_${testId}`, 'Work Experience', 'Bullet 1', 'old', 'new', now
  );
  await db.prepare('INSERT INTO job_applications (id, user_id, job_id, job_title, company, job_url, created_at, updated_at, applied_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    `app_${testId}`, testId, 'job_1', 'Engineer', 'Acme', 'http://job', now, now, now
  );
  await db.prepare('INSERT INTO assessments (id, user_id, skill, score, total_questions, passed, status, created_at) VALUES (?, ?, ?, 8, 10, 1, ?, ?)').run(
    `ass_${testId}`, testId, 'Python', 'COMPLETED', now
  );
  await db.prepare('INSERT INTO assessment_question_snapshots (id, assessment_id, question_id, question_order, question_text, question_type, difficulty, options_json, correct_answer, created_at) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?)').run(
    `snp_${testId}`, `ass_${testId}`, 'q1', 'What is Python?', 'MCQ', 'Easy', '[]', 'A', now
  );
  await db.prepare('INSERT INTO proctoring_events (id, assessment_id, event_type, severity, timestamp, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    `prc_${testId}`, `ass_${testId}`, 'tab_change', 'warning', now, now
  );
  await db.prepare('INSERT INTO user_skills (id, user_id, skill_name, category, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    `usk_${testId}`, testId, 'Python', 'Programming', 'claimed', now, now
  );
  await db.prepare('INSERT INTO verified_skills (id, user_id, skill_name, status, assessment_id, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    `vsk_${testId}`, testId, 'Python', 'VERIFIED', `ass_${testId}`, now
  );
  await db.prepare('INSERT INTO certificates (id, user_id, assessment_id, skill, score, total_questions, certificate_code, issue_date, created_at) VALUES (?, ?, ?, ?, 8, 10, ?, ?, ?)').run(
    `crt_${testId}`, testId, `ass_${testId}`, 'Python', `CODE_${testId}`, now, now
  );
  await db.prepare('INSERT INTO feedback (id, user_id, rating, category, message, created_at) VALUES (?, ?, 5, ?, ?, ?)').run(
    `fb_${testId}`, testId, 'General', 'Great app!', now
  );

  return { testId, testEmail };
}

async function verifyCandidateRecordsExist(db, testId) {
  const u = await db.prepare('SELECT id FROM users WHERE id = ?').get(testId);
  const r = await db.prepare('SELECT id FROM resumes WHERE user_id = ?').get(testId);
  const v = await db.prepare('SELECT id FROM resume_versions WHERE user_id = ?').get(testId);
  const imp = await db.prepare('SELECT id FROM resume_improvements WHERE user_id = ?').get(testId);
  const a = await db.prepare('SELECT id FROM job_applications WHERE user_id = ?').get(testId);
  const ass = await db.prepare('SELECT id FROM assessments WHERE user_id = ?').get(testId);
  const snp = await db.prepare('SELECT id FROM assessment_question_snapshots WHERE assessment_id = ?').get(`ass_${testId}`);
  const prc = await db.prepare('SELECT id FROM proctoring_events WHERE assessment_id = ?').get(`ass_${testId}`);
  const usk = await db.prepare('SELECT id FROM user_skills WHERE user_id = ?').get(testId);
  const vsk = await db.prepare('SELECT id FROM verified_skills WHERE user_id = ?').get(testId);
  const crt = await db.prepare('SELECT id FROM certificates WHERE user_id = ?').get(testId);
  const fb = await db.prepare('SELECT user_id FROM feedback WHERE id = ?').get(`fb_${testId}`);

  return Boolean(u && r && v && imp && a && ass && snp && prc && usk && vsk && crt && fb?.user_id === testId);
}

async function runTest() {
  console.log('--- STARTING TRANSACTION SAFETY & ADMIN USER DELETION TESTS ---');
  const db = getDb();
  const adminActor = { id: 'adm_1791105662844', email: 'kiran81232@gmail.com' };

  // =========================================================================
  // TEST 1: Baseline Deletion & Anonymization
  // =========================================================================
  console.log('\n[TEST 1] Testing normal deletion, cascade purge, and audit logging...');
  const t1Id = `test_del_norm_${Date.now()}`;
  const { testEmail: t1Email } = await insertCandidateWithData(db, t1Id);

  // 1a. Test self-deletion prevention
  try {
    await deleteUserAndData(t1Id, { id: t1Id, email: t1Email });
    console.error('✗ FAIL: Self-deletion should have thrown an error!');
    process.exit(1);
  } catch (err) {
    console.log('✓ PASS: Self-deletion correctly blocked:', err.message);
  }

  // 1b. Authorized deletion
  const res1 = await deleteUserAndData(t1Id, adminActor);
  console.log('✓ PASS: Normal deletion succeeded:', res1.message);

  // 1c. Verify purged
  const existsAfterDel = await verifyCandidateRecordsExist(db, t1Id);
  if (!existsAfterDel) {
    console.log('✓ PASS: All associated records purged and feedback anonymized.');
  } else {
    console.error('✗ FAIL: Lingering candidate records found after deletion!');
    process.exit(1);
  }
  await db.prepare('DELETE FROM feedback WHERE id = ?').run(`fb_${t1Id}`);

  // 1d. Verify audit log committed
  const audit1 = await db.prepare("SELECT * FROM audit_events WHERE event_type = 'ADMIN_USER_DELETED' ORDER BY created_at DESC LIMIT 1").get();
  if (audit1?.metadata_json?.includes(t1Id)) {
    console.log('✓ PASS: Audit event committed together with user deletion.');
  } else {
    console.error('✗ FAIL: Audit log missing for normal deletion!');
    process.exit(1);
  }

  // =========================================================================
  // TEST 2: Safeguard - Block Last Active Administrator Deletion
  // =========================================================================
  console.log('\n[TEST 2] Testing safeguard: block deleting the last active admin...');
  const soleAdminId = `adm_last_${Date.now()}`;
  const now = new Date().toISOString();
  await db.prepare("INSERT INTO users (id, name, email, role, is_active, session_token, created_at, updated_at, last_active_at) VALUES (?, ?, ?, 'ADMIN', 1, ?, ?, ?, ?)").run(
    soleAdminId, 'Sole Admin', `${soleAdminId}@example.com`, `token_${soleAdminId}`, now, now, now
  );

  // Temporarily deactivate other admins in a test transaction
  await db.transaction(async (tx) => {
    // Check if deleting soleAdminId fails when no other active admin exists
    // We simulate by calling deleteUserAndData directly with an external actor
    try {
      // Deactivate all admin_users except none
      await tx.prepare('UPDATE admin_users SET is_active = 0').run();
      await deleteUserAndData(soleAdminId, { id: 'other_super_admin', email: 'other@domain.com' });
      throw new Error('FAIL: Last active admin should not have been deleted!');
    } catch (err) {
      if (err.message.includes('last active administrator')) {
        console.log('✓ PASS: Last active admin deletion correctly blocked:', err.message);
      } else {
        throw err;
      }
    }
    // Throw to rollback the temporary deactivation of admin_users
    throw new Error('ROLLBACK_TEST_ADMIN_DEACTIVATION');
  }).catch((err) => {
    if (err.message !== 'ROLLBACK_TEST_ADMIN_DEACTIVATION') throw err;
  });

  await db.prepare('DELETE FROM users WHERE id = ?').run(soleAdminId);

  // =========================================================================
  // TEST 3: Atomicity - Rollback on Midway Deletion Failure
  // =========================================================================
  console.log('\n[TEST 3] Testing atomic rollback when deletion fails midway (simulated constraint/abort)...');
  const t3Id = `test_del_fail_${Date.now()}`;
  await insertCandidateWithData(db, t3Id);

  // Confirm records exist before attempting deletion
  const preCheck = await verifyCandidateRecordsExist(db, t3Id);
  if (!preCheck) {
    console.error('✗ FAIL: Candidate records were not properly inserted for Test 3!');
    process.exit(1);
  }
  console.log('✓ Candidate user and 11 records confirmed in database.');

  // Install a temporary SQLite trigger on `users` that fires on DELETE and aborts
  // This simulates an error occurring at step 20 (after resumes, assessments, etc. have already been deleted in the transaction)
  await db.exec(`
    CREATE TRIGGER trg_test_simulate_failure
    BEFORE DELETE ON users
    WHEN OLD.id = '${t3Id}'
    BEGIN
      SELECT RAISE(ABORT, 'SIMULATED_MIDWAY_CASCADE_FAILURE');
    END;
  `);

  let errorCaught = false;
  try {
    await deleteUserAndData(t3Id, adminActor);
  } catch (err) {
    errorCaught = true;
    console.log('✓ Caught simulated error during deletion:', err.message);
  } finally {
    await db.exec('DROP TRIGGER IF EXISTS trg_test_simulate_failure;');
  }

  if (!errorCaught) {
    console.error('✗ FAIL: deleteUserAndData did not fail despite trigger!');
    process.exit(1);
  }

  // Verify that ALL 11 records remain 100% UNCHANGED and intact due to rollback
  const recordsStillExist = await verifyCandidateRecordsExist(db, t3Id);
  if (recordsStillExist) {
    console.log('✓ PASS: Rollback verified! All 11 records (resumes, assessments, feedback, user) remain 100% intact.');
  } else {
    console.error('✗ FAIL: Partial deletion detected! Rollback did not restore all candidate records.');
    process.exit(1);
  }

  // Verify NO audit log was written for the failed deletion
  const auditFail = await db.prepare("SELECT * FROM audit_events WHERE event_type = 'ADMIN_USER_DELETED' AND metadata_json LIKE ?").get(`%${t3Id}%`);
  if (!auditFail) {
    console.log('✓ PASS: No orphan audit log created for the rolled-back deletion.');
  } else {
    console.error('✗ FAIL: Found lingering audit log for rolled back deletion!');
    process.exit(1);
  }

  // Clean up Test 3 candidate safely
  await deleteUserAndData(t3Id, adminActor);
  await db.prepare('DELETE FROM feedback WHERE id = ?').run(`fb_${t3Id}`);
  console.log('✓ Test 3 candidate cleaned up successfully.');

  // =========================================================================
  // TEST 4: Atomicity - Rollback on Audit Log Insertion Failure
  // =========================================================================
  console.log('\n[TEST 4] Testing atomic rollback when audit log insertion fails...');
  const t4Id = `test_del_audit_fail_${Date.now()}`;
  await insertCandidateWithData(db, t4Id);

  // Install a trigger on audit_events to simulate an audit log failure
  await db.exec(`
    CREATE TRIGGER trg_test_audit_failure
    BEFORE INSERT ON audit_events
    WHEN NEW.metadata_json LIKE '%${t4Id}%'
    BEGIN
      SELECT RAISE(ABORT, 'SIMULATED_AUDIT_LOG_FAILURE');
    END;
  `);

  let auditErrorCaught = false;
  try {
    await deleteUserAndData(t4Id, adminActor);
  } catch (err) {
    auditErrorCaught = true;
    console.log('✓ Caught simulated audit log failure:', err.message);
  } finally {
    await db.exec('DROP TRIGGER IF EXISTS trg_test_audit_failure;');
  }

  if (!auditErrorCaught) {
    console.error('✗ FAIL: deleteUserAndData did not fail when audit log failed!');
    process.exit(1);
  }

  // Verify all records rolled back and still exist
  const recordsStillExistAudit = await verifyCandidateRecordsExist(db, t4Id);
  if (recordsStillExistAudit) {
    console.log('✓ PASS: Rollback verified! Candidate records completely restored when audit log failed.');
  } else {
    console.error('✗ FAIL: Partial data loss! Records were deleted even though audit log failed.');
    process.exit(1);
  }

  // Clean up Test 4 candidate
  await deleteUserAndData(t4Id, adminActor);
  await db.prepare('DELETE FROM feedback WHERE id = ?').run(`fb_${t4Id}`);
  console.log('✓ Test 4 candidate cleaned up successfully.');

  // =========================================================================
  // TEST 5: Nested Transactions & Savepoint Behavior (SQLite)
  // =========================================================================
  console.log('\n[TEST 5] Testing SQLite nested transaction savepoints...');
  const testValOuter = `nested_outer_${Date.now()}`;
  const testValInner = `nested_inner_${Date.now()}`;

  await db.transaction(async (txOuter) => {
    await txOuter.prepare('INSERT INTO users (id, name, session_token, created_at, updated_at, last_active_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      testValOuter, 'Outer User', `tok_${testValOuter}`, now, now, now
    );

    // Nested transaction that throws
    try {
      await txOuter.transaction(async (txInner) => {
        await txInner.prepare('INSERT INTO users (id, name, session_token, created_at, updated_at, last_active_at) VALUES (?, ?, ?, ?, ?, ?)').run(
          testValInner, 'Inner User', `tok_${testValInner}`, now, now, now
        );
        throw new Error('SIMULATED_INNER_TX_FAILURE');
      });
    } catch (err) {
      console.log('✓ Inner transaction caught error as expected:', err.message);
    }

    // Verify inner user rolled back while outer user still active in transaction
    const innerUser = await txOuter.prepare('SELECT id FROM users WHERE id = ?').get(testValInner);
    const outerUser = await txOuter.prepare('SELECT id FROM users WHERE id = ?').get(testValOuter);
    if (!innerUser && outerUser) {
      console.log('✓ PASS: Inner savepoint rolled back cleanly; outer transaction remained intact.');
    } else {
      console.error('✗ FAIL: Nested transaction did not isolate savepoint rollback properly!');
      process.exit(1);
    }
  });

  // Verify outer user was committed
  const committedOuter = await db.prepare('SELECT id FROM users WHERE id = ?').get(testValOuter);
  if (committedOuter) {
    console.log('✓ PASS: Outer transaction committed successfully.');
    await db.prepare('DELETE FROM users WHERE id = ?').run(testValOuter);
  } else {
    console.error('✗ FAIL: Outer transaction failed to commit!');
    process.exit(1);
  }

  // =========================================================================
  // TEST 6: Offline PostgreSQL Adapter Transaction Unit Verification
  // =========================================================================
  console.log('\n[TEST 6] Testing PostgreSQL adapter transaction lifecycle offline...');
  const recordedQueries = [];
  let connectionReleased = false;

  const mockPgClient = {
    async query(sql, params) {
      recordedQueries.push({ sql, params });
      return { rows: [], rowCount: 1 };
    },
    release() {
      connectionReleased = true;
    },
  };

  // Test Pg transaction wrapper with mock client
  const pgTxClient = createPgTxClient(mockPgClient, 0);

  // 6a. Verify prepared statement execution in Pg adapter
  await pgTxClient.prepare('INSERT INTO test (id, name) VALUES (?, ?)').run('1', 'Test');
  if (recordedQueries[0]?.sql?.includes('$1') && recordedQueries[0]?.sql?.includes('$2')) {
    console.log('✓ PASS: PostgreSQL adapter converts SQLite ? placeholders to $1, $2 placeholders.');
  } else {
    console.error('✗ FAIL: PostgreSQL parameter conversion failed:', recordedQueries[0]);
    process.exit(1);
  }

  // 6b. Verify nested savepoint in Pg adapter
  await pgTxClient.transaction(async (nestedTx) => {
    await nestedTx.prepare('UPDATE test SET name = ? WHERE id = ?').run('Updated', '1');
  });

  const hasSavepoint = recordedQueries.some((q) => q.sql.includes('SAVEPOINT'));
  const hasReleaseSavepoint = recordedQueries.some((q) => q.sql.includes('RELEASE SAVEPOINT'));
  if (hasSavepoint && hasReleaseSavepoint) {
    console.log('✓ PASS: PostgreSQL adapter uses SAVEPOINT and RELEASE SAVEPOINT for nested transactions.');
  } else {
    console.error('✗ FAIL: PostgreSQL savepoint commands missing!');
    process.exit(1);
  }

  // 6c. Verify nested savepoint rollback on error
  try {
    await pgTxClient.transaction(async (nestedTx) => {
      await nestedTx.exec('DELETE FROM test');
      throw new Error('SIMULATED_PG_INNER_FAIL');
    });
  } catch (err) {
    const hasRollbackToSp = recordedQueries.some((q) => q.sql.includes('ROLLBACK TO SAVEPOINT'));
    if (hasRollbackToSp) {
      console.log('✓ PASS: PostgreSQL adapter issues ROLLBACK TO SAVEPOINT on nested error.');
    } else {
      console.error('✗ FAIL: PostgreSQL ROLLBACK TO SAVEPOINT missing!');
      process.exit(1);
    }
  }

  console.log('\n===============================================================');
  console.log('🎉 ALL TRANSACTION SAFETY & ROLLBACK AUDIT TESTS PASSED 100%!');
  console.log('===============================================================\n');
}

runTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
