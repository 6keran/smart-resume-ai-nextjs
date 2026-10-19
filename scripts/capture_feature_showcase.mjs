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

async function loginAdmin() {
  const res = await fetch('http://localhost:3000/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'kiran81232@gmail.com', password: 'kiran@69' }),
  });
  const setCookie = res.headers.get('set-cookie') || '';
  const match = setCookie.match(/sra_admin_session=([^;]+)/);
  return match ? match[1] : null;
}

async function loginUser() {
  // Register or login a test candidate
  const email = 'candidate_showcase@career.test';
  const password = 'Password123!';
  let res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Arun Patel',
        email,
        password,
        confirmPassword: password,
      }),
    });
  }
  const setCookie = res.headers.get('set-cookie') || '';
  const match = setCookie.match(/sra_user_session=([^;]+)/);
  return match ? match[1] : null;
}

async function captureScreenshot({ url, outputPath, width = 1440, height = 900, theme = 'dark', cookies = [], action }) {
  console.log(`Starting capture for ${outputPath} (${width}x${height}, theme=${theme})...`);
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_profile_${Date.now()}`;

  const proc = spawn(
    edgePath,
    [
      '--headless=new',
      `--remote-debugging-port=9222`,
      `--user-data-dir=${userDataDir}`,
      `--window-size=${width},${height}`,
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

    if (!targets || targets.length === 0) {
      throw new Error('Edge DevTools target not available on port 9222');
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

    for (const c of cookies) {
      await send('Network.setCookie', {
        name: c.name,
        value: c.value,
        domain: 'localhost',
        path: '/',
      });
    }

    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await send('Page.navigate', { url });
    await wait(3500);

    if (theme === 'light') {
      await send('Runtime.evaluate', {
        expression: `
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          document.documentElement.setAttribute('data-theme', 'light');
        `,
      });
      await wait(400);
    } else {
      await send('Runtime.evaluate', {
        expression: `
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        `,
      });
      await wait(400);
    }

    if (action) {
      await action(send);
      await wait(1000);
    }

    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outputPath, Buffer.from(data, 'base64'));
    console.log(`✓ Saved screenshot to ${outputPath} (${data.length} bytes base64)`);

    ws.close();
  } finally {
    proc.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

async function run() {
  const adminCookie = await loginAdmin();
  console.log(`Admin cookie obtained: ${Boolean(adminCookie)}`);

  if (adminCookie) {
    await captureScreenshot({
      url: 'http://localhost:3000/admin/proctoring',
      outputPath: 'C:\\Users\\SAI\\.gemini\\antigravity-ide\\brain\\d7ed037c-b860-4752-a04c-1413398dcc0e\\admin_live_proctoring_dark.png',
      width: 1440,
      height: 950,
      theme: 'dark',
      cookies: [{ name: 'sra_admin_session', value: adminCookie }],
    });
  }

  console.log('\nAdmin live proctoring screenshot captured successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
