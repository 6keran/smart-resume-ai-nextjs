import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((r, j) => http.get(url, res => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => r(JSON.parse(d)));
  }).on('error', j));
}

async function inspectDiv() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=d:\\projects\\builder\\scripts\\.edge_div_' + Date.now(),
    'about:blank'
  ], { stdio: 'ignore' });

  await wait(1000);
  try {
    const raw = await getJson('http://localhost:9222/json');
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

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('Navigating to http://localhost:3000/register...');
    await send('Page.navigate', { url: 'http://localhost:3000/register' });
    await wait(22000);

    const divInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        const divs = Array.from(document.querySelectorAll('div')).filter(d => 
          Object.getOwnPropertyNames(d).some(k => k.startsWith('__react'))
        );
        return divs.map(d => ({
          className: d.className,
          id: d.id,
          childCount: d.children.length,
          innerHTMLPreview: d.innerHTML.slice(0, 150)
        }));
      })()`,
      returnByValue: true
    });
    console.log('Divs with React:', JSON.stringify(divInfo.result.value, null, 2));

    ws.close();
  } finally {
    proc.kill();
  }
}

inspectDiv().catch(console.error);
