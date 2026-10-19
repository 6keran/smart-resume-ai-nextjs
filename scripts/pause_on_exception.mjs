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
    await send('Debugger.setPauseOnExceptions', { state: 'uncaught' });
    await send('Runtime.enable');
    await send('Page.enable');

    ws.on('message', async (d) => {
      const m = JSON.parse(d.toString());
      if (m.method === 'Debugger.paused') {
        console.log('[DEBUGGER PAUSED]:');
        console.log('Reason:', m.params.reason);
        console.log('Exception data:', JSON.stringify(m.params.data, null, 2));
        console.log('Call frames:');
        for (const frame of m.params.callFrames.slice(0, 5)) {
          console.log(`  at ${frame.functionName} (${frame.url}:${frame.location.lineNumber}:${frame.location.columnNumber})`);
        }
        await send('Debugger.resume');
      }
    });

    console.log('Navigating to http://localhost:3000/register...');
    await send('Page.navigate', { url: 'http://localhost:3000/register' });
    await wait(4000);

    ws.close();
  } finally {
    proc.kill();
  }
}

test().catch(console.error);
