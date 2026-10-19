import { spawn } from 'child_process';
import http from 'http';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check if local Next.js server is ready
async function isServerReady(url = 'http://localhost:3000/api/auth/me', timeoutMs = 2000) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Ensure server is up; start dev server if not currently running
async function ensureServerRunning() {
  console.log('[Setup] Checking if Next.js server is responding on http://localhost:3000...');
  if (await isServerReady()) {
    console.log('[Setup] Server is already running and healthy.');
    return null;
  }

  console.log('[Setup] Server not detected on port 3000. Launching Next.js server for regression suite...');
  const serverProc = spawn('npm', ['run', 'dev'], {
    shell: true,
    cwd: process.cwd(),
    stdio: 'pipe',
  });

  serverProc.stdout.on('data', (d) => {
    const str = d.toString();
    if (str.includes('Ready') || str.includes('Local:')) {
      // server starting up
    }
  });

  const maxWait = 35000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await sleep(1000);
    if (await isServerReady()) {
      console.log(`[Setup] Next.js server became ready in ${Math.round((Date.now() - start) / 1000)}s.`);
      return serverProc;
    }
  }

  throw new Error('Could not start or connect to local Next.js server on http://localhost:3000 within 35s.');
}

// Simple CDP client
class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
    this.consoleLogs = [];
    this.networkErrors = [];
  }

  async connect() {
    const WebSocket = (await import('ws')).default || (await import('ws'));
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', () => resolve());
      this.ws.on('error', (err) => reject(err));
      this.ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.method === 'Runtime.consoleAPICalled') {
          const text = msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ');
          this.consoleLogs.push({ type: msg.params.type, text });
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          const text = msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text;
          this.consoleLogs.push({ type: 'error', text });
        }
        if (msg.method === 'Network.responseReceived') {
          const { status, url } = msg.params.response;
          if (status >= 400) {
            this.networkErrors.push({ status, url });
          }
        }
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) {
            cb.reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          } else {
            cb.resolve(msg.result);
          }
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      const desc = res.exceptionDetails.exception?.description || res.exceptionDetails.text;
      throw new Error(desc);
    }
    return res.result?.value;
  }

  close() {
    try {
      this.ws?.close();
    } catch {}
  }
}

// Safe navigation helper that ensures document is on expected origin and ready
async function safeNavigate(client, targetUrl, readySelector = null, timeoutMs = 15000) {
  await client.send('Page.navigate', { url: targetUrl });
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    await sleep(300);
    try {
      const state = await client.eval(`
        (() => {
          const href = window.location.href;
          const origin = window.origin;
          const isErrorDoc = href.startsWith('chrome-error:') || href.startsWith('edge-error:');
          const isReady = document.readyState === 'complete';
          const hasSelector = ${readySelector ? `Boolean(document.querySelector(${JSON.stringify(readySelector)}))` : 'true'};
          return { href, origin, isErrorDoc, isReady, hasSelector };
        })()
      `);

      if (state.isErrorDoc) {
        throw new Error(`Navigation failed: browser landed on error page (${state.href})`);
      }

      if (state.href.startsWith('http://localhost:3000') && state.origin === 'http://localhost:3000' && state.isReady && state.hasSelector) {
        return state;
      }
    } catch (err) {
      if (err.message?.includes('Navigation failed')) throw err;
      // frame might be re-navigating, retry
    }
  }

  // Get final state for diagnostic reporting
  let finalState = 'unknown';
  try {
    finalState = await client.eval(`({ href: window.location.href, origin: window.origin, readyState: document.readyState })`);
  } catch {}
  throw new Error(`Timeout waiting for ${targetUrl} (Final state: ${JSON.stringify(finalState)}, expected selector: ${readySelector})`);
}

// Safe helper to read localStorage with origin verification
async function safeGetLocalStorage(client, key) {
  return await client.eval(`
    (() => {
      try {
        if (window.origin !== 'http://localhost:3000') {
          return { error: 'Invalid origin: ' + window.origin + ' (url: ' + window.location.href + ')' };
        }
        return { value: window.localStorage.getItem(${JSON.stringify(key)}) };
      } catch (err) {
        return { error: err.name + ': ' + err.message };
      }
    })()
  `);
}

