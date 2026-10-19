import fs from 'fs';

async function run() {
  const res = await fetch('http://localhost:3000/_next/static/chunks/app/layout.js');
  const t = await res.text();
  fs.writeFileSync('scripts/downloaded_layout.js', t);
  console.log('Saved downloaded_layout.js, size:', t.length);

  const lines = t.split('\n');
  console.log('Total lines in layout.js:', lines.length);

  // Line 585 in layout.js:
  console.log('Line 583:', lines[582]?.substring(0, 100));
  console.log('Line 584:', lines[583]?.substring(0, 100));
  console.log('Line 585 length:', lines[584]?.length);
  console.log('Line 585 characters around col 28:', JSON.stringify(lines[584]?.substring(0, 60)));
  console.log('Line 586:', lines[585]?.substring(0, 100));

  // Let's test evaluating layout.js with node to see exact syntax error!
  try {
    new Function(t);
  } catch (err) {
    console.log('new Function(layout.js) error:', err);
    console.log('Stack:', err.stack);
  }
}

run().catch(console.error);
