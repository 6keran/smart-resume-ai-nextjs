import fs from 'fs';
import path from 'path';

const dir = 'D:/projects/builder/src/components/builder/templates';

const templates = [
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

for (const f of templates) {
  const filePath = path.join(dir, f);
  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Ensure import of getTemplateSpacing
  if (!code.includes('getTemplateSpacing')) {
    code = code.replace(/from '\.\/templateUtils';/, "  getTemplateSpacing,\n} from './templateUtils';");
  }

  // 2. Ensure spacing initialization
  if (!code.includes('const spacing = getTemplateSpacing')) {
    const fnMatch = code.match(/export function \w+Template\(\{[\s\S]*?\}\) \{/);
    if (fnMatch) {
      const insertPos = fnMatch.index + fnMatch[0].length;
      code = code.slice(0, insertPos) + '\n  const spacing = getTemplateSpacing(data, isMiniPreview);' + code.slice(insertPos);
    }
  }

  // 3. Update body sections container
  code = code.replace(/className=\{`space-y-\$\{isMiniPreview \? '[\d\.]+' : '[\d\.]+'\}( flex-1)?`\}/g,
    'className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}'
  );

  // 4. Update entry containers
  code = code.replace(/className="space-y-(2|2\.5|3|3\.5|4)"/g,
    'className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}'
  );
  code = code.replace(/className="space-y-(2|2\.5|3|3\.5|4) px-0\.5"/g,
    'className={`${isMiniPreview ? "space-y-1.5" : spacing.entryGap} px-0.5`}'
  );

  // 5. Update bullet gaps
  code = code.replace(/space-y-(0\.5|1) text-([a-z]+)-700/g,
    '${spacing.bulletGap} text-$2-700 ${spacing.lineHeight}'
  );
  code = code.replace(/space-y-(0\.5|1) text-([a-z]+)-800/g,
    '${spacing.bulletGap} text-$2-800 ${spacing.lineHeight}'
  );

  // 6. Template specific outer container and header updates
  if (f === 'ModernProfessionalTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-slate-800 font-sans select-text leading-normal \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
      'className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
    );
    code = code.replace(/<header className="pb-3 mb-3 border-b border-slate-200">/,
      '<header className={`pb-3.5 ${spacing.headerMarginBottom} border-b border-slate-200 shrink-0`}>'
    );
    code = code.replace(/pl-2\.5 py-0\.5 mb-1/g, 'pl-3 py-1 ${spacing.headingMarginBottom}');
  } else if (f === 'MinimalistTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-neutral-800 font-sans select-text leading-relaxed \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
      'className={`w-full bg-white text-neutral-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
    );
    code = code.replace(/<header className="mb-4">/,
      '<header className={`shrink-0 ${spacing.headerMarginBottom}`}>\n        <div className="w-12 h-0.5 bg-neutral-300 mb-3" />'
    );
    code = code.replace(/mb-1(\.5)? \$\{isMiniPreview \? 'text-\[7\.5px\]' : 'text-\[14px\]'\}/g,
      '${spacing.headingMarginBottom} ${isMiniPreview ? "text-[7.5px]" : "text-[14px]"}'
    );
  } else if (f === 'CorporateExecutiveTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-slate-800 font-sans select-text leading-normal flex-1 flex flex-col min-h-full \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[14px\] p-8 sm:p-10'\s*\}`\}/,
      'className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[14px] ${spacing.lineHeight}`}`}'
    );
    code = code.replace(/mb-5' \}/, '${spacing.headerMarginBottom}\' }');
    code = code.replace(/pb-1 mb-2/g, 'pb-1 ${spacing.headingMarginBottom}');
  } else if (f === 'SoftwareEngineerTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-slate-800 font-sans select-text leading-normal \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
      'className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
    );
    code = code.replace(/<header className="pb-3 mb-3 border-b-2 border-emerald-600">/,
      '<header className={`pb-3.5 ${spacing.headerMarginBottom} border-b-2 border-emerald-600 shrink-0`}>'
    );
    code = code.replace(/pb-1 mb-2/g, 'pb-1 ${spacing.headingMarginBottom}');
  } else if (f === 'DataAnalystTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-slate-800 font-sans select-text leading-normal \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
      'className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
    );
    code = code.replace(/<header className="pb-3 mb-3 border-b-2 border-blue-600">/,
      '<header className={`pb-3.5 ${spacing.headerMarginBottom} border-b-2 border-blue-600 shrink-0`}>'
    );
    code = code.replace(/pb-0\.5 mb-1(\.5)?/g, 'pb-1 ${spacing.headingMarginBottom}');
  } else if (f === 'CreativeProfessionalTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-slate-800 font-sans select-text leading-normal \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
      'className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
    );
    code = code.replace(/mb-4' \}/, '${spacing.headerMarginBottom}\' }');
    code = code.replace(/pb-0\.5 mb-1(\.5)?/g, 'pb-1 ${spacing.headingMarginBottom}');
  } else if (f === 'CompactOnePageTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-slate-900 font-sans select-text leading-snug \$\{\s*isMiniPreview \? 'text-\[6\.5px\] leading-tight p-3' : 'text-\[12\.5px\] p-7 sm:p-8'\s*\}`\}/,
      'className={`w-full bg-white text-slate-900 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[6.5px] leading-tight" : `text-[12.5px] ${spacing.lineHeight}`}`}'
    );
    code = code.replace(/<header className="pb-2 mb-2\.5 border-b border-slate-900/,
      '<header className={`pb-2.5 ${spacing.headerMarginBottom} border-b border-slate-900 shrink-0'
    );
  } else if (f === 'AcademicTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-slate-900 font-serif select-text leading-relaxed \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
      'className={`w-full bg-white text-slate-900 font-serif select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
    );
    code = code.replace(/<header className="text-center pb-2\.5 mb-3\.5 border-b border-slate-400">/,
      '<header className={`text-center pb-3 ${spacing.headerMarginBottom} border-b border-slate-400 shrink-0`}>'
    );
    code = code.replace(/pb-0\.5 mb-1(\.5)?/g, 'pb-1 ${spacing.headingMarginBottom}');
  } else if (f === 'ExperiencedProfessionalTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-slate-800 font-sans select-text leading-normal \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
      'className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
    );
    code = code.replace(/<header className="pb-3 mb-3 border-b-2 border-slate-700">/,
      '<header className={`pb-3.5 ${spacing.headerMarginBottom} border-b-2 border-slate-700 shrink-0`}>'
    );
    code = code.replace(/pb-0\.5 mb-1(\.5)?/g, 'pb-1 ${spacing.headingMarginBottom}');
  } else if (f === 'ContemporaryTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-slate-800 font-sans select-text flex min-h-full \$\{\s*isMiniPreview \? 'text-\[6\.5px\] leading-tight' : 'text-\[13px\] leading-normal'\s*\}`\}/,
      'className={`w-full bg-white text-slate-800 font-sans select-text flex flex-1 min-h-full ${isMiniPreview ? "text-[6.5px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
    );
  } else if (f === 'ThomasHamptoneTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-neutral-800 select-text leading-normal \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-4' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
      'className={`w-full bg-white text-neutral-800 select-text leading-normal flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
    );
    code = code.replace(/pb-5 mb-5 \$\{isMiniPreview \? 'pb-2 mb-2' : ''\}/, 'pb-5 ${isMiniPreview ? "pb-2 mb-2" : spacing.headerMarginBottom}');
  } else if (f === 'NickKoeTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-neutral-800 select-text leading-normal \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-3' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
      'className={`w-full bg-white text-neutral-800 select-text leading-normal flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
    );
    code = code.replace(/pb-4 mb-4 \$\{isMiniPreview \? 'pb-2 mb-2' : ''\}/, 'pb-4 ${isMiniPreview ? "pb-2 mb-2" : spacing.headerMarginBottom}');
  } else if (f === 'RichardSanchezTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-neutral-800 select-text leading-normal flex flex-col \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight' : 'text-\[13px\]'\s*\}`\}/,
      'className={`w-full bg-white text-neutral-800 select-text leading-normal flex flex-col flex-1 min-h-full ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
    );
  } else if (f === 'OliviaWilsonGridTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-neutral-800 select-text leading-normal \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight p-3' : 'text-\[13px\] p-8 sm:p-10'\s*\}`\}/,
      'className={`w-full bg-white text-neutral-800 select-text leading-normal flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
    );
  } else if (f === 'OliviaWilsonBlushTemplate.tsx') {
    code = code.replace(/className=\{`w-full bg-white text-neutral-800 select-text leading-normal flex min-h-\[800px\] \$\{\s*isMiniPreview \? 'text-\[7px\] leading-tight' : 'text-\[13px\]'\s*\}`\}/,
      'className={`w-full bg-white text-neutral-800 select-text leading-normal flex flex-1 min-h-full ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}'
    );
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`Updated: ${f}`);
}
console.log('Finished updating all templates!');
