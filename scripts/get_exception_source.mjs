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

    await send('Debugger.enable');
    await send('Runtime.enable');
    await send('Page.enable');

    const scripts = new Map();
    ws.on('message', async (d) => {
      const m = JSON.parse(d.toString());
      if (m.method === 'Debugger.scriptParsed') {
        scripts.set(m.params.scriptId, m.params.url);
      }
      if (m.method === 'Runtime.exceptionThrown') {
        const details = m.params.exceptionDetails;
        console.log('[EXCEPTION THROWN]:', details.text, details.lineNumber, details.columnNumber, details.url, 'scriptId:', details.scriptId);
        try {
          const src = await send('Debugger.getScriptSource', { scriptId: details.scriptId });
          console.log('Script source length:', src?.scriptSource?.length);
          const lines = (src?.scriptSource || '').split('\n');
          console.log('Surrounding lines:');
          for (let i = Math.max(0, details.lineNumber - 3); i <= Math.min(lines.length - 1, details.lineNumber + 3); i++) {
            console.log(i + ': ' + lines[i]);
          }
        } catch (e) {
          console.log('Error getting script source:', e);
        }
      }
    });

    console.log('Navigating to /register...');
    await send('Page.navigate', { url: 'http://localhost:3000/register' });
    await wait(6000);

    ws.close();
  } finally {
    proc.kill();
  }
}

test().catch(console.error);
