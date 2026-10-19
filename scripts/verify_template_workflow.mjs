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
  const testEmail = `step8_workflow_${Date.now()}@example.com`;
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

async function runComprehensiveVerification() {
  console.log('--- STARTING COMPREHENSIVE TEMPLATE PREVIEWS VERIFICATION ---');
  const cookieValue = await getUserCookie();
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_workflow_${Date.now()}`;

  const proc = spawn(
    edgePath,
    [
      '--headless=new',
      `--remote-debugging-port=9229`,
      `--user-data-dir=${userDataDir}`,
      `--window-size=1440,1100`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  const consoleErrors = [];

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await wait(300);
      try {
        targets = await getJson('http://localhost:9229/json');
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

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.method === 'Runtime.consoleAPICalled' && msg.params?.type === 'error') {
          consoleErrors.push(msg.params.args?.map((a) => a.value || a.description).join(' '));
        }
      } catch {}
    });

    await send('Page.enable');
    await send('Network.enable');
    await send('Runtime.enable');

    await send('Network.setCookie', {
      name: 'sra_user_session',
      value: cookieValue,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    });

    console.log('Navigating to http://localhost:3000/builder...');
    await send('Page.navigate', { url: 'http://localhost:3000/builder' });
    await wait(3000);

    // 1. Load sample data
    console.log('Loading sample data...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const loadBtn = document.getElementById('btn-load-sample-data');
          if (loadBtn) loadBtn.click();
        })()
      `,
    });
    await wait(800);

    // 2. Jump to Step 8
    console.log('Navigating to Step 8 (Templates)...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const step8Btn = document.getElementById('btn-step-8');
          if (step8Btn) step8Btn.click();
        })()
      `,
    });
    await wait(2000);

    // 3. Inspect each of the 4 templates: ATS Classic, Modern Professional, Minimalist, Corporate Executive
    const templatesToTest = [
      { id: 'ats-classic', name: 'ATS Classic' },
      { id: 'modern-professional', name: 'Modern Professional' },
      { id: 'minimalist', name: 'Minimalist' },
      { id: 'corporate-executive', name: 'Corporate Executive' },
    ];

    for (const t of templatesToTest) {
      console.log(`\nEvaluating template card: ${t.name} (${t.id})...`);

      // Ensure card is in view
      const cardMetrics = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const card = document.getElementById('template-card-${t.id}');
            const preview = document.getElementById('template-preview-${t.id}');
            if (!card || !preview) return { error: 'Card or preview element not found' };

            preview.scrollIntoView({ block: 'center' });
            const rect = preview.getBoundingClientRect();
            const h1 = preview.querySelector('h1');
            const h2 = preview.querySelector('h2');
            const bodyP = preview.querySelector('p');

            return {
              width: rect.width,
              height: rect.height,
              aspectRatio: (rect.width / rect.height).toFixed(3),
              expectedRatio: (210 / 297).toFixed(3),
              h1Text: h1 ? h1.textContent.trim().substring(0, 30) : null,
              h1RenderedSize: h1 ? window.getComputedStyle(h1).fontSize : null,
              h2Text: h2 ? h2.textContent.trim().substring(0, 30) : null,
              h2RenderedSize: h2 ? window.getComputedStyle(h2).fontSize : null,
              bodyRenderedSize: bodyP ? window.getComputedStyle(bodyP).fontSize : null,
            };
          })()
        `,
        returnByValue: true,
      });

      console.log('  Metrics:', JSON.stringify(cardMetrics.result?.value, null, 2));

      // Test "Use Template" selection
      console.log(`  Clicking "Use Template" for ${t.id}...`);
      const selectResult = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const btn = document.getElementById('btn-select-template-${t.id}');
            if (!btn) return { error: 'Select button not found' };
            btn.click();
            return { clicked: true };
          })()
        `,
        returnByValue: true,
      });
      await wait(600);

      // Verify selected state
      const checkSelected = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const card = document.getElementById('template-card-${t.id}');
            const btn = document.getElementById('btn-select-template-${t.id}');
            return {
              cardClasses: card ? card.className : '',
              btnText: btn ? btn.textContent.trim() : '',
              hasCheckIcon: Boolean(card?.querySelector('.text-white .lucide-check') || btn?.querySelector('.lucide-check')),
            };
          })()
        `,
        returnByValue: true,
      });
      console.log('  Selected state:', JSON.stringify(checkSelected.result?.value, null, 2));

      // Test "Preview" button -> Step 9 navigation
      console.log(`  Clicking "Preview" for ${t.id} to open Step 9 full A4 preview...`);
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const btn = document.getElementById('btn-preview-template-${t.id}');
            if (btn) btn.click();
          })()
        `,
      });
      await wait(1500);

      // Verify Step 9 is active and renders the correct template in full size
      const step9Check = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const previewA4 = document.getElementById('resume-preview-content');
            const h1 = previewA4 ? previewA4.querySelector('h1') : null;
            return {
              step9Active: Boolean(document.getElementById('btn-step-9')),
              hasFullA4: Boolean(previewA4),
              h1Text: h1 ? h1.textContent.trim() : null,
            };
          })()
        `,
        returnByValue: true,
      });
      console.log('  Step 9 Full Preview Check:', JSON.stringify(step9Check.result?.value, null, 2));

      // Return to Step 8
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const step8Btn = document.getElementById('btn-step-8');
            if (step8Btn) step8Btn.click();
          })()
        `,
      });
      await wait(1000);
    }

    // 4. Test Responsiveness: Tablet (768px) and Mobile (375px)
    console.log('\n--- TESTING RESPONSIVENESS AT NARROWER VIEWPORTS ---');

    console.log('Setting viewport to Tablet (768x1024)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 768,
      height: 1024,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await wait(1000);

    const tabletCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const preview = document.getElementById('template-preview-ats-classic');
          const rect = preview ? preview.getBoundingClientRect() : null;
          return {
            previewWidth: rect ? rect.width : 0,
            previewHeight: rect ? rect.height : 0,
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('Tablet (768px) Metrics:', JSON.stringify(tabletCheck.result?.value, null, 2));

    console.log('Setting viewport to Mobile (375x812)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await wait(1000);

    const mobileCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const preview = document.getElementById('template-preview-ats-classic');
          const rect = preview ? preview.getBoundingClientRect() : null;
          return {
            previewWidth: rect ? rect.width : 0,
            previewHeight: rect ? rect.height : 0,
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('Mobile (375px) Metrics:', JSON.stringify(mobileCheck.result?.value, null, 2));

    // Reset viewport to desktop
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1100,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await wait(800);

    console.log('\nConsole Errors count:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('Console Errors:', consoleErrors);
    }

    console.log('\n--- VERIFICATION COMPLETED SUCCESSFULLY ---');
    ws.close();
  } finally {
    proc.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

runComprehensiveVerification().catch(console.error);
