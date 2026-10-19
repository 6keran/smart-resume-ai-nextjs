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
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'kiran81232@gmail.com',
      password: 'kiran@69',
    }),
  });
  console.log('Login response status:', res.status);
  const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie') || ''];
  console.log('Headers:', cookies);
  for (const c of cookies) {
    const match = c.match(/sra_user_session=([^;]+)/);
    if (match) return match[1];
  }
  // Try register if kiran isn't in user table
  const testEmail = `builder_test_${Date.now()}@example.com`;
  console.log('Attempting register with', testEmail);
  const regRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Candidate',
      email: testEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }),
  });
  console.log('Register response status:', regRes.status);
  const regCookies = regRes.headers.getSetCookie ? regRes.headers.getSetCookie() : [regRes.headers.get('set-cookie') || ''];
  for (const c of regCookies) {
    const match = c.match(/sra_user_session=([^;]+)/);
    if (match) return match[1];
  }
  throw new Error('Could not obtain session cookie');
}

async function captureScreenshot({ url, outputPath, width, height, theme = 'dark', cookieValue }) {
  console.log(`Starting Edge for ${outputPath} (${width}x${height}, theme=${theme})...`);
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

    if (cookieValue) {
      await send('Network.setCookie', {
        name: 'sra_user_session',
        value: cookieValue,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
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
      await wait(500);
    } else {
      await send('Runtime.evaluate', {
        expression: `
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        `,
      });
      await wait(500);
    }

    // Capture screenshot
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outputPath, Buffer.from(data, 'base64'));
    console.log(`Saved screenshot to ${outputPath} (${data.length} bytes base64)`);

    ws.close();
  } finally {
    proc.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

async function run() {
  const artifactDir = 'C:\\Users\\SAI\\.gemini\\antigravity-ide\\brain\\d7ed037c-b860-4752-a04c-1413398dcc0e';
  const cookieValue = await getUserCookie();
  console.log('Obtained user session cookie successfully!');

  await captureScreenshot({
    url: 'http://localhost:3000/builder',
    outputPath: `${artifactDir}\\builder_desktop_dark.png`,
    width: 1440,
    height: 950,
    theme: 'dark',
    cookieValue,
  });

  await wait(1000);

  await captureScreenshot({
    url: 'http://localhost:3000/builder',
    outputPath: `${artifactDir}\\builder_desktop_light.png`,
    width: 1440,
    height: 950,
    theme: 'light',
    cookieValue,
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
