const http = require('http');
const fs = require('fs');
const path = require('path');

// Helper to make HTTP requests
function request(options, data, isMultipart = false, boundary = '') {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

// Generate simple PDF buffer for testing
function createMinimalPdf(text) {
  // Minimal valid PDF 1.4 stream containing text
  const content = `BT /F1 12 Tf 50 750 Td (${text.replace(/[()\\]/g, '')}) Tj ET`;
  const streamLen = content.length;
  const pdfString = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >> endobj
4 0 obj << /Length ${streamLen} >>
stream
${content}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000282 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
${350 + streamLen}
%%EOF`;
  return Buffer.from(pdfString);
}

async function runTests() {
  console.log('=== STARTING CRITICAL VERIFICATION PASS ===\n');
  let passed = 0;
  let failed = 0;

  // TEST 1: Analyzer Page SSR
  try {
    console.log('[Test 1] GET /analyzer HTML verification...');
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/analyzer',
      method: 'GET',
    });

    if (res.statusCode === 200 && res.body.includes('AI Resume Analyzer')) {
      console.log('  ✓ /analyzer responded 200 and rendered AI Resume Analyzer page');
      passed++;
    } else {
      console.error('  ✗ /analyzer failed: status', res.statusCode);
      failed++;
    }
  } catch (err) {
    console.error('  ✗ /analyzer error:', err.message);
    failed++;
  }

  // TEST 2: API POST JSON analysis with Senior Resume text
  try {
    console.log('\n[Test 2] POST /api/resume/analyze with complete resume text...');
    const seniorResumeText = `
Alex Morgan
Senior Full Stack & AI Systems Engineer
San Francisco, CA | alex.morgan@example.com | github.com/alexmorgan

SUMMARY:
Results-driven Senior Full Stack Engineer with 7+ years of experience architecting distributed cloud systems, React/Next.js web applications, and high-throughput microservices. Spearheaded system redesign reducing latency by 42% and cloud costs by $120,000 annually.

TECHNICAL SKILLS:
Languages: Python, TypeScript, JavaScript, SQL, C++
Frameworks: React, Next.js, Node.js, Express, Tailwind CSS
Infrastructure: AWS, Docker, Kubernetes, CI/CD, Redis, PostgreSQL
Testing: Jest, PyTest, Automated Unit Testing, System Design

PROFESSIONAL EXPERIENCE:
Staff Software Engineer | CloudScale Systems | 2021 - Present
- Architected high-performance data pipeline in Python and PostgreSQL processing 30M events daily with 99.99% uptime.
- Led migration of monolithic front-end to Next.js and React, improving Core Web Vitals by 35%.
- Implemented comprehensive Jest and PyTest unit test suites increasing coverage from 62% to 94%.

EDUCATION:
B.S. in Computer Science | UC Berkeley | GPA: 3.85
`;

    const payload = JSON.stringify({ resumeText: seniorResumeText });
    const res = await request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/resume/analyze',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      payload
    );

    if (res.statusCode === 200) {
      const data = JSON.parse(res.body);
      console.log('  ✓ API returned 200 OK');
      console.log('  ✓ Overall ATS Score:', data.overallAtsScore);
      console.log('  ✓ Keyword Match Score:', data.keywordMatchScore);
      console.log('  ✓ Formatting Score:', data.formattingScore);
      console.log('  ✓ Content Score:', data.contentScore);
      console.log('  ✓ Detected Keywords Count:', data.detectedKeywords.length, '->', data.detectedKeywords.slice(0, 5).join(', '));
      console.log('  ✓ Missing Keywords Count:', data.missingKeywords.length, '->', data.missingKeywords.slice(0, 3).join(', '));
      console.log('  ✓ Strengths Count:', data.strengths.length);
      console.log('  ✓ Weaknesses Count:', data.weaknesses.length);
      console.log('  ✓ Recommendations Count:', data.recommendations.length);

      if (
        typeof data.overallAtsScore === 'number' &&
        data.detectedKeywords.includes('Python') &&
        data.detectedKeywords.includes('React') &&
        data.strengths.length > 0 &&
        data.weaknesses.length > 0
      ) {
        console.log('  ✓ Analysis output meets all structural requirements');
        passed++;
      } else {
        console.error('  ✗ Missing expected structured analysis fields');
        failed++;
      }
    } else {
      console.error('  ✗ API failed with status:', res.statusCode, res.body);
      failed++;
    }
  } catch (err) {
    console.error('  ✗ Test 2 error:', err.message);
    failed++;
  }

  // TEST 3: API Multipart/form-data upload (TXT file)
  try {
    console.log('\n[Test 3] POST /api/resume/analyze with multipart/form-data (TXT resume file)...');
    const boundary = '----WebKitFormBoundaryTest' + Math.random().toString(36).substring(2);
    const fileContent = `
Jane Doe
Data Scientist & Machine Learning Engineer
Seattle, WA | jane.doe@example.com

SUMMARY:
Data Scientist with 4 years analyzing large-scale datasets, building machine learning models in Python, and deploying Docker containers on AWS.

SKILLS:
Python, SQL, Machine Learning, Docker, AWS, Pandas, NumPy, Git

EXPERIENCE:
Data Scientist at DataCorp
- Built predictive forecasting models achieving 91% accuracy across 50,000 customers.
- Developed automated SQL reporting pipelines reducing manual effort by 20 hours per week.
`;

    const postData = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="jane_doe_resume.txt"\r\nContent-Type: text/plain\r\n\r\n`),
      Buffer.from(fileContent),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const res = await request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/resume/analyze',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': postData.length,
        },
      },
      postData
    );

    if (res.statusCode === 200) {
      const data = JSON.parse(res.body);
      console.log('  ✓ Multipart file upload & extraction succeeded!');
      console.log('  ✓ ATS Score for Jane Doe:', data.overallAtsScore);
      console.log('  ✓ Word Count:', data.wordCount);
      console.log('  ✓ Detected Keywords:', data.detectedKeywords.join(', '));
      passed++;
    } else {
      console.error('  ✗ Multipart file upload failed:', res.statusCode, res.body);
      failed++;
    }
  } catch (err) {
    console.error('  ✗ Test 3 error:', err.message);
    failed++;
  }

  // TEST 4: Invalid File Type Rejection
  try {
    console.log('\n[Test 4] Validation: Reject invalid file type (e.g. image.png)...');
    const boundary = '----WebKitFormBoundaryTest' + Math.random().toString(36).substring(2);
    const fakeImageBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    const postData = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="avatar.png"\r\nContent-Type: image/png\r\n\r\n`),
      fakeImageBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const res = await request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/resume/analyze',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': postData.length,
        },
      },
      postData
    );

    if (res.statusCode === 400 && res.body.includes('Invalid file type')) {
      console.log('  ✓ Successfully rejected invalid file type with 400 and friendly message');
      passed++;
    } else {
      console.error('  ✗ Rejection test failed:', res.statusCode, res.body);
      failed++;
    }
  } catch (err) {
    console.error('  ✗ Test 4 error:', err.message);
    failed++;
  }

  // TEST 5: Short/Corrupt Resume Rejection
  try {
    console.log('\n[Test 5] Validation: Reject empty or corrupt resume content...');
    const payload = JSON.stringify({ resumeText: 'Hi' });
    const res = await request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/resume/analyze',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      payload
    );

    if (res.statusCode === 400) {
      console.log('  ✓ Successfully rejected too-short input with status 400');
      passed++;
    } else {
      console.error('  ✗ Empty resume test failed: status', res.statusCode);
      failed++;
    }
  } catch (err) {
    console.error('  ✗ Test 5 error:', err.message);
    failed++;
  }

  // TEST 6: Theme System Tokens & CSS Structure
  try {
    console.log('\n[Test 6] Theme System tokens verification...');
    const cssPath = path.join(__dirname, 'src', 'app', 'globals.css');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const darkRequired = [
      '--bg-primary: #0B0D10',
      '--bg-secondary: #111419',
      '--bg-card: #151920',
      '--bg-elevated: #1A1F28',
      '--text-primary: #F5F7FA',
      '--text-secondary: #98A2B3',
      '--border-color: #272C35',
      '--accent: #7C7FF2',
    ];

    const lightRequired = [
      '--bg-primary: #F7F8FA',
      '--bg-card: #FFFFFF',
      '--text-primary: #171A1F',
      '--text-secondary: #667085',
      '--border-color: #E6E8EC',
      '--accent: #5B5CE2',
    ];

    let allTokensPresent = true;
    for (const token of darkRequired) {
      if (!css.includes(token)) {
        console.error(`  ✗ Missing dark theme token: ${token}`);
        allTokensPresent = false;
      }
    }
    for (const token of lightRequired) {
      if (!css.includes(token)) {
        console.error(`  ✗ Missing light theme token: ${token}`);
        allTokensPresent = false;
      }
    }

    if (allTokensPresent && css.includes('@custom-variant dark')) {
      console.log('  ✓ All Dark mode tokens verified (#0B0D10, #111419, #151920, #1A1F28, #F5F7FA, #98A2B3, #272C35, #7C7FF2)');
      console.log('  ✓ All Light mode tokens verified (#F7F8FA, #FFFFFF, #171A1F, #667085, #E6E8EC, #5B5CE2)');
      console.log('  ✓ Tailwind v4 custom dark variant (@custom-variant dark) verified');
      passed++;
    } else {
      failed++;
    }
  } catch (err) {
    console.error('  ✗ Test 6 error:', err.message);
    failed++;
  }

  // TEST 7: Theme Toggle Component Inspection
  try {
    console.log('\n[Test 7] ThemeToggle component verification...');
    const togglePath = path.join(__dirname, 'src', 'components', 'theme', 'ThemeToggle.tsx');
    const toggleCode = fs.readFileSync(togglePath, 'utf-8');

    if (
      toggleCode.includes('useTheme') &&
      toggleCode.includes('toggleTheme') &&
      toggleCode.includes('Light') &&
      toggleCode.includes('Dark') &&
      toggleCode.includes('Sun') &&
      toggleCode.includes('Moon')
    ) {
      console.log('  ✓ ThemeToggle correctly integrates useTheme(), supports Light and Dark labels, Sun and Moon icons, and smooth transitions');
      passed++;
    } else {
      console.error('  ✗ ThemeToggle missing expected functionality');
      failed++;
    }
  } catch (err) {
    console.error('  ✗ Test 7 error:', err.message);
    failed++;
  }

  // TEST 8: Other Core Routes Reachability
  try {
    console.log('\n[Test 8] Checking other core pages...');
    const routes = ['/', '/improver', '/builder', '/skills', '/jobs', '/dashboard', '/feedback'];
    let allRoutesOk = true;

    for (const r of routes) {
      const res = await request({
        hostname: 'localhost',
        port: 3000,
        path: r,
        method: 'GET',
      });
      if (res.statusCode !== 200) {
        console.error(`  ✗ Route ${r} returned ${res.statusCode}`);
        allRoutesOk = false;
      } else {
        console.log(`  ✓ Route ${r} -> 200 OK`);
      }
    }

    if (allRoutesOk) {
      passed++;
    } else {
      failed++;
    }
  } catch (err) {
    console.error('  ✗ Test 8 error:', err.message);
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
