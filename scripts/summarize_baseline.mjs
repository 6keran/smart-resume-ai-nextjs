import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'scripts', 'mobile_audit_baseline.json');
if (!fs.existsSync(file)) {
  console.log('Baseline file does not exist yet.');
  process.exit(0);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));

console.log('### Route-by-Route Baseline Mobile Responsiveness Audit\n');
console.log('| Route | 320px | 360px | 375px | 390px | 430px | 768px | 1024px | 1440px | Header Overflow |');
console.log('| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |');

for (const [route, vps] of Object.entries(data)) {
  const vpKeys = ['320x568', '360x800', '375x812', '390x844', '430x932', '768x1024', '1024x768', '1440x900'];
  const results = vpKeys.map((k) => {
    const v = vps[k];
    if (!v) return 'N/A';
    return v.hasOverflow ? `❌ (+${v.scrollWidth - v.clientWidth}px)` : '✅';
  });
  
  const anyHeader = Object.values(vps).some((v) => v.headerOverflow);
  console.log(`| \`${route}\` | ${results.join(' | ')} | ${anyHeader ? '❌' : '✅'} |`);
}
