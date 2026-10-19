import fs from 'fs';
import path from 'path';

const dir = 'D:/projects/builder/src/components/builder/templates';

function updateTemplateFile(filename, updater) {
  const filePath = path.join(dir, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  content = updater(content);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filename}`);
}

// 1. ModernProfessionalTemplate.tsx
updateTemplateFile('ModernProfessionalTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const isFresher = candidateType === 'fresher';/,
      `const isFresher = candidateType === 'fresher';\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  // Replace outer container
  code = code.replace(
    /className=\{`w-full bg-white text-slate-800 font-sans select-text [^`]+`\}/,
    'className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[14px] ${spacing.lineHeight}`}`}'
  );
  // Header
  code = code.replace(
    /<header className="pb-3 mb-4 border-b border-slate-200 shrink-0">/,
    '<header className={`pb-3.5 ${spacing.headerMarginBottom} border-b border-slate-200 shrink-0`}>'
  );
  // Body div
  code = code.replace(
    /className=\{`space-y-\$\{isMiniPreview \? '2' : '5'\} flex-1`\}/,
    'className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}'
  );
  // Heading margins
  code = code.replace(
    /pl-3 py-1 mb-2\.5/g,
    'pl-3 py-1 ${spacing.headingMarginBottom}'
  );
  code = code.replace(
    /pl-3 py-1 mb-2/g,
    'pl-3 py-1 ${spacing.headingMarginBottom}'
  );
  // Entry gaps
  code = code.replace(
    /className="space-y-3 px-0\.5"/g,
    'className={`${isMiniPreview ? "space-y-2" : spacing.entryGap} px-0.5`}'
  );
  code = code.replace(
    /className="space-y-4 px-0\.5"/g,
    'className={`${isMiniPreview ? "space-y-2" : spacing.entryGap} px-0.5`}'
  );
  code = code.replace(
    /className="space-y-2 px-0\.5"/g,
    'className={`${isMiniPreview ? "space-y-1.5" : spacing.entryGap} px-0.5`}'
  );
  // Bullet gaps
  code = code.replace(
    /mt-1\.5 space-y-1\.5 text-slate-700 leading-\[1\.6\]/g,
    'mt-1.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}'
  );
  code = code.replace(
    /mt-1 space-y-1 text-slate-700 leading-\[1\.6\]/g,
    'mt-1.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}'
  );
  return code;
});

// 2. MinimalistTemplate.tsx
updateTemplateFile('MinimalistTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const isFresher = candidateType === 'fresher';/,
      `const isFresher = candidateType === 'fresher';\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  // Replace outer container
  code = code.replace(
    /className=\{`w-full bg-white text-neutral-800 font-sans select-text leading-relaxed \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
    'className={`w-full bg-white text-neutral-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
  );
  // Header
  code = code.replace(
    /<header className="mb-4">/,
    '<header className={`shrink-0 ${spacing.headerMarginBottom}`}>\n        <div className="w-12 h-0.5 bg-neutral-300 mb-3" />'
  );
  // Body div
  code = code.replace(
    /className=\{`space-y-\$\{isMiniPreview \? '2' : '4'\}\`\}/,
    'className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}'
  );
  // Headings
  code = code.replace(
    /uppercase text-neutral-500 mb-1(\.5)?/g,
    'uppercase text-neutral-500 pb-0.5 ${spacing.headingMarginBottom}'
  );
  // Entries
  code = code.replace(
    /className="space-y-2"/g,
    'className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}'
  );
  code = code.replace(
    /className="space-y-2\.5"/g,
    'className={isMiniPreview ? "space-y-2" : spacing.entryGap}'
  );
  code = code.replace(
    /className="space-y-3"/g,
    'className={isMiniPreview ? "space-y-2" : spacing.entryGap}'
  );
  // Bullets
  code = code.replace(
    /mt-1 space-y-0\.5/g,
    'mt-1.5 ${spacing.bulletGap}'
  );
  return code;
});

// 3. CorporateExecutiveTemplate.tsx
updateTemplateFile('CorporateExecutiveTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const isFresher = candidateType === 'fresher';/,
      `const isFresher = candidateType === 'fresher';\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  // Replace outer container
  code = code.replace(
    /className=\{`w-full bg-white text-slate-800 font-sans select-text leading-normal flex-1 flex flex-col min-h-full \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[14px\] p-8 sm:p-10'\s*\}`\}/,
    'className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[14px] ${spacing.lineHeight}`}`}'
  );
  // Header
  code = code.replace(
    /mb-5' }/,
    `\${spacing.headerMarginBottom}' }`
  );
  // Body div
  code = code.replace(
    /className=\{`space-y-\$\{isMiniPreview \? '2' : '5'\} flex-1`\}/,
    'className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}'
  );
  // Headings
  code = code.replace(
    /pb-1 mb-2/g,
    'pb-1 ${spacing.headingMarginBottom}'
  );
  // Entries
  code = code.replace(
    /className="space-y-4"/g,
    'className={isMiniPreview ? "space-y-2" : spacing.entryGap}'
  );
  code = code.replace(
    /className="space-y-3\.5"/g,
    'className={isMiniPreview ? "space-y-2" : spacing.entryGap}'
  );
  code = code.replace(
    /className="space-y-3"/g,
    'className={isMiniPreview ? "space-y-2" : spacing.entryGap}'
  );
  // Bullets
  code = code.replace(
    /mt-1 space-y-1 text-slate-700/g,
    'mt-1.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}'
  );
  return code;
});

// 4. SoftwareEngineerTemplate.tsx
updateTemplateFile('SoftwareEngineerTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const isFresher = candidateType === 'fresher';/,
      `const isFresher = candidateType === 'fresher';\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  // Replace outer container
  code = code.replace(
    /className=\{`w-full bg-white text-slate-800 font-sans select-text leading-normal flex-1 flex flex-col min-h-full \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[14px\] p-8 sm:p-10'\s*\}`\}/,
    'className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[14px] ${spacing.lineHeight}`}`}'
  );
  // Header
  code = code.replace(
    /<header className="pb-3 mb-4 border-b-2 border-emerald-600 shrink-0">/,
    '<header className={`pb-3.5 ${spacing.headerMarginBottom} border-b-2 border-emerald-600 shrink-0`}>'
  );
  // Body div
  code = code.replace(
    /className=\{`space-y-\$\{isMiniPreview \? '2' : '5'\} flex-1`\}/,
    'className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}'
  );
  // Headings
  code = code.replace(
    /pb-1 mb-2(\.5)?/g,
    'pb-1 ${spacing.headingMarginBottom}'
  );
  // Entries
  code = code.replace(
    /className="space-y-4"/g,
    'className={isMiniPreview ? "space-y-2" : spacing.entryGap}'
  );
  code = code.replace(
    /className="space-y-3\.5"/g,
    'className={isMiniPreview ? "space-y-2" : spacing.entryGap}'
  );
  code = code.replace(
    /className="space-y-3"/g,
    'className={isMiniPreview ? "space-y-2" : spacing.entryGap}'
  );
  // Bullets
  code = code.replace(
    /mt-1 space-y-1 text-slate-700/g,
    'mt-1.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}'
  );
  return code;
});

