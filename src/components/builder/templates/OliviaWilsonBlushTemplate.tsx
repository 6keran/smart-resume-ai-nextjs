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

export function OliviaWilsonBlushTemplate({
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

  const nameParts = (personalInfo.fullName || 'Olivia Wilson').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Olivia';
  const lastName = nameParts.slice(1).join(' ') || 'WILSON';
  const initials = `${firstName[0] || 'O'}${lastName[0] || 'W'}`;

  return (
    <div
      className={`w-full bg-white text-neutral-800 select-text leading-normal flex flex-1 min-h-full ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      {/* 1. LEFT COLUMN: SOFT BLUSH PINK SIDEBAR (~40%) */}
      <div
        className={`w-[40%] bg-[#f2dcde] text-neutral-800 flex flex-col ${
          isMiniPreview ? 'p-3' : 'p-4 sm:p-5'
        }`}
      >
        {/* FRAMED RECTANGULAR PORTRAIT PHOTO */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <div
            className={`bg-white p-2 shadow-sm border border-neutral-200 ${
              isMiniPreview ? 'w-14 h-16 p-1' : 'w-28 h-32 sm:w-32 sm:h-36'
            }`}
          >
            <div className="w-full h-full bg-neutral-100 border border-neutral-300 flex flex-col items-center justify-center text-neutral-500 font-serif overflow-hidden">
              <span className={`font-serif italic ${isMiniPreview ? 'text-xs' : 'text-2xl'}`}>
                {initials}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION: ABOUT ME */}
        {summary && (
          <section className="resume-section">
            <div className="bg-white px-3 py-0.5 text-center font-bold uppercase tracking-[0.2em] text-neutral-900 shadow-xs mb-1.5">
              <span className={isMiniPreview ? 'text-[6px]' : 'text-[13.5px]'}>ABOUT ME</span>
            </div>
            <p className={`text-neutral-700 leading-relaxed text-center ${isMiniPreview ? 'text-[5.5px]' : 'text-[12.5px]'}`}>
              {summary}
            </p>
          </section>
        )}

        {/* SECTION: CONTACT */}
        {hasContactInfo(personalInfo) && (
          <section className="resume-section">
            <div className="bg-white px-3 py-0.5 text-center font-bold uppercase tracking-[0.2em] text-neutral-900 shadow-xs mb-1.5">
              <span className={isMiniPreview ? 'text-[6px]' : 'text-[13.5px]'}>CONTACT</span>
            </div>
            <div className={`space-y-2 text-neutral-700 ${isMiniPreview ? 'space-y-1 text-[5.5px]' : 'text-[12.5px]'}`}>
              {personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className={`shrink-0 text-[#9c6668] ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className={`shrink-0 text-[#9c6668] ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                  <a href={`mailto:${personalInfo.email}`} className="break-all hover:text-black">
                    {personalInfo.email}
                  </a>
                </div>
              )}
              {personalInfo.portfolio && (
                <div className="flex items-center gap-2">
                  <Globe className={`shrink-0 text-[#9c6668] ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
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
              {personalInfo.location && (
                <div className="flex items-start gap-2">
                  <MapPin className={`shrink-0 text-[#9c6668] mt-0.5 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                  <span className="break-words">{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center gap-2">
                  <LinkedinIcon className={`shrink-0 text-[#9c6668] ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
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
          </section>
        )}

        {/* SECTION: SKILLS */}
        {allSkills.length > 0 && (
          <section className="resume-section">
            <div className="bg-white px-3 py-0.5 text-center font-bold uppercase tracking-[0.2em] text-neutral-900 shadow-xs mb-1.5">
              <span className={isMiniPreview ? 'text-[6px]' : 'text-[13.5px]'}>SKILLS</span>
            </div>
            <div className="flex flex-wrap gap-1 justify-center">
              {allSkills.map((s, idx) => (
                <span
                  key={idx}
                  className={`bg-white/80 text-neutral-800 font-medium rounded shadow-2xs ${
                    isMiniPreview ? 'text-[5px] px-1 py-0.2' : 'text-[11.5px] px-2 py-0.5'
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: CERTIFICATIONS */}
        {validCerts.length > 0 && (
          <section className="resume-section">
            <div className="bg-white px-3 py-0.5 text-center font-bold uppercase tracking-[0.2em] text-neutral-900 shadow-xs mb-1.5">
              <span className={isMiniPreview ? 'text-[6px]' : 'text-[13.5px]'}>CERTIFICATES</span>
            </div>
            <ul className={`space-y-2 text-neutral-700 ${isMiniPreview ? 'space-y-1 text-[5.5px]' : 'text-[12.5px]'}`}>
              {validCerts.map((c) => (
                <li key={c.id} className="resume-entry">
                  <p className="font-semibold text-neutral-900">• {c.name}</p>
                  <p className={`text-neutral-500 pl-2 ${isMiniPreview ? 'text-[5px]' : 'text-[11.5px]'}`}>{c.issuer} {c.date ? `(${c.date})` : ''}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* 2. RIGHT COLUMN: CRISP WHITE BACKGROUND WITH BLUSH BARS (~60%) */}
      <div
        className={`w-[60%] bg-white text-neutral-800 flex flex-col ${
          isMiniPreview ? 'p-3 pl-4' : 'p-3.5 sm:p-4 pl-5 sm:pl-6'
        }`}
      >
        {/* HEADER: Calligraphy Script First Name + Sans Last Name */}
        <header className={`mb-2 sm:mb-2.5 ${isMiniPreview ? 'mb-1.5' : ''}`}>
          <h1
            className={`leading-none mb-1 ${
              isMiniPreview ? 'text-lg' : 'text-xl sm:text-2xl'
            }`}
          >
            <span
              className="block font-serif italic text-neutral-900"
              style={{ fontFamily: '"Playfair Display", "Brush Script MT", "Brush Script Std", cursive' }}
            >
              {firstName}
            </span>
            <span
              className={`block font-bold tracking-[0.3em] uppercase text-neutral-900 mt-1 ${
                isMiniPreview ? 'text-[11px]' : 'text-xl sm:text-2xl'
              }`}
            >
              {lastName}
            </span>
          </h1>

          <div className="border-b border-neutral-300 my-1" />

          <p
            className={`font-sans tracking-[0.25em] uppercase text-neutral-600 font-medium ${
              isMiniPreview ? 'text-[5.5px]' : 'text-sm'
            }`}
          >
            {personalInfo.headline || 'DESIGNER AND ARCHITECT'}
          </p>
        </header>

        <div className={`flex-1 ${isMiniPreview ? "space-y-2" : spacing.sectionGap} right-col-sections`}>
        {/* WORK EXPERIENCE */}
        {validExp.length > 0 && (
          <section className="resume-section">
            <div className="bg-[#eed6d8] px-3 py-0.5 font-bold uppercase tracking-[0.2em] text-neutral-900 mb-1">
              <span className={isMiniPreview ? 'text-[6px]' : 'text-[13.5px]'}>WORK EXPERIENCE</span>
            </div>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validExp.map((exp) => (
                <div key={exp.id} className="resume-entry">
                  <h3 className={`font-bold uppercase tracking-wider text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[13px] sm:text-[13.5px]'}`}>
                    {exp.role}
                  </h3>
                  <p className={`text-neutral-700 font-medium ${isMiniPreview ? 'text-[6px]' : 'text-[13px]'}`}>
                    {exp.company}
                  </p>
                  <p className={`text-neutral-500 mb-1.5 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    {exp.location ? ` | ${exp.location}` : ''}
                  </p>
                  {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                    <ul className={`space-y-0.5 text-neutral-600 ${isMiniPreview ? 'text-[5px]' : 'text-[13px]'}`}>
                      {exp.bulletPoints.map((bp, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">
                          {bp}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION */}
        {validEdu.length > 0 && (
          <section className="resume-section">
            <div className="bg-[#eed6d8] px-3 py-0.5 font-bold uppercase tracking-[0.2em] text-neutral-900 mb-1.5">
              <span className={isMiniPreview ? 'text-[6px]' : 'text-[13.5px]'}>EDUCATION</span>
            </div>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validEdu.map((edu) => (
                <div key={edu.id} className="resume-entry">
                  <h3 className={`font-bold uppercase tracking-wider text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                    {edu.degree}
                  </h3>
                  <p className={`text-neutral-700 ${isMiniPreview ? 'text-[6px]' : 'text-[13px]'}`}>
                    {edu.institution}
                  </p>
                  <p className={`text-neutral-500 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                    {edu.graduationYear}
                    {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS */}
        {validProj.length > 0 && (
          <section className="resume-section">
            <div className="bg-[#eed6d8] px-3 py-0.5 font-bold uppercase tracking-[0.2em] text-neutral-900 mb-1.5">
              <span className={isMiniPreview ? 'text-[6px]' : 'text-[13.5px]'}>PROJECTS</span>
            </div>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validProj.map((proj) => (
                <div key={proj.id} className="resume-entry">
                  <h3 className={`font-bold uppercase tracking-wider text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                    {proj.title}
                  </h3>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className={`text-neutral-500 text-[12px] ${isMiniPreview ? 'text-[5px]' : ''}`}>
                      {proj.technologies.join(', ')}
                    </p>
                  )}
                  <p className={`text-neutral-600 mt-0.5 leading-relaxed ${isMiniPreview ? 'text-[5px]' : 'text-[13px]'}`}>
                    {proj.description}
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
}
