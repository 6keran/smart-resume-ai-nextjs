const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING JOB SEARCH REBUILD VERIFICATION ===\n');
  let passed = 0;
  let failed = 0;

  // TEST 1: GET /jobs Page SSR
  try {
    console.log('[Test 1] Testing /jobs page rendering...');
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/jobs',
      method: 'GET',
    });

    if (res.status === 200 && res.body.includes('Find your next opportunity')) {
      console.log('  ✓ /jobs responded 200 and rendered "Find your next opportunity"');
      passed++;
    } else {
      console.error('  ✗ /jobs returned status:', res.status);
      failed++;
    }
  } catch (err) {
    console.error('  ✗ /jobs test error:', err.message);
    failed++;
  }

  // TEST 2: GET /api/jobs/search endpoint
  try {
    console.log('\n[Test 2] Testing GET /api/jobs/search endpoint...');
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/jobs/search?q=React+Developer&location=Bengaluru&radius=40',
      method: 'GET',
    });

    if (res.status === 200) {
      const data = JSON.parse(res.body);
      console.log('  ✓ API returned status 200');
      console.log('  ✓ Search location:', data.searchLocation);
      console.log('  ✓ Configured providers:', data.configuredProviders);
      console.log('  ✓ Is configured flag:', data.isConfigured);
      console.log('  ✓ Returned jobs count:', data.jobs.length);
      passed++;
    } else {
      console.error('  ✗ API returned status:', res.status, res.body);
      failed++;
    }
  } catch (err) {
    console.error('  ✗ API test error:', err.message);
    failed++;
  }

  // TEST 3: POST /api/jobs/search with Resume Personalization Context
  try {
    console.log('\n[Test 3] Testing POST /api/jobs/search with candidate resume skills...');
    const payload = JSON.stringify({
      keywords: 'Full Stack Engineer',
      location: 'Bengaluru',
      radiusKm: 40,
      workplaceType: 'Hybrid',
      resumeSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'],
      resumeHeadline: 'Senior Full Stack Engineer',
      resumeYearsExp: 6,
    });

    const res = await request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/jobs/search',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      payload
    );

    if (res.status === 200) {
      const data = JSON.parse(res.body);
      console.log('  ✓ POST API returned status 200');
      console.log('  ✓ Handled resume skills without errors');
      passed++;
    } else {
      console.error('  ✗ POST API returned status:', res.status, res.body);
      failed++;
    }
  } catch (err) {
    console.error('  ✗ POST API test error:', err.message);
    failed++;
  }

  // TEST 4: Unit Testing Deduplication and Normalization Logic
  try {
    console.log('\n[Test 4] Testing deduplication & normalization algorithms...');
    const { deduplicateJobs } = require('./src/lib/jobs/dedupe');
    const { cleanHtml, extractSkills, detectWorkplaceType } = require('./src/lib/jobs/normalize');

    // Test cleanHtml
    const dirty = '<strong>Senior React Developer</strong> &amp; Cloud Specialist';
    const cleaned = cleanHtml(dirty);
    if (cleaned === 'Senior React Developer & Cloud Specialist') {
      console.log('  ✓ cleanHtml correctly stripped tags and decoded &amp;');
    } else {
      throw new Error(`cleanHtml failed: ${cleaned}`);
    }

    // Test extractSkills
    const text = 'Looking for an experienced engineer in Python, React, Docker, and AWS Kubernetes.';
    const extracted = extractSkills('', text);
    if (extracted.includes('Python') && extracted.includes('React') && extracted.includes('Docker') && extracted.includes('AWS') && extracted.includes('Kubernetes')) {
      console.log('  ✓ extractSkills successfully identified:', extracted.join(', '));
    } else {
      throw new Error(`extractSkills failed: ${extracted.join(', ')}`);
    }

    // Test detectWorkplaceType
    if (detectWorkplaceType('React Dev (Remote)', '', '') === 'Remote' &&
        detectWorkplaceType('DevOps', 'Bengaluru (Hybrid)', '') === 'Hybrid' &&
        detectWorkplaceType('Software Engineer', 'Mumbai', 'Office based') === 'On-site') {
      console.log('  ✓ detectWorkplaceType correctly identified Remote, Hybrid, and On-site');
    } else {
      throw new Error('detectWorkplaceType failed');
    }

    // Test deduplication
    const jobA = {
      id: 'job_1',
      source: 'Adzuna',
      sourceJobId: '101',
      title: 'Senior Frontend Engineer (React)',
      company: 'TechCorp Solutions Pvt Ltd',
      location: 'Bengaluru, India',
      description: 'Short description.',
      snippet: 'Short snippet.',
      employmentType: 'Full-time',
      experienceLevel: 'Senior',
      workplaceType: 'Hybrid',
      postedAt: '2024-03-01T00:00:00Z',
      applyUrl: 'https://careers.techcorp.com/apply/1',
      sourceUrl: 'https://careers.techcorp.com/apply/1',
      skills: ['React'],
      remote: false,
      hybrid: true,
      onsite: false,
    };

    const jobB = {
      id: 'job_2',
      source: 'Jooble',
      sourceJobId: '202',
      title: 'Senior Frontend Engineer',
      company: 'TechCorp Solutions',
      location: 'Bangalore',
      description: 'Longer comprehensive description with complete salary details.',
      snippet: 'Longer snippet.',
      salaryMin: 1800000,
      salaryMax: 2400000,
      employmentType: 'Full-time',
      experienceLevel: 'Senior',
      workplaceType: 'Hybrid',
      postedAt: '2024-03-01T00:00:00Z',
      applyUrl: 'https://jooble.org/job/202',
      sourceUrl: 'https://jooble.org/job/202',
      skills: ['React', 'TypeScript'],
      remote: false,
      hybrid: true,
      onsite: false,
    };

    const deduplicated = deduplicateJobs([jobA, jobB]);
    if (deduplicated.length === 1 && deduplicated[0].salaryMin === 1800000) {
      console.log('  ✓ deduplicateJobs merged duplicate listings across Adzuna and Jooble and retained highest fidelity data');
      passed++;
    } else {
      throw new Error(`Deduplication failed: got ${deduplicated.length} items`);
    }
  } catch (err) {
    console.error('  ✗ Test 4 error:', err.message);
    failed++;
  }

  // TEST 5: Resume Personalization & Transparent Ranking Logic
  try {
    console.log('\n[Test 5] Testing transparent Resume Match scoring algorithm...');
    const { rankJobsWithResume } = require('./src/lib/jobs/ranking');

    const sampleJob = {
      id: 'test_job_1',
      source: 'Adzuna',
      sourceJobId: '1',
      title: 'Senior React & Node.js Engineer',
      company: 'Innovate Labs',
      location: 'Bengaluru',
      description: 'We are seeking a Senior Engineer proficient in React, TypeScript, Node.js, GraphQL, and AWS.',
      snippet: 'Proficient in React, TypeScript, Node.js, GraphQL, and AWS.',
      employmentType: 'Full-time',
      experienceLevel: 'Senior',
      workplaceType: 'Remote',
      postedAt: '2024-03-01T00:00:00Z',
      applyUrl: 'https://example.com/apply',
      sourceUrl: 'https://example.com/apply',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
      remote: true,
      hybrid: false,
      onsite: false,
    };

    // Candidate has React, TypeScript, Node.js, but NOT GraphQL, AWS
    const ranked = rankJobsWithResume([sampleJob], {
      resumeSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'SQL'],
      resumeHeadline: 'Senior Full Stack Engineer',
      resumeYearsExp: 5,
    });

    const evaluated = ranked[0];
    console.log('  ✓ Resume Match Score:', evaluated.matchScore);
    console.log('  ✓ Matched Skills:', evaluated.matchedSkills);
    console.log('  ✓ Missing Skills (Gaps):', evaluated.missingSkills);
    console.log('  ✓ Match Explanation:', evaluated.matchReason);

    if (
      evaluated.matchScore &&
      evaluated.matchScore >= 70 &&
      evaluated.matchedSkills.includes('React') &&
      evaluated.matchedSkills.includes('TypeScript') &&
      evaluated.matchedSkills.includes('Node.js') &&
      (evaluated.missingSkills.includes('GraphQL') || evaluated.partialSkills.includes('GraphQL')) &&
      evaluated.missingSkills.includes('AWS') &&
      !evaluated.matchedSkills.includes('GraphQL') // Verified no invented skills!
    ) {
      console.log('  ✓ Transparent match score strictly verifies candidate skills vs job requirements');
      passed++;
    } else {
      throw new Error('Ranking logic failed validation checks');
    }
  } catch (err) {
    console.error('  ✗ Test 5 error:', err.message);
    failed++;
  }

  // TEST 6: In-Memory TTL Cache
  try {
    console.log('\n[Test 6] Testing in-memory search cache TTL and key generation...');
    const { jobSearchCache } = require('./src/lib/jobs/cache');

    const mockJobs = [{ id: '1', title: 'Test Job', source: 'Adzuna' }];
    jobSearchCache.set('Adzuna', mockJobs, 'react', 'bengaluru', 40, 1);

    const hit = jobSearchCache.get('Adzuna', 'react', 'bengaluru', 40, 1);
    const miss = jobSearchCache.get('Adzuna', 'python', 'bengaluru', 40, 1);

    if (hit && hit.length === 1 && miss === null) {
      console.log('  ✓ Cache hit and miss verified correctly');
      passed++;
    } else {
      throw new Error('Cache verification failed');
    }
  } catch (err) {
    console.error('  ✗ Test 6 error:', err.message);
    failed++;
  }

  // TEST 7: Provider Registration
  try {
    console.log('\n[Test 7] Testing Provider abstraction...');
    const { getAllProviders, AdzunaProvider, JoobleProvider } = require('./src/lib/jobs/providers');

    const providers = getAllProviders();
    const adzuna = providers.find((p) => p.name === 'Adzuna');
    const jooble = providers.find((p) => p.name === 'Jooble');

    if (adzuna instanceof AdzunaProvider && jooble instanceof JoobleProvider) {
      console.log('  ✓ Both AdzunaProvider and JoobleProvider registered and implement JobProvider interface');
      console.log('  ✓ Adzuna configured status:', adzuna.isConfigured());
      console.log('  ✓ Jooble configured status:', jooble.isConfigured());
      passed++;
    } else {
      throw new Error('Provider registration failed');
    }
  } catch (err) {
    console.error('  ✗ Test 7 error:', err.message);
    failed++;
  }

  console.log(`\n==========================================`);
  console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log(`==========================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