// 5. DataAnalystTemplate.tsx
updateTemplateFile('DataAnalystTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const isFresher = candidateType === 'fresher';/,
      `const isFresher = candidateType === 'fresher';\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  code = code.replace(
    /className=\{`w-full bg-white text-slate-800 font-sans select-text leading-normal \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
    'className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
  );
  code = code.replace(
    /<header className="pb-3 mb-3 border-b-2 border-blue-600">/,
    '<header className={`pb-3.5 ${spacing.headerMarginBottom} border-b-2 border-blue-600 shrink-0`}>'
  );
  code = code.replace(
    /className=\{`space-y-\$\{isMiniPreview \? '2' : '4'\}\`\}/,
    'className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}'
  );
  code = code.replace(
    /pb-0\.5 mb-1(\.5)?/g,
    'pb-1 ${spacing.headingMarginBottom}'
  );
  code = code.replace(
    /className="space-y-2\.5"/g,
    'className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}'
  );
  code = code.replace(
    /className="space-y-3"/g,
    'className={isMiniPreview ? "space-y-2" : spacing.entryGap}'
  );
  code = code.replace(
    /mt-1 space-y-0\.5 text-slate-700/g,
    'mt-1.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}'
  );
  return code;
});

// 6. CreativeProfessionalTemplate.tsx
updateTemplateFile('CreativeProfessionalTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const isFresher = candidateType === 'fresher';/,
      `const isFresher = candidateType === 'fresher';\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  code = code.replace(
    /className=\{`w-full bg-white text-slate-800 font-sans select-text leading-normal \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
    'className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
  );
  code = code.replace(
    /p-6 mb-4' }/,
    `p-6 \${spacing.headerMarginBottom}' }`
  );
  code = code.replace(
    /className=\{`space-y-\$\{isMiniPreview \? '2' : '4'\}\`\}/,
    'className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}'
  );
  code = code.replace(
    /pb-0\.5 mb-1(\.5)?/g,
    'pb-1 ${spacing.headingMarginBottom}'
  );
  code = code.replace(
    /className="space-y-3"/g,
    'className={isMiniPreview ? "space-y-2" : spacing.entryGap}'
  );
  code = code.replace(
    /className="space-y-2"/g,
    'className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}'
  );
  code = code.replace(
    /mt-1 space-y-0\.5 text-slate-700/g,
    'mt-1.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}'
  );
  return code;
});

// 7. CompactOnePageTemplate.tsx
updateTemplateFile('CompactOnePageTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const isFresher = candidateType === 'fresher';/,
      `const isFresher = candidateType === 'fresher';\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  code = code.replace(
    /className=\{`w-full bg-white text-slate-900 font-sans select-text leading-snug \$\{\s*isMiniPreview \? 'text-\[6\.5px\] leading-tight p-3' : 'text-\[12\.5px\] p-7 sm:p-8'\s*\}`\}/,
    'className={`w-full bg-white text-slate-900 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[6.5px] leading-tight" : `text-[12.5px] ${spacing.lineHeight}`}`}'
  );
  code = code.replace(
    /<header className="pb-2 mb-2\.5 border-b border-slate-900/,
    '<header className={`pb-2.5 ${spacing.headerMarginBottom} border-b border-slate-900 shrink-0'
  );
  code = code.replace(
    /className=\{`space-y-\$\{isMiniPreview \? '1\.5' : '2\.5'\}\`\}/,
    'className={`${isMiniPreview ? "space-y-1.5" : spacing.sectionGap} flex-1`}'
  );
  code = code.replace(
    /className="space-y-2"/g,
    'className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}'
  );
  code = code.replace(
    /mt-0\.5 space-y-0\.5 text-slate-700/g,
    'mt-1 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}'
  );
  return code;
});

// 8. AcademicTemplate.tsx
updateTemplateFile('AcademicTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const \{ personalInfo, summary, skills, experience, education, projects, certifications \} = data;/,
      `const { personalInfo, summary, skills, experience, education, projects, certifications } = data;\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  code = code.replace(
    /className=\{`w-full bg-white text-slate-900 font-serif select-text leading-relaxed \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
    'className={`w-full bg-white text-slate-900 font-serif select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
  );
  code = code.replace(
    /<header className="text-center pb-2\.5 mb-3\.5 border-b border-slate-400">/,
    '<header className={`text-center pb-3 ${spacing.headerMarginBottom} border-b border-slate-400 shrink-0`}>'
  );
  code = code.replace(
    /className=\{`space-y-\$\{isMiniPreview \? '2' : '4'\}\`\}/,
    'className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}'
  );
  code = code.replace(
    /pb-0\.5 mb-1(\.5)?/g,
    'pb-1 ${spacing.headingMarginBottom}'
  );
  code = code.replace(
    /className="space-y-2\.5"/g,
    'className={isMiniPreview ? "space-y-2" : spacing.entryGap}'
  );
  code = code.replace(
    /mt-1 space-y-0\.5/g,
    'mt-1.5 ${spacing.bulletGap}'
  );
  return code;
});

// 9. ExperiencedProfessionalTemplate.tsx
updateTemplateFile('ExperiencedProfessionalTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const isFresher = candidateType === 'fresher';/,
      `const isFresher = candidateType === 'fresher';\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  code = code.replace(
    /className=\{`w-full bg-white text-slate-800 font-sans select-text leading-normal \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
    'className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
  );
  code = code.replace(
    /<header className="pb-3 mb-3 border-b-2 border-slate-700">/,
    '<header className={`pb-3.5 ${spacing.headerMarginBottom} border-b-2 border-slate-700 shrink-0`}>'
  );
  code = code.replace(
    /className=\{`space-y-\$\{isMiniPreview \? '2' : '4'\}\`\}/,
    'className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}'
  );
  code = code.replace(
    /pb-0\.5 mb-1(\.5)?/g,
    'pb-1 ${spacing.headingMarginBottom}'
  );
  code = code.replace(
    /className="space-y-3"/g,
    'className={isMiniPreview ? "space-y-2" : spacing.entryGap}'
  );
  code = code.replace(
    /className="space-y-2\.5"/g,
    'className={isMiniPreview ? "space-y-2" : spacing.entryGap}'
  );
  code = code.replace(
    /mt-1 space-y-0\.5/g,
    'mt-1.5 ${spacing.bulletGap}'
  );
  return code;
});

// 10. ContemporaryTemplate.tsx
updateTemplateFile('ContemporaryTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const isFresher = candidateType === 'fresher';/,
      `const isFresher = candidateType === 'fresher';\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  // Replace left sidebar padding
  code = code.replace(
    /'p-7 sm:p-8 space-y-6'/,
    '`${spacing.containerPadding} ${spacing.sectionGap}`'
  );
  // Replace right column padding & gap
  code = code.replace(
    /'p-7 sm:p-8 space-y-6'/,
    '`${spacing.containerPadding} ${spacing.sectionGap}`'
  );
  return code;
});

// 11. ThomasHamptoneTemplate.tsx
updateTemplateFile('ThomasHamptoneTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const \{ personalInfo, summary, skills, experience, education, projects, certifications \} = data;/,
      `const { personalInfo, summary, skills, experience, education, projects, certifications } = data;\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  code = code.replace(
    /className=\{`w-full bg-white text-neutral-800 select-text leading-normal flex-1 flex flex-col min-h-full \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[14px\] p-8 sm:p-10'\s*\}`\}/,
    'className={`w-full bg-white text-neutral-800 select-text leading-normal flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[14px] ${spacing.lineHeight}`}`}'
  );
  code = code.replace(
    /pb-5 mb-6 shrink-0 \$\{isMiniPreview \? 'pb-2 mb-2' : ''\}/,
    'pb-5 shrink-0 ${isMiniPreview ? "pb-2 mb-2" : spacing.headerMarginBottom}'
  );
  return code;
});

// 12. NickKoeTemplate.tsx
updateTemplateFile('NickKoeTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const \{ personalInfo, summary, skills, experience, education, projects, certifications \} = data;/,
      `const { personalInfo, summary, skills, experience, education, projects, certifications } = data;\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  code = code.replace(
    /className=\{`w-full bg-white text-neutral-800 select-text leading-normal flex-1 flex flex-col min-h-full \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-3' : 'text-\[14px\] p-8 sm:p-10'\s*\}`\}/,
    'className={`w-full bg-white text-neutral-800 select-text leading-normal flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[14px] ${spacing.lineHeight}`}`}'
  );
  code = code.replace(
    /pb-5 mb-5 shrink-0 \$\{isMiniPreview \? 'pb-2 mb-2' : ''\}/,
    'pb-5 shrink-0 ${isMiniPreview ? "pb-2 mb-2" : spacing.headerMarginBottom}'
  );
  return code;
});

// 13. RichardSanchezTemplate.tsx
updateTemplateFile('RichardSanchezTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const \{ personalInfo, summary, skills, experience, education, projects, certifications \} = data;/,
      `const { personalInfo, summary, skills, experience, education, projects, certifications } = data;\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  code = code.replace(
    /space-y-6' : 'p-6 space-y-8'/,
    "space-y-6' : `p-6 ${spacing.sectionGap}`"
  );
  code = code.replace(
    /space-y-6' : 'p-8 sm:p-10 space-y-8'/,
    "space-y-6' : `p-8 sm:p-10 ${spacing.sectionGap}`"
  );
  return code;
});

// 14. OliviaWilsonGridTemplate.tsx
updateTemplateFile('OliviaWilsonGridTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const \{ personalInfo, summary, skills, experience, education, projects, certifications \} = data;/,
      `const { personalInfo, summary, skills, experience, education, projects, certifications } = data;\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  code = code.replace(
    /className=\{`w-full bg-white text-neutral-800 select-text leading-normal flex-1 flex flex-col min-h-full \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-3' : 'text-\[14px\] p-8 sm:p-10'\s*\}`\}/,
    'className={`w-full bg-white text-neutral-800 select-text leading-normal flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[14px] ${spacing.lineHeight}`}`}'
  );
  return code;
});

// 15. OliviaWilsonBlushTemplate.tsx
updateTemplateFile('OliviaWilsonBlushTemplate.tsx', (code) => {
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(
      /from '\.\/templateUtils';/,
      `  getTemplateSpacing,\n} from './templateUtils';`
    );
  }
  if (!code.includes('const spacing = getTemplateSpacing')) {
    code = code.replace(
      /const \{ personalInfo, summary, skills, experience, education, projects, certifications \} = data;/,
      `const { personalInfo, summary, skills, experience, education, projects, certifications } = data;\n  const spacing = getTemplateSpacing(data, isMiniPreview);`
    );
  }
  code = code.replace(
    /'p-7 sm:p-8 space-y-6'/,
    '`${spacing.containerPadding} ${spacing.sectionGap}`'
  );
  return code;
});

console.log('All remaining templates processed!');
