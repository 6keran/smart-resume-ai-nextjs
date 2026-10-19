import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((r, j) => http.get(url, res => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => r(JSON.parse(d)));
  }).on('error', j));
}

async function inspectMainApp() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=d:\\projects\\builder\\scripts\\.edge_main_app_' + Date.now(),
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

    const requests = new Map();

    ws.on('message', (d) => {
      const m = JSON.parse(d.toString());
      if (m.method === 'Network.requestWillBeSent') {
        requests.set(m.params.requestId, { url: m.params.request.url, start: Date.now() });
        console.log(`[REQ SENT] id=${m.params.requestId} ${m.params.request.url}`);
      }
      if (m.method === 'Network.responseReceived') {
        const req = requests.get(m.params.requestId);
        console.log(`[RESP] id=${m.params.requestId} ${m.params.response.status} ${req?.url || m.params.response.url}`);
      }
      if (m.method === 'Network.loadingFinished') {
        const req = requests.get(m.params.requestId);
        console.log(`[FINISHED] id=${m.params.requestId} ${req?.url} took ${Date.now() - (req?.start || 0)}ms`);
      }
      if (m.method === 'Network.loadingFailed') {
        const req = requests.get(m.params.requestId);
        console.log(`[FAILED] id=${m.params.requestId} ${req?.url} error: ${m.params.errorText}`);
      }
      if (m.method === 'Page.loadEventFired') {
        console.log('[PAGE LOAD FIRED]');
      }
    });

    await send('Page.enable');
    await send('Network.enable');

    console.log('Navigating to http://localhost:3000/register...');
    await send('Page.navigate', { url: 'http://localhost:3000/register' });

    // Wait up to 15 seconds
    await wait(15000);

    ws.close();
  } finally {
    proc.kill();
  }
}

inspectMainApp().catch(console.error);
