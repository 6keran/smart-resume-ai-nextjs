import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((r, j) => http.get(url, res => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => r(JSON.parse(d)));
  }).on('error', j));
}

async function checkReactElements() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=d:\\projects\\builder\\scripts\\.edge_react_elem_' + Date.now(),
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

    // Wait 22 seconds for main-app.js to finish
    await wait(22000);

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const allElements = document.querySelectorAll('*');
        let elementsWithReact = 0;
        let formReactKeys = [];
        let bodyReactKeys = Object.getOwnPropertyNames(document.body).filter(k => k.startsWith('__react'));

        const reactElements = [];
        for (const el of allElements) {
          const keys = Object.getOwnPropertyNames(el).filter(k => k.startsWith('__react'));
          if (keys.length > 0) {
            elementsWithReact++;
            reactElements.push({
              tag: el.tagName,
              id: el.id,
              className: el.className?.toString?.().slice(0, 50),
              keys
            });
            if (el.tagName === 'FORM') {
              formReactKeys = keys;
            }
          }
        }

        return {
          totalElements: allElements.length,
          elementsWithReact,
          reactElements,
          formReactKeys
        };
      })()`,
      returnByValue: true
    });

    console.log('React elements check:', JSON.stringify(check.result.value, null, 2));

    ws.close();
  } finally {
    proc.kill();
  }
}

checkReactElements().catch(console.error);
