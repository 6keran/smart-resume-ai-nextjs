import http from 'http';
import WebSocket from 'ws';

async function test() {
  const list = await new Promise((res, reject) => {
    http.get('http://127.0.0.1:9222/json', (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', reject);
  }).catch(() => null);

  if (!list) {
    console.log('No CDP port open at 9222');
    return;
  }
  const page = list.find(p => p.type === 'page' && p.url.includes('/builder'));
  if (!page) { console.log('Builder page not found'); return; }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));
  let id = 1;
  const send = (m, p={}) => new Promise(res => {
    const cur = id++;
    const handler = (msg) => {
      const data = JSON.parse(msg);
      if (data.id === cur) {
        ws.off('message', handler);
        res(data.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: cur, method: m, params: p }));
  });

  const res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const doc = document.getElementById('resume-a4-document');
        if (!doc) return { error: 'No doc' };
        const docRect = doc.getBoundingClientRect();
        
        // Find zoom factor: doc.offsetWidth vs docRect.width
        const scale = docRect.width / doc.offsetWidth;

        // Leaf elements or content sections
        const contentNodes = Array.from(doc.querySelectorAll('h1, h2, h3, h4, p, li, span, a, svg'));
        let maxBottom = 0;
        let lowestElement = null;

        for (const el of contentNodes) {
          const r = el.getBoundingClientRect();
          if (r.bottom > maxBottom) {
            maxBottom = r.bottom;
            lowestElement = {
              tag: el.tagName,
              text: (el.textContent || '').slice(0, 30),
              bottom: Math.round((r.bottom - docRect.top) / scale)
            };
          }
        }

        const unscaledHeight = doc.offsetHeight;
        const unscaledContentEnd = Math.round((maxBottom - docRect.top) / scale);

        return {
          scale,
          unscaledHeight,
          unscaledContentEnd,
          lowestElement,
          fillPercent: Math.round((unscaledContentEnd / 1123) * 100),
          remainingWhitespacePx: 1123 - unscaledContentEnd
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Measurement:', JSON.stringify(res.value, null, 2));
  ws.close();
}
test();
