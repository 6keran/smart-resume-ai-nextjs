import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function runTest() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=d:\\projects\\builder\\scripts\\.edge_dbg_test_' + Date.now(),
    'about:blank'
  ], { stdio: 'ignore' });

  await wait(1000);
  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await wait(200);
      try {
        targets = await getJson('http://localhost:9222/json');
        if (targets?.length) break;
      } catch {}
    }
    const pageTarget = targets.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension://')) || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

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
        console.log('[API RESPONSE]', m.params.response.status, m.params.response.url);
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    console.log('Navigating to http://localhost:3000/register...');
    await send('Page.navigate', { url: 'http://localhost:3000/register' });

    for (let i = 0; i < 15; i++) {
      await wait(1000);
      const evalRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const docProps = Object.getOwnPropertyNames(document).filter(k => k.startsWith('__react'));
          const btn = document.querySelector('button[type="submit"]');
          return {
            time: ${i + 1},
            docReactProps: docProps,
            hasButton: Boolean(btn),
            btnText: btn ? btn.innerText.trim() : null
          };
        })()`,
        returnByValue: true
      });
      console.log(`[SEC ${i + 1}]`, evalRes?.value);
      if (evalRes?.value?.docReactProps?.length > 0) {
        console.log('Hydration detected!');
        break;
      }
    }

    const testEmail = `candidate_test_${Date.now()}@example.com`;
    console.log('Entering values and submitting registration for:', testEmail);

    await send('Runtime.evaluate', {
      expression: `(() => {
        function setVal(id, val) {
          const el = document.getElementById(id);
          if (!el) return;
          const proto = Object.getPrototypeOf(el);
          const desc = Object.getOwnPropertyDescriptor(proto, 'value');
          if (desc && desc.set) desc.set.call(el, val);
          else el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
        setVal('fullName', 'Test Candidate');
        setVal('email', '${testEmail}');
        setVal('password', 'CandidatePass123!');
        setVal('confirmPassword', 'CandidatePass123!');
      })()`
    });

    await wait(500);

    console.log('Clicking submit button...');
    await send('Runtime.evaluate', {
      expression: `document.querySelector('button[type="submit"]').click()`
    });

    await wait(3000);

    const postSubmit = await send('Runtime.evaluate', {
      expression: 'window.location.href',
      returnByValue: true
    });
    console.log('Final URL after submit:', postSubmit?.value);

    const cookies = await send('Network.getCookies');
    console.log('Cookies:', cookies.cookies.map(c => `${c.name}=${c.value.slice(0, 15)}...`));

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    proc.kill();
  }
}

runTest();
