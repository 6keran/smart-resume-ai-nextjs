import { spawn } from 'child_process';
import WebSocket from 'ws';

async function test() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_p0_${Date.now()}`;

  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  let wsUrl = null;
  proc.stderr.on('data', (d) => {
    const text = d.toString();
    const match = text.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (match) {
      wsUrl = match[1];
      console.log('Discovered Edge DevTools URL:', wsUrl);
    }
  });

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    if (wsUrl) break;
  }

  if (!wsUrl) {
    proc.kill();
    throw new Error('Failed to get DevTools URL');
  }

  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.on('open', r));
  console.log('Successfully connected to Edge via WebSocket!');

  ws.close();
  proc.kill();
  const fs = await import('fs');
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
}

test().catch(console.error);
