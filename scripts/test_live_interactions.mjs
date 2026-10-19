import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

async function wait(ms) {
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

async function runLiveTest() {
  console.log('=== STARTING LIVE BROWSER TESTS FOR THEME & LOGIN ===');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_live_${Date.now()}`;

  const proc = spawn(
    edgePath,
    [
      '--headless=new',
      `--remote-debugging-port=9245`,
      `--user-data-dir=${userDataDir}`,
      `--window-size=1440,1100`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await wait(300);
      try {
        targets = await getJson('http://localhost:9245/json');
        if (targets && targets.length > 0) break;
      } catch {}
    }

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.on('open', resolve));

    let msgId = 1;
    const send = (method, params = {}) => {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (data) => {
          const msg = JSON.parse(data.toString());
          if (msg.id === id) {
            ws.off('message', handler);
            resolve(msg.result);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    const consoleLogs = [];
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.method === 'Runtime.consoleAPICalled') {
          const args = msg.params.args?.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
          consoleLogs.push(`[CONSOLE ${msg.params.type.toUpperCase()}] ${args}`);
        }
        if (msg.method === 'Log.entryAdded') {
          consoleLogs.push(`[LOG ${msg.params.entry.level}] ${msg.params.entry.text}`);
        }
      } catch {}
    });

    await send('Page.enable');
    await send('Network.enable');
    await send('Runtime.enable');
    await send('Log.enable');

    // ----------------------------------------------------
    // TEST 1: THEME SWITCHING ON /login
    // ----------------------------------------------------
    console.log('\n--- 1. TESTING THEME SWITCHING ---');
    console.log('Navigating to http://localhost:3000/login ...');
    await send('Page.navigate', { url: 'http://localhost:3000/login' });
    await wait(3000);

    const getThemeInfo = async () => {
      const res = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const html = document.documentElement;
            const body = document.body;
            return {
              htmlClass: html.className,
              htmlDataTheme: html.getAttribute('data-theme'),
              htmlColorScheme: html.style.colorScheme,
              bodyBg: window.getComputedStyle(body).backgroundColor,
              bgPrimaryVar: window.getComputedStyle(html).getPropertyValue('--bg-primary').trim(),
              textPrimaryVar: window.getComputedStyle(html).getPropertyValue('--text-primary').trim(),
              localStorage: localStorage.getItem('smart_resume_theme') || localStorage.getItem('theme'),
            };
          })()
        `,
        returnByValue: true,
      });
      return res.result?.value;
    };

    console.log('Theme before toggle:', await getThemeInfo());

    // Click Light button
    console.log('Clicking "Light" button in ThemeToggle...');
    const clickLight = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const lightBtn = buttons.find(b => b.textContent.trim() === 'Light' || b.getAttribute('title') === 'Activate Light Mode');
          if (!lightBtn) return { error: 'Light button not found' };
          lightBtn.click();
          return { clicked: true };
        })()
      `,
      returnByValue: true,
    });
    console.log('Click Light result:', clickLight.result?.value);
    await wait(800);

    const themeAfterLight = await getThemeInfo();
    console.log('Theme after clicking Light:', themeAfterLight);

    // Reload page to test persistence
    console.log('Reloading page to test theme persistence...');
    await send('Page.reload');
    await wait(2500);

    const themeAfterReload = await getThemeInfo();
    console.log('Theme after reload (must still be light):', themeAfterReload);

    // Click Dark button
    console.log('Clicking "Dark" button in ThemeToggle...');
    const clickDark = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const darkBtn = buttons.find(b => b.textContent.trim() === 'Dark' || b.getAttribute('title') === 'Activate Dark Mode');
          if (!darkBtn) return { error: 'Dark button not found' };
          darkBtn.click();
          return { clicked: true };
        })()
      `,
      returnByValue: true,
    });
    console.log('Click Dark result:', clickDark.result?.value);
    await wait(800);

    const themeAfterDark = await getThemeInfo();
    console.log('Theme after clicking Dark:', themeAfterDark);

    // ----------------------------------------------------
    // TEST 2: AUTHENTICATION FLOW
    // ----------------------------------------------------
    console.log('\n--- 2. TESTING AUTHENTICATION FLOW ---');
    // Ensure clean state (logged out)
    await send('Network.clearBrowserCookies');
    await send('Page.navigate', { url: 'http://localhost:3000/login' });
    await wait(2000);

    const testUser = {
      email: `flow_test_${Date.now()}@example.com`,
      password: 'StrongPassword123!',
      fullName: 'Flow Test Candidate',
    };

    console.log('Registering user via API:', testUser.email);
    const regRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: testUser.fullName,
        email: testUser.email,
        password: testUser.password,
        confirmPassword: testUser.password,
      }),
    });
    console.log('Registration HTTP code:', regRes.status);

    // A. TEST REJECTION OF INCORRECT CREDENTIALS
    console.log('\nSubmitting INCORRECT password in login form...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const emailInput = document.getElementById('email');
          const passInput = document.getElementById('password');
          const submitBtn = document.querySelector('button[type="submit"]');

          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(emailInput, '${testUser.email}');
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));

          setter.call(passInput, 'WRONG_PASSWORD_XYZ');
          passInput.dispatchEvent(new Event('input', { bubbles: true }));

          submitBtn.click();
        })()
      `,
    });
    await wait(1500);

    const rejectionCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const errBanner = document.getElementById('auth-error');
          return {
            hasErrorBanner: Boolean(errBanner),
            errorMessage: errBanner ? errBanner.textContent.trim() : null,
            currentUrl: window.location.href,
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('Incorrect password rejection check:', rejectionCheck.result?.value);

    // B. TEST LOGIN WITH CORRECT CREDENTIALS
    console.log('\nSubmitting CORRECT credentials in login form...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const emailInput = document.getElementById('email');
          const passInput = document.getElementById('password');
          const submitBtn = document.querySelector('button[type="submit"]');

          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(emailInput, '${testUser.email}');
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));

          setter.call(passInput, '${testUser.password}');
          passInput.dispatchEvent(new Event('input', { bubbles: true }));

          submitBtn.click();
        })()
      `,
    });
    await wait(3000);

    const afterLoginCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          return {
            currentUrl: window.location.href,
            pathname: window.location.pathname,
            title: document.title,
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('After login check:', afterLoginCheck.result?.value);

    // Check cookies
    const cookies = await send('Network.getCookies');
    const sessionCookie = cookies.cookies.find(c => c.name === 'sra_user_session');
    console.log('Session Cookie present:', Boolean(sessionCookie), sessionCookie ? `Expires: ${new Date(sessionCookie.expires * 1000).toISOString()}` : '');

    // C. TEST PROTECTED ROUTE RELOAD
    console.log('\nReloading protected route (/dashboard)...');
    await send('Page.reload');
    await wait(2500);

    const reloadCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          return {
            currentUrl: window.location.href,
            pathname: window.location.pathname,
            hasDashboardSidebar: Boolean(document.querySelector('aside')),
            userNameInHeader: document.querySelector('header')?.textContent?.includes('${testUser.fullName}') || false,
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('Protected route reload check:', reloadCheck.result?.value);

    // D. TEST NAVIGATING TO OTHER PROTECTED ROUTES (e.g. /builder, /analyzer)
    console.log('\nNavigating to /builder while authenticated...');
    await send('Page.navigate', { url: 'http://localhost:3000/builder' });
    await wait(2500);
    const builderCheck = await send('Runtime.evaluate', {
      expression: `
        (() => ({
          pathname: window.location.pathname,
          hasA4: Boolean(document.getElementById('resume-a4-document')),
        }))()
      `,
      returnByValue: true,
    });
    console.log('Builder navigation check:', builderCheck.result?.value);

    // E. TEST LOGOUT
    console.log('\nTesting logout...');
    const logoutRes = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { cookie: `sra_user_session=${sessionCookie?.value}` },
    });
    console.log('Logout API status:', logoutRes.status);

    await send('Network.clearBrowserCookies');
    await send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
    await wait(2000);

    const loggedOutCheck = await send('Runtime.evaluate', {
      expression: `
        (() => ({
          pathname: window.location.pathname,
          search: window.location.search,
        }))()
      `,
      returnByValue: true,
    });
    console.log('Logged out access to /dashboard redirected to:', loggedOutCheck.result?.value);

    console.log('\n--- CONSOLE LOGS CAPTURED DURING RUNTIME ---');
    consoleLogs.forEach(l => console.log(l));

  } finally {
    proc.kill();
  }
}

runLiveTest().catch(console.error);
