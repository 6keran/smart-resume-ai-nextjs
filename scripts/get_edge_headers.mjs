import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

async function getEdgeHeaders() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=d:\\projects\\builder\\scripts\\.edge_hdr_' + Date.now(),
    'about:blank'
  ], { stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 1000));
  try {
    const raw = await fetch('http://localhost:9222/json').then(r => r.json());
    const target = raw.find(t => t.type === 'page');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let id = 1;
    const send = (m, p) => new Promise(r => {
      const i = id++;
      const h = d => { const j = JSON.parse(d); if (j.id === i) { ws.off('message', h); r(j.result); } };
      ws.on('message', h);
      ws.send(JSON.stringify({ id: i, method: m, params: p }));
    });

    ws.on('message', d => {
      const m = JSON.parse(d.toString());
      if (m.method === 'Network.requestWillBeSent') {
        if (m.params.request.url.includes('main-app.js')) {
          console.log('MAIN APP HEADERS:', JSON.stringify(m.params.request.headers, null, 2));
        }
      }
    });

    await send('Page.enable');
    await send('Network.enable');
    await send('Page.navigate', { url: 'http://localhost:3000/register' });
    await new Promise(r => setTimeout(r, 4000));
    ws.close();
  } finally {
    proc.kill();
  }
}

getEdgeHeaders().catch(console.error);
