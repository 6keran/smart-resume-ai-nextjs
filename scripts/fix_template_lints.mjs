import fs from 'fs';

// 1. OliviaWilsonGridTemplate.tsx
let ow = fs.readFileSync('src/components/builder/templates/OliviaWilsonGridTemplate.tsx', 'utf8');

// Replace inner SectionHeader declaration
const oldHeaderDecl = /  const SectionHeader = \(\{ title \}: \{ title: string \}\) => \{[\s\S]*?\n  \};\r?\n/;
ow = ow.replace(oldHeaderDecl, '');

// Place SectionHeader above export function OliviaWilsonGridTemplate
const headerComponent = `function SectionHeader({ title, isMiniPreview }: { title: string; isMiniPreview?: boolean }) {
  const firstLetter = title[0];
  const rest = title.slice(1);
  return (
    <div className={\`flex items-center gap-1.5 pb-2 mb-2 font-sans font-bold tracking-[0.2em] text-neutral-800 \${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}\`}>
      <div className="relative inline-flex items-center justify-center">
        <span className={\`absolute rounded-full bg-neutral-200/80 -z-0 \${isMiniPreview ? 'w-3 h-3' : 'w-5 h-5'}\`} />
        <span className="relative z-10">{firstLetter}</span>
      </div>
      <span>{rest}</span>
    </div>
  );
}\n\n`;

ow = ow.replace('export function OliviaWilsonGridTemplate', headerComponent + 'export function OliviaWilsonGridTemplate');

// Replace <SectionHeader title="..." /> with <SectionHeader title="..." isMiniPreview={isMiniPreview} />
ow = ow.replace(/<SectionHeader title="([^"]+)" \/>/g, '<SectionHeader title="$1" isMiniPreview={isMiniPreview} />');

fs.writeFileSync('src/components/builder/templates/OliviaWilsonGridTemplate.tsx', ow, 'utf8');
console.log('OliviaWilsonGridTemplate updated');

// 2. SoftwareEngineerTemplate.tsx
let se = fs.readFileSync('src/components/builder/templates/SoftwareEngineerTemplate.tsx', 'utf8');
se = se.replace("// {isFresher ? 'ENGINEERING OBJECTIVE' : 'SYSTEMS PROFILE & SUMMARY'}", "{'// '}{isFresher ? 'ENGINEERING OBJECTIVE' : 'SYSTEMS PROFILE & SUMMARY'}");
se = se.replace('// TECHNICAL SKILLS & STACK', "{'// TECHNICAL SKILLS & STACK'}");
se = se.replace('// FEATURED OPEN SOURCE & SYSTEMS', "{'// FEATURED OPEN SOURCE & SYSTEMS'}");
se = se.replace('// ENGINEERING EXPERIENCE', "{'// ENGINEERING EXPERIENCE'}");
se = se.replace('// EDUCATION', "{'// EDUCATION'}");
se = se.replace('// CERTIFICATIONS', "{'// CERTIFICATIONS'}");
se = se.replace('className="list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed"', 'className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed`}');
se = se.replace('className="list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed"', 'className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed`}');

fs.writeFileSync('src/components/builder/templates/SoftwareEngineerTemplate.tsx', se, 'utf8');
console.log('SoftwareEngineerTemplate updated');
