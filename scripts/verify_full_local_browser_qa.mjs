import { spawn } from 'child_process';
import http from 'http';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
    this.consoleLogs = [];
    this.networkResponses = [];
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
          this.networkResponses.push(msg.params.response);
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

async function runFullVerification() {
  console.log('================================================================');
  console.log('COMPREHENSIVE BROWSER QA: LOGIN HYDRATION + THEME + AUTH SESSION');
  console.log('================================================================');

  const edgePort = 9360;
  const edgeProfile = `D:\\projects\\builder\\scripts\\.edge_final_qa_${Date.now()}`;
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

  let cdp = null;
  const results = {
    hydration: false,
    themeLight: false,
    themeDark: false,
    themeReloadPersistence: false,
    invalidCredentialsRejected: false,
    loginSuccessful: false,
    cookieHttpOnlySet: false,
    authMeVerified: false,
    sessionPersistenceOnReload: false,
    logoutSuccessful: false,
    protectedRouteBlocksAccess: false,
    zeroConsoleErrors: false,
  };

  try {
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        const list = await new Promise((resolve, reject) => {
          http.get(`http://127.0.0.1:${edgePort}/json/list`, (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => resolve(JSON.parse(data)));
          }).on('error', reject);
        });
        const pageTarget = list.find((t) => t.type === 'page') || list[0];
        if (pageTarget?.webSocketDebuggerUrl) {
          wsUrl = pageTarget.webSocketDebuggerUrl;
          break;
        }
      } catch {}
    }

    cdp = new CdpClient(wsUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');

    console.log('\n[TEST 1] Loading /login and checking hydration integrity...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/login' });
    await sleep(2500);

    const hydrationCheck = await cdp.eval(`
      (() => {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const emailContainer = emailInput ? emailInput.parentElement : null;
        return {
          emailInputExists: !!emailInput,
          emailInputReadOnly: emailInput ? emailInput.readOnly : null,
          passwordInputExists: !!passwordInput,
          passwordInputReadOnly: passwordInput ? passwordInput.readOnly : null,
          hasVueScopedDiv: emailContainer ? !!emailContainer.querySelector('[data-v-4914bf38]') : false,
          childCount: emailContainer ? emailContainer.children.length : 0,
        };
      })()
    `);
    console.log('Hydration check state:', hydrationCheck);

    const initialErrors = cdp.consoleLogs.filter(
      (l) => l.type === 'error' || l.text.toLowerCase().includes('hydration') || l.text.includes('mismatch')
    );
    console.log('Hydration errors on initial load:', initialErrors.length === 0 ? 'NONE (0 errors)' : initialErrors);
    results.hydration =
      hydrationCheck.emailInputExists &&
      hydrationCheck.emailInputReadOnly === false &&
      hydrationCheck.hasVueScopedDiv === false &&
      initialErrors.length === 0;

    console.log('\n[TEST 2] Testing Theme Toggle: Light Mode...');
    await cdp.eval(`document.getElementById('theme-toggle-light')?.click()`);
    await sleep(400);

    const lightState = await cdp.eval(`
      (() => {
        const root = document.documentElement;
        const style = getComputedStyle(root);
        return {
          dataTheme: root.getAttribute('data-theme'),
          isLightClass: root.classList.contains('light'),
          isDarkClass: root.classList.contains('dark'),
          colorScheme: root.style.colorScheme,
          bgPrimary: style.getPropertyValue('--bg-primary').trim(),
          textPrimary: style.getPropertyValue('--text-primary').trim(),
          storedTheme: localStorage.getItem('smart_resume_theme')
        };
      })()
    `);
    console.log('Light Mode state:', lightState);
    results.themeLight =
      lightState.dataTheme === 'light' &&
      lightState.isLightClass === true &&
      lightState.bgPrimary === '#FFFFFF' &&
      lightState.storedTheme === 'light';

    console.log('\n[TEST 3] Testing Theme Toggle: Dark Mode...');
    await cdp.eval(`document.getElementById('theme-toggle-dark')?.click()`);
    await sleep(400);

    const darkState = await cdp.eval(`
      (() => {
        const root = document.documentElement;
        const style = getComputedStyle(root);
        return {
          dataTheme: root.getAttribute('data-theme'),
          isLightClass: root.classList.contains('light'),
          isDarkClass: root.classList.contains('dark'),
          colorScheme: root.style.colorScheme,
          bgPrimary: style.getPropertyValue('--bg-primary').trim(),
          textPrimary: style.getPropertyValue('--text-primary').trim(),
          storedTheme: localStorage.getItem('smart_resume_theme')
        };
      })()
    `);
    console.log('Dark Mode state:', darkState);
    results.themeDark =
      darkState.dataTheme === 'dark' &&
      darkState.isDarkClass === true &&
      darkState.bgPrimary === '#171717' &&
      darkState.storedTheme === 'dark';

    console.log('\n[TEST 4] Testing Theme Persistence Across Page Reload...');
    // Set to light, reload, check if light persisted
    await cdp.eval(`document.getElementById('theme-toggle-light')?.click()`);
    await sleep(300);
    await cdp.send('Page.reload');
    await sleep(2000);

    const reloadedThemeState = await cdp.eval(`
      (() => {
        const root = document.documentElement;
        const style = getComputedStyle(root);
        return {
          dataTheme: root.getAttribute('data-theme'),
          bgPrimary: style.getPropertyValue('--bg-primary').trim(),
          storedTheme: localStorage.getItem('smart_resume_theme')
        };
      })()
    `);
    console.log('Theme state after reload:', reloadedThemeState);
    results.themeReloadPersistence =
      reloadedThemeState.dataTheme === 'light' &&
      reloadedThemeState.bgPrimary === '#FFFFFF' &&
      reloadedThemeState.storedTheme === 'light';

    console.log('\n[TEST 5] Testing Rejection of Invalid Credentials...');
    await cdp.eval(`
      (() => {
        const setVal = (el, val) => {
          const proto = Object.getPrototypeOf(el);
          const set = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
          set.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');
        setVal(emailInput, 'user@example.com');
        setVal(passInput, 'WrongPassword999!');
        document.querySelector('button[type="submit"]')?.click();
      })()
    `);
    await sleep(2000);

    const errorBanner = await cdp.eval(`
      (() => {
        const err = document.getElementById('auth-error');
        return {
          errorDisplayed: !!err,
          errorText: err ? err.textContent.trim() : null,
          currentUrl: window.location.href
        };
      })()
    `);
    console.log('Invalid login response:', errorBanner);
    results.invalidCredentialsRejected =
      errorBanner.errorDisplayed === true &&
      errorBanner.errorText.includes('Invalid email or password') &&
      errorBanner.currentUrl.includes('/login');

    console.log('\n[TEST 6] Registering fresh test account to verify complete login & session flow...');
    const testEmail = `user_qa_${Date.now()}@example.com`;
    const testPass = 'SecurePass123!';

    // Navigate to /register
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/register' });
    await sleep(2500);

    await cdp.eval(`
      (() => {
        const setVal = (el, val) => {
          const proto = Object.getPrototypeOf(el);
          const set = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
          set.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        const nameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');
        const confirmInput = document.getElementById('confirmPassword');

        setVal(nameInput, 'QA Test User');
        setVal(emailInput, '${testEmail}');
        setVal(passInput, '${testPass}');
        setVal(confirmInput, '${testPass}');
        document.querySelector('button[type="submit"]')?.click();
      })()
    `);
    await sleep(3500);

    const dashboardUrl = await cdp.eval('window.location.href');
    console.log('URL after account creation:', dashboardUrl);

    // Check cookies via CDP Network.getCookies
    const { cookies } = await cdp.send('Network.getCookies', { urls: ['http://localhost:3000'] });
    const sessionCookie = cookies.find((c) => c.name === 'sra_user_session');
    console.log('Session Cookie Details:', {
      found: !!sessionCookie,
      httpOnly: sessionCookie?.httpOnly,
      path: sessionCookie?.path,
      secure: sessionCookie?.secure,
      valuePrefix: sessionCookie?.value.substring(0, 20) + '...',
    });
    results.cookieHttpOnlySet = !!sessionCookie && sessionCookie.httpOnly === true;

    // Verify /api/auth/me returns authenticated
    const authMeResult = await cdp.eval(`
      fetch('/api/auth/me')
        .then(r => r.json())
        .catch(err => ({ error: err.message }))
    `);
    console.log('/api/auth/me response in browser:', authMeResult);
    results.authMeVerified = authMeResult.authenticated === true && authMeResult.user?.email === testEmail;

    // Test session persistence on reload
    console.log('\n[TEST 7] Testing Session Persistence on Reload...');
    await cdp.send('Page.reload');
    await sleep(2500);
    const urlAfterReload = await cdp.eval('window.location.href');
    console.log('URL on /dashboard after reload:', urlAfterReload);
    results.sessionPersistenceOnReload = urlAfterReload.includes('/dashboard');

    // Test logout
    console.log('\n[TEST 8] Testing Logout Flow...');
    await cdp.eval(`
      fetch('/api/auth/logout', { method: 'POST' }).then(() => {
        window.location.href = '/login';
      })
    `);
    await sleep(2500);
    const urlAfterLogout = await cdp.eval('window.location.href');
    console.log('URL after logout:', urlAfterLogout);

    // Verify cookies cleared
    const { cookies: cookiesAfterLogout } = await cdp.send('Network.getCookies', { urls: ['http://localhost:3000'] });
    const sessionCookieAfter = cookiesAfterLogout.find((c) => c.name === 'sra_user_session');
    console.log('Session cookie after logout:', sessionCookieAfter ? sessionCookieAfter.value : 'CLEARED (none)');
    results.logoutSuccessful = urlAfterLogout.includes('/login') && (!sessionCookieAfter || sessionCookieAfter.value === '');

    // Test accessing protected route while logged out
    console.log('\n[TEST 9] Testing Protected Route Access While Logged Out...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
    await sleep(2500);
    const protectedAttemptUrl = await cdp.eval('window.location.href');
    console.log('URL when trying to visit /dashboard while logged out:', protectedAttemptUrl);
    results.protectedRouteBlocksAccess = protectedAttemptUrl.includes('/login');

    // Test logging in again with registered test account on /login
    console.log('\n[TEST 10] Testing Login on /login with Registered Credentials...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/login' });
    await sleep(2500);

    await cdp.eval(`
      (() => {
        const setVal = (el, val) => {
          const proto = Object.getPrototypeOf(el);
          const set = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
          set.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');
        setVal(emailInput, '${testEmail}');
        setVal(passInput, '${testPass}');
        document.querySelector('button[type="submit"]')?.click();
      })()
    `);
    await sleep(3500);
    const postLoginUrl = await cdp.eval('window.location.href');
    console.log('URL after login submission:', postLoginUrl);
    results.loginSuccessful = postLoginUrl.includes('/dashboard');

    // Total console errors check
    const allErrors = cdp.consoleLogs.filter(
      (l) => l.type === 'error' && !l.text.includes('Failed to load resource: the server responded with a status of 401')
    );
    console.log('\nTotal Unexpected Console Errors:', allErrors.length === 0 ? '0 errors' : allErrors);
    results.zeroConsoleErrors = allErrors.length === 0;

    console.log('\n================================================================');
    console.log('FINAL LOCAL BROWSER QA TEST SUMMARY:');
    console.log('================================================================');
    console.log(JSON.stringify(results, null, 2));

    const allPassed = Object.values(results).every(Boolean);
    console.log(`\nOVERALL STATUS: ${allPassed ? 'ALL TESTS PASSED SUCCESSFULLY! ✅' : 'SOME TESTS FAILED ❌'}`);
    return allPassed;
  } finally {
    if (cdp) cdp.close();
    try {
      edgeProc.kill('SIGKILL');
    } catch {}
  }
}

runFullVerification().catch(console.error);