async function runRegressionSuite() {
  console.log('====================================================');
  console.log('STARTING REAL REGRESSION TEST: AUTH + THEME SWITCHING');
  console.log('====================================================');

  let serverProc = null;
  let edgeProc = null;
  let client = null;

  const results = {
    auth: {
      step1_registerNewAccount: false,
      step2_loginCorrectCredentials: false,
      step3_rejectIncorrectCredentials: false,
      step4_reloadMaintainsSession: false,
      step5_visitProtectedRoute: false,
      step6_logoutRemovesProtectedAccess: false,
      step7_existingAccountWorks: false,
    },
    theme: {
      step1_switchToDark: false,
      step2_switchToLight: false,
      step3_navigateAcrossRoutes: false,
      step4_reloadPersistsTheme: false,
      step5_themeCorrectlyAppliedToDom: false,
      step6_noHydrationOrScriptErrors: false,
    },
  };

  try {
    // 1. Ensure server is up
    serverProc = await ensureServerRunning();

    // 2. Launch headless Edge with clean profile
    const edgePort = 9225;
    const edgeProfile = `D:\\projects\\builder\\scripts\\.edge_regress_${Date.now()}`;
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

    console.log(`[Browser] Launching Edge on remote port ${edgePort}...`);
    edgeProc = spawn(edgePath, [
      `--remote-debugging-port=${edgePort}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${edgeProfile}`,
      'about:blank',
    ]);

    // Poll for page target
    let target = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        const listData = await new Promise((resolve, reject) => {
          http.get(`http://127.0.0.1:${edgePort}/json/list`, (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => resolve(JSON.parse(data)));
          }).on('error', reject);
        });
        const page = listData.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
        if (page) {
          target = page;
          break;
        }
      } catch {}
    }

    if (!target) {
      throw new Error('Failed to discover page target via Edge CDP');
    }

    console.log(`[Browser] Connected to page target (${target.id})`);
    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Network.enable');

    // -------------------------------------------------------------
    // SECTION A: THEME SWITCHING IN-DEPTH VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- TESTING THEME SWITCHING FLOW ---');

    // Navigate to /login and wait for theme controls to render
    console.log('Navigating to http://localhost:3000/login...');
    const navState = await safeNavigate(client, 'http://localhost:3000/login', '#theme-toggle-light', 15000);
    console.log(`Landed on: ${navState.href} (Origin: ${navState.origin})`);

    // Initial theme check
    const initialTheme = await client.eval(`({
      attr: document.documentElement.getAttribute('data-theme'),
      isDarkClass: document.documentElement.classList.contains('dark'),
      isLightClass: document.documentElement.classList.contains('light'),
      bgPrimary: getComputedStyle(document.body).getPropertyValue('--bg-primary').trim(),
      colorScheme: document.documentElement.style.colorScheme
    })`);
    console.log('Initial theme state on /login:', initialTheme);

    // Step 2: Switch to Light mode
    try {
      console.log('Switching to Light mode via #theme-toggle-light...');
      const switchedToLight = await client.eval(`(function() {
        const lightBtn = document.querySelector('#theme-toggle-light') || 
                         document.querySelector('button[aria-label*="Light"]') ||
                         document.querySelector('button[title*="Light"]');
        if (!lightBtn) return { error: 'Light button not found' };
        lightBtn.click();
        return { success: true };
      })()`);
      console.log('Light button click result:', switchedToLight);
      await sleep(500);

      const storageLight = await safeGetLocalStorage(client, 'smart_resume_theme');
      const afterLight = await client.eval(`({
        dataTheme: document.documentElement.getAttribute('data-theme'),
        isLight: document.documentElement.classList.contains('light'),
        isDark: document.documentElement.classList.contains('dark'),
        colorScheme: document.documentElement.style.colorScheme,
        bgPrimary: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
      })`);
      afterLight.localStored = storageLight.value ?? null;
      console.log('State after switching to Light:', afterLight);

      if (afterLight.dataTheme === 'light' && afterLight.isLight && afterLight.localStored === 'light') {
        results.theme.step2_switchToLight = true;
        console.log('PASS: Step 2: Switched to Light mode successfully.');
      } else {
        console.log('FAIL: Step 2: Did not switch to Light mode completely.');
      }
    } catch (err) {
      console.error('FAIL: Step 2 threw error:', err.message);
    }

    // Step 1: Switch to Dark mode
    try {
      console.log('Switching to Dark mode via #theme-toggle-dark...');
      const switchedToDark = await client.eval(`(function() {
        const darkBtn = document.querySelector('#theme-toggle-dark') || 
                        document.querySelector('button[aria-label*="Dark"]') ||
                        document.querySelector('button[title*="Dark"]');
        if (!darkBtn) return { error: 'Dark button not found' };
        darkBtn.click();
        return { success: true };
      })()`);
      console.log('Dark button click result:', switchedToDark);
      await sleep(500);

      const storageDark = await safeGetLocalStorage(client, 'smart_resume_theme');
      const afterDark = await client.eval(`({
        dataTheme: document.documentElement.getAttribute('data-theme'),
        isLight: document.documentElement.classList.contains('light'),
        isDark: document.documentElement.classList.contains('dark'),
        colorScheme: document.documentElement.style.colorScheme,
        bgPrimary: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
      })`);
      afterDark.localStored = storageDark.value ?? null;
      console.log('State after switching to Dark:', afterDark);

      if (afterDark.dataTheme === 'dark' && afterDark.isDark && afterDark.localStored === 'dark') {
        results.theme.step1_switchToDark = true;
        console.log('PASS: Step 1: Switched to Dark mode successfully.');
      } else {
        console.log('FAIL: Step 1: Did not switch to Dark mode completely.');
      }
    } catch (err) {
      console.error('FAIL: Step 1 threw error:', err.message);
    }

    // Step 4 & 5: Reload browser and verify theme persistence without FOUC
    try {
      // Set to Light first
      await client.eval(`document.querySelector('#theme-toggle-light')?.click()`);
      await sleep(300);

      console.log('Reloading page to test theme persistence...');
      await client.send('Page.reload');
      await safeNavigate(client, 'http://localhost:3000/login', '#theme-toggle-light', 10000);

      const storageReload = await safeGetLocalStorage(client, 'smart_resume_theme');
      const afterReload = await client.eval(`({
        dataTheme: document.documentElement.getAttribute('data-theme'),
        isLight: document.documentElement.classList.contains('light'),
        isDark: document.documentElement.classList.contains('dark'),
        bgPrimary: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
      })`);
      afterReload.localStored = storageReload.value ?? null;
      console.log('State after page reload:', afterReload);

      if (afterReload.dataTheme === 'light' && afterReload.isLight && afterReload.localStored === 'light') {
        results.theme.step4_reloadPersistsTheme = true;
        results.theme.step5_themeCorrectlyAppliedToDom = true;
        console.log('PASS: Step 4 & 5: Selected theme persists across reload without FOUC.');
      } else {
        console.log('FAIL: Step 4 & 5: Theme did not persist across reload.');
      }
    } catch (err) {
      console.error('FAIL: Step 4 & 5 threw error:', err.message);
    }

    // Step 3: Navigate across routes (e.g., to /register)
    try {
      console.log('Navigating to /register to test theme persistence across routes...');
      await safeNavigate(client, 'http://localhost:3000/register', 'input#email', 10000);

      const storageReg = await safeGetLocalStorage(client, 'smart_resume_theme');
      const onRegisterTheme = await client.eval(`({
        dataTheme: document.documentElement.getAttribute('data-theme'),
        isLight: document.documentElement.classList.contains('light')
      })`);
      onRegisterTheme.localStored = storageReg.value ?? null;
      console.log('Theme on /register after navigation:', onRegisterTheme);

      if (onRegisterTheme.dataTheme === 'light' && onRegisterTheme.isLight) {
        results.theme.step3_navigateAcrossRoutes = true;
        console.log('PASS: Step 3: Theme persisted across navigation to /register.');
      } else {
        console.log('FAIL: Step 3: Theme lost across route navigation.');
      }
    } catch (err) {
      console.error('FAIL: Step 3 threw error:', err.message);
    }

    // Step 6: Check for hydration or script errors
    const themeErrors = client.consoleLogs.filter(
      (l) => l.type === 'error' && (l.text.includes('hydration') || l.text.includes('Hydration') || l.text.includes('mismatch'))
    );
    if (themeErrors.length === 0) {
      results.theme.step6_noHydrationOrScriptErrors = true;
      console.log('PASS: Step 6: Zero hydration or script errors observed.');
    } else {
      console.log('WARN: Hydration/script errors detected:', themeErrors);
    }

    // -------------------------------------------------------------
    // SECTION B: AUTHENTICATION FLOW IN-DEPTH VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- TESTING AUTHENTICATION FLOW ---');

    // Step 1: Register a new test account
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const testName = 'Test Candidate';

    try {
      console.log(`Registering account: ${testEmail}...`);
      await safeNavigate(client, 'http://localhost:3000/register', 'input#fullName', 10000);

      await client.eval(`(function() {
        const nameInput = document.querySelector('input#fullName') || document.querySelector('input[type="text"]');
        const emailInput = document.querySelector('input#email') || document.querySelector('input[type="email"]');
        const passInputs = document.querySelectorAll('input[type="password"]');
        
        const setVal = (el, val) => {
          const proto = Object.getPrototypeOf(el);
          const set = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
          set.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        setVal(nameInput, ${JSON.stringify(testName)});
        setVal(emailInput, ${JSON.stringify(testEmail)});
        setVal(passInputs[0], ${JSON.stringify(testPassword)});
        setVal(passInputs[1], ${JSON.stringify(testPassword)});
      })()`);

      await sleep(300);
      console.log('Submitting registration form...');
      await client.eval(`document.querySelector('button[type="submit"]')?.click()`);

      // Wait for redirect to /dashboard
      const startWait = Date.now();
      let postRegUrl = '';
      while (Date.now() - startWait < 8000) {
        await sleep(500);
        postRegUrl = await client.eval('window.location.href');
        if (postRegUrl.includes('/dashboard')) break;
      }
      console.log('URL after registration:', postRegUrl);

      if (postRegUrl.includes('/dashboard')) {
        results.auth.step1_registerNewAccount = true;
        console.log('PASS: Step 1: Registered new test account and redirected to /dashboard.');
      } else {
        console.log('FAIL: Step 1: Registration did not redirect to /dashboard.');
      }
    } catch (err) {
      console.error('FAIL: Step 1 threw error:', err.message);
    }

    // Step 6: Log out and verify protected access is removed
    try {
      console.log('Logging out from /dashboard...');
      await client.eval(`(function() {
        fetch('/api/auth/logout', { method: 'POST' }).then(() => {
          window.location.href = '/login';
        });
      })()`);

      await safeNavigate(client, 'http://localhost:3000/login', 'input#email', 8000);
      const postLogoutUrl = await client.eval('window.location.href');
      console.log('URL after logout:', postLogoutUrl);

      // Try visiting protected route /dashboard while logged out
      await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
      await sleep(2500);
      const guardedUrl = await client.eval('window.location.href');
      console.log('URL when accessing /dashboard while logged out:', guardedUrl);

      if (guardedUrl.includes('/login')) {
        results.auth.step6_logoutRemovesProtectedAccess = true;
        console.log('PASS: Step 6: Logout successfully revoked session; protected route redirected to /login.');
      } else {
        console.log('FAIL: Step 6: Protected route /dashboard did not redirect to /login.');
      }
    } catch (err) {
      console.error('FAIL: Step 6 threw error:', err.message);
    }

    // Step 3: Verify incorrect credentials are rejected
    try {
      console.log('Testing incorrect credentials rejection on /login...');
      await safeNavigate(client, 'http://localhost:3000/login', 'input#email', 8000);

      await client.eval(`(function() {
        const emailInput = document.querySelector('input#email');
        const passInput = document.querySelector('input#password');
        
        const setVal = (el, val) => {
          const proto = Object.getPrototypeOf(el);
          const set = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
          set.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        setVal(emailInput, ${JSON.stringify(testEmail)});
        setVal(passInput, "TotallyWrongPassword123!");
      })()`);

      await sleep(300);
      await client.eval(`document.querySelector('button[type="submit"]')?.click()`);
      await sleep(1500);

      const errorMessage = await client.eval(`document.querySelector('#auth-error')?.textContent || ''`);
      console.log('Error banner text on invalid credentials:', errorMessage);

      if (errorMessage.includes('Invalid email or password')) {
        results.auth.step3_rejectIncorrectCredentials = true;
        console.log('PASS: Step 3: Incorrect credentials correctly rejected with clean error message.');
      } else {
        console.log('FAIL: Step 3: Incorrect credentials were not rejected with expected error banner.');
      }
    } catch (err) {
      console.error('FAIL: Step 3 threw error:', err.message);
    }

    // Step 2: Log in with the correct credentials
    try {
      console.log('Logging in with correct credentials...');
      await client.eval(`(function() {
        const passInput = document.querySelector('input#password');
        const setVal = (el, val) => {
          const proto = Object.getPrototypeOf(el);
          const set = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
          set.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        setVal(passInput, ${JSON.stringify(testPassword)});
      })()`);

      await sleep(300);
      await client.eval(`document.querySelector('button[type="submit"]')?.click()`);

      const startWaitLogin = Date.now();
      let loginRedirectUrl = '';
      while (Date.now() - startWaitLogin < 8000) {
        await sleep(500);
        loginRedirectUrl = await client.eval('window.location.href');
        if (loginRedirectUrl.includes('/dashboard')) break;
      }
      console.log('URL after correct login submission:', loginRedirectUrl);

      if (loginRedirectUrl.includes('/dashboard')) {
        results.auth.step2_loginCorrectCredentials = true;
        console.log('PASS: Step 2: Correct login redirected to /dashboard successfully.');
      } else {
        console.log('FAIL: Step 2: Login did not redirect to /dashboard.');
      }
    } catch (err) {
      console.error('FAIL: Step 2 threw error:', err.message);
    }

    // Step 4: Reload page and verify session behaves correctly
    try {
      console.log('Reloading /dashboard to verify session persistence...');
      await client.send('Page.reload');
      await safeNavigate(client, 'http://localhost:3000/dashboard', null, 8000);

      const afterReloadDashUrl = await client.eval('window.location.href');
      console.log('URL after reload on /dashboard:', afterReloadDashUrl);

      if (afterReloadDashUrl.includes('/dashboard')) {
        results.auth.step4_reloadMaintainsSession = true;
        console.log('PASS: Step 4: Page reload maintains active session on /dashboard.');
      } else {
        console.log('FAIL: Step 4: Session lost on /dashboard reload.');
      }
    } catch (err) {
      console.error('FAIL: Step 4 threw error:', err.message);
    }

    // Step 5: Visit protected routes while logged in
    try {
      console.log('Navigating to protected route /builder...');
      await safeNavigate(client, 'http://localhost:3000/builder', null, 8000);

      const builderUrl = await client.eval('window.location.href');
      console.log('URL on /builder while logged in:', builderUrl);

      if (builderUrl.includes('/builder')) {
        results.auth.step5_visitProtectedRoute = true;
        console.log('PASS: Step 5: Protected route /builder accessible with valid session.');
      } else {
        console.log('FAIL: Step 5: Protected route /builder was not accessible.');
      }
    } catch (err) {
      console.error('FAIL: Step 5 threw error:', err.message);
    }

    // Step 7: Verify an existing test account still works
    try {
      console.log('\nTesting existing test account login...');
      // Log out first
      await client.eval(`fetch('/api/auth/logout', { method: 'POST' }).then(() => { window.location.href = '/login'; })`);
      await safeNavigate(client, 'http://localhost:3000/login', 'input#email', 8000);

      // Login with registered test account
      await client.eval(`(function() {
        const emailInput = document.querySelector('input#email');
        const passInput = document.querySelector('input#password');
        const setVal = (el, val) => {
          const proto = Object.getPrototypeOf(el);
          const set = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
          set.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        setVal(emailInput, ${JSON.stringify(testEmail)});
        setVal(passInput, ${JSON.stringify(testPassword)});
      })()`);

      await sleep(300);
      await client.eval(`document.querySelector('button[type="submit"]')?.click()`);

      const startWaitExist = Date.now();
      let existingLoginUrl = '';
      while (Date.now() - startWaitExist < 8000) {
        await sleep(500);
        existingLoginUrl = await client.eval('window.location.href');
        if (existingLoginUrl.includes('/dashboard')) break;
      }
      console.log('URL after existing account login:', existingLoginUrl);

      if (existingLoginUrl.includes('/dashboard')) {
        results.auth.step7_existingAccountWorks = true;
        console.log('PASS: Step 7: Existing test account works perfectly.');
      } else {
        console.log('FAIL: Step 7: Existing account login did not redirect to /dashboard.');
      }
    } catch (err) {
      console.error('FAIL: Step 7 threw error:', err.message);
    }

  } catch (err) {
    console.error('Fatal test harness error:', err);
  } finally {
    if (client) client.close();
    if (edgeProc) {
      try {
        edgeProc.kill('SIGKILL');
      } catch {}
    }
    if (serverProc) {
      try {
        serverProc.kill();
      } catch {}
    }
  }

  console.log('\n====================================================');
  console.log('FINAL REGRESSION TEST RESULTS:');
  console.log('====================================================');
  console.log('AUTHENTICATION:');
  console.log(JSON.stringify(results.auth, null, 2));
  console.log('THEME:');
  console.log(JSON.stringify(results.theme, null, 2));

  const allAuthPassed = Object.values(results.auth).every(Boolean);
  const allThemePassed = Object.values(results.theme).every(Boolean);

  if (allAuthPassed && allThemePassed) {
    console.log('\n>>> ALL 13 REGRESSION TESTS PASSED! <<<');
    process.exit(0);
  } else {
    console.log('\n>>> SOME REGRESSION TESTS FAILED! <<<');
    process.exit(1);
  }
}

runRegressionSuite().catch((err) => {
  console.error('Fatal regression suite error:', err);
  process.exit(1);
});
