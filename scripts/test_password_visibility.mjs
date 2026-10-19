import { spawn } from 'child_process';
import http from 'http';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function ensureServerRunning() {
  if (await isServerReady()) {
    console.log('[Setup] Server already running on http://localhost:3000');
    return null;
  }

  console.log('[Setup] Starting Next.js dev server...');
  const serverProc = spawn('npm', ['run', 'dev'], {
    shell: true,
    cwd: process.cwd(),
    stdio: 'pipe',
  });

  const maxWait = 35000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await sleep(1000);
    if (await isServerReady()) {
      console.log(`[Setup] Next.js server ready in ${Math.round((Date.now() - start) / 1000)}s.`);
      return serverProc;
    }
  }

  throw new Error('Could not start server on http://localhost:3000');
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    const WebSocket = (await import('ws')).default || (await import('ws'));
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', () => resolve());
      this.ws.on('error', (err) => reject(err));
      this.ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
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

async function safeNavigate(client, targetUrl, readySelector = null, timeoutMs = 15000) {
  await client.send('Page.navigate', { url: targetUrl });
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await sleep(300);
    try {
      const isReady = await client.eval(`
        (() => {
          const isComplete = document.readyState === 'complete';
          const hasSelector = ${readySelector ? `Boolean(document.querySelector(${JSON.stringify(readySelector)}))` : 'true'};
          return isComplete && hasSelector;
        })()
      `);
      if (isReady) return;
    } catch {}
  }
  throw new Error(`Timeout navigating to ${targetUrl}`);
}

