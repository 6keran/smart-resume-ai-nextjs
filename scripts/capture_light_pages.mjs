import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';
import fs from 'fs';

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function capture(pageName, urlPath) {
  const outputPath = `C:\\Users\\SAI\\.gemini\\antigravity-ide\\brain\\d7ed037c-b860-4752-a04c-1413398dcc0e\\light_test_${pageName}.png`;
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_cap_${Date.now()}`;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--window-size=1440,900',
    'about:blank'
  ], { stdio: 'ignore' });
  
  await new Promise(r => setTimeout(r, 1000));
  const targets = await getJson('http://localhost:9222/json');
  const target = targets.find(t => t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));
  
  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const cur = id++;
    const h = (d) => {
      const m = JSON.parse(d.toString());
      if (m.id === cur) { ws.off('message', h); res(m.result); }
    };
    ws.on('message', h);
    ws.send(JSON.stringify({ id: cur, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  await send('Page.navigate', { url: `http://localhost:3000${urlPath}` });
  await new Promise(r => setTimeout(r, 3000));

  // Set theme to light via localStorage and document class
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('smart_resume_theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
      // trigger theme toggle if present
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('Light'));
      const visibleBtn = btns.find(b => b.getBoundingClientRect().width > 0);
      if (visibleBtn) visibleBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(outputPath, Buffer.from(data, 'base64'));
  console.log(`Saved: ${pageName} -> ${outputPath}`);

  ws.close();
  proc.kill();
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch {}
}

async function run() {
  await capture('home', '/');
  await capture('builder', '/builder');
  await capture('analyzer', '/analyzer');
  await capture('skills', '/skills');
}

run().catch(console.error);
