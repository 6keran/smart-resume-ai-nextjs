import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'scripts', 'mobile_audit_baseline.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

for (const route of ['/builder', '/dashboard', '/dashboard/applications', '/dashboard/improvements', '/feedback']) {
  console.log(`\n=== Culprits for ${route} at 375px ===`);
  const vp = data[route]['375x812'] || data[route]['320x568'];
  if (vp && vp.culprits) {
    for (const c of vp.culprits) {
      console.log(`  <${c.tag} id="${c.id}" class="${c.cls}"> rectRight=${c.rectRight} scrollWidth=${c.scrollWidth} text="${c.text}"`);
    }
  }
}
