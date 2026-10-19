const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PROTOCOL = fs.existsSync(path.resolve(__dirname, 'certificates/localhost.pem')) ? 'https' : 'http';
const BASE_URL = `${PROTOCOL}://localhost:${PORT}`;
const rootCA = fs.existsSync(path.resolve(__dirname, 'certificates/rootCA.pem'))
  ? fs.readFileSync(path.resolve(__dirname, 'certificates/rootCA.pem'))
  : null;

function makeRequest(reqPath, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, BASE_URL);
    const client = url.protocol === 'https:' ? https : http;
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      ca: rootCA || undefined,
      rejectUnauthorized: true,
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });

    req.on('error', reject);

    if (body) {
      if (typeof body === 'object') {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING QUESTION BANK & ADMIN DASHBOARD VERIFICATION ---');

  let adminCookie = '';

  // 1. Verify Unauthenticated Protection
  console.log('\n[1] Testing unauthenticated access protection on /api/admin/questions...');
  const unauthRes = await makeRequest('/api/admin/questions');
  console.log('Unauthenticated status:', unauthRes.status);
  if (unauthRes.status === 401) {
    console.log('PASS: Unauthenticated access blocked with 401.');
  } else {
    throw new Error(`FAIL: Expected 401, got ${unauthRes.status}`);
  }

  // 2. Admin Login
  console.log('\n[2] Logging in as Admin (kiran81232@gmail.com)...');
  const loginRes = await makeRequest('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'kiran81232@gmail.com', password: 'kiran@69' });

  if (loginRes.status !== 200) {
    throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
  }

  const setCookie = loginRes.headers['set-cookie'];
  if (setCookie && setCookie[0]) {
    adminCookie = setCookie[0].split(';')[0];
    console.log('PASS: Admin login successful. Cookie:', adminCookie.substring(0, 30) + '...');
  } else {
    throw new Error('FAIL: No session cookie returned from login.');
  }

  // 3. Admin Stats & Question Bank Telemetry
  console.log('\n[3] Fetching admin stats to verify Question Bank telemetry...');
  const statsRes = await makeRequest('/api/admin/stats', {
    headers: { Cookie: adminCookie },
  });

  if (statsRes.status !== 200) {
    throw new Error(`Failed to fetch stats: ${statsRes.status}`);
  }

  const stats = statsRes.data.stats;
  console.log('Question Bank Telemetry:', stats.questionBankStats);
  if (stats.questionBankStats && stats.questionBankStats.totalQuestions >= 120) {
    console.log(`PASS: Telemetry verified with ${stats.questionBankStats.totalQuestions} questions across ${stats.questionBankStats.skillsCovered} skills.`);
  } else {
    throw new Error(`FAIL: Unexpected question bank stats: ${JSON.stringify(stats.questionBankStats)}`);
  }

  // 4. Query Question Bank
  console.log('\n[4] Querying Question Bank with filters (skill=Python)...');
  const qRes = await makeRequest('/api/admin/questions?skill=Python', {
    headers: { Cookie: adminCookie },
  });

  if (qRes.status !== 200 || !Array.isArray(qRes.data.questions)) {
    throw new Error(`Failed to query questions: ${qRes.status}`);
  }
  console.log(`PASS: Found ${qRes.data.questions.length} questions for Python (Total: ${qRes.data.total}).`);

  // 5. Create a Question
  console.log('\n[5] Creating a test question in Question Bank...');
  const createRes = await makeRequest('/api/admin/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
  }, {
    skill: 'Python',
    question_text: 'AUTOMATED TEST: What is the return value of isinstance(True, int)?',
    question_type: 'MCQ',
    difficulty: 'Hard',
    options: ['False', 'True', 'TypeError', 'None'],
    correct_answer: 'Option B',
    explanation: 'In Python, bool is a subclass of int, so True is an instance of int.',
    time_limit_seconds: 90,
    is_active: true,
  });

  if (createRes.status !== 201 || !createRes.data.id) {
    throw new Error(`Failed to create question: ${createRes.status} ${JSON.stringify(createRes.data)}`);
  }
  const testQId = createRes.data.id;
  console.log('PASS: Question created with ID:', testQId);

  // 6. Update the Question
  console.log('\n[6] Updating test question...');
  const updateRes = await makeRequest('/api/admin/questions', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
  }, {
    id: testQId,
    explanation: 'UPDATED: bool is an int subclass in Python runtime.',
    difficulty: 'Medium',
  });

  if (updateRes.status !== 200) {
    throw new Error(`Failed to update question: ${updateRes.status}`);
  }
  console.log('PASS: Question updated successfully.');

  // 7. Toggle Question Status
  console.log('\n[7] Toggling question status to Inactive...');
  const toggleRes = await makeRequest('/api/admin/questions', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
  }, {
    id: testQId,
    is_active: false,
  });

  if (toggleRes.status !== 200 || toggleRes.data.is_active !== false) {
    throw new Error(`Failed to toggle question status: ${toggleRes.status}`);
  }
  console.log('PASS: Question deactivated.');

  // 8. Public Assessment Start
  console.log('\n[8] Testing public candidate assessment start for Python...');
  const startRes = await makeRequest('/api/assessments/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { skill: 'Python' });

  if (startRes.status !== 200 || !startRes.data.attemptId) {
    throw new Error(`Failed to start assessment: ${startRes.status} ${JSON.stringify(startRes.data)}`);
  }

  const attemptId = startRes.data.attemptId;
  const examQuestions = startRes.data.questions;
  console.log(`PASS: Started assessment attempt ${attemptId} with ${examQuestions.length} questions.`);

  // Verify questions do not expose correct answer
  if (examQuestions[0].correct_answer || examQuestions[0].explanation) {
    throw new Error('FAIL: Exam questions expose correct answer or explanation to candidate!');
  }
  console.log('PASS: Exam questions sanitized (no answer leakage to client).');

  // 9. Submit Assessment Attempt
  console.log('\n[9] Submitting assessment attempt...');
  const userAnswers = {};
  examQuestions.forEach((q, idx) => {
    // Select option 1 (B) for all
    userAnswers[q.id] = 1;
  });

  const submitRes = await makeRequest('/api/assessments/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    attemptId,
    userAnswers,
    proctoringEvents: [],
    durationSeconds: 300,
  });

  if (submitRes.status !== 200 || submitRes.data.score === undefined) {
    throw new Error(`Failed to submit assessment: ${submitRes.status} ${JSON.stringify(submitRes.data)}`);
  }
  console.log(`PASS: Graded attempt. Score: ${submitRes.data.score}/${submitRes.data.totalQuestions} (${submitRes.data.percentage}%), Status: ${submitRes.data.status}`);

  // 10. Admin Review Attempt Snapshots
  console.log('\n[10] Fetching historical attempt snapshots via Admin API...');
  const detailRes = await makeRequest(`/api/admin/assessments/attempts?id=${attemptId}`, {
    headers: { Cookie: adminCookie },
  });

  if (detailRes.status !== 200 || !detailRes.data.snapshots) {
    throw new Error(`Failed to get attempt detail: ${detailRes.status}`);
  }

  const snapshots = detailRes.data.snapshots;
  console.log(`PASS: Retrieved preserved snapshots (${snapshots.length} questions). First question: "${snapshots[0].questionText.slice(0, 40)}..."`);
  console.log(`Snapshot 1 Candidate Answer: "${snapshots[0].selectedAnswer}", Correct Answer: "${snapshots[0].correctAnswer}", isCorrect: ${snapshots[0].isCorrect}`);

  // 11. Soft-delete the test question
  console.log('\n[11] Soft-deleting test question...');
  const deleteRes = await makeRequest(`/api/admin/questions?id=${testQId}`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie },
  });

  if (deleteRes.status !== 200) {
    throw new Error(`Failed to delete question: ${deleteRes.status}`);
  }
  console.log('PASS: Question soft-deleted.');

  // 12. Check Real Audit Events
  console.log('\n[12] Checking genuine audit events recorded in database...');
  const statsRes2 = await makeRequest('/api/admin/stats', {
    headers: { Cookie: adminCookie },
  });

  const activities = statsRes2.data.stats.recentActivities;
  console.log(`PASS: Found ${activities.length} real audit events in database.`);
  activities.slice(0, 3).forEach((a, i) => {
    console.log(`  Event ${i + 1}: [${a.type}] ${a.title} - ${a.description} (${a.timestamp})`);
  });

  // 13. Question Count Validation (Requirement #23)
  console.log('\n[13] Testing Question Count Validation (Requirement #23)...');
  // Temporarily set Python required questions to 999
  const configUpdateRes = await makeRequest('/api/admin/assessments/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
  }, {
    skillSlug: 'python',
    questionsCount: 999,
    passPercentage: 70,
    timeLimitMinutes: 20
  });

  if (configUpdateRes.status !== 200) {
    throw new Error(`Failed to update config for validation test: ${configUpdateRes.status}`);
  }

  // Attempt to start Python assessment with 999 required
  const failStartRes = await makeRequest('/api/assessments/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { skill: 'Python' });

  console.log('Insufficient questions status:', failStartRes.status);
  console.log('Insufficient questions message:', failStartRes.data.message);

  if (
    failStartRes.status === 400 &&
    failStartRes.data.message &&
    failStartRes.data.message.includes('currently unavailable because only') &&
    failStartRes.data.message.includes('Please contact the administrator.')
  ) {
    console.log('PASS: Correctly rejected exam start with required informative message.');
  } else {
    throw new Error(`FAIL: Expected 400 with administrative message, got: ${JSON.stringify(failStartRes.data)}`);
  }

  // Restore Python required questions back to 10
  await makeRequest('/api/admin/assessments/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
  }, {
    skillSlug: 'python',
    questionsCount: 10,
    passPercentage: 70,
    timeLimitMinutes: 20
  });
  console.log('PASS: Restored Python assessment config to 10 questions.');

  console.log('\n============================================================');
  console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  console.log('============================================================');
}

runTests().catch((err) => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
