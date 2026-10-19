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
    this.exceptions = [];
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
          this.exceptions.push(text);
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

async function testBrowser(name, args) {
  console.log(`\n========================================`);
  console.log(`TESTING: ${name}`);
  console.log(`========================================`);
  const port = 9333;
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const proc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    ...args,
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

    if (!wsUrl) throw new Error('Could not connect to Chrome CDP');

    cdp = new CdpClient(wsUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    await cdp.send('Page.navigate', { url: 'http://localhost:3000/login' });
    await sleep(3000);

    const domInfo = await cdp.eval(`
      (() => {
        const emailDiv = document.querySelector('label[for="email"] + div');
        return {
          emailDivHTML: emailDiv ? emailDiv.outerHTML.substring(0, 300) : null,
          hasVueScoped: emailDiv ? !!emailDiv.querySelector('[data-v-4914bf38]') : false,
          vueAttrElement: document.querySelector('[data-v-4914bf38]') ? document.querySelector('[data-v-4914bf38]').outerHTML.substring(0, 200) : null,
          inputsCount: document.querySelectorAll('input').length,
          loginBtnPresent: !!document.querySelector('button[type="submit"]'),
          themeToggleLightPresent: !!document.getElementById('theme-toggle-light')
        };
      })()
    `);

    console.log('DOM Inspection:', domInfo);
    console.log('Console Logs count:', cdp.consoleLogs.length);
    const hydrationErrors = cdp.consoleLogs.filter(
      (l) => l.text.toLowerCase().includes('hydration') || l.text.includes('4914bf38') || l.text.includes('mismatch')
    );
    console.log('Hydration / Mismatch Errors found:', hydrationErrors);

    return { domInfo, hydrationErrors, allLogs: cdp.consoleLogs };
  } finally {
    if (cdp) cdp.close();
    try {
      proc.kill('SIGKILL');
    } catch {}
  }
}

async function run() {
  const cleanDir = `D:\\projects\\builder\\scripts\\.chrome_clean_${Date.now()}`;
  const extensionPath = `${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data\\Default\\Extensions\\ckcdnopgiijkcoejjophlljlfommgihi\\2.1.9_0`;

  // 1. Clean browser test (no extensions)
  await testBrowser('Clean Chrome Profile (Zero Extensions)', [
    `--user-data-dir=${cleanDir}`,
  ]);

  // 2. Extension loaded test
  const extDir = `D:\\projects\\builder\\scripts\\.chrome_ext_${Date.now()}`;
  await testBrowser('Chrome Profile With Temp Mail Extension Loaded', [
    `--user-data-dir=${extDir}`,
    `--load-extension=${extensionPath}`,
    `--disable-extensions-except=${extensionPath}`,
  ]);
}

run().catch(console.error);
