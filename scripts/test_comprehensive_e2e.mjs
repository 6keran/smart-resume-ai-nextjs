import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function runComprehensiveVerification() {
  console.log('========================================================');
  console.log('🧪 RUNNING COMPREHENSIVE E2E VERIFICATION SUITE');
  console.log('========================================================\n');

  // STEP 1: Register and login a test user
  const ts = Date.now();
  const testUser = {
    fullName: `E2E Candidate ${ts}`,
    email: `e2e_${ts}@testcompany.org`,
    password: 'SafePassword123!',
    confirmPassword: 'SafePassword123!',
  };

  console.log('▶ STEP 1: Candidate Registration and Login');
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });

  const regData = await regRes.json();
  assert.ok([200, 201].includes(regRes.status), `Registration failed: ${JSON.stringify(regData)}`);
  console.log(`  ✓ Registration successful for ${testUser.email}`);

  // Extract session cookie from registration
  const rawRegCookies = regRes.headers.getSetCookie?.() || [regRes.headers.get('set-cookie') || ''];
  let userCookie = '';
  for (const c of rawRegCookies) {
    if (c.includes('sra_user_session=')) {
      userCookie = c.split(';')[0];
    }
  }
  assert.ok(userCookie, 'sra_user_session cookie was not returned on registration');
  console.log(`  ✓ Extracted session cookie: ${userCookie.slice(0, 30)}...`);

  // STEP 2: Verify Protected Pages with User Session Cookie
  console.log('\n▶ STEP 2: Authenticated Navigation to Core Pages');
  const protectedPages = [
    '/',
    '/builder',
    '/analyzer',
    '/dashboard',
    '/dashboard/resumes',
    '/dashboard/analyses',
    '/dashboard/applications',
    '/dashboard/skills',
    '/dashboard/profile',
    '/improver',
    '/job-match',
    '/jobs',
    '/skills',
    '/feedback',
    '/guidance',
  ];

  for (const pagePath of protectedPages) {
    const res = await fetch(`${BASE_URL}${pagePath}`, {
      headers: { Cookie: userCookie },
    });
    assert.strictEqual(
      res.status,
      200,
      `Expected 200 OK for authenticated ${pagePath}, got ${res.status}`
    );
    const html = await res.text();
    assert.ok(html.length > 500, `Page content for ${pagePath} was suspiciously small (${html.length} bytes)`);
    console.log(`  ✓ GET ${pagePath} => Status 200 OK (${html.length} bytes)`);
  }

  // STEP 3: Test Resume Builder API & Data Flow
  console.log('\n▶ STEP 3: Testing Resume Analyzer API with Candidate Session');
  const sampleResumeText = `
John Doe
Senior Full Stack Engineer
john.doe@example.com | +1 555-0199 | San Francisco, CA | linkedin.com/in/johndoe

SUMMARY
Experienced software engineer with 7+ years developing scalable React, Next.js, Node.js, and TypeScript applications. Demonstrated track record improving system throughput by 40% and leading high-velocity engineering teams.

EXPERIENCE
Lead Software Engineer | Acme Corp | 2021 - Present
- Architected modern web applications using Next.js 14, React 18, and TypeScript.
- Designed distributed SQLite and PostgreSQL databases with high-throughput query optimization.
- Mentored junior engineers and reduced CI/CD deployment cycle times by 60%.

Senior Frontend Developer | Tech Innovations | 2018 - 2021
- Built responsive user interfaces and dashboards using React, Redux, and Tailwind CSS.
- Optimized web vitals achieving 99+ Lighthouse performance scores.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2014 - 2018

SKILLS
JavaScript, TypeScript, React, Next.js, Node.js, Express, HTML5, CSS3, Tailwind CSS, SQLite, PostgreSQL, Git, Docker, Jest, REST APIs, GraphQL
  `.trim();

  const analyzeRes = await fetch(`${BASE_URL}/api/resume/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userCookie,
    },
    body: JSON.stringify({ resumeText: sampleResumeText, targetRole: 'Senior Full Stack Engineer' }),
  });

  assert.strictEqual(analyzeRes.status, 200, `Resume analysis failed with status ${analyzeRes.status}`);
  const analyzeData = await analyzeRes.json();
  assert.ok(typeof analyzeData.overallAtsScore === 'number' && analyzeData.overallAtsScore > 0, 'Overall ATS score should be > 0');
  assert.ok(Array.isArray(analyzeData.detectedKeywords), 'Detected keywords should be an array');
  console.log(`  ✓ Resume analyzed: ATS Score = ${analyzeData.overallAtsScore}/100, Detected Keywords = ${analyzeData.detectedKeywords.length}`);

  // STEP 4: Test Resume Improver API
  console.log('\n▶ STEP 4: Testing Resume Improver API');
  const improveRes = await fetch(`${BASE_URL}/api/resume/improve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userCookie,
    },
    body: JSON.stringify({
      sectionName: 'experience',
      originalContent: 'Worked on fixing bugs and writing code for the website in Next.js and TypeScript.',
    }),
  });

  assert.strictEqual(improveRes.status, 200, `Resume improve failed with status ${improveRes.status}`);
  const improveData = await improveRes.json();
  assert.ok(improveData.improvedContent, 'Should return improvedContent');
  console.log(`  ✓ Resume Improver returned: "${improveData.improvedContent.slice(0, 60)}..."`);

  // STEP 5: Test Job Search and Job Match API
  console.log('\n▶ STEP 5: Testing Job Search & Job Matching APIs');
  const jobsRes = await fetch(`${BASE_URL}/api/jobs/search?q=Frontend&location=Remote&limit=5`, {
    headers: { Cookie: userCookie },
  });
  assert.strictEqual(jobsRes.status, 200, `Job search failed with status ${jobsRes.status}`);
  const jobsData = await jobsRes.json();
  console.log(`  ✓ Job search returned status 200, jobs array: count = ${jobsData.jobs?.length ?? 0}`);

  const matchRes = await fetch(`${BASE_URL}/api/job/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userCookie,
    },
    body: JSON.stringify({
      resumeText: sampleResumeText,
      jobDescription: 'Looking for a Senior Frontend Developer skilled in React, Next.js, and TypeScript.',
    }),
  });
  assert.strictEqual(matchRes.status, 200, `Job match failed with status ${matchRes.status}`);
  const matchData = await matchRes.json();
  console.log(`  ✓ Job match returned score: ${matchData.matchScore || matchData.overallScore || 'Calculated'}`);

  // STEP 6: Test Admin Login & Protected Admin APIs
  console.log('\n▶ STEP 6: Testing Admin Authentication & Dashboard');
  const adminLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'kiran81232@gmail.com', password: 'kiran@69' }),
  });
  assert.strictEqual(adminLoginRes.status, 200, `Admin login failed: ${adminLoginRes.status}`);
  const adminLoginData = await adminLoginRes.json();
  assert.strictEqual(adminLoginData.admin.role, 'ADMIN', 'Admin role mismatch');

  const rawAdminCookies = adminLoginRes.headers.getSetCookie?.() || [adminLoginRes.headers.get('set-cookie') || ''];
  let adminCookie = '';
  for (const c of rawAdminCookies) {
    if (c.includes('sra_admin_session=')) {
      adminCookie = c.split(';')[0];
    }
  }
  assert.ok(adminCookie, 'sra_admin_session cookie was not returned');
  console.log(`  ✓ Admin login successful. Cookie: ${adminCookie.slice(0, 30)}...`);

  // Admin stats endpoint
  const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: adminCookie },
  });
  assert.strictEqual(statsRes.status, 200, `Admin stats failed with status ${statsRes.status}`);
  const statsData = await statsRes.json();
  assert.ok(statsData.stats && typeof statsData.stats.totalVisitors === 'number', 'Admin stats should include totalVisitors');
  console.log(`  ✓ Admin stats returned totalVisitors = ${statsData.stats.totalVisitors}, totalResumesAnalyzed = ${statsData.stats.totalResumesAnalyzed}`);

  // Admin dashboard HTML page
  const adminDashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Cookie: adminCookie },
  });
  assert.strictEqual(adminDashRes.status, 200, `Admin dashboard page returned status ${adminDashRes.status}`);
  console.log('  ✓ Admin dashboard HTML page rendered successfully (200 OK)');

  console.log('\n========================================================');
  console.log('🎉 ALL COMPREHENSIVE E2E VERIFICATIONS PASSED 100%!');
  console.log('========================================================');
}

runComprehensiveVerification().catch((err) => {
  console.error('\n❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
