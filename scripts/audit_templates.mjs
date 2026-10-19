import fs from 'fs';
import path from 'path';

const dir = 'D:/projects/builder/src/components/builder/templates';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Template.tsx'));

console.log(`Found ${files.length} template files.`);

for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  console.log(`\n=================== ${f} ===================`);
  
  // Find outer container
  const outerMatch = content.match(/return\s*\(\s*<div[^>]*className=\{`([^`]+)`\}/);
  if (outerMatch) {
    console.log('Outer container:', outerMatch[1].replace(/\s+/g, ' ').trim());
  } else {
    const plainOuter = content.match(/return\s*\(\s*<div[^>]*className="([^"]+)"/);
    if (plainOuter) console.log('Outer container (plain):', plainOuter[1]);
  }

  // Find header
  const headerMatch = content.match(/<header[^>]*className=\{`([^`]+)`\}/);
  if (headerMatch) {
    console.log('Header:', headerMatch[1].replace(/\s+/g, ' ').trim());
  }

  // Find section wrapper & space-y classes
  const bodyDivMatch = content.match(/\{\/\*\s*BODY[^]*?<div[^>]*className=\{`([^`]+)`\}/i);
  if (bodyDivMatch) {
    console.log('Body div:', bodyDivMatch[1].replace(/\s+/g, ' ').trim());
  }

  const spaceMatches = content.match(/space-y-[^\s"'`]+/g);
  if (spaceMatches) {
    console.log('Space classes:', [...new Set(spaceMatches)].join(', '));
  }

  // Check padding
  const paddingMatches = content.match(/p[xytb]?-\d+(\.\d+)?/g);
  if (paddingMatches) {
    console.log('Paddings found:', [...new Set(paddingMatches)].slice(0, 8).join(', '));
  }
}
