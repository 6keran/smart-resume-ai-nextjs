import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';
import path from 'path';

async function testUrl(targetHost) {
  console.log(`\n======================================================`);
  console.log(`TESTING ACCESS ON: http://${targetHost}:3000/login`);
  console.log(`======================================================`);

  const edgeUserDataDir = path.resolve(`C:/Users/kiran/.gemini/antigravity-ide/brain/8b0c1bfc-4324-4535-b7a7-8e8286467afa/.edge_diag_${targetHost.replace(/[^a-zA-Z0-9]/g, '_')}`);
  const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
    '--headless=new',
    '--remote-debugging-port=9225',
    `--user-data-dir=${edgeUserDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9225/json', (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });

  const page = list.find(p => p.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let id = 1;
  const send = (m, p = {}) => new Promise(res => {
    const cur = id++;
    const handler = (msg) => {
      const data = JSON.parse(msg);
      if (data.id === cur) {
        ws.off('message', handler);
        res(data.result || {});
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: cur, method: m, params: p }));
  });

  const consoleLogs = [];
  const wsEvents = [];
  const networkErrors = [];

  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map(a => a.value || a.description || '').join(' ');
      consoleLogs.push(`[Console ${data.params.type}] ${text}`);
    }
    if (data.method === 'Log.entryAdded') {
      consoleLogs.push(`[Log ${data.params.entry.level}] ${data.params.entry.text}`);
    }
    if (data.method === 'Network.webSocketCreated') {
      wsEvents.push(`[WS Created] ${data.params.url}`);
    }
    if (data.method === 'Network.webSocketClosed') {
      wsEvents.push(`[WS Closed] requestId: ${data.params.requestId}`);
    }
    if (data.method === 'Network.webSocketFrameError') {
      wsEvents.push(`[WS Error] ${data.params.errorMessage}`);
    }
    if (data.method === 'Network.loadingFailed') {
      networkErrors.push(`[Network Failed] ${data.params.errorText} on type ${data.params.type}`);
    }
  });

  await send('Network.enable');
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');

  console.log(`Navigating to http://${targetHost}:3000/login ...`);
  await send('Page.navigate', { url: `http://${targetHost}:3000/login` });
  await new Promise(r => setTimeout(r, 3500));

  console.log(`Initial Logs for ${targetHost}:`);
  console.log('Console Logs:', consoleLogs);
  console.log('WS Events:', wsEvents);
  console.log('Network Errors:', networkErrors);

  // Test Theme Toggle
  console.log(`\nTesting Theme Toggle on ${targetHost}...`);
  const themeResult = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const lightBtn = document.getElementById('theme-toggle-light') || document.querySelector('button[aria-label*=\"Light\"]') || document.querySelector('button[title*=\"Light\"]');
        const before = document.documentElement.getAttribute('data-theme');
        if (lightBtn) {
          lightBtn.click();
        }
        return {
          foundBtn: Boolean(lightBtn),
          before,
          after: document.documentElement.getAttribute('data-theme')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Theme toggle click result:', themeResult.result?.value);

  // Test Login Form Submission
  console.log(`\nTesting Login Submission on ${targetHost}...`);
  const loginResult = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const emailInput = document.querySelector('input[type=\"email\"]') || document.querySelector('input[name=\"email\"]');
        const passInput = document.querySelector('input[type=\"password\"]') || document.querySelector('input[name=\"password\"]');
        const submitBtn = document.querySelector('button[type=\"submit\"]');

        if (!emailInput || !passInput || !submitBtn) {
          return { error: 'Form elements missing', email: Boolean(emailInput), pass: Boolean(passInput), btn: Boolean(submitBtn) };
        }

        // Set values using native setters to trigger React state updates
        const setVal = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        setVal(emailInput, 'user@example.com');
        setVal(passInput, 'Password123!');

        submitBtn.click();

        // Wait 2 seconds
        await new Promise(r => setTimeout(r, 2000));

        return {
          currentUrl: window.location.href,
          errorBanner: document.querySelector('.bg-rose-500\\\\/10, [role=\"alert\"]')?.innerText || null
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Login result:', loginResult.result?.value);

  // Wait another second to catch late events
  await new Promise(r => setTimeout(r, 1500));
  console.log('Final Console Logs:', consoleLogs.slice(-10));
  console.log('Final WS Events:', wsEvents);

  ws.close();
  edge.kill();
}

async function run() {
  await testUrl('192.168.56.1');
  await testUrl('localhost');
}

run().catch(console.error);
