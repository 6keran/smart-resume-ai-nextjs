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

async function runDiagnostic() {
  console.log('=== STARTING BROWSER RUNTIME DIAGNOSTIC ===');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_diag_${Date.now()}`;

  const proc = spawn(
    edgePath,
    [
      '--headless=new',
      `--remote-debugging-port=9240`,
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
        targets = await getJson('http://localhost:9240/json');
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
    const networkFailures = [];

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.method === 'Runtime.consoleAPICalled') {
          const args = msg.params.args?.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
          consoleLogs.push(`[${msg.params.type.toUpperCase()}] ${args}`);
        }
        if (msg.method === 'Network.responseReceived') {
          const status = msg.params.response.status;
          const url = msg.params.response.url;
          if (status >= 400) {
            networkFailures.push(`${status} ${url}`);
          }
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

    console.log('\n--- DIAGNOSING LOGIN PAGE ---');
    console.log('Navigating to http://localhost:3000/login ...');
    await send('Page.navigate', { url: 'http://localhost:3000/login' });
    await wait(3000);

    // Check page DOM and elements
    const pageState = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[name="email"]') || document.getElementById('email');
          const passInput = document.querySelector('input[type="password"]') || document.querySelector('input[name="password"]') || document.getElementById('password');
          const submitBtn = document.querySelector('button[type="submit"]') || document.getElementById('btn-login-submit');
          const forms = Array.from(document.querySelectorAll('form')).map(f => ({
            id: f.id,
            action: f.action,
            method: f.method,
            buttonCount: f.querySelectorAll('button').length
          }));

          return {
            title: document.title,
            hasEmail: Boolean(emailInput),
            emailId: emailInput?.id,
            hasPass: Boolean(passInput),
            passId: passInput?.id,
            hasSubmit: Boolean(submitBtn),
            submitId: submitBtn?.id,
            submitText: submitBtn?.textContent?.trim(),
            forms
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Login Page DOM State:', JSON.stringify(pageState.result?.value, null, 2));

    // Try filling in credentials of an existing account or register a test user first
    console.log('\nRegistering a test account via API to guarantee known credentials...');
    const testEmail = `login_diag_${Date.now()}@example.com`;
    const testPass = 'Password123!';
    const regRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Diagnostic User', email: testEmail, password: testPass, confirmPassword: testPass })
    });
    console.log('Registered user status:', regRes.status);

    // Clear cookies in the browser so we are starting logged out
    await send('Network.clearBrowserCookies');

    // Reload /login
    await send('Page.navigate', { url: 'http://localhost:3000/login' });
    await wait(2000);

    // Fill form and click submit in browser
    console.log(`\nTyping credentials (${testEmail}) and clicking submit in browser...`);
    const submitResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const emailInput = document.querySelector('input[type="email"]');
          const passInput = document.querySelector('input[type="password"]');
          const submitBtn = document.querySelector('button[type="submit"]');

          if (!emailInput || !passInput || !submitBtn) {
            return { error: 'Elements missing', emailInput: Boolean(emailInput), passInput: Boolean(passInput), submitBtn: Boolean(submitBtn) };
          }

          // Use React friendly value setter
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(emailInput, '${testEmail}');
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
          emailInput.dispatchEvent(new Event('change', { bubbles: true }));

          nativeInputValueSetter.call(passInput, '${testPass}');
          passInput.dispatchEvent(new Event('input', { bubbles: true }));
          passInput.dispatchEvent(new Event('change', { bubbles: true }));

          // Click submit
          submitBtn.click();
          return { submitted: true, emailVal: emailInput.value, passVal: passInput.value ? '***' : '' };
        })()
      `,
      returnByValue: true
    });
    console.log('Submission result:', JSON.stringify(submitResult.result?.value, null, 2));

    await wait(3000);

    // Check where the page navigated to
    const currentUrl = await send('Runtime.evaluate', {
      expression: 'window.location.href',
      returnByValue: true
    });
    console.log('Current URL after login submit:', currentUrl.result?.value);

    // Check browser cookies
    const cookiesRes = await send('Network.getCookies');
    console.log('Browser cookies after login:', cookiesRes.cookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`));

    console.log('\n--- DIAGNOSING THEME TOGGLE ---');
    // Check theme state
    const themeState1 = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const html = document.documentElement;
          const body = document.body;
          const toggleBtns = document.querySelectorAll('.theme-toggle, [aria-label*="theme" i], button[id*="theme" i]');
          return {
            htmlClass: html.className,
            htmlDataTheme: html.getAttribute('data-theme'),
            bodyClass: body.className,
            bodyBg: window.getComputedStyle(body).backgroundColor,
            bodyColor: window.getComputedStyle(body).color,
            cssVars: {
              bgPrimary: window.getComputedStyle(html).getPropertyValue('--bg-primary'),
              textPrimary: window.getComputedStyle(html).getPropertyValue('--text-primary'),
            },
            toggleButtonCount: toggleBtns.length,
            toggleButtons: Array.from(toggleBtns).map(b => ({
              id: b.id,
              ariaLabel: b.getAttribute('aria-label'),
              text: b.textContent?.trim(),
              visible: b.offsetParent !== null,
              disabled: b.disabled
            }))
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Initial Theme State:', JSON.stringify(themeState1.result?.value, null, 2));

    // Try clicking theme toggle
    console.log('\nClicking theme toggle in browser...');
    const clickToggleResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('.theme-toggle') || document.querySelector('button[aria-label*="theme" i]') || document.querySelector('#theme-toggle-btn');
          if (!btn) return { error: 'No toggle button found' };
          btn.click();
          return { clicked: true, id: btn.id };
        })()
      `,
      returnByValue: true
    });
    console.log('Toggle Click Result:', JSON.stringify(clickToggleResult.result?.value, null, 2));

    await wait(1000);

    const themeState2 = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const html = document.documentElement;
          const body = document.body;
          return {
            htmlClass: html.className,
            htmlDataTheme: html.getAttribute('data-theme'),
            bodyClass: body.className,
            bodyBg: window.getComputedStyle(body).backgroundColor,
            bodyColor: window.getComputedStyle(body).color,
            localStorageTheme: localStorage.getItem('theme'),
            cssVars: {
              bgPrimary: window.getComputedStyle(html).getPropertyValue('--bg-primary'),
              textPrimary: window.getComputedStyle(html).getPropertyValue('--text-primary'),
            }
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Theme State After Toggle Click:', JSON.stringify(themeState2.result?.value, null, 2));

    console.log('\n--- CONSOLE LOGS & ERRORS COLLECTED ---');
    consoleLogs.forEach(l => console.log(l));

    console.log('\n--- NETWORK FAILURES COLLECTED ---');
    networkFailures.forEach(f => console.log(f));

  } finally {
    proc.kill();
  }
}

runDiagnostic().catch(console.error);
