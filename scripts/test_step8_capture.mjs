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
  const testEmail = `step8_test_${Date.now()}@example.com`;
  const regRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Maya Chen',
      email: testEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }),
  });
  const regCookies = regRes.headers.getSetCookie ? regRes.headers.getSetCookie() : [regRes.headers.get('set-cookie') || ''];
  for (const c of regCookies) {
    const match = c.match(/sra_user_session=([^;]+)/);
    if (match) return match[1];
  }
  throw new Error('Could not obtain session cookie');
}

async function captureStep8() {
  const cookieValue = await getUserCookie();
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_step8_${Date.now()}`;

  const proc = spawn(
    edgePath,
    [
      '--headless=new',
      `--remote-debugging-port=9227`,
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
        targets = await getJson('http://localhost:9227/json');
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

    await send('Network.setCookie', {
      name: 'sra_user_session',
      value: cookieValue,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    });

    await send('Page.navigate', { url: 'http://localhost:3000/builder' });
    await wait(3000);

    // Load sample data first to pass validation, then go to Step 8
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const loadBtn = document.getElementById('btn-load-sample-data');
          if (loadBtn) loadBtn.click();
        })()
      `,
    });
    await wait(800);

    // Jump to Step 8 (Template selection)
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const step8Btn = document.getElementById('btn-step-8');
          if (step8Btn) step8Btn.click();
        })()
      `,
    });
    await wait(2000);

    // Measure the template preview container and card dimensions
    const previewInfo = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const cards = Array.from(document.querySelectorAll('[id^="template-card-"]'));
          return cards.slice(0, 4).map(c => {
            const previewBox = c.querySelector('.aspect-\\\\[210\\\\/297\\\\]');
            const innerScaled = previewBox ? previewBox.querySelector('div') : null;
            const h3 = c.querySelector('h3');
            return {
              id: c.id,
              title: h3 ? h3.innerText : '',
              cardRect: c.getBoundingClientRect(),
              previewBoxRect: previewBox ? previewBox.getBoundingClientRect() : null,
              innerScaledRect: innerScaled ? innerScaled.getBoundingClientRect() : null,
              innerStyle: innerScaled ? innerScaled.getAttribute('style') : ''
            };
          });
        })()
      `,
      returnByValue: true,
    });

    console.log('STEP 8 PREVIEW INFO:', JSON.stringify(previewInfo.result?.value, null, 2));

    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    const outImg = 'C:\\Users\\kiran\\.gemini\\antigravity-ide\\brain\\8b0c1bfc-4324-4535-b7a7-8e8286467afa\\scratch\\step8_template_cards.png';
    fs.writeFileSync(outImg, Buffer.from(data, 'base64'));
    console.log(`Saved step 8 screenshot to ${outImg}`);

    ws.close();
  } finally {
    proc.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

captureStep8().catch(console.error);
