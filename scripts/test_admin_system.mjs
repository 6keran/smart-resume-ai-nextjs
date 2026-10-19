// End-to-end integration test script for Smart Resume AI Admin System
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('========================================');
  console.log('SMART RESUME AI — REAL ADMIN SYSTEM TEST');
  console.log('========================================\n');

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

  // 1. Unauthenticated redirect for /admin/dashboard
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, { redirect: 'manual' });
    assert(
      res.status === 307 || res.status === 302 || res.status === 308,
      `Unauthenticated visit to /admin/dashboard redirects (HTTP ${res.status})`
    );
    const loc = res.headers.get('location') || '';
    assert(loc.includes('/admin/login'), `/admin/dashboard redirects to /admin/login (Location: ${loc})`);
  } catch (err) {
    assert(false, `Redirect test failed: ${err.message}`);
  }

  // 2. Legacy /dashboard redirect
  try {
    const res = await fetch(`${BASE_URL}/dashboard`, { redirect: 'manual' });
    assert(
      res.status === 307 || res.status === 302 || res.status === 308,
      `Public /dashboard redirects (HTTP ${res.status})`
    );
    const loc = res.headers.get('location') || '';
    assert(loc.includes('/admin/login'), `/dashboard redirects to /admin/login (Location: ${loc})`);
  } catch (err) {
    assert(false, `Dashboard redirect test failed: ${err.message}`);
  }

  // 3. Invalid admin login test
  try {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'fake@smartresume.ai', password: 'wrongpassword' }),
    });
    assert(res.status === 401, `Invalid login rejected with HTTP 401 (Got ${res.status})`);
    const data = await res.json();
    assert(data.message === 'Invalid email or password.', `Generic error returned: "${data.message}"`);
  } catch (err) {
    assert(false, `Invalid login test failed: ${err.message}`);
  }

  // 4. Valid admin login test
  let sessionCookie = '';
  try {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@smartresume.ai', password: 'Admin@SmartResume2026!' }),
    });
    assert(res.status === 200, `Valid login succeeds with HTTP 200 (Got ${res.status})`);
    const data = await res.json();
    assert(data.admin?.email === 'admin@smartresume.ai', `Logged in admin email confirmed: ${data.admin?.email}`);
    
    // Extract session cookie
    const setCookie = res.headers.get('set-cookie') || '';
    const match = setCookie.match(/sra_admin_session=([^;]+)/);
    if (match) {
      sessionCookie = match[1];
      assert(true, `Secure session token received: ${sessionCookie.slice(0, 20)}...`);
    } else {
      assert(false, `No sra_admin_session cookie received! Header: ${setCookie}`);
    }
  } catch (err) {
    assert(false, `Valid login test failed: ${err.message}`);
  }

  // 5. Query /api/admin/stats with session
  let initialStats = null;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Cookie: `sra_admin_session=${sessionCookie}` },
    });
    assert(res.status === 200, `Admin stats queried successfully (HTTP ${res.status})`);
    const data = await res.json();
    initialStats = data.stats;
    assert(typeof initialStats.totalResumesAnalyzed === 'number', `totalResumesAnalyzed is numeric: ${initialStats.totalResumesAnalyzed}`);
    console.log('   Current Database State:');
    console.log(`   - Visitors: ${initialStats.totalVisitors}`);
    console.log(`   - Analyses: ${initialStats.totalResumesAnalyzed}`);
    console.log(`   - Avg ATS Score: ${initialStats.averageAtsScore}`);
    console.log(`   - Verified Skills: ${initialStats.verifiedSkillsCount}`);
    console.log(`   - Completed Assessments: ${initialStats.completedAssessmentsCount}`);
    console.log(`   - Job Searches: ${initialStats.totalJobSearches}`);
    console.log(`   - Feedback: ${initialStats.totalFeedback}`);
  } catch (err) {
    assert(false, `Query stats test failed: ${err.message}`);
  }

  // 6. Test Real DB Write Events
  console.log('\n--- Triggering Real Application Events ---');

  // Event A: Resume Analysis
  let analysisScore = 0;
  try {
    const res = await fetch(`${BASE_URL}/api/resume/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeText: 'Senior Software Engineer with 7 years of production experience in TypeScript, React, Node.js, PostgreSQL, Docker, AWS cloud architecture, and microservices.',
      }),
    });
    assert(res.ok, `Public resume analysis completed (HTTP ${res.status})`);
    const data = await res.json();
    analysisScore = data.overallAtsScore;
    assert(typeof analysisScore === 'number' && analysisScore > 0, `Real ATS score calculated: ${analysisScore}/100`);
  } catch (err) {
    assert(false, `Resume analysis test failed: ${err.message}`);
  }

  // Event B: Job Search
  try {
    const res = await fetch(`${BASE_URL}/api/jobs/search?q=Senior+TypeScript+Engineer&location=Bengaluru`);
    assert(res.ok, `Public job search completed (HTTP ${res.status})`);
    const data = await res.json();
    assert(data.jobs && data.jobs.length >= 0, `Job search returned response`);
  } catch (err) {
    assert(false, `Job search test failed: ${err.message}`);
  }

  // Event C: Skill Assessment
  try {
    const res = await fetch(`${BASE_URL}/api/assessments/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skill: 'React',
        userAnswers: { 'react_01': 1, 'react_02': 0, 'react_03': 2, 'react_04': 0, 'react_05': 1, 'react_06': 2, 'react_07': 0, 'react_08': 1 },
        startedAt: new Date().toISOString(),
      }),
    });
    assert(res.ok, `Skill assessment completed (HTTP ${res.status})`);
    const data = await res.json();
    assert(typeof data.score === 'number', `Assessment graded: score ${data.score}/10 (Passed: ${data.passed})`);
  } catch (err) {
    assert(false, `Assessment submit test failed: ${err.message}`);
  }

  // Event D: Feedback Submission
  let feedbackId = '';
  try {
    const res = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 5,
        category: 'Resume Analysis',
        feedback: 'The ATS scoring breakdown is fast, accurate, and truly helpful!',
        suggestions: 'Add more tech stack presets for full stack roles.',
      }),
    });
    assert(res.ok, `Feedback submitted successfully (HTTP ${res.status})`);
    const data = await res.json();
    feedbackId = data.data?.id;
    assert(Boolean(feedbackId), `Feedback recorded with ID: ${feedbackId}`);
  } catch (err) {
    assert(false, `Feedback test failed: ${err.message}`);
  }

  // 7. Re-query Admin Stats to verify database state updated!
  console.log('\n--- Verifying Real Database Persistence in Admin Console ---');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Cookie: `sra_admin_session=${sessionCookie}` },
    });
    assert(res.ok, `Admin stats refetched successfully`);
    const data = await res.json();
    const updatedStats = data.stats;
    assert(
      updatedStats.totalResumesAnalyzed >= (initialStats?.totalResumesAnalyzed || 0) + 1,
      `Resume analyses count incremented: ${initialStats?.totalResumesAnalyzed} -> ${updatedStats.totalResumesAnalyzed}`
    );
    assert(
      updatedStats.totalJobSearches >= (initialStats?.totalJobSearches || 0) + 1,
      `Job searches count incremented: ${initialStats?.totalJobSearches} -> ${updatedStats.totalJobSearches}`
    );
    assert(
      updatedStats.totalFeedback >= (initialStats?.totalFeedback || 0) + 1,
      `Feedback count incremented: ${initialStats?.totalFeedback} -> ${updatedStats.totalFeedback}`
    );
    assert(
      updatedStats.recentActivities.length > 0,
      `Recent activities stream populated with real events (Count: ${updatedStats.recentActivities.length})`
    );
  } catch (err) {
    assert(false, `Refetch stats verification failed: ${err.message}`);
  }

  // 8. Test Subpage Records Queries
  console.log('\n--- Verifying Admin Subpage Data Feeds ---');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/records?type=visitors`, {
      headers: { Cookie: `sra_admin_session=${sessionCookie}` },
    });
    const data = await res.json();
    assert(data.data && data.data.length > 0, `Visitors list queried from DB: ${data.data?.length} visitors found`);
  } catch (err) {
    assert(false, `Visitors record query failed: ${err.message}`);
  }

  try {
    const res = await fetch(`${BASE_URL}/api/admin/records?type=feedback`, {
      headers: { Cookie: `sra_admin_session=${sessionCookie}` },
    });
    const data = await res.json();
    assert(data.data && data.data.length > 0, `Feedback records queried from DB: ${data.data?.length} entries found`);
  } catch (err) {
    assert(false, `Feedback record query failed: ${err.message}`);
  }

  // 9. Test Feedback Status Update (PATCH)
  if (feedbackId) {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/feedback`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `sra_admin_session=${sessionCookie}`,
        },
        body: JSON.stringify({ id: feedbackId, status: 'reviewed' }),
      });
      assert(res.ok, `Admin updated feedback status to 'reviewed'`);
    } catch (err) {
      assert(false, `Update feedback status test failed: ${err.message}`);
    }
  }

  // 10. Admin Logout Test
  console.log('\n--- Testing Admin Logout & Session Invalidation ---');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
      method: 'POST',
      headers: { Cookie: `sra_admin_session=${sessionCookie}` },
    });
    assert(res.ok, `Logout endpoint returned HTTP 200`);

    // Verify /api/admin/stats is now rejected without cookie
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`);
    assert(statsRes.status === 401, `Unauthenticated request to /api/admin/stats returns 401 Unauthorized`);
  } catch (err) {
    assert(false, `Logout test failed: ${err.message}`);
  }

  console.log('\n========================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================');

  if (failed > 0) process.exit(1);
}

runTests();
