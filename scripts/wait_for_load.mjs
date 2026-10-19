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
      try { targets = await getJson('http://localhost:9222/json'); if (targets?.length) break; } catch {}
    }
    const pageTarget = targets.find((t) => t.type === 'page' && !t.url.startsWith('chrome-extension://')) || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let msgId = 1;
    const send = (method, params = {}) => new Promise(r => {
      const id = msgId++;
      const h = d => {
        const m = JSON.parse(d.toString());
        if (m.id === id) {
          ws.off('message', h);
          r(m.result || m.error);
        }
      };
      ws.on('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    let loaded = false;
    ws.on('message', (d) => {
      const m = JSON.parse(d.toString());
      if (m.method === 'Page.loadEventFired') {
        console.log('[PAGE LOAD EVENT FIRED]');
        loaded = true;
      }
    });

    console.log('Navigating to http://localhost:3000/register...');
    await send('Page.navigate', { url: 'http://localhost:3000/register' });

    for (let i = 0; i < 30; i++) {
      if (loaded) break;
      await wait(300);
    }
    await wait(1000);

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const form = document.querySelector('form');
        const allKeys = form ? Object.getOwnPropertyNames(form) : [];
        const reactKeys = allKeys.filter(k => k.startsWith('__react'));
        return {
          docReady: document.readyState,
          chunks: window.webpackChunk_N_E?.map(c => c[0]),
          reactKeysOnForm: reactKeys,
          hasOnSubmit: Boolean(form?.onsubmit)
        };
      })()`,
      returnByValue: true
    });
    console.log('Post-load check:', JSON.stringify(check.result.value, null, 2));

    ws.close();
  } finally {
    proc.kill();
  }
}

test().catch(console.error);
