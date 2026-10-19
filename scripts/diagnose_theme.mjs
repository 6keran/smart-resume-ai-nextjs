import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function diagnose() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_diag_${Date.now()}`;

  const proc = spawn(
    edgePath,
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      `--user-data-dir=${userDataDir}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await wait(300);
      try {
        targets = await getJson('http://localhost:9222/json');
        if (targets && targets.length > 0) break;
      } catch {}
    }

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((r) => ws.on('open', r));

    let msgId = 1;
    const send = (method, params = {}) => {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (data) => {
          const msg = JSON.parse(data.toString());
          if (msg.id === id) {
            ws.off('message', handler);
            resolve(msg.result);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Log.enable');

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.log('[BROWSER EXCEPTION FULL]', JSON.stringify(msg.params.exceptionDetails, null, 2));
      }
      if (msg.method === 'Network.responseReceived') {
        const r = msg.params.response;
        if (r.status >= 400) {
          console.log('[FAILED NETWORK]', r.status, r.url);
        }
      }
      if (msg.method === 'Log.entryAdded') {
        console.log('[BROWSER LOG ENTRY]', msg.params.entry.level, msg.params.entry.text);
      }
    });

    console.log('Navigating to http://localhost:3000...');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await wait(4500);

    // Let's fetch layout.js and evaluate Header.tsx's code in Edge!
    const headerEvalResult = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const t = await fetch('http://localhost:3000/_next/static/chunks/app/layout.js').then(r => r.text());
          const lines = t.split('\\n');
          const l = lines[518];
          const match = l.match(/eval\\(__webpack_require__\\.ts\\((.*)\\)\\);$/);
          if (!match) return { error: 'No match' };
          const code = JSON.parse(match[1]);
          try {
            eval(code);
            return { success: true };
          } catch(e) {
            return { error: e.message, stack: e.stack };
          }
        })()
      `,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log('EVAL HEADER IN EDGE RESULT:', headerEvalResult.result.value);

    // Let's click the VISIBLE one!
    console.log('\nClicking visible Light button...');
    const clickResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('Light'));
          const visibleBtn = btns.find(b => {
            const r = b.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          });
          if (!visibleBtn) return { error: 'No visible light button found' };
          
          console.log('Clicking visible button:', visibleBtn.outerHTML);
          visibleBtn.click();
          return { clicked: true, outerHTML: visibleBtn.outerHTML };
        })()
      `,
      returnByValue: true,
    });
    console.log('CLICK RESULT:', clickResult.result.value);

    await wait(1000);

    const postClickDiag = await send('Runtime.evaluate', {
      expression: `
        ({
          htmlClasses: document.documentElement.className,
          bodyBg: getComputedStyle(document.body).backgroundColor,
          storageTheme: localStorage.getItem('smart_resume_theme'),
        })
      `,
      returnByValue: true,
    });
    console.log('\nPOST-CLICK STATE:', postClickDiag.result.value);

    ws.close();
  } finally {
    proc.kill();
  }
}

diagnose().catch(console.error);
