import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function test() {
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_test_${Date.now()}`;
  const proc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--window-size=1440,900',
    'about:blank'
  ], { stdio: 'ignore' });
  
  let targets = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      targets = await getJson('http://localhost:9222/json');
      if (targets && targets.length > 0) break;
    } catch {}
  }
  if (!targets || targets.length === 0) {
    throw new Error('Edge DevTools target not available on port 9222');
  }
  const target = targets.find(t => t.type === 'page') || targets[0];
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

  ws.on('message', (d) => {
    const m = JSON.parse(d.toString());
    if (m.method === 'Runtime.consoleAPICalled') {
      console.log('BROWSER LOG:', m.params.args.map(a => a.value || a.description).join(' '));
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });

  await send('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 4000));

  console.log('\n--- FINDING AND CLICKING LIGHT BUTTON ---');
  const clickRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('Light'));
        const visibleBtn = btns.find(b => b.getBoundingClientRect().width > 0);
        if (!visibleBtn) return { error: 'No visible Light button found', allButtonsCount: document.querySelectorAll('button').length };
        visibleBtn.click();
        return { clicked: true, outerHTML: visibleBtn.outerHTML.slice(0, 100) };
      })()
    `,
    returnByValue: true
  });
  console.log('Click action result:', clickRes.result.value);

  await new Promise(r => setTimeout(r, 1500));

  const postState = await send('Runtime.evaluate', {
    expression: `
      ({
        htmlClass: document.documentElement.className,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        bodyColor: getComputedStyle(document.body).color,
        bgPrimaryVar: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim(),
        storageTheme: localStorage.getItem('smart_resume_theme')
      })
    `,
    returnByValue: true
  });
  console.log('\n--- POST-CLICK STATE ---');
  console.log(postState.result.value);

  ws.close();
  proc.kill();
  try {
    const fs = await import('fs');
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch {}
}
test().catch(console.error);
