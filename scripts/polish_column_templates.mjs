import fs from 'fs';
import path from 'path';

// 1. Update NickKoeTemplate.tsx
const nickKoePath = 'src/components/builder/templates/NickKoeTemplate.tsx';
let nickKoe = fs.readFileSync(nickKoePath, 'utf8');

// Replace the two-column grid in NickKoeTemplate
const nickKoeGridPattern = /\{\/\* TWO COLUMNS \*\/\}[\s\S]*?\{\/\* RIGHT COLUMN[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/;

const newNickKoeGrid = `{/* TWO COLUMNS */}
      <div className="grid grid-cols-12 gap-5 sm:gap-6 flex-1">
        {/* LEFT COLUMN: ~58% (EXPERIENCE, PROJECTS, EDUCATION) */}
        <div className={\`col-span-7 \${isMiniPreview ? "space-y-2" : spacing.sectionGap}\`}>
          {/* IF FRESHER: PROJECTS FIRST, THEN EXPERIENCE, THEN EDUCATION */}
          {isFresher ? (
            <>
              {/* PORTFOLIO / PROJECTS */}
              {validProj.length > 0 && (
                <section className="resume-section">
                  <h2
                    className={\`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 \${
                      isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'
                    }\`}
                  >
                    PORTFOLIO & PROJECTS
                  </h2>
                  <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                    {validProj.map((proj) => (
                      <div key={proj.id} className="relative pl-4 resume-entry">
                        <div
                          className={\`absolute left-0 top-1 bg-[#2a9d8f] \${
                            isMiniPreview ? 'w-1.5 h-3' : 'w-2 h-4'
                          }\`}
                        />
                        <div className={\`flex items-center gap-1 font-semibold text-neutral-900 \${isMiniPreview ? 'text-[7px]' : 'text-[13px] sm:text-[13.5px]'}\`}>
                          <span>{proj.title}</span>
                          {proj.link && (
                            <a
                              href={formatUrl(proj.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2a9d8f] hover:underline"
                            >
                              <ArrowUpRight className={\`inline \${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'}\`} />
                            </a>
                          )}
                        </div>
                        {proj.description && (
                          <p className={\`text-neutral-600 leading-snug mt-0.5 \${isMiniPreview ? 'text-[5.5px]' : 'text-[12px] sm:text-[12.5px]'}\`}>
                            {proj.description}
                          </p>
                        )}
                        {proj.bullets && proj.bullets.length > 0 && (
                          <ul className={\`space-y-0.5 mt-0.5 text-neutral-600 \${isMiniPreview ? 'text-[5px]' : 'text-[11.5px] sm:text-[12px]'}\`}>
                            {proj.bullets.map((b, bIdx) => (
                              <li key={bIdx} className="flex items-start gap-1">
                                <span className="text-[#2a9d8f]">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* WORK EXPERIENCE */}
              {validExp.length > 0 && (
                <section className="resume-section">
                  <h2
                    className={\`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 \${
                      isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'
                    }\`}
                  >
                    WORK EXPERIENCE
                  </h2>
                  <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                    {validExp.map((exp) => (
                      <div key={exp.id} className="relative pl-4 resume-entry">
                        <div
                          className={\`absolute left-0 top-1 bg-[#2a9d8f] \${
                            isMiniPreview ? 'w-1.5 h-3' : 'w-2 h-4'
                          }\`}
                        />
                        <div>
                          <h3
                            className={\`font-semibold text-neutral-900 leading-snug \${
                              isMiniPreview ? 'text-[7px]' : 'text-[13px] sm:text-[13.5px]'
                            }\`}
                          >
                            {exp.role}
                          </h3>
                          <div className={\`flex items-center gap-1 text-neutral-700 font-medium mt-0.5 mb-0.5 \${isMiniPreview ? 'text-[6px]' : 'text-[12px] sm:text-[12.5px]'}\`}>
                            <span>{exp.company}</span>
                            <ArrowUpRight className={\`text-[#2a9d8f] \${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'}\`} />
                          </div>
                          <p
                            className={\`text-[#2a9d8f] font-medium mb-1 \${
                              isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px]'
                            }\`}
                          >
                            {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                            {exp.location ? \` | \${exp.location}\` : ''}
                          </p>
                          {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                            <ul className={\`space-y-0.5 text-neutral-600 \${isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px] sm:text-[12px]'}\`}>
                              {exp.bulletPoints.map((bp, bIdx) => (
                                <li key={bIdx} className="flex items-start gap-1 leading-snug">
                                  <span className="text-[#2a9d8f] mt-0.5">•</span>
                                  <span>{bp}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <>
              {/* WORK EXPERIENCE */}
              {validExp.length > 0 && (
                <section className="resume-section">
                  <h2
                    className={\`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 \${
                      isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'
                    }\`}
                  >
                    WORK EXPERIENCE
                  </h2>
                  <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                    {validExp.map((exp) => (
                      <div key={exp.id} className="relative pl-4 resume-entry">
                        <div
                          className={\`absolute left-0 top-1 bg-[#2a9d8f] \${
                            isMiniPreview ? 'w-1.5 h-3' : 'w-2 h-4'
                          }\`}
                        />
                        <div>
                          <h3
                            className={\`font-semibold text-neutral-900 leading-snug \${
                              isMiniPreview ? 'text-[7px]' : 'text-[13px] sm:text-[13.5px]'
                            }\`}
                          >
                            {exp.role}
                          </h3>
                          <div className={\`flex items-center gap-1 text-neutral-700 font-medium mt-0.5 mb-0.5 \${isMiniPreview ? 'text-[6px]' : 'text-[12px] sm:text-[12.5px]'}\`}>
                            <span>{exp.company}</span>
                            <ArrowUpRight className={\`text-[#2a9d8f] \${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'}\`} />
                          </div>
                          <p
                            className={\`text-[#2a9d8f] font-medium mb-1 \${
                              isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px]'
                            }\`}
                          >
                            {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                            {exp.location ? \` | \${exp.location}\` : ''}
                          </p>
                          {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                            <ul className={\`space-y-0.5 text-neutral-600 \${isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px] sm:text-[12px]'}\`}>
                              {exp.bulletPoints.map((bp, bIdx) => (
                                <li key={bIdx} className="flex items-start gap-1 leading-snug">
                                  <span className="text-[#2a9d8f] mt-0.5">•</span>
                                  <span>{bp}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* PORTFOLIO / PROJECTS */}
              {validProj.length > 0 && (
                <section className="resume-section">
                  <h2
                    className={\`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 \${
                      isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'
                    }\`}
                  >
                    PORTFOLIO & PROJECTS
                  </h2>
                  <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                    {validProj.map((proj) => (
                      <div key={proj.id} className="relative pl-4 resume-entry">
                        <div
                          className={\`absolute left-0 top-1 bg-[#2a9d8f] \${
                            isMiniPreview ? 'w-1.5 h-3' : 'w-2 h-4'
                          }\`}
                        />
                        <div className={\`flex items-center gap-1 font-semibold text-neutral-900 \${isMiniPreview ? 'text-[7px]' : 'text-[13px] sm:text-[13.5px]'}\`}>
                          <span>{proj.title}</span>
                          {proj.link && (
                            <a
                              href={formatUrl(proj.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2a9d8f] hover:underline"
                            >
                              <ArrowUpRight className={\`inline \${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'}\`} />
                            </a>
                          )}
                        </div>
                        {proj.description && (
                          <p className={\`text-neutral-600 leading-snug mt-0.5 \${isMiniPreview ? 'text-[5.5px]' : 'text-[12px] sm:text-[12.5px]'}\`}>
                            {proj.description}
                          </p>
                        )}
                        {proj.bullets && proj.bullets.length > 0 && (
                          <ul className={\`space-y-0.5 mt-0.5 text-neutral-600 \${isMiniPreview ? 'text-[5px]' : 'text-[11.5px] sm:text-[12px]'}\`}>
                            {proj.bullets.map((b, bIdx) => (
                              <li key={bIdx} className="flex items-start gap-1">
                                <span className="text-[#2a9d8f]">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* EDUCATION */}
          {validEdu.length > 0 && (
            <section className="resume-section">
              <h2
                className={\`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 \${
                  isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'
                }\`}
              >
                EDUCATION
              </h2>
              <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                {validEdu.map((edu) => (
                  <div key={edu.id} className="relative pl-4 resume-entry">
                    {/* Teal indicator */}
                    <div
                      className={\`absolute left-0 top-1 bg-[#2a9d8f] \${
                        isMiniPreview ? 'w-1.5 h-3' : 'w-2 h-4'
                      }\`}
                    />
                    <h3 className={\`font-semibold text-neutral-900 \${isMiniPreview ? 'text-[7px]' : 'text-[13px] sm:text-[13.5px]'}\`}>
                      {edu.degree}
                    </h3>
                    <p className={\`text-neutral-700 \${isMiniPreview ? 'text-[6px]' : 'text-[12px] sm:text-[12.5px]'}\`}>
                      {edu.institution}
                    </p>
                    <p className={\`text-[#2a9d8f] font-medium \${isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px]'}\`}>
                      {edu.graduationYear}
                      {edu.gpa ? \` | GPA: \${edu.gpa}\` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: ~42% (HARD SKILLS PILLS, SOFT SKILLS PILLS, CERTIFICATES) */}
        <div className={\`col-span-5 \${isMiniPreview ? "space-y-2" : spacing.sectionGap}\`}>
          {/* HARD SKILLS */}
          {hardSkills.length > 0 && (
            <section className="resume-section">
              <h2
                className={\`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 \${
                  isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'
                }\`}
              >
                HARD SKILLS
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {hardSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className={\`bg-[#135274] text-white font-medium rounded tracking-wide \${
                      isMiniPreview ? 'text-[5px] px-1 py-0.2' : 'text-[11.5px] px-2 py-0.5'
                    }\`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* SOFT SKILLS */}
          {softSkills.length > 0 && (
            <section className="resume-section">
              <h2
                className={\`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 \${
                  isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'
                }\`}
              >
                SOFT SKILLS
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {softSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className={\`bg-[#135274] text-white font-medium rounded tracking-wide \${
                      isMiniPreview ? 'text-[5px] px-1 py-0.2' : 'text-[11.5px] px-2 py-0.5'
                    }\`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* CERTIFICATES */}
          {validCerts.length > 0 && (
            <section className="resume-section">
              <h2
                className={\`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 \${
                  isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'
                }\`}
              >
                CERTIFICATES
              </h2>
              <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                {validCerts.map((cert) => (
                  <div key={cert.id} className="text-neutral-700 resume-entry">
                    <p className={\`font-semibold text-neutral-800 \${isMiniPreview ? 'text-[6px]' : 'text-[12.5px]'}\`}>
                      {cert.name} {cert.date ? \`– \${cert.date}\` : ''}
                    </p>
                    <p className={\`text-neutral-500 \${isMiniPreview ? 'text-[5px]' : 'text-[11.5px]'}\`}>
                      {cert.issuer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}`;

if (nickKoeGridPattern.test(nickKoe)) {
  nickKoe = nickKoe.replace(nickKoeGridPattern, newNickKoeGrid);
  fs.writeFileSync(nickKoePath, nickKoe, 'utf8');
  console.log('Successfully updated NickKoeTemplate.tsx');
} else {
  console.log('Could not match pattern in NickKoeTemplate.tsx');
}

// 2. Update OliviaWilsonGridTemplate.tsx
const gridPath = 'src/components/builder/templates/OliviaWilsonGridTemplate.tsx';
let grid = fs.readFileSync(gridPath, 'utf8');

// Refine boxPad and header padding
grid = grid.replace(
  'const boxPad = isMiniPreview ? "p-2" : spacing.density === "spacious" ? "p-5 sm:p-7" : spacing.density === "compact" ? "p-3 sm:p-4" : "p-4 sm:p-6";',
  'const boxPad = isMiniPreview ? "p-2" : spacing.density === "spacious" ? "p-4 sm:p-5" : spacing.density === "compact" ? "p-2.5 sm:p-3" : "p-3 sm:p-4";'
);
grid = grid.replace(
  'header className={`relative text-center border-t border-b border-neutral-300 py-6 mb-0 overflow-hidden ${isMiniPreview ? \'py-3\' : \'\'}`}',
  'header className={`relative text-center border-t border-b border-neutral-300 py-3.5 sm:py-4 mb-0 overflow-hidden ${isMiniPreview ? \'py-2\' : \'\'}`}'
);
grid = grid.replace(
  'const SectionHeader = ({ title }: { title: string }) => {\n    const firstLetter = title[0];\n    const rest = title.slice(1);\n    return (\n      <div className={`flex items-center gap-1.5 pb-2 mb-2 font-sans font-bold tracking-[0.2em] text-neutral-800 ${isMiniPreview ? \'text-[7px]\' : \'text-[14px]\'`}}>',
  'const SectionHeader = ({ title }: { title: string }) => {\n    const firstLetter = title[0];\n    const rest = title.slice(1);\n    return (\n      <div className={`flex items-center gap-1.5 pb-1 mb-1.5 font-sans font-bold tracking-[0.2em] text-neutral-800 ${isMiniPreview ? \'text-[7px]\' : \'text-[13px] sm:text-[13.5px]\'`}}>'
);

fs.writeFileSync(gridPath, grid, 'utf8');
console.log('Successfully updated OliviaWilsonGridTemplate.tsx');

// 3. Update OliviaWilsonBlushTemplate.tsx
const blushPath = 'src/components/builder/templates/OliviaWilsonBlushTemplate.tsx';
let blush = fs.readFileSync(blushPath, 'utf8');

blush = blush.replace(
  'isMiniPreview ? \'w-16 h-20 p-1\' : \'w-36 h-44 sm:w-40 sm:h-48\'',
  'isMiniPreview ? \'w-14 h-16 p-1\' : \'w-28 h-32 sm:w-32 sm:h-36\''
);
blush = blush.replace(
  'flex justify-center mb-6',
  'flex justify-center mb-3 sm:mb-4'
);
blush = blush.replace(
  'isMiniPreview ? \'text-2xl\' : \'text-5xl sm:text-6xl\'',
  'isMiniPreview ? \'text-xl\' : \'text-3xl sm:text-4xl\''
);
blush = blush.replace(
  'header className={`mb-6 ${isMiniPreview ? \'mb-3\' : \'\'}`}',
  'header className={`mb-3 sm:mb-4 ${isMiniPreview ? \'mb-2\' : \'\'}`}'
);
blush = blush.replace(
  'isMiniPreview ? \'p-3 pl-4\' : \'p-6 sm:p-8 pl-8 sm:pl-10\'',
  'isMiniPreview ? \'p-3 pl-4\' : \'p-4 sm:p-5 pl-6 sm:pl-7\''
);

fs.writeFileSync(blushPath, blush, 'utf8');
console.log('Successfully updated OliviaWilsonBlushTemplate.tsx');
