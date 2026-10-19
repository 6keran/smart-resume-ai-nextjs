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

async function captureScreenshot({ url, outputPath, width, height, theme = 'dark' }) {
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
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });

    await send('Page.navigate', { url });
    await wait(2500);

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
  await captureScreenshot({
    url: 'http://localhost:3000/login',
    outputPath: 'd:\\projects\\builder\\scripts\\login_desktop_dark.png',
    width: 1280,
    height: 800,
    theme: 'dark',
  });

  await wait(1000);

  await captureScreenshot({
    url: 'http://localhost:3000/login',
    outputPath: 'd:\\projects\\builder\\scripts\\login_desktop_light.png',
    width: 1280,
    height: 800,
    theme: 'light',
  });

  await wait(1000);

  await captureScreenshot({
    url: 'http://localhost:3000/login',
    outputPath: 'd:\\projects\\builder\\scripts\\login_mobile_dark.png',
    width: 390,
    height: 844,
    theme: 'dark',
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
