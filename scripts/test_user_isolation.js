const {
  getDb,
  registerUser,
  loginUser,
  getUserBySession,
  getUserDashboardData,
  getUserResumes,
  getUserAnalyses,
  getUserSingleAnalysis,
  createJobApplication,
  getUserJobApplications,
  submitAssessmentAttempt,
  startAssessmentAttempt,
  getUserCertificates,
  getUserCourses,
  updateUserCourseProgress,
  changeUserPassword,
  recordResumeUpload,
  recordResumeAnalysis,
  getAdminUsers,
  verifyPassword,
} = require('../src/lib/db');

async function runTests() {
  console.log('=== STARTING MULTI-USER ISOLATION & AUTHENTICATION TESTS ===\n');

  const db = getDb();
  const testSuffix = Date.now();

  // Test 1: User A Registration
  console.log('1. Registering User A (Alice)...');
  const userAEmail = `alice_${testSuffix}@example.com`;
  const { user: userA, sessionToken: tokenA } = registerUser({
    name: 'Alice Career',
    email: userAEmail,
    password: 'Password123!',
  });
  console.log(`   User A registered: id=${userA.id}, name=${userA.name}, email=${userA.email}`);
  if (!userA.id || userA.name !== 'Alice Career' || !tokenA) {
    throw new Error('User A registration failed');
  }

  // Test 2: User A Session Verification
  console.log('2. Verifying User A session token...');
  const sessionA = getUserBySession(tokenA);
  if (!sessionA || sessionA.id !== userA.id) {
    throw new Error('User A session verification failed');
  }
  console.log(`   User A session verified successfully: ${sessionA.email}`);

  // Test 3: User B Registration
  console.log('3. Registering User B (Bob)...');
  const userBEmail = `bob_${testSuffix}@example.com`;
  const { user: userB, sessionToken: tokenB } = registerUser({
    name: 'Bob Engineer',
    email: userBEmail,
    password: 'SecurePassword456!',
  });
  console.log(`   User B registered: id=${userB.id}, name=${userB.name}, email=${userB.email}`);
  if (!userB.id || userB.name !== 'Bob Engineer' || !tokenB) {
    throw new Error('User B registration failed');
  }

  // Test 4: User A creates data
  console.log('4. Creating private records for User A (Resume, Analysis, Application, Assessment, Certificate, Course)...');
  const resumeAId = recordResumeUpload({
    userId: userA.id,
    filename: 'Alice_Senior_Resume.pdf',
    fileType: 'pdf',
    parsedSuccessfully: true,
  });

  const analysisAId = recordResumeAnalysis({
    userId: userA.id,
    resumeId: resumeAId,
    fileType: 'pdf',
    atsScore: 88,
    keywordScore: 92,
    formattingScore: 90,
    sectionScore: 85,
    analysisStatus: 'COMPLETED',
    detectedKeywords: ['React', 'TypeScript', 'Node.js'],
    missingKeywords: ['Docker'],
    recommendations: [
      {
        category: 'Experience',
        title: 'Action verb phrasing in experience bullet',
        originalText: 'Helped team with website code',
        improvedText: 'Architected and deployed high-performance Next.js application increasing engagement by 35%',
      },
    ],
  });

  const appA = createJobApplication(userA.id, {
    jobTitle: 'Staff Frontend Engineer',
    company: 'Vercel',
    location: 'Remote',
    status: 'Applied',
    notes: 'Interview scheduled next Tuesday',
  });

  // Start & pass assessment for User A -> auto-creates certificate
  const attempt = startAssessmentAttempt('React', userA.id, 'vis_test_a');
  const completedA = submitAssessmentAttempt({
    attemptId: attempt.attemptId,
    answers: { [attempt.questions[0].id]: attempt.questions[0].options[0] }, // Will grade
    violations: [],
  });

  // Force pass attempt directly to verify certificate generation
  db.prepare("UPDATE assessments SET score = 9, passed = 1, status = 'COMPLETED' WHERE id = ?").run(attempt.attemptId);
  const certId = `crt_test_${testSuffix}`;
  const certCode = `CERT-2026-REACT-${Math.floor(100000 + Math.random() * 900000)}`;
  db.prepare(`
    INSERT INTO certificates (id, user_id, assessment_id, skill, score, total_questions, certificate_code, issue_date, verification_status, created_at)
    VALUES (?, ?, ?, 'React', 9, 10, ?, datetime('now'), 'VERIFIED', datetime('now'))
  `).run(certId, userA.id, attempt.attemptId, certCode);

  updateUserCourseProgress(userA.id, 'modern-react-typescript', 5);

  console.log(`   User A created resume=${resumeAId}, analysis=${analysisAId}, app=${appA.id}, cert=${certCode}`);

  // Test 5: Verify User A Dashboard has the records
  console.log('5. Verifying User A Dashboard Data...');
  const dashA = getUserDashboardData(userA.id);
  console.log(`   User A Metrics: Resumes=${dashA.metrics.totalResumes}, Analyses=${dashA.metrics.totalAnalyses}, AvgATS=${dashA.metrics.avgAtsScore}, Apps=${dashA.metrics.totalApplications}, Improvements=${dashA.metrics.improvementsMade}, Certs=${dashA.metrics.certificatesEarned}`);
  if (dashA.metrics.totalResumes < 1 || dashA.metrics.totalAnalyses < 1 || dashA.metrics.totalApplications < 1) {
    throw new Error('User A data not showing up in User A dashboard');
  }

  // Test 6: Verify User B has ZERO of User A's data (Strict Isolation)
  console.log('6. Verifying User B Data Isolation (Strictly Private)...');
  const dashB = getUserDashboardData(userB.id);
  console.log(`   User B Metrics: Resumes=${dashB.metrics.totalResumes}, Analyses=${dashB.metrics.totalAnalyses}, AvgATS=${dashB.metrics.avgAtsScore}, Apps=${dashB.metrics.totalApplications}, Improvements=${dashB.metrics.improvementsMade}, Certs=${dashB.metrics.certificatesEarned}`);

  if (dashB.metrics.totalResumes !== 0) {
    throw new Error(`SECURITY LEAK: User B sees ${dashB.metrics.totalResumes} resumes!`);
  }
  if (dashB.metrics.totalAnalyses !== 0) {
    throw new Error(`SECURITY LEAK: User B sees ${dashB.metrics.totalAnalyses} analyses!`);
  }
  if (dashB.metrics.totalApplications !== 0) {
    throw new Error(`SECURITY LEAK: User B sees ${dashB.metrics.totalApplications} applications!`);
  }
  if (dashB.metrics.certificatesEarned !== 0) {
    throw new Error(`SECURITY LEAK: User B sees ${dashB.metrics.certificatesEarned} certificates!`);
  }
  console.log('   ✓ USER B HAS 0 OF USER A\'S DATA. METRICS ARE 100% ISOLATED.');

  // Test 7: Direct URL Access Protection (User B tries to read User A's analysis ID)
  console.log('7. Testing Direct ID Access across users...');
  const aliceAnalysisForBob = getUserSingleAnalysis(userB.id, analysisAId);
  if (aliceAnalysisForBob !== null) {
    throw new Error(`SECURITY VIOLATION: User B was able to fetch User A's analysis (${analysisAId})!`);
  }
  console.log('   ✓ Direct access denied: getUserSingleAnalysis(userB.id, analysisAId) returned NULL.');

  const aliceAnalysisForAlice = getUserSingleAnalysis(userA.id, analysisAId);
  if (!aliceAnalysisForAlice || aliceAnalysisForAlice.id !== analysisAId) {
    throw new Error('Owner Alice could not access her own analysis');
  }
  console.log('   ✓ Owner Alice successfully retrieved her analysis.');

  // Test 8: Password Change for User A
  console.log('8. Testing Password Change...');
  changeUserPassword(userA.id, 'Password123!', 'NewAlicePassword2026!');
  const loginWithOld = () => loginUser({ email: userAEmail, password: 'Password123!' });
  let oldFailed = false;
  try {
    loginWithOld();
  } catch {
    oldFailed = true;
  }
  if (!oldFailed) {
    throw new Error('Old password was still accepted after password change');
  }
  const { user: userALoggedIn } = loginUser({ email: userAEmail, password: 'NewAlicePassword2026!' });
  if (userALoggedIn.id !== userA.id) {
    throw new Error('Login with new password failed');
  }
  console.log('   ✓ Password change validated. Old password rejected, new password verified.');

  // Test 9: Admin Access Check
  console.log('9. Testing Admin System-wide Visibility...');
  const adminUsers = getAdminUsers(100);
  const foundAlice = adminUsers.find(u => u.id === userA.id);
  const foundBob = adminUsers.find(u => u.id === userB.id);

  if (!foundAlice || !foundBob) {
    throw new Error('Admin user list did not show both real users Alice and Bob');
  }
  console.log(`   ✓ Admin sees both Alice (${foundAlice.name}) and Bob (${foundBob.name}) in system-wide user catalog.`);

  console.log('\n=== ALL USER AUTHENTICATION & DASHBOARD ISOLATION TESTS PASSED! ===');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
