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
  const testEmail = `step8_verify_${Date.now()}@example.com`;
  const regRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Rahul Sharma',
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

async function inspectAllFourCards() {
  const cookieValue = await getUserCookie();
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_step8_all_${Date.now()}`;

  const proc = spawn(
    edgePath,
    [
      '--headless=new',
      `--remote-debugging-port=9228`,
      `--user-data-dir=${userDataDir}`,
      `--window-size=1440,1100`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await wait(300);
      try {
        targets = await getJson('http://localhost:9228/json');
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

    // Load sample data
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const loadBtn = document.getElementById('btn-load-sample-data');
          if (loadBtn) loadBtn.click();
        })()
      `,
    });
    await wait(800);

    // Jump to Step 8
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const step8Btn = document.getElementById('btn-step-8');
          if (step8Btn) step8Btn.click();
        })()
      `,
    });
    await wait(2500);

    // Capture each of the 4 cards: ats-classic, modern-professional, minimalist, corporate-executive
    const templateIds = ['ats-classic', 'modern-professional', 'minimalist', 'corporate-executive'];

    for (const tId of templateIds) {
      const cardBox = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const card = document.getElementById('template-card-${tId}');
            if (!card) return null;
            card.scrollIntoView({ block: 'center' });
            const rect = card.getBoundingClientRect();
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
          })()
        `,
        returnByValue: true,
      });

      await wait(400);

      const reBox = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const card = document.getElementById('template-card-${tId}');
            if (!card) return null;
            const rect = card.getBoundingClientRect();
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
          })()
        `,
        returnByValue: true,
      });

      if (reBox.result?.value) {
        const { data: cardData } = await send('Page.captureScreenshot', {
          format: 'png',
          clip: {
            x: reBox.result.value.x,
            y: reBox.result.value.y,
            width: reBox.result.value.width,
            height: reBox.result.value.height,
            scale: 1,
          },
        });
        const outCard = `C:\\Users\\kiran\\.gemini\\antigravity-ide\\brain\\8b0c1bfc-4324-4535-b7a7-8e8286467afa\\scratch\\card_${tId}.png`;
        fs.writeFileSync(outCard, Buffer.from(cardData, 'base64'));
        console.log(`Saved screenshot for ${tId} -> ${outCard}`);
      }
    }

    // Also take a screenshot of the whole builder at step 8
    const { data: allData } = await send('Page.captureScreenshot', { format: 'png' });
    const outAll = 'C:\\Users\\kiran\\.gemini\\antigravity-ide\\brain\\8b0c1bfc-4324-4535-b7a7-8e8286467afa\\scratch\\step8_all_view.png';
    fs.writeFileSync(outAll, Buffer.from(allData, 'base64'));
    console.log(`Saved full view to ${outAll}`);

    ws.close();
  } finally {
    proc.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

inspectAllFourCards().catch(console.error);
