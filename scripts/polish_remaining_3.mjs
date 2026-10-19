import fs from 'fs';

// 1. ThomasHamptoneTemplate.tsx
const thomasPath = 'src/components/builder/templates/ThomasHamptoneTemplate.tsx';
let thomas = fs.readFileSync(thomasPath, 'utf8');

thomas = thomas.replace(
  'header className={`flex justify-between items-center border-b border-neutral-300 pb-5 ${isMiniPreview ? "pb-2 mb-2" : spacing.headerMarginBottom}`}',
  'header className={`flex justify-between items-center border-b border-neutral-300 pb-3 sm:pb-3.5 ${isMiniPreview ? "pb-2 mb-2" : spacing.headerMarginBottom}`}'
);
thomas = thomas.replace(
  'isMiniPreview ? \'w-10 h-10\' : \'w-24 h-24 sm:w-28 sm:h-28\'',
  'isMiniPreview ? \'w-10 h-10\' : \'w-20 h-20 sm:w-22 sm:h-22\''
);
thomas = thomas.replace(
  'isMiniPreview ? \'text-[12px]\' : \'text-3xl sm:text-4xl\'',
  'isMiniPreview ? \'text-[12px]\' : \'text-2xl sm:text-[28px]\''
);

fs.writeFileSync(thomasPath, thomas, 'utf8');
console.log('ThomasHamptoneTemplate.tsx updated');

// 2. CreativeProfessionalTemplate.tsx
const creativePath = 'src/components/builder/templates/CreativeProfessionalTemplate.tsx';
let creative = fs.readFileSync(creativePath, 'utf8');

creative = creative.replace(
  'isMiniPreview ? \'p-2.5 mb-2\' : \'p-6 mb-4\'',
  'isMiniPreview ? \'p-2 mb-2\' : \'p-4 sm:p-4.5 mb-2.5\''
);
creative = creative.replace(
  /border-b border-purple-200 pb-1 \$\{spacing\.headingMarginBottom\}/g,
  'border-b border-purple-200 pb-0.5 ${spacing.headingMarginBottom}'
);

fs.writeFileSync(creativePath, creative, 'utf8');
console.log('CreativeProfessionalTemplate.tsx updated');

// 3. OliviaWilsonBlushTemplate.tsx
const blushPath = 'src/components/builder/templates/OliviaWilsonBlushTemplate.tsx';
let blush = fs.readFileSync(blushPath, 'utf8');

blush = blush.replace(
  /bg-\[#eed6d8\] px-3 py-1 font-bold uppercase tracking-\[0\.2em\] text-neutral-900 mb-3/g,
  'bg-[#eed6d8] px-3 py-0.5 font-bold uppercase tracking-[0.2em] text-neutral-900 mb-1.5'
);
blush = blush.replace(
  'isMiniPreview ? \'text-xl\' : \'text-3xl sm:text-4xl\'',
  'isMiniPreview ? \'text-lg\' : \'text-2xl sm:text-[28px]\''
);
blush = blush.replace(
  'space-y-1 text-neutral-600',
  'space-y-0.5 text-neutral-600'
);

fs.writeFileSync(blushPath, blush, 'utf8');
console.log('OliviaWilsonBlushTemplate.tsx updated');
