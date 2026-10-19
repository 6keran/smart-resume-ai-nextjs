import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function testTheme() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = 'd:\\projects\\builder\\scripts\\.edge_theme_test_' + Date.now();
  const proc = spawn(edgePath, ['--headless=new', '--remote-debugging-port=9250', '--user-data-dir=' + userDataDir, 'about:blank'], { stdio: 'ignore' });

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await wait(300);
      try {
        targets = await getJson('http://localhost:9250/json');
        if (targets && targets.length > 0) break;
      } catch {}
    }
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let msgId = 1;
    const send = (method, params = {}) => new Promise(resolve => {
      const id = msgId++;
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) { ws.off('message', handler); resolve(msg.result); }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

    const consoleMessages = [];
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.method === 'Runtime.consoleAPICalled') {
          const args = msg.params.args?.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
          consoleMessages.push(`[${msg.params.type}] ${args}`);
        }
      } catch {}
    });

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('Navigating to http://localhost:3000/login ...');
    await send('Page.navigate', { url: 'http://localhost:3000/login' });
    await wait(3000);

    const initial = await send('Runtime.evaluate', {
      expression: `({
        theme: document.documentElement.getAttribute('data-theme'),
        class: document.documentElement.className,
        bg: window.getComputedStyle(document.body).backgroundColor
      })`,
      returnByValue: true
    });
    console.log('Login initial theme:', initial.result?.value);

    // Click Light
    const toggle = await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const b = buttons.find(el => el.textContent.trim() === 'Light' || el.getAttribute('title') === 'Activate Light Mode');
        if (b) { b.click(); return { clicked: true }; }
        return { clicked: false, buttons: buttons.map(x => x.textContent.trim()) };
      })()`,
      returnByValue: true
    });
    console.log('Clicked Light on login:', toggle.result?.value);
    await wait(1000);

    const afterLight = await send('Runtime.evaluate', {
      expression: `({
        theme: document.documentElement.getAttribute('data-theme'),
        class: document.documentElement.className,
        bg: window.getComputedStyle(document.body).backgroundColor,
        local: localStorage.getItem('smart_resume_theme')
      })`,
      returnByValue: true
    });
    console.log('Login after Light click:', afterLight.result?.value);

    // Reload page
    console.log('Reloading /login to test persistence...');
    await send('Page.reload');
    await wait(2500);

    const afterReload = await send('Runtime.evaluate', {
      expression: `({
        theme: document.documentElement.getAttribute('data-theme'),
        class: document.documentElement.className,
        bg: window.getComputedStyle(document.body).backgroundColor,
        local: localStorage.getItem('smart_resume_theme')
      })`,
      returnByValue: true
    });
    console.log('Login after reload:', afterReload.result?.value);

    console.log('\nConsole messages during run:');
    consoleMessages.forEach(m => console.log(m));

  } finally {
    proc.kill();
  }
}
testTheme().catch(console.error);
