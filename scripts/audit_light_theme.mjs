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

const routes = [
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/analyzer',
  '/improver',
  '/builder',
  '/skills',
  '/jobs',
  '/job-match',
  '/guidance',
  '/admin/login',
  '/admin/dashboard'
];

async function audit() {
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_audit_${Date.now()}`;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--window-size=1440,900',
    'about:blank'
  ], { stdio: 'ignore' });
  
  await new Promise(r => setTimeout(r, 1200));
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
  await send('Network.enable');

  console.log('--- STARTING LIGHT MODE AUDIT ACROSS ALL ROUTES ---');

  for (const route of routes) {
    try {
      await send('Page.navigate', { url: `http://localhost:3000${route}` });
      await new Promise(r => setTimeout(r, 1500));

      const evaluation = await send('Runtime.evaluate', {
        expression: `
          (() => {
            // Apply light mode explicitly
            localStorage.setItem('smart_resume_theme', 'light');
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            document.documentElement.setAttribute('data-theme', 'light');
            document.documentElement.style.colorScheme = 'light';

            const bodyStyle = getComputedStyle(document.body);
            const headers = Array.from(document.querySelectorAll('h1, h2, h3')).slice(0, 5).map(h => {
              const s = getComputedStyle(h);
              return { tag: h.tagName, color: s.color, text: h.innerText.slice(0, 30) };
            });

            // Find elements with suspicious dark backgrounds in light mode
            const allDivs = Array.from(document.querySelectorAll('div, section, main, header, aside'));
            const darkElements = [];
            for (const el of allDivs) {
              const bg = getComputedStyle(el).backgroundColor;
              const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
              if (match) {
                const r = parseInt(match[1]);
                const g = parseInt(match[2]);
                const b = parseInt(match[3]);
                if (r < 30 && g < 30 && b < 30 && el.getBoundingClientRect().width > 120 && el.getBoundingClientRect().height > 50) {
                  darkElements.push({
                    tag: el.tagName,
                    class: (el.className || '').toString().slice(0, 50),
                    bg,
                    rect: { w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) }
                  });
                }
              }
            }

            return {
              url: location.pathname,
              bodyBg: bodyStyle.backgroundColor,
              bodyColor: bodyStyle.color,
              headers,
              suspiciousDarkCount: darkElements.length,
              suspiciousDarkElements: darkElements.slice(0, 3)
            };
          })()
        `,
        returnByValue: true
      });

      if (evaluation?.exceptionDetails) {
        console.error(`Route [${route}] exception:`, evaluation.exceptionDetails.text, evaluation.exceptionDetails.exception?.description);
      }
      const resVal = evaluation?.result?.value !== undefined ? evaluation.result.value : evaluation?.value;
      console.log(`Route [${route}]:`, JSON.stringify(resVal, null, 2));
    } catch (e) {
      console.error(`Route [${route}] error:`, e.message);
    }
  }

  ws.close();
  proc.kill();
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch {}
}

audit().catch(console.error);
