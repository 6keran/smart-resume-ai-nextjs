import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import WebSocket from 'ws';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getUserCookie() {
  const regRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Button Tester',
      email: `btn_tester_${Date.now()}@example.com`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }),
  });
  const cookies = regRes.headers.getSetCookie ? regRes.headers.getSetCookie() : [regRes.headers.get('set-cookie') || ''];
  for (const c of cookies) {
    const match = c.match(/sra_user_session=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

async function run() {
  const cookieValue = await getUserCookie();
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_profile_${Date.now()}`;

  const proc = spawn(
    edgePath,
    [
      '--headless=new',
      `--remote-debugging-port=9222`,
      `--user-data-dir=${userDataDir}`,
      `--window-size=1440,950`,
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
    await new Promise((resolve) => ws.on('open', resolve));

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
    await send('Network.enable');
    await send('Runtime.enable');

    ws.on('message', (d) => {
      try {
        const msg = JSON.parse(d.toString());
        if (msg.method === 'Runtime.consoleAPICalled') {
          console.log('BROWSER CONSOLE:', msg.params.type, msg.params.args.map((a) => a.value || a.description));
        } else if (msg.method === 'Runtime.exceptionThrown') {
          console.error('BROWSER EXCEPTION:', msg.params.exceptionDetails);
        }
      } catch {}
    });

    if (cookieValue) {
      await send('Network.setCookie', {
        name: 'sra_user_session',
        value: cookieValue,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      });
    }

    await send('Page.navigate', { url: 'http://localhost:3000/builder' });

    // Wait for React hydration
    await send('Runtime.evaluate', {
      expression: `
        new Promise((resolve) => {
          const interval = setInterval(() => {
            const input = document.getElementById('input-fullName');
            if (input && Object.keys(input).some(k => k.startsWith('__react'))) {
              clearInterval(interval);
              resolve(true);
            }
          }, 200);
          setTimeout(() => { clearInterval(interval); resolve(false); }, 15000);
        })
      `,
      awaitPromise: true,
    });

    console.log('React hydration complete!');

    const checkRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-load-sample-data');
          if (!btn) return { error: 'No btn' };
          btn.click();
          return { clicked: true };
        })()
      `,
      returnByValue: true,
    });
    console.log('Button click result:', checkRes.result.value);

    await wait(1500);

    await wait(1000);

    const afterRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const nameInputAfter = document.querySelector('input[placeholder*="Rahul"]')?.value;
          const previewHeading = document.querySelector('#resume-a4-document h1')?.textContent;
          return {
            nameInputAfter,
            previewHeading,
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('After state:', afterRes.result.value);

    // Save screenshot
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\SAI\\.gemini\\antigravity-ide\\brain\\d7ed037c-b860-4752-a04c-1413398dcc0e\\test_sample_button_clicked.png', Buffer.from(data, 'base64'));
    console.log('Saved test_sample_button_clicked.png');

    ws.close();
  } finally {
    proc.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

run().catch(console.error);
