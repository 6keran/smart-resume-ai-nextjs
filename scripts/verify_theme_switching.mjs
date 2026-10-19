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

async function verifyInteractiveSwitch() {
  console.log('Testing interactive theme toggle in Microsoft Edge...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_prof_${Date.now()}`;

  const proc = spawn(
    edgePath,
    [
      '--headless=new',
      `--remote-debugging-port=9222`,
      `--user-data-dir=${userDataDir}`,
      `--window-size=1440,900`,
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
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log('Navigating to http://localhost:3000...');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await wait(3500);

    // Initial check
    const initialCheck = await send('Runtime.evaluate', {
      expression: `
        ({
          htmlClasses: document.documentElement.className,
          dataTheme: document.documentElement.getAttribute('data-theme'),
          bodyBg: getComputedStyle(document.body).backgroundColor,
          bodyColor: getComputedStyle(document.body).color,
        })
      `,
      returnByValue: true,
    });
    console.log('Initial state on load:', initialCheck.result.value);

    // Click Light button
    console.log('\nSimulating user click on Light button...');
    const clickResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const lightBtn = btns.find(b => b.textContent && b.textContent.includes('Light') && b.getBoundingClientRect().width > 0);
          if (!lightBtn) return { error: 'No visible Light button' };
          lightBtn.click();
          return { clicked: true, outerHTML: lightBtn.outerHTML.slice(0, 100) };
        })()
      `,
      returnByValue: true,
    });
    console.log('Click result:', clickResult.result.value);

    await wait(1500);

    // Post-click check
    const postClickCheck = await send('Runtime.evaluate', {
      expression: `
        ({
          htmlClasses: document.documentElement.className,
          dataTheme: document.documentElement.getAttribute('data-theme'),
          bodyBg: getComputedStyle(document.body).backgroundColor,
          bodyColor: getComputedStyle(document.body).color,
          storageTheme: (() => { try { return localStorage.getItem('smart_resume_theme'); } catch(e) { return 'restricted'; } })()
        })
      `,
      returnByValue: true,
    });
    console.log('Post-click state (Light Mode):', postClickCheck.result.value);

    // Take screenshot of Light Mode
    const { data: lightPng } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\SAI\\.gemini\\antigravity-ide\\brain\\d7ed037c-b860-4752-a04c-1413398dcc0e\\verified_home_light.png', Buffer.from(lightPng, 'base64'));
    console.log('Saved verified_home_light.png');

    // Click Dark button
    console.log('\nSimulating user click on Dark button...');
    const darkClickResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const darkBtn = btns.find(b => b.textContent && b.textContent.includes('Dark') && b.getBoundingClientRect().width > 0);
          if (!darkBtn) return { error: 'No visible Dark button' };
          darkBtn.click();
          return { clicked: true, outerHTML: darkBtn.outerHTML.slice(0, 100) };
        })()
      `,
      returnByValue: true,
    });
    console.log('Dark click result:', darkClickResult.result.value);

    await wait(1500);

    const postDarkCheck = await send('Runtime.evaluate', {
      expression: `
        ({
          htmlClasses: document.documentElement.className,
          dataTheme: document.documentElement.getAttribute('data-theme'),
          bodyBg: getComputedStyle(document.body).backgroundColor,
          bodyColor: getComputedStyle(document.body).color,
        })
      `,
      returnByValue: true,
    });
    console.log('Post-dark-click state (Dark Mode restored):', postDarkCheck.result.value);

    // Take screenshot of Dark Mode
    const { data: darkPng } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\SAI\\.gemini\\antigravity-ide\\brain\\d7ed037c-b860-4752-a04c-1413398dcc0e\\verified_home_dark.png', Buffer.from(darkPng, 'base64'));
    console.log('Saved verified_home_dark.png');

    ws.close();
  } finally {
    proc.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

verifyInteractiveSwitch().catch(console.error);