async function runPasswordVisibilitySuite() {
  console.log('====================================================');
  console.log('TESTING SHOW / HIDE PASSWORD FUNCTIONALITY');
  console.log('====================================================\n');

  let serverProc = null;
  let edgeProc = null;
  let client = null;

  try {
    serverProc = await ensureServerRunning();

    const edgePort = 9226;
    const edgeProfile = `D:\\projects\\builder\\scripts\\.edge_pass_${Date.now()}`;
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

    edgeProc = spawn(edgePath, [
      `--remote-debugging-port=${edgePort}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${edgeProfile}`,
      'about:blank',
    ]);

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
      throw new Error('Failed to connect to browser CDP target');
    }

    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    // -------------------------------------------------------------
    // TEST 1: LOGIN PAGE (/login)
    // -------------------------------------------------------------
    console.log('1. Testing /login password visibility toggle...');
    await safeNavigate(client, 'http://localhost:3000/login', 'input#password');

    // Helper to simulate real user typing in React controlled inputs
    await client.eval(`
      window.__setReactInput = (selector, val) => {
        const el = document.querySelector(selector);
        el.focus();
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
    `);

    // Set initial password
    const testSecret = 'SuperSecret2026!';
    await client.eval(`window.__setReactInput('input#password', ${JSON.stringify(testSecret)})`);
    await sleep(100);

    // Check initial state
    const loginInitial = await client.eval(`
      (() => {
        const input = document.querySelector('input#password');
        const btn = document.querySelector('#toggle-password');
        return {
          type: input.type,
          value: input.value,
          buttonType: btn.getAttribute('type'),
          ariaLabel: btn.getAttribute('aria-label'),
          ariaPressed: btn.getAttribute('aria-pressed'),
          hasEyeIcon: Boolean(btn.querySelector('svg.lucide-eye')),
          hasEyeOffIcon: Boolean(btn.querySelector('svg.lucide-eye-off'))
        };
      })()
    `);
    console.log('   Initial login state:', loginInitial);

    if (loginInitial.type !== 'password' || !loginInitial.hasEyeIcon || loginInitial.ariaPressed !== 'false') {
      throw new Error(`Login initial state incorrect: ${JSON.stringify(loginInitial)}`);
    }

    // Click Show Password
    console.log('   Clicking Show password button...');
    await client.eval(`document.querySelector('#toggle-password').click()`);
    await sleep(200);

    const loginRevealed = await client.eval(`
      (() => {
        const input = document.querySelector('input#password');
        const btn = document.querySelector('#toggle-password');
        return {
          type: input.type,
          value: input.value,
          ariaLabel: btn.getAttribute('aria-label'),
          ariaPressed: btn.getAttribute('aria-pressed'),
          hasEyeIcon: Boolean(btn.querySelector('svg.lucide-eye')),
          hasEyeOffIcon: Boolean(btn.querySelector('svg.lucide-eye-off'))
        };
      })()
    `);
    console.log('   Revealed state:', loginRevealed);

    if (loginRevealed.type !== 'text' || loginRevealed.value !== testSecret || !loginRevealed.hasEyeOffIcon || loginRevealed.ariaPressed !== 'true') {
      throw new Error(`Failed to reveal password: ${JSON.stringify(loginRevealed)}`);
    }

    // Click Hide Password
    console.log('   Clicking Hide password button...');
    await client.eval(`document.querySelector('#toggle-password').click()`);
    await sleep(200);

    const loginHidden = await client.eval(`
      (() => {
        const input = document.querySelector('input#password');
        const btn = document.querySelector('#toggle-password');
        return {
          type: input.type,
          value: input.value,
          ariaLabel: btn.getAttribute('aria-label'),
          ariaPressed: btn.getAttribute('aria-pressed'),
          hasEyeIcon: Boolean(btn.querySelector('svg.lucide-eye')),
          hasEyeOffIcon: Boolean(btn.querySelector('svg.lucide-eye-off'))
        };
      })()
    `);
    console.log('   Re-masked state:', loginHidden);

    if (loginHidden.type !== 'password' || loginHidden.value !== testSecret || !loginHidden.hasEyeIcon || loginHidden.ariaPressed !== 'false') {
      throw new Error(`Failed to re-hide password: ${JSON.stringify(loginHidden)}`);
    }
    console.log('✓ PASS: /login password show/hide works flawlessly.\n');

    // -------------------------------------------------------------
    // TEST 2: REGISTER PAGE (/register)
    // -------------------------------------------------------------
    console.log('2. Testing /register password and confirm-password toggles...');
    await safeNavigate(client, 'http://localhost:3000/register', 'input#confirmPassword');

    await client.eval(`
      window.__setReactInput = (selector, val) => {
        const el = document.querySelector(selector);
        el.focus();
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
    `);

    const regSecret1 = 'StrongPass123';
    const regSecret2 = 'StrongPass123';
    await client.eval(`window.__setReactInput('input#password', ${JSON.stringify(regSecret1)})`);
    await client.eval(`window.__setReactInput('input#confirmPassword', ${JSON.stringify(regSecret2)})`);
    await sleep(100);

    // Test toggle for password field
    await client.eval(`document.querySelector('#toggle-password').click()`);
    await sleep(100);
    const p1State = await client.eval(`({
      type: document.querySelector('input#password').type,
      value: document.querySelector('input#password').value,
      ariaPressed: document.querySelector('#toggle-password').getAttribute('aria-pressed')
    })`);
    if (p1State.type !== 'text' || p1State.value !== regSecret1 || p1State.ariaPressed !== 'true') {
      throw new Error(`Register password did not reveal: ${JSON.stringify(p1State)}`);
    }

    // Test toggle for confirmPassword field
    await client.eval(`document.querySelector('#toggle-confirm-password').click()`);
    await sleep(100);
    const p2State = await client.eval(`({
      type: document.querySelector('input#confirmPassword').type,
      value: document.querySelector('input#confirmPassword').value,
      ariaPressed: document.querySelector('#toggle-confirm-password').getAttribute('aria-pressed')
    })`);
    if (p2State.type !== 'text' || p2State.value !== regSecret2 || p2State.ariaPressed !== 'true') {
      throw new Error(`Register confirm-password did not reveal: ${JSON.stringify(p2State)}`);
    }

    // Toggle both back to hidden
    await client.eval(`document.querySelector('#toggle-password').click()`);
    await client.eval(`document.querySelector('#toggle-confirm-password').click()`);
    await sleep(100);
    const remasked = await client.eval(`({
      p1Type: document.querySelector('input#password').type,
      p2Type: document.querySelector('input#confirmPassword').type,
      p1Val: document.querySelector('input#password').value,
      p2Val: document.querySelector('input#confirmPassword').value
    })`);
    if (remasked.p1Type !== 'password' || remasked.p2Type !== 'password' || remasked.p1Val !== regSecret1 || remasked.p2Val !== regSecret2) {
      throw new Error(`Register fields did not re-mask: ${JSON.stringify(remasked)}`);
    }
    console.log('✓ PASS: /register password & confirm-password show/hide works flawlessly.\n');

    // -------------------------------------------------------------
    // TEST 3: ADMIN LOGIN PAGE (/admin/login)
    // -------------------------------------------------------------
    console.log('3. Testing /admin/login password visibility toggle...');
    await safeNavigate(client, 'http://localhost:3000/admin/login', 'input#admin-password');

    await client.eval(`
      window.__setReactInput = (selector, val) => {
        const el = document.querySelector(selector);
        el.focus();
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
    `);

    const adminSecret = 'MasterAdminPass!';
    await client.eval(`window.__setReactInput('input#admin-password', ${JSON.stringify(adminSecret)})`);
    await sleep(100);

    // Verify initial state
    const adminInitial = await client.eval(`
      (() => {
        const input = document.querySelector('input#admin-password');
        const btn = document.querySelector('#admin-toggle-password');
        return {
          type: input.type,
          tabIndex: btn.tabIndex,
          buttonType: btn.getAttribute('type'),
          ariaPressed: btn.getAttribute('aria-pressed')
        };
      })()
    `);
    if (adminInitial.type !== 'password' || adminInitial.tabIndex < 0 || adminInitial.ariaPressed !== 'false') {
      throw new Error(`Admin login initial state incorrect: ${JSON.stringify(adminInitial)}`);
    }

    // Click Show
    await client.eval(`document.querySelector('#admin-toggle-password').click()`);
    await sleep(100);
    const adminRevealed = await client.eval(`
      (() => {
        const input = document.querySelector('input#admin-password');
        const btn = document.querySelector('#admin-toggle-password');
        return {
          type: input.type,
          value: input.value,
          ariaPressed: btn.getAttribute('aria-pressed')
        };
      })()
    `);
    if (adminRevealed.type !== 'text' || adminRevealed.value !== adminSecret || adminRevealed.ariaPressed !== 'true') {
      throw new Error(`Admin password did not reveal: ${JSON.stringify(adminRevealed)}`);
    }

    // Click Hide
    await client.eval(`document.querySelector('#admin-toggle-password').click()`);
    await sleep(100);
    const adminHidden = await client.eval(`
      (() => {
        const input = document.querySelector('input#admin-password');
        const btn = document.querySelector('#admin-toggle-password');
        return {
          type: input.type,
          value: input.value,
          ariaPressed: btn.getAttribute('aria-pressed')
        };
      })()
    `);
    if (adminHidden.type !== 'password' || adminHidden.value !== adminSecret || adminHidden.ariaPressed !== 'false') {
      throw new Error(`Admin password did not re-mask: ${JSON.stringify(adminHidden)}`);
    }
    console.log('✓ PASS: /admin/login password show/hide works flawlessly.\n');

    console.log('====================================================');
    console.log('🎉 ALL SHOW/HIDE PASSWORD TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } finally {
    client?.close();
    if (edgeProc) {
      try {
        process.kill(edgeProc.pid);
      } catch {}
    }
    if (serverProc) {
      try {
        process.kill(serverProc.pid);
      } catch {}
    }
  }
}

runPasswordVisibilitySuite().catch((err) => {
  console.error('\n❌ Password visibility test failed:', err);
  process.exit(1);
});
