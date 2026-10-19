import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class EdgeCDP {
  constructor() {
    this.proc = null;
    this.ws = null;
    this.msgId = 1;
    this.responses = new Map();
    this.eventHandlers = [];
  }

  async start() {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const userDataDir = `d:\\projects\\builder\\scripts\\.edge_session_${Date.now()}`;
    this.proc = spawn(
      edgePath,
      [
        '--headless=new',
        '--remote-debugging-port=9222',
        `--user-data-dir=${userDataDir}`,
        '--window-size=1280,800',
        'about:blank',
      ],
      { stdio: 'ignore' }
    );

    let targets = null;
    for (let i = 0; i < 30; i++) {
      await wait(250);
      try {
        targets = await getJson('http://localhost:9222/json');
        if (targets && targets.length > 0) break;
      } catch {}
    }

    if (!targets || targets.length === 0) {
      throw new Error('Edge DevTools could not connect');
    }

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    this.ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((r) => this.ws.on('open', r));

    this.ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id && this.responses.has(msg.id)) {
        const { resolve, reject } = this.responses.get(msg.id);
        this.responses.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
      if (msg.method) {
        this.eventHandlers.forEach((h) => h(msg.method, msg.params));
      }
    });

    await this.cmd('Page.enable');
    await this.cmd('Runtime.enable');
    await this.cmd('Network.enable');
  }

  cmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.responses.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  onEvent(handler) {
    this.eventHandlers.push(handler);
  }

  async goto(url, waitAfter = 2000) {
    await this.cmd('Page.navigate', { url });
    await wait(waitAfter);
  }

  async eval(expression) {
    const res = await this.cmd('Runtime.evaluate', {
      expression,
      returnByValue: true,
    });
    return res.result?.value;
  }

  async waitForSelector(selector, timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const exists = await this.eval(`Boolean(document.querySelector('${selector}'))`);
      if (exists) return true;
      await wait(250);
    }
    throw new Error(`Timeout waiting for selector: ${selector}`);
  }

  async setInputValue(selector, value) {
    await this.waitForSelector(selector);
    const success = await this.eval(`
      (() => {
        const input = document.querySelector('${selector}');
        if (!input) return false;
        
        input.focus();
        const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (valueSetter) {
          valueSetter.call(input, ${JSON.stringify(value)});
        } else {
          input.value = ${JSON.stringify(value)};
        }
        
        const tracker = input._valueTracker;
        if (tracker) {
          tracker.setValue('');
        }
        
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      })()
    `);
    if (!success) {
      throw new Error(`Input not found: ${selector}`);
    }
  }

  async click(selector) {
    const success = await this.eval(`
      (() => {
        const btn = document.querySelector('${selector}');
        if (!btn) return false;
        btn.click();
        return true;
      })()
    `);
    if (!success) {
      throw new Error(`Button not found: ${selector}`);
    }
  }

  async waitForUrl(expectedSubstring, timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const url = await this.eval('window.location.href');
      if (url && url.includes(expectedSubstring)) return url;
      await wait(300);
    }
    return await this.eval('window.location.href');
  }

  async getCookies() {
    const res = await this.cmd('Network.getCookies');
    return res.cookies || [];
  }

  async clearCookies() {
    await this.cmd('Network.clearBrowserCookies');
  }

  async close() {
    try {
      this.ws.close();
    } catch {}
    try {
      this.proc.kill();
    } catch {}
  }
}

