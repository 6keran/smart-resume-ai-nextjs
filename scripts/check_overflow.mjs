import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';
import fs from 'fs';

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = ''; res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function testOverflow() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = 'd:\\projects\\builder\\scripts\\.edge_overflow_' + Date.now();
  const proc = spawn(edgePath, ['--headless=new', '--remote-debugging-port=9230', `--user-data-dir=${userDataDir}`, '--window-size=375,812', 'about:blank'], { stdio: 'ignore' });
  try {
    let targets = null;
    for (let i = 0; i < 20; i++) {
      await wait(300);
      try { targets = await getJson('http://localhost:9230/json'); if (targets && targets.length) break; } catch {}
    }
    const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));
    let id = 1;
    const send = (m, p = {}) => new Promise(r => {
      const i = id++;
      const h = (d) => { const msg = JSON.parse(d); if (msg.id === i) { ws.off('message', h); r(msg.result); } };
      ws.on('message', h);
      ws.send(JSON.stringify({ id: i, method: m, params: p }));
    });
    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:3000/builder' });
    await wait(3000);
    const wideElements = await send('Runtime.evaluate', {
      expression: `(() => {
        const els = Array.from(document.querySelectorAll('*'));
        return els.filter(el => el.getBoundingClientRect().width > 375).map(el => ({
          tag: el.tagName,
          id: el.id,
          className: el.className ? el.className.toString().slice(0, 50) : '',
          width: el.getBoundingClientRect().width
        })).slice(0, 10);
      })()`,
      returnByValue: true
    });
    console.log('Elements wider than 375px:', wideElements.result?.value);
    ws.close();
  } finally {
    proc.kill();
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  }
}
testOverflow();
