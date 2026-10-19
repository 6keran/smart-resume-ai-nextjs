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

async function runThemeDiagnosis() {
  console.log('==============================================');
  console.log('INDEPENDENT THEME TOGGLE DETAILED INVESTIGATION');
  console.log('==============================================');

  const port = 9345;
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const profile = `D:\\projects\\builder\\scripts\\.edge_theme_diag_${Date.now()}`;

  const proc = spawn(edgePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    'about:blank',
  ]);

  let cdp = null;
  try {
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        const list = await new Promise((resolve, reject) => {
          http.get(`http://127.0.0.1:${port}/json/list`, (res) => {
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

    console.log('\n--- 1. Navigating to /login ---');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/login' });
    await sleep(2000);

    // Initial state check
    const initialState = await cdp.eval(`
      (() => {
        const root = document.documentElement;
        const body = document.body;
        const style = getComputedStyle(root);
        return {
          rootDataTheme: root.getAttribute('data-theme'),
          rootClasses: Array.from(root.classList),
          rootColorScheme: root.style.colorScheme,
          bodyDataTheme: body ? body.getAttribute('data-theme') : null,
          bodyClasses: body ? Array.from(body.classList) : null,
          cssBgPrimary: style.getPropertyValue('--bg-primary').trim(),
          cssTextPrimary: style.getPropertyValue('--text-primary').trim(),
          cssBorderColor: style.getPropertyValue('--border-color').trim(),
          localStorage_theme: localStorage.getItem('smart_resume_theme'),
          lightBtnExists: !!document.getElementById('theme-toggle-light'),
          darkBtnExists: !!document.getElementById('theme-toggle-dark'),
          lightBtnAriaChecked: document.getElementById('theme-toggle-light')?.getAttribute('aria-checked'),
          darkBtnAriaChecked: document.getElementById('theme-toggle-dark')?.getAttribute('aria-checked')
        };
      })()
    `);
    console.log('Initial Theme State:', initialState);

    // Click Light button
    console.log('\n--- 2. Clicking #theme-toggle-light ---');
    const clickLightResult = await cdp.eval(`
      (() => {
        const btn = document.getElementById('theme-toggle-light');
        if (!btn) return { error: 'Light button not found' };
        btn.click();
        return { success: true };
      })()
    `);
    console.log('Click Light Result:', clickLightResult);
    await sleep(500);

    const stateAfterLight = await cdp.eval(`
      (() => {
        const root = document.documentElement;
        const body = document.body;
        const style = getComputedStyle(root);
        return {
          rootDataTheme: root.getAttribute('data-theme'),
          rootClasses: Array.from(root.classList),
          rootColorScheme: root.style.colorScheme,
          bodyDataTheme: body ? body.getAttribute('data-theme') : null,
          cssBgPrimary: style.getPropertyValue('--bg-primary').trim(),
          cssTextPrimary: style.getPropertyValue('--text-primary').trim(),
          localStorage_theme: localStorage.getItem('smart_resume_theme'),
          lightBtnAriaChecked: document.getElementById('theme-toggle-light')?.getAttribute('aria-checked'),
          darkBtnAriaChecked: document.getElementById('theme-toggle-dark')?.getAttribute('aria-checked')
        };
      })()
    `);
    console.log('State after clicking Light:', stateAfterLight);

    // Click Dark button
    console.log('\n--- 3. Clicking #theme-toggle-dark ---');
    const clickDarkResult = await cdp.eval(`
      (() => {
        const btn = document.getElementById('theme-toggle-dark');
        if (!btn) return { error: 'Dark button not found' };
        btn.click();
        return { success: true };
      })()
    `);
    console.log('Click Dark Result:', clickDarkResult);
    await sleep(500);

    const stateAfterDark = await cdp.eval(`
      (() => {
        const root = document.documentElement;
        const body = document.body;
        const style = getComputedStyle(root);
        return {
          rootDataTheme: root.getAttribute('data-theme'),
          rootClasses: Array.from(root.classList),
          rootColorScheme: root.style.colorScheme,
          bodyDataTheme: body ? body.getAttribute('data-theme') : null,
          cssBgPrimary: style.getPropertyValue('--bg-primary').trim(),
          cssTextPrimary: style.getPropertyValue('--text-primary').trim(),
          localStorage_theme: localStorage.getItem('smart_resume_theme'),
          lightBtnAriaChecked: document.getElementById('theme-toggle-light')?.getAttribute('aria-checked'),
          darkBtnAriaChecked: document.getElementById('theme-toggle-dark')?.getAttribute('aria-checked')
        };
      })()
    `);
    console.log('State after clicking Dark:', stateAfterDark);

    // Switch back to light, then reload page to test persistence
    console.log('\n--- 4. Switching to Light and reloading page ---');
    await cdp.eval(`document.getElementById('theme-toggle-light')?.click()`);
    await sleep(300);
    console.log('Reloading page via Page.reload...');
    await cdp.send('Page.reload');
    await sleep(2000);

    const stateAfterReload = await cdp.eval(`
      (() => {
        const root = document.documentElement;
        const body = document.body;
        const style = getComputedStyle(root);
        return {
          rootDataTheme: root.getAttribute('data-theme'),
          rootClasses: Array.from(root.classList),
          rootColorScheme: root.style.colorScheme,
          bodyDataTheme: body ? body.getAttribute('data-theme') : null,
          cssBgPrimary: style.getPropertyValue('--bg-primary').trim(),
          cssTextPrimary: style.getPropertyValue('--text-primary').trim(),
          localStorage_theme: localStorage.getItem('smart_resume_theme'),
          lightBtnAriaChecked: document.getElementById('theme-toggle-light')?.getAttribute('aria-checked'),
          darkBtnAriaChecked: document.getElementById('theme-toggle-dark')?.getAttribute('aria-checked')
        };
      })()
    `);
    console.log('State after Reload (should be light):', stateAfterReload);

    console.log('\n--- 5. Console errors during theme interactions ---');
    const errors = cdp.consoleLogs.filter((l) => l.type === 'error');
    console.log('Console Errors:', errors.length > 0 ? errors : 'NONE (0 errors)');

    return {
      success:
        stateAfterLight.rootDataTheme === 'light' &&
        stateAfterDark.rootDataTheme === 'dark' &&
        stateAfterReload.rootDataTheme === 'light' &&
        errors.length === 0,
    };
  } finally {
    if (cdp) cdp.close();
    try {
      proc.kill('SIGKILL');
    } catch {}
  }
}

runThemeDiagnosis().then(res => console.log('Theme Diagnosis Result:', res)).catch(console.error);
