import { spawn } from 'child_process';
import WebSocket from 'ws';
import fs from 'fs';

async function testButtons() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_btn_${Date.now()}`;
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    '--window-size=1440,900',
    'about:blank'
  ]);

  let wsUrl = null;
  proc.stderr.on('data', d => {
    const m = d.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (m && !wsUrl) wsUrl = m[1];
  });
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 100));
    if (wsUrl) break;
  }
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const cur = id++;
    const h = d => {
      const m = JSON.parse(d.toString());
      if (m.id === cur) { ws.off('message', h); res(m.result); }
    };
    ws.on('message', h);
    ws.send(JSON.stringify({ id: cur, method, params }));
  });

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

  const sendPage = (method, params = {}) => new Promise(res => {
    const cur = id++;
    const h = d => {
      const m = JSON.parse(d.toString());
      if (m.id === cur) { ws.off('message', h); res(m.result); }
    };
    ws.on('message', h);
    ws.send(JSON.stringify({ id: cur, sessionId, method, params }));
  });

  await sendPage('Page.enable');
  await sendPage('Runtime.enable');

  await sendPage('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 4000));

  const info = await sendPage('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('Light'));
        return btns.map((b, idx) => {
          const rect = b.getBoundingClientRect();
          const computed = window.getComputedStyle(b);
          const allKeys = Object.keys(b);
          const reactKeys = allKeys.filter(k => k.startsWith('__react'));
          const fiberKey = reactKeys.find(k => k.startsWith('__reactFiber'));
          const propsKey = reactKeys.find(k => k.startsWith('__reactProps'));
          return {
            index: idx,
            tag: b.tagName,
            text: b.textContent.trim(),
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
            visible: rect.width > 0 && rect.height > 0 && computed.display !== 'none' && computed.visibility !== 'hidden',
            reactKeys,
            hasFiber: Boolean(fiberKey),
            hasProps: Boolean(propsKey),
            propsKeys: propsKey ? Object.keys(b[propsKey] || {}) : [],
            parent: b.parentElement ? b.parentElement.tagName + '.' + b.parentElement.className.split(' ').slice(0, 3).join('.') : null
          };
        });
      })()
    `,
    returnByValue: true
  });
  console.log('Buttons info:', JSON.stringify(info.result.value, null, 2));

  // Check if ANY element in the entire DOM has React Fiber
  const globalHydration = await sendPage('Runtime.evaluate', {
    expression: `
      (() => {
        const allElements = Array.from(document.querySelectorAll('*'));
        let elementsWithReact = 0;
        let sampleReactKeys = [];
        for (const el of allElements) {
          const rk = Object.keys(el).filter(k => k.startsWith('__react'));
          if (rk.length > 0) {
            elementsWithReact++;
            if (sampleReactKeys.length === 0) sampleReactKeys = rk;
          }
        }
        return {
          totalElements: allElements.length,
          elementsWithReact,
          sampleReactKeys,
          nextData: Boolean(window.__NEXT_DATA__),
          nextRouter: Boolean(window.next)
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Global Hydration check:', JSON.stringify(globalHydration.result.value, null, 2));

  ws.close();
  proc.kill();
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
}

testButtons().catch(console.error);
