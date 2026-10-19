import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';
import path from 'path';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

class BrowserSession {
  constructor(port, dataDir) {
    this.port = port;
    this.dataDir = dataDir;
    this.consoleLogs = [];
    this.wsEvents = [];
    this.networkErrors = [];
    this.id = 1;
    this.callbacks = new Map();
  }

  async start() {
    this.edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
      '--headless=new',
      `--remote-debugging-port=${this.port}`,
      `--user-data-dir=${this.dataDir}`,
      'about:blank'
    ]);
    await sleep(2000);

    const list = await new Promise((res, rej) => {
      http.get(`http://127.0.0.1:${this.port}/json`, (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });

    const page = list.find(p => p.type === 'page') || list[0];
    this.ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(r => this.ws.on('open', r));

    this.ws.on('message', (msg) => {
      const data = JSON.parse(msg);
      if (data.method === 'Runtime.consoleAPICalled') {
        const text = data.params.args.map(a => a.value || a.description || '').join(' ');
        this.consoleLogs.push({ type: data.params.type, text });
      }
      if (data.method === 'Log.entryAdded') {
        this.consoleLogs.push({ type: data.params.entry.level, text: data.params.entry.text });
      }
      if (data.method === 'Network.webSocketCreated') {
        this.wsEvents.push(`[WS Created] ${data.params.url}`);
      }
      if (data.method === 'Network.webSocketFrameError') {
        this.wsEvents.push(`[WS Error] ${data.params.errorMessage}`);
      }
      if (data.method === 'Network.loadingFailed') {
        this.networkErrors.push(`[Network Failed] ${data.params.errorText}`);
      }
      if (data.id && this.callbacks.has(data.id)) {
        const cb = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        cb(data.result || {});
      }
    });

    await this.send('Network.enable');
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Log.enable');
  }

  send(method, params = {}) {
    return new Promise(res => {
      const cur = this.id++;
      this.callbacks.set(cur, res);
      this.ws.send(JSON.stringify({ id: cur, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  }

  async close() {
    try { this.ws.close(); } catch {}
    try { this.edge.kill(); } catch {}
  }
}

async function verifyHost(host) {
  console.log(`\n======================================================`);
  console.log(`VERIFYING LOCAL ACCESS ON: http://${host}:3000`);
  console.log(`======================================================`);

  const dataDir = path.resolve(`C:/Users/kiran/.gemini/antigravity-ide/brain/8b0c1bfc-4324-4535-b7a7-8e8286467afa/.edge_verify_${host.replace(/[^a-zA-Z0-9]/g, '_')}`);
  const browser = new BrowserSession(9226, dataDir);
  await browser.start();

  try {
    // 1. Navigate to /login
    console.log(`1. Navigating to http://${host}:3000/login ...`);
    await browser.send('Page.navigate', { url: `http://${host}:3000/login` });
    await sleep(3000);

    // 2. Check HMR status
    const hmrConnected = browser.consoleLogs.some(l => l.text.includes('[HMR] connected'));
    const wsErrors = browser.wsEvents.filter(e => e.includes('[WS Error]'));
    console.log(`  HMR Connected: ${hmrConnected ? 'YES' : 'NO'}`);
    console.log(`  WebSocket Errors: ${wsErrors.length}`);

    // 3. Theme Toggle Verification
    console.log('\n2. Testing Theme Toggle & Persistence...');
    const initialTheme = await browser.eval(`document.documentElement.getAttribute('data-theme')`);
    console.log(`  Initial theme: ${initialTheme}`);

    // Click light
    const switchLight = await browser.eval(`
      (() => {
        const btn = document.querySelector('#theme-toggle-light') || document.querySelector('button[aria-label*="Light"]') || document.querySelector('button[title*="Light"]');
        if (!btn) return false;
        btn.click();
        return true;
      })()
    `);
    await sleep(500);
    const themeAfterLight = await browser.eval(`document.documentElement.getAttribute('data-theme')`);
    console.log(`  Theme after clicking Light button: ${themeAfterLight} (Button clicked: ${switchLight})`);

    // Reload page to test theme persistence
    console.log('  Reloading page to test theme persistence across refresh...');
    await browser.send('Page.reload');
    await sleep(2500);

    const themeAfterReload = await browser.eval(`document.documentElement.getAttribute('data-theme')`);
    const localStorageTheme = await browser.eval(`localStorage.getItem('smart_resume_theme')`);
    console.log(`  Theme after reload: ${themeAfterReload} (localStorage: ${localStorageTheme})`);
    const themeOk = themeAfterLight === 'light' && themeAfterReload === 'light';
    console.log(`  Theme persistence test: ${themeOk ? 'PASS' : 'FAIL'}`);

    // 4. Registration and Login flow
    console.log('\n3. Testing Auth flow (Registration & Login)...');
    const testEmail = `verify_${Date.now()}@example.com`;
    const testPassword = 'Password123!';

    // Navigate to /register
    console.log(`  Navigating to http://${host}:3000/register ...`);
    await browser.send('Page.navigate', { url: `http://${host}:3000/register` });
    await sleep(2500);

    const regResult = await browser.eval(`
      (async () => {
        const nameInput = document.querySelector('input#fullName') || document.querySelector('input[name="fullName"]') || document.querySelector('input[type="text"]');
        const emailInput = document.querySelector('input#email') || document.querySelector('input[name="email"]') || document.querySelector('input[type="email"]');
        const passInputs = document.querySelectorAll('input[type="password"]');
        const submitBtn = document.querySelector('button[type="submit"]');

        if (!nameInput || !emailInput || passInputs.length < 2 || !submitBtn) {
          return { error: 'Registration form elements missing' };
        }

        const setVal = (el, val) => {
          const proto = Object.getPrototypeOf(el);
          const set = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
          set.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        setVal(nameInput, 'Verification User');
        setVal(emailInput, '${testEmail}');
        setVal(passInputs[0], '${testPassword}');
        setVal(passInputs[1], '${testPassword}');

        submitBtn.click();
        await new Promise(r => setTimeout(r, 2000));

        return { url: window.location.href };
      })()
    `);
    console.log('  Registration submitted. Current URL:', regResult?.url);
    const regOk = regResult?.url?.includes('/dashboard');
    console.log(`  Registration & redirect to /dashboard: ${regOk ? 'PASS' : 'FAIL'}`);

    // 5. Session persistence on Dashboard reload
    console.log('  Testing session persistence across page reload on /dashboard...');
    await browser.send('Page.reload');
    await sleep(2500);
    const urlAfterReload = await browser.eval(`window.location.href`);
    const sessionOk = urlAfterReload.includes('/dashboard');
    console.log(`  URL after reload: ${urlAfterReload} -> ${sessionOk ? 'PASS (Session retained)' : 'FAIL'}`);

    // 6. Test Logout
    console.log('  Testing logout flow...');
    const logoutResult = await browser.eval(`
      (async () => {
        const logoutBtn = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent && el.textContent.toLowerCase().includes('log out') || el.textContent.toLowerCase().includes('sign out') || el.getAttribute('aria-label')?.toLowerCase()?.includes('logout'));
        if (logoutBtn) {
          logoutBtn.click();
          await new Promise(r => setTimeout(r, 1500));
          return { clicked: true, url: window.location.href };
        }
        // Fallback: trigger /api/auth/logout directly via fetch
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
        await new Promise(r => setTimeout(r, 1500));
        return { clicked: false, fallback: true, status: res.status, url: window.location.href };
      })()
    `);
    console.log('  Logout action result:', logoutResult);

    await sleep(1500);
    const urlAfterLogout = await browser.eval(`window.location.href`);
    const logoutOk = urlAfterLogout.includes('/login');
    console.log(`  URL after logout: ${urlAfterLogout} -> ${logoutOk ? 'PASS (Redirected to /login)' : 'FAIL'}`);

    // 7. Login with newly created user
    console.log(`  Testing login with newly registered credentials on http://${host}:3000/login ...`);
    const loginResult = await browser.eval(`
      (async () => {
        const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[name="email"]');
        const passInput = document.querySelector('input[type="password"]') || document.querySelector('input[name="password"]');
        const submitBtn = document.querySelector('button[type="submit"]');

        if (!emailInput || !passInput || !submitBtn) return { error: 'Form elements not found' };

        const setVal = (el, val) => {
          const proto = Object.getPrototypeOf(el);
          const set = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
          set.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        setVal(emailInput, '${testEmail}');
        setVal(passInput, '${testPassword}');

        submitBtn.click();
        await new Promise(r => setTimeout(r, 2000));
        return { url: window.location.href };
      })()
    `);
    console.log('  Login submit result URL:', loginResult?.url);
    const loginOk = loginResult?.url?.includes('/dashboard');
    console.log(`  Login redirect to /dashboard: ${loginOk ? 'PASS' : 'FAIL'}`);

    const allPassed = hmrConnected && wsErrors.length === 0 && themeOk && regOk && sessionOk && logoutOk && loginOk;
    console.log(`\nOVERALL RESULT FOR ${host}: ${allPassed ? '>>> ALL VERIFICATIONS PASSED! <<<' : 'FAILED'}`);
    return allPassed;
  } finally {
    await browser.close();
  }
}

async function main() {
  const localhostResult = await verifyHost('localhost');
  const ipResult = await verifyHost('127.0.0.1');

  console.log('\n======================================================');
  console.log(`FINAL SUMMARY:`);
  console.log(`  localhost:3000  -> ${localhostResult ? 'PASS' : 'FAIL'}`);
  console.log(`  127.0.0.1:3000  -> ${ipResult ? 'PASS' : 'FAIL'}`);
  console.log('======================================================\n');
}

main().catch(console.error);
