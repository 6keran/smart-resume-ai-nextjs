import fs from 'fs';
import path from 'path';

const dir = 'D:/projects/builder/src/components/builder/templates';
const files = [
  'ModernProfessionalTemplate.tsx',
  'MinimalistTemplate.tsx',
  'CorporateExecutiveTemplate.tsx',
  'SoftwareEngineerTemplate.tsx',
  'DataAnalystTemplate.tsx',
  'CreativeProfessionalTemplate.tsx',
  'CompactOnePageTemplate.tsx',
  'AcademicTemplate.tsx',
  'ExperiencedProfessionalTemplate.tsx',
  'ContemporaryTemplate.tsx',
  'ThomasHamptoneTemplate.tsx',
  'NickKoeTemplate.tsx',
  'RichardSanchezTemplate.tsx',
  'OliviaWilsonGridTemplate.tsx',
  'OliviaWilsonBlushTemplate.tsx',
];

for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  console.log(`\n=== ${f} ===`);
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('return (') || line.includes('<div\n') || line.includes('className={`w-full')) {
      console.log(`L${i+1} Outer: ${line.trim()}`);
      if (lines[i+1]) console.log(`L${i+2} Outer+1: ${lines[i+1].trim()}`);
      if (lines[i+2]) console.log(`L${i+3} Outer+2: ${lines[i+2].trim()}`);
    }
    if (line.includes('<header')) {
      console.log(`L${i+1} Header: ${line.trim()}`);
      if (lines[i+1] && lines[i+1].includes('className')) console.log(`L${i+2} Header+1: ${lines[i+1].trim()}`);
    }
    if (line.includes('{/* BODY') || line.includes('space-y-${isMiniPreview')) {
      console.log(`L${i+1} Body: ${line.trim()}`);
      if (lines[i+1]) console.log(`L${i+2} Body+1: ${lines[i+1].trim()}`);
    }
  }
}
