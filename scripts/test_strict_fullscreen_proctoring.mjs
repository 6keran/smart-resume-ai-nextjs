// scripts/test_strict_fullscreen_proctoring.mjs
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const DB_PATH = path.join(process.cwd(), 'data', 'smart_resume.db');

async function runProctoringTests() {
  console.log('====================================================');
  console.log('SMART RESUME AI — STRICT FULLSCREEN PROCTORING TESTS');
  console.log('====================================================\n');

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

  // 1. Verify DB schema has proctoring columns on assessments and proctoring_events table
  const db = new DatabaseSync(DB_PATH);
  try {
    const tableInfo = db.prepare("PRAGMA table_info(assessments)").all();
    const colNames = tableInfo.map((c) => c.name);
    assert(colNames.includes('termination_reason'), 'assessments table has termination_reason column');
    assert(colNames.includes('proctoring_events_json'), 'assessments table has proctoring_events_json column');

    const proctorEventsTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='proctoring_events'").get();
    assert(!!proctorEventsTable, 'proctoring_events audit table exists in SQLite database');
  } catch (err) {
    assert(false, `DB schema check failed: ${err.message}`);
  }

  // 2. Check Assessment Page Loads
  try {
    const res = await fetch(`${BASE_URL}/skills/assess/python`);
    assert(res.status === 200, `Assessment page /skills/assess/python loads (HTTP ${res.status})`);
    const html = await res.text();
    assert(
      html.includes('Strict Fullscreen Proctoring') ||
      html.includes('Assessment Rules') ||
      html.includes('Camera') ||
      html.includes('Fullscreen'),
      'Instructions and Readiness screen content present in HTML'
    );
    assert(html.includes('Start Assessment'), 'Start Assessment trigger present in readiness interface');
  } catch (err) {
    assert(false, `Assessment page load failed: ${err.message}`);
  }

  // 3. Start Assessment Attempt via API
  let attempt1Id = null;
  let attempt1Questions = [];
  const testVisitorId = 'test-proctor-visitor-' + Date.now();
  try {
    const res = await fetch(`${BASE_URL}/api/assessments/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sra_visitor_id=${testVisitorId}`,
      },
      body: JSON.stringify({ skill: 'Python' }),
    });
    assert(res.status === 200, `POST /api/assessments/start returns 200`);
    const data = await res.json();
    assert(data.success === true, 'Assessment start reported success');
    assert(!!data.attemptId, `Attempt ID generated: ${data.attemptId}`);
    assert(Array.isArray(data.questions) && data.questions.length > 0, `Returned ${data.questions?.length} questions`);
    attempt1Id = data.attemptId;
    attempt1Questions = data.questions || [];
  } catch (err) {
    assert(false, `Assessment start API failed: ${err.message}`);
  }

  // 4. Test Violation Termination: Submit with 3 violations
  if (attempt1Id) {
    try {
      const proctoringEvents = [
        { type: 'CAMERA_STARTED', severity: 'info', timestamp: Date.now() - 60000, details: 'Camera hardware verified' },
        { type: 'TAB_SWITCH', severity: 'violation', timestamp: Date.now() - 40000, details: 'Document visibility changed to hidden (Warning 1/3)' },
        { type: 'FULLSCREEN_EXIT', severity: 'violation', timestamp: Date.now() - 20000, details: 'Fullscreen exited unexpectedly (Final Warning 2/3)' },
        { type: 'TAB_SWITCH', severity: 'violation', timestamp: Date.now() - 5000, details: 'Document visibility changed to hidden (Violation 3/3 - Terminated)' },
      ];

      const res = await fetch(`${BASE_URL}/api/assessments/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `sra_visitor_id=${testVisitorId}`,
        },
        body: JSON.stringify({
          attemptId: attempt1Id,
          userAnswers: { [attempt1Questions[0]?.id || 'q1']: 0 },
          proctoringEvents,
          durationSeconds: 120,
          terminationReason: 'Exceeded maximum violation threshold (3/3 violations). Assessment automatically terminated.',
        }),
      });

      assert(res.status === 200, `POST /api/assessments/submit returns 200 for terminated attempt`);
      const graded = await res.json();
      assert(graded.status === 'INCOMPLETE', `Attempt status graded as INCOMPLETE (actual: ${graded.status})`);
      assert(graded.isTerminated === true, `isTerminated flag is true`);
      assert(graded.certificateId === null || graded.certificateId === undefined, `No certificate awarded on termination (actual: ${graded.certificateId})`);
      assert(graded.score === 0, `Score is 0% on violation termination (actual: ${graded.score})`);

      // Verify DB persistence of termination and audit log
      const row = db.prepare("SELECT status, termination_reason, score, proctoring_events_json FROM assessments WHERE id = ?").get(attempt1Id);
      assert(row?.status === 'INCOMPLETE', `DB row status in assessments is 'INCOMPLETE'`);
      assert(typeof row?.termination_reason === 'string' && row.termination_reason.includes('3/3'), `DB termination_reason accurately recorded: "${row?.termination_reason}"`);

      // Verify proctoring_events audit table entries
      const eventsInDb = db.prepare("SELECT event_type, details FROM proctoring_events WHERE assessment_id = ?").all(attempt1Id);
      assert(eventsInDb.length === 4, `DB proctoring_events table recorded all 4 audit events (actual: ${eventsInDb.length})`);
      const eventTypes = eventsInDb.map((e) => e.event_type);
      assert(eventTypes.includes('TAB_SWITCH') && eventTypes.includes('FULLSCREEN_EXIT'), `proctoring_events logged TAB_SWITCH and FULLSCREEN_EXIT`);
    } catch (err) {
      assert(false, `Termination submission test failed: ${err.message}`);
    }

    // 5. Test Double-Submission / Tampering Prevention after Termination
    try {
      const res = await fetch(`${BASE_URL}/api/assessments/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `sra_visitor_id=${testVisitorId}`,
        },
        body: JSON.stringify({
          attemptId: attempt1Id,
          userAnswers: { [attempt1Questions[0]?.id || 'q1']: 1 },
          proctoringEvents: [],
          durationSeconds: 120,
        }),
      });
      const data = await res.json();
      assert(data.status === 'INCOMPLETE', `Re-submission preserves INCOMPLETE status`);
      assert(data.score === 0, `Re-submission cannot alter score (actual: ${data.score})`);
    } catch (err) {
      assert(false, `Double-submission test failed: ${err.message}`);
    }
  }

  // 6. Test Normal Passing Attempt (0 or 1 violation)
  const passVisitorId = 'test-pass-visitor-' + Date.now();
  let attempt2Id = null;
  let attempt2Questions = [];
  try {
    const res = await fetch(`${BASE_URL}/api/assessments/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sra_visitor_id=${passVisitorId}`,
      },
      body: JSON.stringify({ skill: 'Python' }),
    });
    const data = await res.json();
    attempt2Id = data.attemptId;
    attempt2Questions = data.questions || [];
    assert(!!attempt2Id, `Second attempt initialized: ${attempt2Id}`);
  } catch (err) {
    assert(false, `Second attempt start failed: ${err.message}`);
  }

  if (attempt2Id && attempt2Questions.length > 0) {
    try {
      // Lookup correct answers from snapshots table
      const snaps = db.prepare("SELECT id, question_id, correct_answer FROM assessment_question_snapshots WHERE assessment_id = ?").all(attempt2Id);
      const userAnswers = {};
      snaps.forEach((s) => {
        userAnswers[s.question_id] = s.correct_answer;
      });

      const proctoringEvents = [
        { type: 'CAMERA_STARTED', severity: 'info', timestamp: Date.now() - 30000, details: 'Camera hardware active' },
        { type: 'FULLSCREEN_ACTIVE', severity: 'info', timestamp: Date.now() - 29000, details: 'Fullscreen mode confirmed active' },
        { type: 'TAB_SWITCH', severity: 'violation', timestamp: Date.now() - 15000, details: 'Single transient blur (Warning 1/3)' },
      ];

      const res = await fetch(`${BASE_URL}/api/assessments/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `sra_visitor_id=${passVisitorId}`,
        },
        body: JSON.stringify({
          attemptId: attempt2Id,
          userAnswers,
          proctoringEvents,
          durationSeconds: 150,
        }),
      });

      assert(res.status === 200, `POST /api/assessments/submit for passing attempt returns 200`);
      const graded = await res.json();
      assert(graded.status === 'passed', `Attempt status graded as passed (actual: ${graded.status})`);
      assert(graded.score >= 7, `Passing score awarded (actual: ${graded.score}/${graded.totalQuestions})`);
      assert(!!graded.certificateId, `Certificate code generated for passing attempt: ${graded.certificateId}`);

      // Verify DB verified_skills entry exists
      const vsRow = db.prepare("SELECT id, skill_name, status FROM verified_skills WHERE assessment_id = ?").get(attempt2Id);
      assert(!!vsRow && vsRow.status === 'VERIFIED', `Verified skill recorded in DB: ${vsRow?.skill_name}`);
    } catch (err) {
      assert(false, `Passing attempt submission failed: ${err.message}`);
    }
  }

  // 7. Test Ownership Security: Mismatched Visitor Cannot Submit Someone Else's Attempt
  let attempt3Id = null;
  const legitVisitorId = 'test-legit-visitor-' + Date.now();
  try {
    const res = await fetch(`${BASE_URL}/api/assessments/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sra_visitor_id=${legitVisitorId}`,
      },
      body: JSON.stringify({ skill: 'Python' }),
    });
    const data = await res.json();
    attempt3Id = data.attemptId;
  } catch (err) {}

  if (attempt3Id) {
    try {
      const maliciousVisitor = 'attacker-visitor-' + Date.now();
      const res = await fetch(`${BASE_URL}/api/assessments/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `sra_visitor_id=${maliciousVisitor}`,
        },
        body: JSON.stringify({
          attemptId: attempt3Id,
          userAnswers: {},
          proctoringEvents: [],
          durationSeconds: 10,
        }),
      });
      assert(res.status === 403, `Unauthorized visitor submission rejected with HTTP 403 (actual: ${res.status})`);
    } catch (err) {
      assert(false, `Ownership security test failed: ${err.message}`);
    }
  }

  db.close();

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runProctoringTests();
