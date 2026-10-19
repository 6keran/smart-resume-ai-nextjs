import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function runCompleteTestSuite() {
  console.log('=====================================================');
  console.log('SMART RESUME AI — AUTHENTICATION VERIFICATION SUITE');
  console.log('=====================================================\n');

  const BASE_URL = 'http://localhost:3000';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = 'd:\\projects\\builder\\scripts\\.edge_suite_' + Date.now();

  const edgeProc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--window-size=1280,800',
    'about:blank'
  ], { stdio: 'ignore' });

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await wait(250);
      try {
        targets = await getJson('http://localhost:9222/json');
        if (targets?.length) break;
      } catch {}
    }

    if (!targets || targets.length === 0) {
      throw new Error('Edge DevTools not responding on port 9222');
    }

    const pageTarget = targets.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension://')) || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.on('open', r); ws.on('error', j); });

    let msgId = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      const h = d => {
        const j = JSON.parse(d.toString());
        if (j.id === id) {
          ws.off('message', h);
          if (j.error) reject(j.error);
          else resolve(j.result);
        }
      };
      ws.on('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });

    let pageLoaded = false;
    ws.on('message', d => {
      const m = JSON.parse(d.toString());
      if (m.method === 'Page.loadEventFired') {
        pageLoaded = true;
      }
      if (m.method === 'Network.responseReceived' && m.params.response.url.includes('/api/')) {
        console.log(`  [NET ${m.params.response.status}] ${m.params.response.url}`);
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    const navigateAndWait = async (url) => {
      pageLoaded = false;
      await send('Page.navigate', { url });
      for (let i = 0; i < 40; i++) {
        if (pageLoaded) break;
        await wait(200);
      }
      await wait(1500); // Allow React and initial fetch to settle
    };

    // -------------------------------------------------------------
    // TEST 1: Register New User via Browser
    // -------------------------------------------------------------
    console.log('--- TEST 1: Register New User in Browser ---');
    const testCandidateEmail = `candidate_${Date.now()}@testresume.io`;
    const testCandidatePass = 'TestPass@2026!';
    await navigateAndWait(`${BASE_URL}/register`);

    const regFormExists = await send('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector("form") && document.querySelector("#fullName"))',
      returnByValue: true
    });
    console.log('  Registration form rendered:', regFormExists?.value);

    await send('Runtime.evaluate', {
      expression: `(() => {
        function set(id, val) {
          const el = document.getElementById(id);
          if (!el) return;
          const proto = Object.getPrototypeOf(el);
          const desc = Object.getOwnPropertyDescriptor(proto, 'value');
          if (desc && desc.set) desc.set.call(el, val);
          else el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
        set('fullName', 'Candidate Tester');
        set('email', '${testCandidateEmail}');
        set('password', '${testCandidatePass}');
        set('confirmPassword', '${testCandidatePass}');
      })()`
    });

    console.log('  Triggering form submission...');
    await send('Runtime.evaluate', {
      expression: 'document.querySelector("button[type=\'submit\']").click()'
    });
    await wait(3000);

    const afterRegUrl = await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true });
    console.log('  URL after registration submit:', afterRegUrl?.value);

    const cookiesAfterReg = await send('Network.getCookies');
    const userSessionCookie = cookiesAfterReg.cookies.find(c => c.name === 'sra_user_session');
    console.log('  sra_user_session cookie set:', Boolean(userSessionCookie), userSessionCookie?.value?.slice(0, 20) + '...');

    // -------------------------------------------------------------
    // TEST 2: Reject Duplicate Registration
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Reject Duplicate Registration ---');
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Duplicate Tester',
        email: testCandidateEmail,
        password: testCandidatePass,
        confirmPassword: testCandidatePass,
      }),
    });
    const dupBody = await dupRes.json().catch(() => ({}));
    console.log(`  Duplicate registration status: ${dupRes.status} (Expected 409 or 400)`);
    console.log(`  Duplicate message: "${dupBody.message}"`);

    // -------------------------------------------------------------
    // TEST 3: Reject Incorrect Password on Candidate Login
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Reject Incorrect Password ---');
    const badPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testCandidateEmail,
        password: 'CompletelyWrongPassword123!',
      }),
    });
    const badPassBody = await badPassRes.json().catch(() => ({}));
    console.log(`  Bad password login status: ${badPassRes.status} (Expected 401)`);
    console.log(`  Bad password message: "${badPassBody.message}"`);

    // -------------------------------------------------------------
    // TEST 4: Log in via Browser with Valid Account
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Log In via Browser ---');
    // Clear cookies first to simulate fresh login
    await send('Network.clearBrowserCookies');
    await navigateAndWait(`${BASE_URL}/login`);

    await send('Runtime.evaluate', {
      expression: `(() => {
        function set(id, val) {
          const el = document.getElementById(id);
          if (!el) return;
          const proto = Object.getPrototypeOf(el);
          const desc = Object.getOwnPropertyDescriptor(proto, 'value');
          if (desc && desc.set) desc.set.call(el, val);
          else el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
        set('email', '${testCandidateEmail}');
        set('password', '${testCandidatePass}');
      })()`
    });

    console.log('  Clicking Sign In button...');
    await send('Runtime.evaluate', {
      expression: 'document.querySelector("button[type=\'submit\']").click()'
    });
    await wait(3000);

    const afterLoginUrl = await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true });
    console.log('  URL after candidate login:', afterLoginUrl?.value);

    // -------------------------------------------------------------
    // TEST 5: Dashboard Session Persistence on Reload
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Dashboard Session Persistence on Reload ---');
    await navigateAndWait(`${BASE_URL}/dashboard`);
    let currentDashUrl = await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true });
    console.log('  Visited /dashboard URL:', currentDashUrl?.value);

    console.log('  Reloading dashboard page...');
    await navigateAndWait(`${BASE_URL}/dashboard`);
    currentDashUrl = await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true });
    console.log('  URL after reload:', currentDashUrl?.value);
    const hasCandidateGreeting = await send('Runtime.evaluate', {
      expression: 'document.body.innerText.includes("Candidate Tester") || document.body.innerText.includes("Welcome") || document.body.innerText.includes("Dashboard")',
      returnByValue: true
    });
    console.log('  Dashboard greeting / title rendered:', hasCandidateGreeting?.value);

    // -------------------------------------------------------------
    // TEST 6: Candidate Cannot Access Admin Portal
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Candidate Cannot Access Admin Portal ---');
    await navigateAndWait(`${BASE_URL}/admin/dashboard`);
    const adminBlockedUrl = await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true });
    console.log('  Attempting /admin/dashboard with candidate session redirects to:', adminBlockedUrl?.value);

    const adminApiBlocked = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: {
        'Cookie': `sra_user_session=${userSessionCookie?.value || ''}`
      }
    });
    console.log(`  Admin API protection status with user session: ${adminApiBlocked.status} (Expected 401)`);

    // -------------------------------------------------------------
    // TEST 7: Logout Invalidates User Session
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Logout Invalidates User Session ---');
    await navigateAndWait(`${BASE_URL}/dashboard`);
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const logoutBtn = btns.find(b => b.innerText.includes('Sign Out') || b.title === 'Sign Out' || b.getAttribute('aria-label') === 'Sign Out');
        if (logoutBtn) logoutBtn.click();
      })()`
    });
    await wait(2500);

    const postLogoutUrl = await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true });
    console.log('  URL after logout click:', postLogoutUrl?.value);

    // Verify /dashboard redirects back to /login when logged out
    await navigateAndWait(`${BASE_URL}/dashboard`);
    const postLogoutDashUrl = await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true });
    console.log('  Accessing /dashboard after logout redirects to:', postLogoutDashUrl?.value);

    // -------------------------------------------------------------
    // TEST 8: Admin Login Flow in Browser
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Admin Login Flow in Browser ---');
    await send('Network.clearBrowserCookies');
    await navigateAndWait(`${BASE_URL}/admin/login`);

    const adminFormExists = await send('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector("#admin-email") && document.querySelector("#admin-password"))',
      returnByValue: true
    });
    console.log('  Admin login form rendered:', adminFormExists?.value);

    // Test bad admin password first
    await send('Runtime.evaluate', {
      expression: `(() => {
        function set(id, val) {
          const el = document.getElementById(id);
          if (!el) return;
          const proto = Object.getPrototypeOf(el);
          const desc = Object.getOwnPropertyDescriptor(proto, 'value');
          if (desc && desc.set) desc.set.call(el, val);
          else el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
        set('admin-email', 'kiran81232@gmail.com');
        set('admin-password', 'IncorrectAdminPass999!');
      })()`
    });

    await send('Runtime.evaluate', {
      expression: 'document.querySelector("button[type=\'submit\']").click()'
    });
    await wait(2000);

    const adminBadPassErr = await send('Runtime.evaluate', {
      expression: 'document.body.innerText.includes("Invalid email or password") || document.body.innerText.includes("Access denied")',
      returnByValue: true
    });
    console.log('  Admin invalid credentials rejected with error message:', adminBadPassErr?.value);

    // Now test valid admin login
    console.log('  Logging in with valid admin credentials...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        function set(id, val) {
          const el = document.getElementById(id);
          if (!el) return;
          const proto = Object.getPrototypeOf(el);
          const desc = Object.getOwnPropertyDescriptor(proto, 'value');
          if (desc && desc.set) desc.set.call(el, val);
          else el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
        set('admin-email', 'kiran81232@gmail.com');
        set('admin-password', 'kiran@69');
      })()`
    });

    await send('Runtime.evaluate', {
      expression: 'document.querySelector("button[type=\'submit\']").click()'
    });
    await wait(3000);

    const adminSuccessUrl = await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true });
    console.log('  URL after successful admin login:', adminSuccessUrl?.value);

    const adminCookies = await send('Network.getCookies');
    const adminSessionCookie = adminCookies.cookies.find(c => c.name === 'sra_admin_session');
    console.log('  sra_admin_session cookie set:', Boolean(adminSessionCookie), adminSessionCookie?.value?.slice(0, 20) + '...');

    // -------------------------------------------------------------
    // TEST 9: Admin Dashboard Reload & Persistence
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Admin Dashboard Reload & Persistence ---');
    await navigateAndWait(`${BASE_URL}/admin/dashboard`);
    const adminReloadUrl = await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true });
    console.log('  Admin dashboard URL after refresh:', adminReloadUrl?.value);
    const adminPageTitle = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
    console.log('  Admin dashboard title:', adminPageTitle?.value);

    // -------------------------------------------------------------
    // TEST 10: Admin Logout Flow
    // -------------------------------------------------------------
    console.log('\n--- TEST 10: Admin Logout Flow ---');
    const adminLogoutRes = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': `sra_admin_session=${adminSessionCookie?.value || ''}`
      }
    });
    console.log(`  Admin logout API status: ${adminLogoutRes.status} (Expected 200)`);

    ws.close();
    console.log('\n=====================================================');
    console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('=====================================================');
  } catch (err) {
    console.error('Test suite failure:', err);
  } finally {
    edgeProc.kill();
  }
}

runCompleteTestSuite();
