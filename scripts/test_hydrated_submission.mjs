import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(1000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function testHydratedSubmit() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = 'd:\\projects\\builder\\scripts\\.edge_hydrated_test_' + Date.now();
  console.log('Spawning Edge with userDataDir:', userDataDir);
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ], { stdio: 'ignore' });

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await wait(300);
      try {
        targets = await getJson('http://localhost:9222/json');
        if (targets && targets.length > 0) {
          console.log(`Connected to Edge CDP after ${(i + 1) * 300}ms (${targets.length} targets)`);
          break;
        }
      } catch {}
    }

    if (!targets || targets.length === 0) {
      throw new Error('Failed to connect to Edge DevTools');
    }

    const pageTarget = targets.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension://')) || targets[0];
    console.log('Using target:', pageTarget.title, pageTarget.url);
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((r, j) => {
      ws.on('open', r);
      ws.on('error', j);
    });

    let msgId = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      const h = d => {
        const j = JSON.parse(d.toString());
        if (j.id === id) {
          ws.off('message', h);
          if (j.error) reject(j.error);
          else resolve(j.result);
        }
      };
      ws.on('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });

    ws.on('message', d => {
      const m = JSON.parse(d.toString());
      if (m.method === 'Network.responseReceived' && m.params.response.url.includes('/api/')) {
        console.log('[API CALL]', m.params.response.status, m.params.response.url);
      }
      if (m.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE]', m.params.type, m.params.args.map(a => a.value || a.description).join(' '));
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    console.log('Navigating to http://localhost:3000/register...');
    await send('Page.navigate', { url: 'http://localhost:3000/register' });

    console.log('Waiting for React hydration container...');
    let hydrated = false;
    for (let i = 0; i < 60; i++) {
      await wait(500);
      const chk = await send('Runtime.evaluate', {
        expression: 'Object.getOwnPropertyNames(document).some(k => k.startsWith("__reactContainer"))',
        returnByValue: true
      });
      if (chk?.result?.value === true) {
        console.log(`React is hydrated after ${(i + 1) * 500}ms!`);
        hydrated = true;
        break;
      }
    }

    if (!hydrated) {
      console.log('React failed to hydrate within 30s');
      ws.close();
      return;
    }

    // Wait a brief tick for components to mount
    await wait(1000);

    const testEmail = `hydrated_candidate_${Date.now()}@testcorp.com`;
    console.log('Filling form with:', testEmail);

    await send('Runtime.evaluate', {
      expression: `(() => {
        function setInput(el, val) {
          if (!el) return;
          const proto = Object.getPrototypeOf(el);
          const desc = Object.getOwnPropertyDescriptor(proto, 'value');
          if (desc && desc.set) {
            desc.set.call(el, val);
          } else {
            el.value = val;
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
        setInput(document.querySelector('input#fullName'), 'Hydrated Candidate');
        setInput(document.querySelector('input#email'), '${testEmail}');
        setInput(document.querySelector('input#password'), 'ValidPass123!');
        setInput(document.querySelector('input#confirmPassword'), 'ValidPass123!');
      })()`
    });

    await wait(500);

    console.log('Clicking submit button...');
    await send('Runtime.evaluate', {
      expression: 'document.querySelector("button[type=\'submit\']").click()'
    });

    await wait(3500);

    const postSubmitUrl = await send('Runtime.evaluate', {
      expression: 'window.location.href',
      returnByValue: true
    });
    console.log('URL after submit:', postSubmitUrl?.result?.value);

    const cookies = await send('Network.getCookies');
    console.log('Cookies present:', cookies.cookies.map(c => `${c.name}=${c.value.slice(0, 15)}...`));

    ws.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    proc.kill();
  }
}

testHydratedSubmit();
