import { spawn } from 'child_process';
import WebSocket from 'ws';

async function run() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=d:\\projects\\builder\\scripts\\.edge_eval_test',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));
  try {
    const raw = await fetch('http://localhost:9222/json').then(r => r.json());
    const target = raw.find(t => t.type === 'page');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let id = 1;
    const send = (m, p) => new Promise(r => {
      const i = id++;
      const h = d => {
        const j = JSON.parse(d);
        if (j.id === i) {
          ws.off('message', h);
          r(j.result || j.error);
        }
      };
      ws.on('message', h);
      ws.send(JSON.stringify({ id: i, method: m, params: p }));
    });

    const appLayout = await fetch('http://localhost:3000/_next/static/chunks/app/layout.js').then(r => r.text());
    console.log('appLayout length:', appLayout.length);

    // Let's test evaluating lines up to 320
    const lines = appLayout.split('\n');
    console.log('Line 314 content:', lines[314]?.slice(0, 80));

    // Evaluate in browser
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        try {
          const fn = new Function(${JSON.stringify(lines[314])});
          return 'Line 314 parsed fine as Function';
        } catch(e) {
          return 'Line 314 error: ' + e.message;
        }
      })()`,
      returnByValue: true
    });
    console.log('Result for line 314:', res);

    ws.close();
  } finally {
    edge.kill();
  }
}

run().catch(console.error);
