import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function getJson(url) {
  return new Promise((r, j) => http.get(url, res => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => r(JSON.parse(d)));
  }).on('error', j));
}

async function debugScripts() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=d:\\projects\\builder\\scripts\\.edge_dbg_' + Date.now(),
    'about:blank'
  ], { stdio: 'ignore' });

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await wait(300);
      try { targets = await getJson('http://localhost:9222/json'); if (targets?.length) break; } catch {}
    }
    const pageTarget = targets.find((t) => t.type === 'page' && !t.url.startsWith('chrome-extension://')) || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let msgId = 1;
    const send = (method, params = {}) => new Promise(r => {
      const id = msgId++;
      const h = d => {
        const m = JSON.parse(d.toString());
        if (m.id === id) {
          ws.off('message', h);
          r(m.result || m.error);
        }
      };
      ws.on('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });

    const networkRequests = [];
    const consoleLogs = [];
    const exceptions = [];

    ws.on('message', (d) => {
      const m = JSON.parse(d.toString());
      if (m.method === 'Network.requestWillBeSent') {
        networkRequests.push({ id: m.params.requestId, url: m.params.request.url });
      }
      if (m.method === 'Network.responseReceived') {
        console.log(`[NET RES] ${m.params.response.status} ${m.params.response.url} (${m.params.response.mimeType})`);
      }
      if (m.method === 'Network.loadingFailed') {
        console.log(`[NET FAILED] ${m.params.errorText} for request ${m.params.requestId}`);
      }
      if (m.method === 'Runtime.consoleAPICalled') {
        console.log(`[CONSOLE ${m.params.type}]`, ...m.params.args.map(a => a.value || a.description));
      }
      if (m.method === 'Runtime.exceptionThrown') {
        const details = m.params.exceptionDetails;
        console.log(`[EXCEPTION FULL]`, JSON.stringify(details, null, 2));
        if (details.scriptId) {
          send('Debugger.getScriptSource', { scriptId: details.scriptId }).then(srcRes => {
            if (srcRes?.scriptSource) {
              const lines = srcRes.scriptSource.split('\n');
              console.log('Script line from debugger at line ' + details.lineNumber + ':');
              console.log(lines[details.lineNumber]);
              console.log('Line before:', lines[details.lineNumber - 1]);
              console.log('Line after:', lines[details.lineNumber + 1]);
            }
          }).catch(e => console.error('getScriptSource failed:', e));
        }
      }
      if (m.method === 'Log.entryAdded') {
        console.log(`[BROWSER LOG ENTRY]`, m.params.entry.level, m.params.entry.text, m.params.entry.url, m.params.entry.lineNumber);
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Debugger.enable');
    await send('Network.enable');
    await send('Log.enable');

    console.log('Navigating to http://localhost:3000/register...');
    await send('Page.navigate', { url: 'http://localhost:3000/register' });

    await wait(6000);

    const evalResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const scriptTags = Array.from(document.querySelectorAll('script')).map(s => ({
          src: s.src,
          async: s.async,
          defer: s.defer,
          type: s.type
        }));
        return {
          scripts: scriptTags,
          readyState: document.readyState
        };
      })()`,
      returnByValue: true
    });

    console.log('DOM script tags:', JSON.stringify(evalResult.result.value, null, 2));

    ws.close();
  } finally {
    proc.kill();
  }
}

debugScripts().catch(console.error);
