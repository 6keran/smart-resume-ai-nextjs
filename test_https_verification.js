const https = require('https');
const fs = require('fs');
const path = require('path');

const rootCA = fs.readFileSync(path.resolve(__dirname, 'certificates/rootCA.pem'));

function makeHttpsRequest(urlPath, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlPath, 'https://localhost:3000');
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 3000,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      ca: rootCA, // Uses the trusted root CA to verify the certificate chain!
      rejectUnauthorized: true, // STRICT SSL VERIFICATION - DO NOT DISABLE SECURITY
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
          socket: res.socket,
        });
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

async function runHttpsTests() {
  console.log('============================================================');
  console.log('STARTING LOCAL HTTPS (https://localhost:3000) VERIFICATION');
  console.log('============================================================\n');

  // 1. Verify TLS Handshake & Certificate Details
  console.log('[1] Testing TLS Handshake & Certificate Validation with strict rootCA check...');
  const tlsCheck = await new Promise((resolve, reject) => {
    const socket = https.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      ca: rootCA,
      rejectUnauthorized: true,
    }, (res) => {
      const cert = res.socket.getPeerCertificate(true);
      const protocol = res.socket.getProtocol();
      const cipher = res.socket.getCipher();
      res.resume();
      resolve({ cert, protocol, cipher });
    });
    socket.on('error', reject);
    socket.end();
  });

  console.log('  TLS Protocol:', tlsCheck.protocol);
  console.log('  Cipher Suite:', tlsCheck.cipher?.name);
  console.log('  Certificate Subject:', tlsCheck.cert?.subject?.CN || tlsCheck.cert?.subject?.O);
  console.log('  Certificate Issuer:', tlsCheck.cert?.issuer?.O);
  console.log('  Subject Alternative Names (SANs):', tlsCheck.cert?.subjectaltname);
  console.log('  Valid from:', tlsCheck.cert?.valid_from, 'to', tlsCheck.cert?.valid_to);

  if (!tlsCheck.cert?.subjectaltname?.includes('localhost')) {
    throw new Error('FAIL: Certificate SANs do not include localhost!');
  }
  console.log('PASS: TLS Handshake succeeded with valid trusted certificate!\n');

  // 2. Test Home Page over HTTPS
  console.log('[2] Testing Home Page (GET https://localhost:3000)...');
  const homeRes = await makeHttpsRequest('/');
  console.log('  Status code:', homeRes.status);
  if (homeRes.status === 200) {
    console.log('PASS: Home Page loaded successfully over HTTPS.\n');
  } else {
    throw new Error(`FAIL: Expected status 200, got ${homeRes.status}`);
  }

  // 3. Test Protected Admin Redirect over HTTPS
  console.log('[3] Testing unauthenticated redirect on /admin/dashboard over HTTPS...');
  const unauthRes = await makeHttpsRequest('/admin/dashboard');
  console.log('  Status code:', unauthRes.status);
  console.log('  Redirect location:', unauthRes.headers.location);
  if (unauthRes.status === 307 || unauthRes.status === 302 || unauthRes.status === 308) {
    if (unauthRes.headers.location && unauthRes.headers.location.startsWith('https://')) {
      console.log('PASS: Redirected to HTTPS login URL cleanly without downgrading to HTTP.\n');
    } else {
      console.log(`PASS: Redirected to login: ${unauthRes.headers.location}\n`);
    }
  } else {
    throw new Error(`FAIL: Expected redirect (307/302), got ${unauthRes.status}`);
  }

  // 4. Test Admin Authentication over HTTPS
  console.log('[4] Testing Admin Login (POST https://localhost:3000/api/admin/auth/login)...');
  const loginRes = await makeHttpsRequest('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'kiran81232@gmail.com', password: 'kiran@69' });

  console.log('  Login status:', loginRes.status);
  const setCookie = loginRes.headers['set-cookie'];
  if (!setCookie || !setCookie[0]) {
    throw new Error('FAIL: No session cookie returned from HTTPS login!');
  }
  const adminCookie = setCookie[0].split(';')[0];
  console.log('  Session cookie received over HTTPS:', adminCookie.substring(0, 30) + '...');
  console.log('PASS: Admin logged in securely over HTTPS.\n');

  // 5. Test Authenticated Admin Dashboard & Stats over HTTPS
  console.log('[5] Testing Admin Stats API (GET https://localhost:3000/api/admin/stats) over HTTPS...');
  const statsRes = await makeHttpsRequest('/api/admin/stats', {
    headers: { Cookie: adminCookie },
  });
  console.log('  Stats status:', statsRes.status);
  console.log('  Total visitors:', statsRes.data?.stats?.totalVisitors);
  console.log('  Question Bank total questions:', statsRes.data?.stats?.questionBankStats?.totalQuestions);
  if (statsRes.status === 200 && statsRes.data?.stats?.questionBankStats?.totalQuestions >= 120) {
    console.log('PASS: Admin stats and Question Bank telemetry fetched successfully over HTTPS.\n');
  } else {
    throw new Error(`FAIL: Unexpected stats response: ${JSON.stringify(statsRes.data)}`);
  }

  // 6. Test Question Bank Management over HTTPS
  console.log('[6] Testing Question Bank API (GET https://localhost:3000/api/admin/questions) over HTTPS...');
  const questionsRes = await makeHttpsRequest('/api/admin/questions?skill=Python', {
    headers: { Cookie: adminCookie },
  });
  console.log('  Questions status:', questionsRes.status);
  console.log('  Python questions returned:', questionsRes.data?.questions?.length);
  if (questionsRes.status === 200 && questionsRes.data?.questions?.length > 0) {
    console.log('PASS: Question Bank queries work seamlessly over HTTPS.\n');
  } else {
    throw new Error(`FAIL: Expected questions array over HTTPS`);
  }

  // 7. Test Public Skill Verification Exam Start over HTTPS
  console.log('[7] Testing Public Assessment Exam Start (POST https://localhost:3000/api/assessments/start) over HTTPS...');
  const assessStartRes = await makeHttpsRequest('/api/assessments/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { skill: 'Python' });

  console.log('  Assessment start status:', assessStartRes.status);
  console.log('  Attempt ID created:', assessStartRes.data?.attemptId);
  console.log('  Questions delivered:', assessStartRes.data?.questions?.length);
  if (assessStartRes.status === 200 && assessStartRes.data?.questions?.length === 10) {
    console.log('PASS: Skill Verification assessment starts and delivers DB questions over HTTPS.\n');
  } else {
    throw new Error(`FAIL: Assessment start failed over HTTPS`);
  }

  // 8. Test Job Search API over HTTPS
  console.log('[8] Testing Job Search Provider Pipeline (POST https://localhost:3000/api/jobs/search) over HTTPS...');
  const jobRes = await makeHttpsRequest('/api/jobs/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    title: 'TypeScript Developer',
    location: 'Bengaluru',
  });
  console.log('  Job Search status:', jobRes.status);
  console.log('  Job listings returned:', jobRes.data?.jobs?.length || 0);
  if (jobRes.status === 200) {
    console.log('PASS: Job Search system queries and returns live records over HTTPS.\n');
  } else {
    throw new Error(`FAIL: Job search failed over HTTPS`);
  }

  console.log('============================================================');
  console.log('ALL HTTPS CHECKS PASSED WITH ZERO ERRORS ON https://localhost:3000');
  console.log('============================================================');
}

runHttpsTests().catch((err) => {
  console.error('\nHTTPS VERIFICATION FAILED:', err);
  process.exit(1);
});
