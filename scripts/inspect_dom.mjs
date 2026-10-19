import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((r, j) => http.get(url, res => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => r(JSON.parse(d)));
  }).on('error', j));
}

async function test() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=d:\\projects\\builder\\scripts\\.edge_tmp_' + Date.now(),
    'about:blank'
  ], { stdio: 'ignore' });

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await wait(300);
      try {
        targets = await getJson('http://localhost:9222/json');
        if (targets?.length) break;
      } catch {}
    }
    const pageTarget = targets.find((t) => t.type === 'page' && !t.url.startsWith('chrome-extension://') && !t.url.startsWith('extension://')) || targets.find(t => t.type === 'page') || targets[0];
    console.log('Selected target:', pageTarget.url, pageTarget.title);
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let msgId = 1;
    const send = (method, params = {}) => new Promise(r => {
      const id = msgId++;
      const h = d => {
        const m = JSON.parse(d.toString());
        if (m.id === id) {
          ws.off('message', h);
          r(m.result);
        }
      };
      ws.on('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    ws.on('message', (d) => {
      const m = JSON.parse(d.toString());
      if (m.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE]', m.params.type, ...m.params.args.map(a => a.value || a.description));
      }
      if (m.method === 'Runtime.exceptionThrown') {
        console.log('[BROWSER EXCEPTION DETAILS]:', JSON.stringify(m.params.exceptionDetails, null, 2));
      }
      if (m.method === 'Network.requestWillBeSent') {
        if (m.params.request.url.includes('/api/')) {
          console.log('[BROWSER REQ]', m.params.request.method, m.params.request.url);
        }
      }
      if (m.method === 'Network.responseReceived') {
        if (m.params.response.url.includes('/api/')) {
          console.log('[BROWSER RES]', m.params.response.status, m.params.response.url);
        }
      }
    });

    console.log('Navigating to http://localhost:3000/register...');
    await send('Page.navigate', { url: 'http://localhost:3000/register' });
    await wait(3000);

    const formInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        const form = document.querySelector('form');
        if (!form) return { hasForm: false };
        const keys = Object.keys(form);
        const reactKey = keys.find(k => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'));
        const props = reactKey ? form[reactKey] : null;
        return {
          hasForm: true,
          keys,
          hasOnSubmit: Boolean(props?.onSubmit),
          propsKeys: props ? Object.keys(props) : []
        };
      })()`,
      returnByValue: true
    });
    console.log('Form inspection:', formInfo.result.value);

    // Log beforeunload or form submission
    await send('Runtime.evaluate', {
      expression: `
        window.addEventListener('beforeunload', (e) => {
          console.log('[PAGE NAVIGATING/UNLOADING]', window.location.href);
        });
        const form = document.querySelector('form');
        if (form) {
          form.addEventListener('submit', (e) => {
            console.log('[NATIVE SUBMIT FIRED] defaultPrevented:', e.defaultPrevented);
          });
        }
      `
    });

    const inputs = await send('Runtime.evaluate', {
      expression: 'Array.from(document.querySelectorAll("input")).map(i => ({ id: i.id, type: i.type, value: i.value }))',
      returnByValue: true
    });
    console.log('Inputs found on /register:', inputs.result.value);

    // Let's type into the inputs using CDP Input.dispatchKeyEvent or Input.insertText!
    // Focus fullName
    await send('Runtime.evaluate', { expression: 'document.querySelector("#fullName").focus()' });
    await send('Input.insertText', { text: 'Test Candidate Real' });

    // Focus email
    await send('Runtime.evaluate', { expression: 'document.querySelector("#email").focus()' });
    const emailToUse = `real_candidate_${Date.now()}@testcorp.com`;
    await send('Input.insertText', { text: emailToUse });

    // Focus password
    await send('Runtime.evaluate', { expression: 'document.querySelector("#password").focus()' });
    await send('Input.insertText', { text: 'ValidPassword123!' });

    // Focus confirmPassword
    await send('Runtime.evaluate', { expression: 'document.querySelector("#confirmPassword").focus()' });
    await send('Input.insertText', { text: 'ValidPassword123!' });

    await wait(500);

    const valuesAfterType = await send('Runtime.evaluate', {
      expression: 'Array.from(document.querySelectorAll("input")).map(i => ({ id: i.id, value: i.value }))',
      returnByValue: true
    });
    console.log('Values after insertText:', valuesAfterType.result.value);

    // Click submit button!
    console.log('Clicking Create Account button...');
    await send('Runtime.evaluate', {
      expression: 'document.querySelector("button[type=\'submit\']").click()'
    });

    await wait(4000);

    const currentUrl = await send('Runtime.evaluate', { expression: 'window.location.href' });
    console.log('Current URL after submit:', currentUrl.result.value);

    const pageCookies = await send('Network.getCookies');
    console.log('Cookies in browser:', pageCookies.cookies.map(c => `${c.name}=${c.value.substring(0, 15)}...`));

    const errorOnPage = await send('Runtime.evaluate', {
      expression: 'document.querySelector("#register-error")?.innerText || document.querySelector("#auth-error")?.innerText'
    });
    console.log('Error banner if any:', errorOnPage.result.value);

    ws.close();
  } finally {
    proc.kill();
  }
}

test().catch(console.error);
