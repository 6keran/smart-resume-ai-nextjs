'use client';

import React from 'react';
import { ResumeData } from '@/types/resume';
import {
  hasContactInfo,
  formatUrl,
  cleanDomain,
  hasSkillsData,
  hasExperienceData,
  hasEducationData,
  hasProjectsData,
  hasCertificationsData,
  LinkedinIcon,
  getTemplateSpacing,
} from './templateUtils';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

function SectionHeader({ title, isMiniPreview }: { title: string; isMiniPreview?: boolean }) {
  const firstLetter = title[0];
  const rest = title.slice(1);
  return (
    <div className={`flex items-center gap-1.5 pb-2 mb-2 font-sans font-bold tracking-[0.2em] text-neutral-800 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
      <div className="relative inline-flex items-center justify-center">
        <span className={`absolute rounded-full bg-neutral-200/80 -z-0 ${isMiniPreview ? 'w-3 h-3' : 'w-5 h-5'}`} />
        <span className="relative z-10">{firstLetter}</span>
      </div>
      <span>{rest}</span>
    </div>
  );
}

export function OliviaWilsonGridTemplate({
  data,
  isMiniPreview = false,
}: {
  data: ResumeData;
  isMiniPreview?: boolean;
}) {
  const spacing = getTemplateSpacing(data, isMiniPreview);
  const { personalInfo, summary, skills, experience, education, projects, certifications, candidateType } = data;
  const isFresher = candidateType === 'fresher';

  const validExp = (experience || []).filter((e) => e.role?.trim() || e.company?.trim());
  const validEdu = (education || []).filter((e) => e.degree?.trim() || e.institution?.trim());
  const validProj = (projects || []).filter((p) => p.title?.trim());
  const validCerts = (certifications || []).filter((c) => c.name?.trim());

  const allSkills = [
    ...(skills?.technical || []),
    ...(skills?.tools || []),
    ...(skills?.soft || []),
  ];

  const nameParts = (personalInfo.fullName || 'OLIVIA WILSON').trim().split(/\s+/);
  const initials = `${nameParts[0]?.[0] || 'O'}${nameParts[1]?.[0] || 'W'}`;

  // Section title badge with circular background on first letter matching reference
  const boxPad = isMiniPreview ? "p-2" : spacing.density === "spacious" ? "p-4 sm:p-5" : spacing.density === "compact" ? "p-2.5 sm:p-3" : "p-3 sm:p-4";


  return (
    <div
      className={`w-full bg-white text-neutral-800 select-text leading-normal flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      {/* 1. TOP HEADER WITH SCRIPT MONOGRAM WATERMARK */}
      <header className={`relative text-center border-t border-b border-neutral-300 py-3.5 sm:py-4 mb-0 overflow-hidden ${isMiniPreview ? 'py-2' : ''}`}>
        {/* Calligraphic Script Monogram Watermark behind the name */}
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none text-neutral-300/40 font-serif italic ${
            isMiniPreview ? 'text-4xl' : 'text-8xl sm:text-9xl'
          }`}
          style={{ fontFamily: '"Playfair Display", "Brush Script MT", cursive' }}
        >
          {initials}
        </div>

        {/* Foreground Content */}
        <div className="relative z-10">
          <h1
            className={`font-semibold tracking-[0.25em] uppercase text-neutral-900 leading-tight ${
              isMiniPreview ? 'text-[12px]' : 'text-2xl sm:text-3xl'
            }`}
          >
            {personalInfo.fullName || 'OLIVIA WILSON'}
          </h1>
          <p
            className={`font-serif italic tracking-[0.2em] uppercase text-neutral-600 mt-1.5 ${
              isMiniPreview ? 'text-[6px]' : 'text-sm'
            }`}
          >
            {personalInfo.headline || 'MARKETING MANAGER'}
          </p>
        </div>
      </header>

      {/* 2. ARCHITECTURAL 2-COLUMN FRAMED BOX GRID */}
      <div className="grid grid-cols-12 border-b border-neutral-300 flex-1">
        {/* LEFT COLUMN: ~36% (CONTACT, EDUCATION, SKILLS, LANGUAGES) */}
        <div className="col-span-4 border-r border-neutral-300">
          {/* BOX 1: CONTACT */}
          {hasContactInfo(personalInfo) && (
            <div className={`border-b border-neutral-300 resume-section ${boxPad}`}>
              <SectionHeader title="CONTACT" isMiniPreview={isMiniPreview} />
              <div className={`space-y-2 text-neutral-600 ${isMiniPreview ? 'space-y-1 text-[5.5px]' : 'text-[12.5px]'}`}>
                {personalInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className={`shrink-0 text-neutral-600 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className={`shrink-0 text-neutral-600 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                    <a href={`mailto:${personalInfo.email}`} className="break-all hover:text-black">
                      {personalInfo.email}
                    </a>
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className={`shrink-0 text-neutral-600 mt-0.5 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                    <span className="break-words">{personalInfo.location}</span>
                  </div>
                )}
                {personalInfo.portfolio && (
                  <div className="flex items-center gap-2">
                    <Globe className={`shrink-0 text-neutral-600 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                    <a
                      href={formatUrl(personalInfo.portfolio)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all hover:text-black"
                    >
                      {cleanDomain(personalInfo.portfolio)}
                    </a>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center gap-2">
                    <LinkedinIcon className={`shrink-0 text-neutral-600 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                    <a
                      href={formatUrl(personalInfo.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all hover:text-black"
                    >
                      {cleanDomain(personalInfo.linkedin)}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BOX 2: EDUCATION */}
          {validEdu.length > 0 && (
            <div className={`border-b border-neutral-300 resume-section ${boxPad}`}>
              <SectionHeader title="EDUCATION" isMiniPreview={isMiniPreview} />
              <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                {validEdu.map((edu) => (
                  <div key={edu.id} className="text-neutral-700 resume-entry">
                    <p className={`font-medium text-neutral-500 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                      {edu.graduationYear}
                    </p>
                    <p className={`font-bold uppercase tracking-wider text-neutral-900 ${isMiniPreview ? 'text-[6px]' : 'text-[14px]'}`}>
                      {edu.institution}
                    </p>
                    <p className={`text-neutral-600 mt-0.5 ${isMiniPreview ? 'text-[5.5px]' : 'text-[13px]'}`}>
                      • {edu.degree}
                    </p>
                    {edu.gpa && (
                      <p className={`text-neutral-500 font-medium ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                        • GPA: {edu.gpa}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOX 3: SKILLS */}
          {allSkills.length > 0 && (
            <div className={`border-b border-neutral-300 resume-section ${boxPad}`}>
              <SectionHeader title="SKILLS" isMiniPreview={isMiniPreview} />
              <ul className={`space-y-1.5 text-neutral-700 ${isMiniPreview ? 'space-y-0.5 text-[5.5px]' : 'text-[12.5px]'}`}>
                {allSkills.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-neutral-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* BOX 4: CERTIFICATES / LANGUAGES */}
          {validCerts.length > 0 && (
            <div className={`resume-section ${boxPad}`}>
              <SectionHeader title="CERTIFICATES" isMiniPreview={isMiniPreview} />
              <ul className={`space-y-2 text-neutral-700 ${isMiniPreview ? 'space-y-1 text-[5.5px]' : 'text-[12.5px]'}`}>
                {validCerts.map((c) => (
                  <li key={c.id} className="resume-entry">
                    <p className="font-semibold text-neutral-800">• {c.name}</p>
                    <p className={`text-neutral-500 pl-2 ${isMiniPreview ? 'text-[5px]' : 'text-[11.5px]'}`}>{c.issuer} {c.date ? `(${c.date})` : ''}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ~64% (PROFILE SUMMARY, WORK EXPERIENCE, PROJECTS) */}
        <div className="col-span-8">
          {/* BOX 1: PROFILE SUMMARY */}
          {summary && (
            <div className={`border-b border-neutral-300 resume-section ${boxPad}`}>
              <SectionHeader title="PROFILE SUMMARY" isMiniPreview={isMiniPreview} />
              <p className={`text-neutral-600 leading-relaxed ${isMiniPreview ? 'text-[5.5px]' : 'text-[13px]'}`}>
                {summary}
              </p>
            </div>
          )}

          {/* BOX 2: WORK EXPERIENCE */}
          {validExp.length > 0 && (
            <div className={`border-b border-neutral-300 resume-section ${boxPad}`}>
              <SectionHeader title="WORK EXPERIENCE" isMiniPreview={isMiniPreview} />
              <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                {validExp.map((exp) => (
                  <div key={exp.id} className="resume-entry">
                    <div className="flex justify-between items-baseline">
                      <h3 className={`font-bold text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                        {exp.company}
                      </h3>
                      <span className={`text-neutral-500 font-medium ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>

                    <p className={`text-neutral-700 italic mt-0.5 mb-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[13px]'}`}>
                      {exp.role} {exp.location ? `| ${exp.location}` : ''}
                    </p>

                    {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                      <ul className={`space-y-1 text-neutral-600 ${isMiniPreview ? 'text-[5px]' : 'text-[13px]'}`}>
                        {exp.bulletPoints.map((bp, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-neutral-400 mt-0.5">•</span>
                            <span>{bp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOX 3: PROJECTS */}
          {validProj.length > 0 && (
            <div className={`resume-section ${boxPad}`}>
              <SectionHeader title="PROJECTS" isMiniPreview={isMiniPreview} />
              <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                {validProj.map((proj) => (
                  <div key={proj.id} className="resume-entry">
                    <h3 className={`font-bold text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {proj.title}
                    </h3>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <p className={`text-neutral-500 mb-1 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                        Tech: {proj.technologies.join(', ')}
                      </p>
                    )}
                    <p className={`text-neutral-600 leading-relaxed ${isMiniPreview ? 'text-[5.5px]' : 'text-[13px]'}`}>
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
