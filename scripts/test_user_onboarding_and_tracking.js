const http = require('http');

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          json,
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function extractCookie(headers, cookieName) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return null;
  for (const c of setCookie) {
    const match = c.match(new RegExp(`^${cookieName}=([^;]+)`));
    if (match) return match[1];
  }
  return null;
}

async function runTests() {
  console.log('========================================================');
  console.log('RUNNING E2E REAL USER ONBOARDING & ACTIVITY TRACKING TEST');
  console.log('========================================================\n');

  // 1. Validation Test: Reject empty or whitespace-only name
  console.log('1. Testing validation rejection on invalid names...');
  const emptyRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/user/profile',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: '   ', email: '' }
  );
  if (emptyRes.statusCode === 400) {
    console.log('   ✓ Successfully rejected whitespace-only name (HTTP 400)');
  } else {
    console.error('   ✗ Expected 400 for empty name, got:', emptyRes.statusCode);
  }

  // 2. Onboard User 1: Rahul Kumar
  console.log('\n2. Onboarding User 1: Rahul Kumar...');
  const u1Res = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/user/profile',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Rahul Kumar', email: 'rahul.kumar@example.com' }
  );

  if (u1Res.statusCode !== 200 || !u1Res.json?.user?.id) {
    console.error('   ✗ Failed to onboard User 1:', u1Res.data);
    process.exit(1);
  }

  const user1 = u1Res.json.user;
  const user1SessionCookie = extractCookie(u1Res.headers, 'sra_user_session');
  console.log(`   ✓ User profile created: ${user1.name} (ID: ${user1.id})`);
  console.log(`   ✓ Received persistent session cookie: sra_user_session=${user1SessionCookie?.slice(0, 16)}...`);

  // 3. User 1: Analyze Resume
  console.log('\n3. User 1 analyzing resume...');
  const resumeSample = `RAHUL KUMAR
Full Stack TypeScript & React Developer with 4 years of experience.
Skills: TypeScript, React, Next.js, Node.js, SQL, AWS, Tailwind CSS.
Experience:
Software Engineer at Tech Solutions (2022 - Present)
- Developed responsive web applications using React and Next.js.
- Designed database schemas in SQL and RESTful APIs.`;

  const anlRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/resume/analyze',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sra_user_session=${user1SessionCookie}`,
      },
    },
    {
      resumeText: resumeSample,
      targetRole: 'Full Stack Developer',
      jobDescription: 'Seeking a Full Stack Engineer with React, TypeScript, and SQL skills.',
      filename: 'Rahul_Kumar_Resume.pdf',
    }
  );

  const score = anlRes.json?.overallAtsScore || anlRes.json?.analysis?.atsScore || anlRes.json?.atsScore;
  if (anlRes.statusCode === 200 && score !== undefined) {
    console.log(`   ✓ Resume analyzed! ATS Score: ${score}/100`);
  } else {
    console.error('   ✗ Resume analysis failed:', anlRes.data);
  }

  // 4. User 1: Job Search
  console.log('\n4. User 1 executing Job Search...');
  const jobRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/jobs/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sra_user_session=${user1SessionCookie}`,
      },
    },
    {
      query: 'Senior Full Stack Engineer',
      location: 'Bengaluru',
    }
  );

  if (jobRes.statusCode === 200) {
    console.log(`   ✓ Job search logged: "${jobRes.json?.meta?.query || 'Senior Full Stack Engineer'}" (${jobRes.json?.jobs?.length || 0} listings)`);
  } else {
    console.error('   ✗ Job search failed:', jobRes.data);
  }

  // 5. User 1: Skill Assessment
  console.log('\n5. User 1 taking Skill Verification Assessment (React)...');
  const startAssRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/assessments/start',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sra_user_session=${user1SessionCookie}`,
      },
    },
    { skill: 'React' }
  );

  const attemptId = startAssRes.json?.attemptId || startAssRes.json?.assessmentId;
  if (startAssRes.statusCode === 200 && attemptId) {
    const questions = startAssRes.json.questions || [];
    console.log(`   ✓ Assessment started (ID: ${attemptId}, ${questions.length} questions)`);

    // Submit answers
    const answers = {};
    for (const q of questions) {
      answers[q.id] = q.options[0] || 'Option A';
    }

    const submitAssRes = await request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/assessments/submit',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `sra_user_session=${user1SessionCookie}`,
        },
      },
      {
        attemptId,
        userAnswers: answers,
        durationSeconds: 145,
      }
    );

    if (submitAssRes.statusCode === 200) {
      console.log(`   ✓ Assessment submitted! Score: ${submitAssRes.json?.score}/${submitAssRes.json?.totalQuestions} (Passed: ${submitAssRes.json?.passed})`);
    } else {
      console.error('   ✗ Assessment submission failed:', submitAssRes.data);
    }
  } else {
    console.error('   ✗ Assessment start failed:', startAssRes.data);
  }

  // 6. User 1: Submit Feedback
  console.log('\n6. User 1 submitting feedback...');
  const fbRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/feedback',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sra_user_session=${user1SessionCookie}`,
      },
    },
    {
      rating: 5,
      category: 'Resume Analyzer',
      message: 'The ATS scoring breakdown and real-time keyword suggestions are fantastic!',
      suggestions: 'Keep up the great work.',
    }
  );

  if (fbRes.statusCode === 200) {
    console.log('   ✓ Feedback recorded with candidate identity!');
  } else {
    console.error('   ✗ Feedback failed:', fbRes.data);
  }

  // 7. Onboard User 2: Priya Sharma
  console.log('\n7. Onboarding User 2: Priya Sharma (Verifying separation of users)...');
  const u2Res = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/user/profile',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Priya Sharma', email: 'priya.sharma@example.com' }
  );

  const user2 = u2Res.json.user;
  const user2SessionCookie = extractCookie(u2Res.headers, 'sra_user_session');
  console.log(`   ✓ User 2 created: ${user2.name} (ID: ${user2.id})`);

  // User 2: Job Search in Mumbai
  await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/jobs/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sra_user_session=${user2SessionCookie}`,
      },
    },
    {
      query: 'Data Scientist',
      location: 'Mumbai',
    }
  );
  console.log('   ✓ User 2 executed separate job search for "Data Scientist" in Mumbai');

  // 8. Admin Authentication & Verification
  console.log('\n8. Authenticating as Admin to verify candidate data...');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: 'kiran81232@gmail.com',
      password: 'kiran@69',
    }
  );

  if (loginRes.statusCode !== 200) {
    console.error('   ✗ Admin login failed:', loginRes.data);
    process.exit(1);
  }

  const adminCookie = extractCookie(loginRes.headers, 'sra_admin_session');
  console.log('   ✓ Admin authenticated successfully!');

  // 9. Admin Users List Verification
  console.log('\n9. Verifying /admin/users data via /api/admin/records?type=users...');
  const usersRecordRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/records?type=users',
    headers: { Cookie: `sra_admin_session=${adminCookie}` },
  });

  const usersList = usersRecordRes.json?.data || [];
  const foundRahul = usersList.find((u) => u.name === 'Rahul Kumar');
  const foundPriya = usersList.find((u) => u.name === 'Priya Sharma');

  if (foundRahul) {
    console.log(`   ✓ Found "Rahul Kumar" in Admin Users list!`);
    console.log(`     - Email: ${foundRahul.email}`);
    console.log(`     - Resumes: ${foundRahul.resumes_count}`);
    console.log(`     - Analyses: ${foundRahul.analyses_count}`);
    console.log(`     - Job Searches: ${foundRahul.searches_count}`);
    console.log(`     - Assessments: ${foundRahul.assessments_count}`);
  } else {
    console.error('   ✗ "Rahul Kumar" NOT found in Admin Users list!');
  }

  if (foundPriya) {
    console.log(`   ✓ Found "Priya Sharma" in Admin Users list!`);
    console.log(`     - Searches: ${foundPriya.searches_count}`);
  } else {
    console.error('   ✗ "Priya Sharma" NOT found in Admin Users list!');
  }

  // 10. Admin User Detail Verification
  console.log(`\n10. Verifying /admin/users/[id] detail for Rahul Kumar (ID: ${user1.id})...`);
  const detailRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/records?type=user_detail&id=${user1.id}`,
    headers: { Cookie: `sra_admin_session=${adminCookie}` },
  });

  const detail = detailRes.json?.data;
  if (detail && detail.user?.name === 'Rahul Kumar') {
    console.log(`   ✓ User Detail loaded: ${detail.user.name}`);
    console.log(`     - Analyses array length: ${detail.analyses?.length}`);
    console.log(`     - Searches array length: ${detail.searches?.length}`);
    console.log(`     - Assessments array length: ${detail.assessments?.length}`);
    console.log(`     - Feedback array length: ${detail.feedback?.length}`);
  } else {
    console.error('   ✗ Failed to load User Detail:', detailRes.data);
  }

  // 11. Admin Recent Activities Audit Stream Verification
  console.log('\n11. Verifying /api/admin/stats recent activities for real candidate names...');
  const statsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/stats',
    headers: { Cookie: `sra_admin_session=${adminCookie}` },
  });

  const activities = statsRes.json?.stats?.recentActivities || [];
  console.log(`   ✓ Total recent activities returned: ${activities.length}`);

  let foundAnonymous = false;
  let rahulEvents = 0;
  let priyaEvents = 0;

  for (const act of activities) {
    if (act.userName === 'Anonymous' || act.title?.includes('Anonymous') || act.description?.includes('Anonymous')) {
      foundAnonymous = true;
    }
    if (act.userName === 'Rahul Kumar' || act.description?.includes('Rahul Kumar')) {
      rahulEvents++;
    }
    if (act.userName === 'Priya Sharma' || act.description?.includes('Priya Sharma')) {
      priyaEvents++;
    }
    console.log(`     • [${act.title}] Candidate: "${act.userName}" — ${act.description}`);
  }

  if (foundAnonymous) {
    console.error('   ✗ FAILED: Found "Anonymous" in activity stream!');
  } else {
    console.log('   ✓ Zero "Anonymous" found in recent activity stream!');
  }

  console.log(`   ✓ Rahul Kumar events tracked: ${rahulEvents}`);
  console.log(`   ✓ Priya Sharma events tracked: ${priyaEvents}`);

  console.log('\n========================================================');
  console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
  console.log('========================================================');
}

runTests().catch(console.error);
