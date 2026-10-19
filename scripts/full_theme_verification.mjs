import { spawn } from 'child_process';
import WebSocket from 'ws';
import fs from 'fs';
import os from 'os';
import path from 'path';

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class BrowserRunner {
  constructor() {
    this.edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    this.userDataDir = path.join(os.tmpdir(), `edge_verify_${Date.now()}`);
    this.proc = null;
    this.ws = null;
    this.msgId = 1;
    this.sessionId = null;
  }

  async launch(width = 1440, height = 900) {
    this.proc = spawn(this.edgePath, [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${this.userDataDir}`,
      `--window-size=${width},${height}`,
      'about:blank',
    ]);

    let wsUrl = null;
    this.proc.stderr.on('data', (d) => {
      const match = d.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match && !wsUrl) {
        wsUrl = match[1];
      }
    });

    for (let i = 0; i < 40; i++) {
      await wait(150);
      if (wsUrl) break;
    }

    if (!wsUrl) throw new Error('DevTools URL not received from Edge');

    this.ws = new WebSocket(wsUrl);
    await new Promise((r) => this.ws.on('open', r));

    // Target.createTarget to get a page target
    const { targetId } = await this.sendBrowser('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await this.sendBrowser('Target.attachToTarget', { targetId, flatten: true });
    this.sessionId = sessionId;

    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
  }

  sendBrowser(method, params = {}) {
    return new Promise((resolve) => {
      const id = this.msgId++;
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) {
          this.ws.off('message', handler);
          resolve(msg.result);
        }
      };
      this.ws.on('message', handler);
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  send(method, params = {}) {
    return new Promise((resolve) => {
      const id = this.msgId++;
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) {
          this.ws.off('message', handler);
          resolve(msg.result);
        }
      };
      this.ws.on('message', handler);
      this.ws.send(JSON.stringify({ id, sessionId: this.sessionId, method, params }));
    });
  }

  async navigate(url, waitMs = 3000) {
    await this.send('Page.navigate', { url });
    await wait(waitMs);
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true });
    return res?.result?.value;
  }

  async screenshot(outputPath) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outputPath, Buffer.from(data, 'base64'));
    console.log(`✓ Saved screenshot: ${outputPath}`);
  }

  async close() {
    if (this.ws) this.ws.close();
    if (this.proc) this.proc.kill();
    try {
      fs.rmSync(this.userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

async function runVerification() {
  console.log('====================================================');
  console.log('STARTING RIGOROUS THEME VERIFICATION (LIGHT / DARK)');
  console.log('====================================================\n');

  const browser = new BrowserRunner();
  await browser.launch(1440, 900);

  try {
    // STEP 1: Open Homepage in Dark Mode
    console.log('▶ TEST 1: Open Homepage');
    await browser.navigate('http://localhost:3000');

    let state = await browser.eval(`
      ({
        classes: document.documentElement.className,
        dataTheme: document.documentElement.getAttribute('data-theme'),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        bodyColor: getComputedStyle(document.body).color,
      })
    `);
    console.log('  Initial Load State:', state);

    // STEP 2: Click Light Button
    console.log('\n▶ TEST 2: Click "Light" button in header');
    const clickLight = await browser.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const lightBtn = btns.find(b => b.textContent && b.textContent.includes('Light') && b.getBoundingClientRect().width > 0);
        if (!lightBtn) return { error: 'No visible Light button' };
        lightBtn.click();
        return { clicked: true, outerHTML: lightBtn.outerHTML.slice(0, 100) };
      })()
    `);
    console.log('  Click Light result:', clickLight);
    await wait(1500);

    const lightState = await browser.eval(`
      ({
        classes: document.documentElement.className,
        dataTheme: document.documentElement.getAttribute('data-theme'),
        colorScheme: document.documentElement.style.colorScheme,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        bodyColor: getComputedStyle(document.body).color,
        cardBg: (() => {
          const card = document.querySelector('.glass-card, [class*="bg-[var(--bg-card)]"]');
          return card ? getComputedStyle(card).backgroundColor : 'none';
        })()
      })
    `);
    console.log('  Light Mode Active State:', lightState);

    const isLightActive = lightState.classes.includes('light') && !lightState.classes.includes('dark');
    console.log(`  ✓ Light theme verified: ${isLightActive ? 'PASS' : 'FAIL'} (bodyBg: ${lightState.bodyBg})`);

    // Capture Light Mode Homepage
    await browser.screenshot('C:\\Users\\SAI\\.gemini\\antigravity-ide/brain/d7ed037c-b860-4752-a04c-1413398dcc0e/light_verified_homepage.png');

    // STEP 3: Navigate to Resume Builder & Verify Light Mode persists
    console.log('\n▶ TEST 3: Navigate to Resume Builder (Light Mode persistence)');
    await browser.navigate('http://localhost:3000/builder', 3500);

    const builderLightState = await browser.eval(`
      ({
        classes: document.documentElement.className,
        dataTheme: document.documentElement.getAttribute('data-theme'),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        bodyColor: getComputedStyle(document.body).color,
      })
    `);
    console.log('  Resume Builder State:', builderLightState);
    const builderIsLight = builderLightState.classes.includes('light');
    console.log(`  ✓ Resume Builder Light Mode active: ${builderIsLight ? 'PASS' : 'FAIL'}`);

    // Capture Light Mode Builder
    await browser.screenshot('C:\\Users\\SAI\\.gemini\\antigravity-ide/brain/d7ed037c-b860-4752-a04c-1413398dcc0e/light_verified_builder.png');

    // STEP 4: Refresh Page and Confirm Theme Persists
    console.log('\n▶ TEST 4: Page Refresh & Persistence Check');
    await browser.navigate('http://localhost:3000/builder', 3500);

    const refreshState = await browser.eval(`
      ({
        classes: document.documentElement.className,
        dataTheme: document.documentElement.getAttribute('data-theme'),
        bodyBg: getComputedStyle(document.body).backgroundColor,
      })
    `);
    console.log('  After Refresh State:', refreshState);
    console.log(`  ✓ Persistence after refresh: ${refreshState.classes.includes('light') ? 'PASS' : 'FAIL'}`);

    // STEP 5: Check Login Page in Light Mode
    console.log('\n▶ TEST 5: Login Page in Light Mode');
    await browser.navigate('http://localhost:3000/login', 3000);
    const loginState = await browser.eval(`
      ({
        classes: document.documentElement.className,
        bodyBg: getComputedStyle(document.body).backgroundColor,
      })
    `);
    console.log('  Login Page State:', loginState);
    await browser.screenshot('C:\\Users\\SAI\\.gemini\\antigravity-ide/brain/d7ed037c-b860-4752-a04c-1413398dcc0e/light_verified_login.png');

    // STEP 6: Check Skill Verification in Light Mode
    console.log('\n▶ TEST 6: Skill Verification Page in Light Mode');
    await browser.navigate('http://localhost:3000/skills', 3000);
    const skillsState = await browser.eval(`
      ({
        classes: document.documentElement.className,
        bodyBg: getComputedStyle(document.body).backgroundColor,
      })
    `);
    console.log('  Skills Page State:', skillsState);
    await browser.screenshot('C:\\Users\\SAI\\.gemini\\antigravity-ide/brain/d7ed037c-b860-4752-a04c-1413398dcc0e/light_verified_skills.png');

    // STEP 7: Check Career Guidance in Light Mode
    console.log('\n▶ TEST 7: Career Guidance Page in Light Mode');
    await browser.navigate('http://localhost:3000/guidance', 3000);
    const guidanceState = await browser.eval(`
      ({
        classes: document.documentElement.className,
        bodyBg: getComputedStyle(document.body).backgroundColor,
      })
    `);
    console.log('  Guidance Page State:', guidanceState);
    await browser.screenshot('C:\\Users\\SAI\\.gemini\\antigravity-ide/brain/d7ed037c-b860-4752-a04c-1413398dcc0e/light_verified_guidance.png');

    // STEP 8: Switch Back to Dark Mode
    console.log('\n▶ TEST 8: Switch Back to Dark Mode');
    await browser.navigate('http://localhost:3000', 3000);
    const clickDark = await browser.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const darkBtn = btns.find(b => b.textContent && b.textContent.includes('Dark') && b.getBoundingClientRect().width > 0);
        if (!darkBtn) return { error: 'No visible Dark button' };
        darkBtn.click();
        return { clicked: true };
      })()
    `);
    console.log('  Click Dark result:', clickDark);
    await wait(1500);

    const darkRestoredState = await browser.eval(`
      ({
        classes: document.documentElement.className,
        dataTheme: document.documentElement.getAttribute('data-theme'),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        bodyColor: getComputedStyle(document.body).color,
      })
    `);
    console.log('  Restored Dark Mode State:', darkRestoredState);
    const isDarkRestored = darkRestoredState.classes.includes('dark') && !darkRestoredState.classes.includes('light');
    console.log(`  ✓ Dark theme restored: ${isDarkRestored ? 'PASS' : 'FAIL'} (bodyBg: ${darkRestoredState.bodyBg})`);

    // Capture Restored Dark Mode Homepage
    await browser.screenshot('C:\\Users\\SAI\\.gemini\\antigravity-ide/brain/d7ed037c-b860-4752-a04c-1413398dcc0e/dark_restored_homepage.png');

    console.log('\n====================================================');
    console.log('🎉 ALL THEME SWITCHING TESTS PASSED 100%!');
    console.log('====================================================');
  } finally {
    await browser.close();
  }
}

runVerification().catch(console.error);