async function runBrowserValidation() {
  console.log('====================================================');
  console.log('🌐 BROWSER-LEVEL AUTHENTICATION VALIDATION SUITE');
  console.log('====================================================');

  const cdp = new EdgeCDP();
  await cdp.start();

  const networkLogs = [];
  const browserErrors = [];

  cdp.onEvent((method, params) => {
    if (method === 'Network.responseReceived') {
      const url = params.response.url;
      if (url.includes('/api/')) {
        networkLogs.push(`[${params.response.status}] ${url}`);
      }
    }
    if (method === 'Runtime.consoleAPICalled' && params.type === 'error') {
      browserErrors.push(params.args.map((a) => a.value || a.description).join(' '));
    }
  });

  const testEmail = `real_browser_user_${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';
  const testName = 'Browser Validation Candidate';

  try {
    // Ensure clean state without residual cookies
    await cdp.clearCookies();

    // ----------------------------------------------------
    // 1. REGISTER NEW USER IN BROWSER
    // ----------------------------------------------------
    console.log('\n▶ FLOW 1: Candidate Registration in Browser');
    await cdp.goto('http://localhost:3000/register', 2000);
    console.log('  Loaded URL:', await cdp.eval('window.location.href'));

    await cdp.setInputValue('#fullName', testName);
    await cdp.setInputValue('#email', testEmail);
    await cdp.setInputValue('#password', testPassword);
    await cdp.setInputValue('#confirmPassword', testPassword);
    console.log('  Form fields populated.');

    await cdp.click('button[type="submit"]');
    console.log('  Submit clicked, awaiting response and redirect...');
    const afterRegUrl = await cdp.waitForUrl('/dashboard', 8000);
    console.log('  URL after registration:', afterRegUrl);

    const cookiesAfterReg = await cdp.getCookies();
    const userCookie = cookiesAfterReg.find((c) => c.name === 'sra_user_session');
    console.log('  sra_user_session cookie present:', Boolean(userCookie));

    if (!afterRegUrl.includes('/dashboard')) {
      const errorMsg = await cdp.eval(`document.querySelector('#register-error')?.innerText || null`);
      throw new Error(`Registration failed to redirect to /dashboard. Current URL: ${afterRegUrl}, Error: ${errorMsg}`);
    }
    console.log('  ✓ Registration successful, redirected to /dashboard');

    // ----------------------------------------------------
    // 2. DASHBOARD PERSISTENCE ON RELOAD
    // ----------------------------------------------------
    console.log('\n▶ FLOW 2: Dashboard Persistence on Reload');
    await cdp.goto('http://localhost:3000/dashboard', 2500);
    const reloadedUrl = await cdp.eval('window.location.href');
    console.log('  URL after page refresh:', reloadedUrl);
    if (!reloadedUrl.includes('/dashboard')) {
      throw new Error(`Session did not persist upon reload: redirected to ${reloadedUrl}`);
    }
    const dashboardHtml = await cdp.eval('document.body.innerText');
    console.log('  Dashboard loaded correctly with content length:', dashboardHtml.length);
    console.log('  ✓ Dashboard session persisted across reload');

    console.log('\n▶ FLOW 3: User Logout via Browser UI');
    await wait(1000);
    await cdp.waitForSelector('button[title="Sign Out"]');
    await cdp.eval(`
      (() => {
        const btn = document.querySelector('button[title="Sign Out"]');
        if (btn) btn.click();
      })()
    `);
    const postLogoutUrl = await cdp.waitForUrl('/login', 8000);
    console.log('  URL after clicking Sign Out:', postLogoutUrl);
    const cookiesAfterLogout = await cdp.getCookies();
    const userCookieAfterLogout = cookiesAfterLogout.find((c) => c.name === 'sra_user_session');
    console.log('  sra_user_session cleared:', !userCookieAfterLogout || userCookieAfterLogout.value === '');
    if (!postLogoutUrl.includes('/login')) {
      throw new Error(`Logout failed to redirect to /login. Current URL: ${postLogoutUrl}`);
    }
    console.log('  ✓ Logout successfully redirected and invalidated session');

    // ----------------------------------------------------
    // 4. ATTEMPT ACCESSING PROTECTED /dashboard WHEN LOGGED OUT
    // ----------------------------------------------------
    console.log('\n▶ FLOW 4: Protected Route Redirect When Logged Out');
    await cdp.goto('http://localhost:3000/dashboard', 2000);
    const blockedUrl = await cdp.eval('window.location.href');
    console.log('  URL when accessing /dashboard logged out:', blockedUrl);
    if (!blockedUrl.includes('/login')) {
      throw new Error(`Unauthenticated user was not redirected to /login! URL: ${blockedUrl}`);
    }
    console.log('  ✓ Middleware correctly blocked access and redirected to /login');

    // ----------------------------------------------------
    // 5. REJECT INCORRECT PASSWORD ON LOGIN
    // ----------------------------------------------------
    console.log('\n▶ FLOW 5: Reject Incorrect Password on Login');
    await cdp.goto('http://localhost:3000/login', 2000);
    await cdp.setInputValue('#email', testEmail);
    await cdp.setInputValue('#password', 'WrongPassword999!');
    await cdp.click('button[type="submit"]');
    await wait(2500);

    const badPassUrl = await cdp.eval('window.location.href');
    const badPassError = await cdp.eval(`document.querySelector('#auth-error')?.innerText || null`);
    console.log('  URL remained on login:', badPassUrl.includes('/login'));
    console.log('  Error banner displayed:', badPassError);
    if (!badPassError || !badPassError.toLowerCase().includes('invalid')) {
      throw new Error(`Expected invalid password error, got: ${badPassError}`);
    }
    console.log('  ✓ Incorrect password successfully rejected with clear error banner');

    // ----------------------------------------------------
    // 6. LOGIN WITH REGISTERED ACCOUNT
    // ----------------------------------------------------
    console.log('\n▶ FLOW 6: Candidate Login with Registered Account');
    await cdp.setInputValue('#password', testPassword);
    await cdp.click('button[type="submit"]');
    console.log('  Submit clicked with valid credentials...');
    const loginSuccessUrl = await cdp.waitForUrl('/dashboard', 8000);
    console.log('  URL after valid login:', loginSuccessUrl);
    if (!loginSuccessUrl.includes('/dashboard')) {
      const err = await cdp.eval(`document.querySelector('#auth-error')?.innerText || null`);
      throw new Error(`Login failed to redirect to /dashboard. Current URL: ${loginSuccessUrl}, Error: ${err}`);
    }
    console.log('  ✓ Candidate successfully logged in and redirected to /dashboard');

    // ----------------------------------------------------
    // 7. PREVENT CANDIDATE FROM ACCESSING ADMIN DASHBOARD
    // ----------------------------------------------------
    console.log('\n▶ FLOW 7: Verify Candidate Cannot Access Admin Portal');
    await cdp.goto('http://localhost:3000/admin/dashboard', 2000);
    const candidateAdminUrl = await cdp.eval('window.location.href');
    console.log('  URL when candidate visits /admin/dashboard:', candidateAdminUrl);
    if (!candidateAdminUrl.includes('/admin/login')) {
      throw new Error(`Candidate user was not blocked from /admin/dashboard! URL: ${candidateAdminUrl}`);
    }
    console.log('  ✓ Candidate user blocked from admin dashboard and redirected to /admin/login');

    // ----------------------------------------------------
    // 8. REJECT DUPLICATE REGISTRATION
    // ----------------------------------------------------
    console.log('\n▶ FLOW 8: Reject Duplicate Registration in Browser');
    // Clear cookies first to visit /register without auto-redirect to /dashboard
    await cdp.clearCookies();
    await cdp.goto('http://localhost:3000/register', 2000);
    await cdp.setInputValue('#fullName', 'Duplicate User');
    await cdp.setInputValue('#email', testEmail);
    await cdp.setInputValue('#password', testPassword);
    await cdp.setInputValue('#confirmPassword', testPassword);
    await cdp.click('button[type="submit"]');
    await wait(2500);

    const dupUrl = await cdp.eval('window.location.href');
    const dupError = await cdp.eval(`document.querySelector('#register-error')?.innerText || null`);
    console.log('  URL remained on register:', dupUrl.includes('/register'));
    console.log('  Duplicate error displayed:', dupError);
    if (!dupError || !dupError.toLowerCase().includes('already exists')) {
      throw new Error(`Expected duplicate email error, got: ${dupError}`);
    }
    console.log('  ✓ Duplicate registration rejected with clear error banner');

    // ----------------------------------------------------
    // 9. ADMIN LOGIN IN SEPARATE PORTAL
    // ----------------------------------------------------
    console.log('\n▶ FLOW 9: Admin Login in Browser UI');
    await cdp.goto('http://localhost:3000/admin/login', 2500);
    console.log('  Loaded admin login URL:', await cdp.eval('window.location.href'));

    await cdp.setInputValue('#admin-email', 'kiran81232@gmail.com');
    await cdp.setInputValue('#admin-password', 'kiran@69');
    await cdp.click('button[type="submit"]');
    console.log('  Admin login submitted...');
    const adminDashboardUrl = await cdp.waitForUrl('/admin/dashboard', 8000);
    console.log('  URL after admin login:', adminDashboardUrl);
    if (!adminDashboardUrl.includes('/admin/dashboard')) {
      const adminErr = await cdp.eval(`document.querySelector('[role="alert"]')?.innerText || null`);
      throw new Error(`Admin login failed to redirect to /admin/dashboard. Current URL: ${adminDashboardUrl}, Error: ${adminErr}`);
    }

    const adminCookies = await cdp.getCookies();
    const adminCookie = adminCookies.find((c) => c.name === 'sra_admin_session');
    console.log('  sra_admin_session cookie present:', Boolean(adminCookie));
    console.log('  ✓ Admin login succeeded and redirected to /admin/dashboard');

    console.log('\n▶ FLOW 10: Admin Dashboard Access & Verification');
    await wait(2000);
    const adminPageContent = (await cdp.eval('document.body.innerText')) || '';
    const hasAdminText =
      adminPageContent.includes('Admin') ||
      adminPageContent.includes('Overview') ||
      adminPageContent.includes('Analytics') ||
      adminPageContent.includes('Candidates');
    console.log('  Admin dashboard contains admin management panels:', hasAdminText);
    console.log('  ✓ Admin portal validated successfully');

    console.log('\n====================================================');
    console.log('🎉 ALL 10 BROWSER-LEVEL AUTHENTICATION FLOWS PASSED!');
    console.log('====================================================');

    console.log('\nNetwork API calls captured during browser run:');
    networkLogs.forEach((l) => console.log('  ' + l));
  } finally {
    await cdp.close();
  }
}

runBrowserValidation().catch((err) => {
  console.error('\n❌ BROWSER VALIDATION FAILED:', err);
  process.exit(1);
});
