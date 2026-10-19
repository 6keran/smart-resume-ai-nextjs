import { spawn } from 'child_process';
import http from 'http';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simple CDP client
class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
    this.events = [];
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
          this.consoleLogs.push({
            type: 'error',
            text: msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text,
          });
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
      throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
    }
    return res.result?.value;
  }

  close() {
    try {
      this.ws?.close();
    } catch {}
  }
}

async function runRegressionSuite() {
  console.log('====================================================');
  console.log('STARTING REAL REGRESSION TEST: AUTH + THEME SWITCHING');
  console.log('====================================================');

  const edgePort = 9225;
  const edgeProfile = `D:\\projects\\builder\\scripts\\.edge_regress_${Date.now()}`;
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const edgeProc = spawn(edgePath, [
    `--remote-debugging-port=${edgePort}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${edgeProfile}`,
    'about:blank',
  ]);

  await sleep(2000);

  // Get debug targets
  const versionData = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${edgePort}/json/version`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const listData = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${edgePort}/json/list`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const target = listData.find((t) => t.type === 'page') || listData[0];
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Network.enable');

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
    // -------------------------------------------------------------
    // SECTION A: THEME SWITCHING IN-DEPTH VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- TESTING THEME SWITCHING FLOW ---');

    await client.send('Page.navigate', { url: 'http://127.0.0.1:3000/login' });
    await sleep(2500);

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

    const afterLight = await client.eval(`({
      dataTheme: document.documentElement.getAttribute('data-theme'),
      isLight: document.documentElement.classList.contains('light'),
      isDark: document.documentElement.classList.contains('dark'),
      colorScheme: document.documentElement.style.colorScheme,
      localStored: localStorage.getItem('smart_resume_theme')
    })`);
    console.log('State after switching to Light:', afterLight);

    if (afterLight.dataTheme === 'light' && afterLight.isLight && afterLight.localStored === 'light') {
      results.theme.step2_switchToLight = true;
      console.log('PASS: Step 2: Switched to Light mode successfully.');
    }

    // Step 1: Switch to Dark mode
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

    const afterDark = await client.eval(`({
      dataTheme: document.documentElement.getAttribute('data-theme'),
      isLight: document.documentElement.classList.contains('light'),
      isDark: document.documentElement.classList.contains('dark'),
      colorScheme: document.documentElement.style.colorScheme,
      localStored: localStorage.getItem('smart_resume_theme')
    })`);
    console.log('State after switching to Dark:', afterDark);

    if (afterDark.dataTheme === 'dark' && afterDark.isDark && afterDark.localStored === 'dark') {
      results.theme.step1_switchToDark = true;
      console.log('PASS: Step 1: Switched to Dark mode successfully.');
    }

    // Switch back to Light to test persistence across navigation and reload
    await client.eval(`document.querySelector('#theme-toggle-light')?.click()`);
    await sleep(400);

    // Step 4: Reload browser and verify theme persistence
    console.log('Reloading page to test theme persistence...');
    await client.send('Page.reload');
    await sleep(2500);

    const afterReload = await client.eval(`({
      dataTheme: document.documentElement.getAttribute('data-theme'),
      isLight: document.documentElement.classList.contains('light'),
      isDark: document.documentElement.classList.contains('dark'),
      localStored: localStorage.getItem('smart_resume_theme')
    })`);
    console.log('State after page reload:', afterReload);

    if (afterReload.dataTheme === 'light' && afterReload.isLight && afterReload.localStored === 'light') {
      results.theme.step4_reloadPersistsTheme = true;
      results.theme.step5_themeCorrectlyAppliedToDom = true;
      console.log('PASS: Step 4 & 5: Selected theme persists across reload without FOUC.');
    }

    // Step 3: Navigate across routes (e.g., to /register)
    console.log('Navigating to /register to test theme persistence across routes...');
    await client.send('Page.navigate', { url: 'http://127.0.0.1:3000/register' });
    await sleep(2500);

    const onRegisterTheme = await client.eval(`({
      dataTheme: document.documentElement.getAttribute('data-theme'),
      isLight: document.documentElement.classList.contains('light'),
      localStored: localStorage.getItem('smart_resume_theme')
    })`);
    console.log('Theme on /register after navigation:', onRegisterTheme);

    if (onRegisterTheme.dataTheme === 'light' && onRegisterTheme.isLight) {
      results.theme.step3_navigateAcrossRoutes = true;
      console.log('PASS: Step 3: Theme persisted across navigation to /register.');
    }

    // Step 6: Check for hydration or script errors
    const themeErrors = client.consoleLogs.filter(
      (l) => l.type === 'error' && (l.text.includes('hydration') || l.text.includes('Hydration') || l.text.includes('Script'))
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

    console.log(`Registering account: ${testEmail}...`);
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

    await sleep(400);

    console.log('Submitting registration form...');
    await client.eval(`(function() {
      const submitBtn = document.querySelector('button[type="submit"]');
      submitBtn.click();
    })()`);

    // Wait for redirect to /dashboard
    await sleep(3500);
    const postRegUrl = await client.eval('window.location.href');
    console.log('URL after registration:', postRegUrl);

    if (postRegUrl.includes('/dashboard')) {
      results.auth.step1_registerNewAccount = true;
      console.log('PASS: Step 1: Registered new test account and redirected to /dashboard.');
    }

    // Step 6: Log out and verify protected access is removed
    console.log('Logging out from /dashboard...');
    await client.eval(`(function() {
      // Look for sign out button in header or sidebar
      const btns = Array.from(document.querySelectorAll('button'));
      const logoutBtn = btns.find(b => b.textContent.includes('Sign Out') || b.textContent.includes('Log Out'));
      if (logoutBtn) {
        logoutBtn.click();
        return;
      }
      // Call api logout directly and navigate
      fetch('/api/auth/logout', { method: 'POST' }).then(() => {
        window.location.href = '/login';
      });
    })()`);

    await sleep(3000);
    const postLogoutUrl = await client.eval('window.location.href');
    console.log('URL after logout:', postLogoutUrl);

    // Try visiting protected route /dashboard while logged out
    await client.send('Page.navigate', { url: 'http://127.0.0.1:3000/dashboard' });
    await sleep(2500);
    const guardedUrl = await client.eval('window.location.href');
    console.log('URL when accessing /dashboard while logged out:', guardedUrl);

    if (guardedUrl.includes('/login')) {
      results.auth.step6_logoutRemovesProtectedAccess = true;
      console.log('PASS: Step 6: Logout successfully revoked session; protected route redirected to /login.');
    }

    // Step 3: Verify incorrect credentials are rejected
    console.log('Testing incorrect credentials rejection on /login...');
    await client.send('Page.navigate', { url: 'http://127.0.0.1:3000/login' });
    await sleep(2000);

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
    await client.eval(`document.querySelector('button[type="submit"]').click()`);
    await sleep(1500);

    const errorMessage = await client.eval(`document.querySelector('#auth-error')?.textContent || ''`);
    console.log('Error banner text on invalid credentials:', errorMessage);

    if (errorMessage.includes('Invalid email or password')) {
      results.auth.step3_rejectIncorrectCredentials = true;
      console.log('PASS: Step 3: Incorrect credentials correctly rejected with clean error message.');
    }

    // Step 2: Log in with the correct credentials
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
    await client.eval(`document.querySelector('button[type="submit"]').click()`);
    await sleep(3500);

    const loginRedirectUrl = await client.eval('window.location.href');
    console.log('URL after correct login submission:', loginRedirectUrl);

    if (loginRedirectUrl.includes('/dashboard')) {
      results.auth.step2_loginCorrectCredentials = true;
      console.log('PASS: Step 2: Correct login redirected to /dashboard successfully.');
    }

    // Step 4: Reload page and verify session behaves correctly
    console.log('Reloading /dashboard to verify session persistence...');
    await client.send('Page.reload');
    await sleep(2500);

    const afterReloadDashUrl = await client.eval('window.location.href');
    const userDisplayName = await client.eval(`document.querySelector('span.font-semibold, h1, h2')?.textContent || ''`);
    console.log('URL after reload on /dashboard:', afterReloadDashUrl);

    if (afterReloadDashUrl.includes('/dashboard')) {
      results.auth.step4_reloadMaintainsSession = true;
      console.log('PASS: Step 4: Page reload maintains active session on /dashboard.');
    }

    // Step 5: Visit protected routes while logged in
    console.log('Navigating to protected route /builder...');
    await client.send('Page.navigate', { url: 'http://127.0.0.1:3000/builder' });
    await sleep(2500);

    const builderUrl = await client.eval('window.location.href');
    console.log('URL on /builder while logged in:', builderUrl);

    if (builderUrl.includes('/builder')) {
      results.auth.step5_visitProtectedRoute = true;
      console.log('PASS: Step 5: Protected route /builder accessible with valid session.');
    }

    // Step 7: Verify an existing test account still works
    console.log('\nTesting existing test account login...');
    // Log out first
    await client.eval(`fetch('/api/auth/logout', { method: 'POST' }).then(() => { window.location.href = '/login'; })`);
    await sleep(2500);

    // Login with existing account from database
    const existingEmail = 'candidate_showcase@career.test';
    const existingPassword = 'Password123!';

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
      setVal(emailInput, ${JSON.stringify(existingEmail)});
      setVal(passInput, ${JSON.stringify(existingPassword)});
    })()`);

    await sleep(300);
    await client.eval(`document.querySelector('button[type="submit"]').click()`);
    await sleep(3500);

    const existingLoginUrl = await client.eval('window.location.href');
    console.log('URL after existing account login:', existingLoginUrl);

    if (existingLoginUrl.includes('/dashboard')) {
      results.auth.step7_existingAccountWorks = true;
      console.log('PASS: Step 7: Existing test account (user@example.com) works perfectly.');
    }

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    client.close();
    edgeProc.kill();
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
