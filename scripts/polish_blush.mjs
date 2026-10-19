import fs from 'fs';

const blushPath = 'src/components/builder/templates/OliviaWilsonBlushTemplate.tsx';
let blush = fs.readFileSync(blushPath, 'utf8');

// Replace vertical 1-column list with flex-wrap pill badges for skills in the sidebar
const oldSkills = `<ul className={\`space-y-1.5 text-neutral-700 \${isMiniPreview ? 'space-y-0.5 text-[5.5px]' : 'text-[12.5px]'}\`}>
              {allSkills.map((s, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#9c6668]">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>`;

const newSkills = `<div className="flex flex-wrap gap-1 justify-center">
              {allSkills.map((s, idx) => (
                <span
                  key={idx}
                  className={\`bg-white/80 text-neutral-800 font-medium rounded shadow-2xs \${
                    isMiniPreview ? 'text-[5px] px-1 py-0.2' : 'text-[11.5px] px-2 py-0.5'
                  }\`}
                >
                  {s}
                </span>
              ))}
            </div>`;

// Update sidebar padding and heading margins
blush = blush.replace(
  "isMiniPreview ? 'p-3' : 'p-6 sm:p-8'",
  "isMiniPreview ? 'p-3' : 'p-4 sm:p-5'"
);

blush = blush.replace(
  /bg-white px-3 py-1\.5 text-center font-bold uppercase tracking-\[0\.2em\] text-neutral-900 shadow-xs mb-3/g,
  "bg-white px-3 py-0.5 text-center font-bold uppercase tracking-[0.2em] text-neutral-900 shadow-xs mb-1.5"
);

if (blush.includes('{allSkills.map((s, idx) => (')) {
  // Replace the ul with div
  const ulRegex = /<ul className=\{`space-y-1\.5 text-neutral-700 \$\{isMiniPreview \? 'space-y-0\.5 text-\[5\.5px\]' : 'text-\[12\.5px\]'\}\`}>[\s\S]*?<\/ul>/;
  blush = blush.replace(ulRegex, newSkills);
  console.log('Replaced skills list with badges in blush sidebar');
}

fs.writeFileSync(blushPath, blush, 'utf8');
console.log('Successfully updated OliviaWilsonBlushTemplate.tsx');
