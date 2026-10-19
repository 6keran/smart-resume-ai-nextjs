import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((r, j) => http.get(url, res => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => r(JSON.parse(d)));
  }).on('error', j));
}

async function checkDoc() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=d:\\projects\\builder\\scripts\\.edge_doc_' + Date.now(),
    'about:blank'
  ], { stdio: 'ignore' });

  await wait(1000);
  try {
    const raw = await getJson('http://localhost:9222/json');
    const target = raw.find(t => t.type === 'page');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let id = 1;
    const send = (method, params = {}) => new Promise(r => {
      const i = id++;
      const h = d => { const j = JSON.parse(d); if (j.id === i) { ws.off('message', h); r(j.result); } };
      ws.on('message', h);
      ws.send(JSON.stringify({ id: i, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('Navigating to http://localhost:3000/register...');
    await send('Page.navigate', { url: 'http://localhost:3000/register' });
    await wait(22000);

    const docKeys = await send('Runtime.evaluate', {
      expression: `(() => {
        return {
          docKeys: Object.getOwnPropertyNames(document).filter(k => k.startsWith('__react')),
          htmlKeys: Object.getOwnPropertyNames(document.documentElement).filter(k => k.startsWith('__react')),
          bodyKeys: Object.getOwnPropertyNames(document.body).filter(k => k.startsWith('__react')),
          windowReact: Boolean(window.React),
          windowNext: Boolean(window.next),
          nextRouter: Boolean(window.__next_root_layout)
        };
      })()`,
      returnByValue: true
    });
    console.log('Document check:', JSON.stringify(docKeys.result.value, null, 2));

    ws.close();
  } finally {
    proc.kill();
  }
}

checkDoc().catch(console.error);
