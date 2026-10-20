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
  getTemplateSpacing,
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeIcon,
  ExternalLinkIcon,
} from './templateUtils';

export function ModernTwoColumnTemplate({
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

  return (
    <div
      className={`w-full bg-white text-slate-800 font-sans select-text flex flex-1 min-h-full ${
        isMiniPreview ? 'text-[6.5px] leading-tight' : `text-[13px] ${spacing.lineHeight}`
      }`}
    >
      {/* LEFT COLUMN: Sidebar (34% width) with Contact, Skills, Education, Certifications */}
      <div
        className={`w-[34%] bg-slate-50 border-r border-slate-200 flex flex-col justify-between shrink-0 ${
          isMiniPreview ? 'p-3 space-y-2' : `${spacing.containerPadding} space-y-4`
        }`}
      >
        <div className={`${isMiniPreview ? 'space-y-2.5' : spacing.sectionGap} flex-1`}>
          {/* INITIALS MONOGRAM BADGE */}
          <div className="flex items-center gap-2.5">
            <div
              className={`rounded-lg bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 shadow-sm ${
                isMiniPreview ? 'w-6 h-6 text-[9px]' : 'w-11 h-11 text-base'
              }`}
            >
              {(personalInfo.fullName || 'SR')
                .split(' ')
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="min-w-0">
              <span className={`font-bold text-slate-900 block leading-tight truncate ${isMiniPreview ? 'text-[8px]' : 'text-[14px]'}`}>
                {personalInfo.fullName || 'YOUR NAME'}
              </span>
              {personalInfo.headline && (
                <span className={`text-blue-700 font-medium block truncate ${isMiniPreview ? 'text-[6px]' : 'text-[11.5px]'}`}>
                  {personalInfo.headline}
                </span>
              )}
            </div>
          </div>

          {/* CONTACT INFO */}
          {hasContactInfo(personalInfo) && (
            <div className={`space-y-1 text-slate-600 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
              <h3
                className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5 ${
                  isMiniPreview ? 'text-[7px]' : 'text-[12.5px]'
                }`}
              >
                Contact
              </h3>
              {personalInfo.email && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <MailIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} text-blue-700 shrink-0`} />
                  <a href={`mailto:${personalInfo.email}`} className="truncate hover:text-blue-700 break-all">
                    {personalInfo.email}
                  </a>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-1.5">
                  <PhoneIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} text-blue-700 shrink-0`} />
                  <span className="truncate">{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-1.5">
                  <MapPinIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} text-blue-700 shrink-0`} />
                  <span className="truncate">{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <LinkedinIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} text-blue-700 shrink-0`} />
                  <a
                    href={formatUrl(personalInfo.linkedin)}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:text-blue-700 break-all"
                  >
                    {cleanDomain(personalInfo.linkedin)}
                  </a>
                </div>
              )}
              {personalInfo.github && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <GithubIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} text-blue-700 shrink-0`} />
                  <a
                    href={formatUrl(personalInfo.github)}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:text-blue-700 break-all"
                  >
                    {cleanDomain(personalInfo.github)}
                  </a>
                </div>
              )}
              {personalInfo.portfolio && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <GlobeIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} text-blue-700 shrink-0`} />
                  <a
                    href={formatUrl(personalInfo.portfolio)}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:text-blue-700 break-all"
                  >
                    {cleanDomain(personalInfo.portfolio)}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* SKILLS */}
          {hasSkillsData(skills) && (
            <div className={`space-y-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
              <h3
                className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1 ${
                  isMiniPreview ? 'text-[7px]' : 'text-[12.5px]'
                }`}
              >
                Skills & Stack
              </h3>
              {skills?.technical && skills.technical.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-800 block text-[11px] mb-0.5">Core Competencies:</span>
                  <div className="flex flex-wrap gap-1">
                    {skills.technical.map((s, i) => (
                      <span
                        key={i}
                        className="bg-white border border-slate-200 text-slate-800 rounded px-1.5 py-0.2 text-[10.5px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {skills?.tools && skills.tools.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-800 block text-[11px] mb-0.5">Tools & Platforms:</span>
                  <div className="flex flex-wrap gap-1">
                    {skills.tools.map((t, i) => (
                      <span
                        key={i}
                        className="bg-white border border-slate-200 text-slate-700 rounded px-1.5 py-0.2 text-[10.5px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EDUCATION (In Sidebar) */}
          {validEdu.length > 0 && (
            <div className={`space-y-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
              <h3
                className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1 ${
                  isMiniPreview ? 'text-[7px]' : 'text-[12.5px]'
                }`}
              >
                Education
              </h3>
              {validEdu.map((edu) => (
                <div key={edu.id} className="resume-entry">
                  <span className={`font-bold text-slate-900 block ${isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'}`}>
                    {edu.degree}
                  </span>
                  <span className="text-slate-600 block text-[11.5px]">{edu.institution}</span>
                  <span className="text-slate-500 font-mono block text-[10.5px]">{edu.graduationYear}</span>
                  {edu.gpa && (
                    <span className="text-blue-800 font-semibold block text-[10.5px]">GPA: {edu.gpa}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CERTIFICATIONS (In Sidebar) */}
          {validCerts.length > 0 && (
            <div className={`space-y-1 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
              <h3
                className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1 ${
                  isMiniPreview ? 'text-[7px]' : 'text-[12.5px]'
                }`}
              >
                Credentials
              </h3>
              {validCerts.map((c) => (
                <div key={c.id} className="resume-entry text-[11px]">
                  <strong className="text-slate-900 block font-semibold">{c.name}</strong>
                  <span className="text-slate-500 block">{c.issuer} · {c.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Career Story & Projects (66% width) */}
      <div
        className={`w-[66%] flex flex-col justify-between ${
          isMiniPreview ? 'p-3 space-y-2' : `${spacing.containerPadding} space-y-4`
        }`}
      >
        <div className={`${isMiniPreview ? 'space-y-2.5' : spacing.sectionGap} flex-1`}>
          {/* RIGHT HEADER */}
          <div className="border-b-2 border-slate-900 pb-2.5">
            <h1
              className={`font-black tracking-tight text-slate-950 break-words ${
                isMiniPreview ? 'text-[14px]' : 'text-3xl'
              }`}
            >
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            {personalInfo.headline && (
              <p
                className={`font-semibold text-blue-700 tracking-wide mt-0.5 break-words ${
                  isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'
                }`}
              >
                {personalInfo.headline}
              </p>
            )}
          </div>

          {/* PROFESSIONAL SUMMARY */}
          {summary?.trim() && (
            <section className="resume-section">
              <h2
                className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 ${
                  spacing.headingMarginBottom
                } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
              >
                {isFresher ? 'Profile & Career Focus' : 'Executive Career Narrative'}
              </h2>
              <p className="text-slate-700 leading-relaxed text-justify break-words [overflow-wrap:anywhere]">
                {summary}
              </p>
            </section>
          )}

          {/* FRESHER: PROJECTS FIRST */}
          {isFresher && validProj.length > 0 && (
            <section className="resume-section">
              <h2
                className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 ${
                  spacing.headingMarginBottom
                } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
              >
                Featured Projects & Systems
              </h2>
              <div className={isMiniPreview ? 'space-y-1.5' : spacing.entryGap}>
                {validProj.map((proj) => (
                  <div key={proj.id} className="resume-entry">
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                        {proj.title}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <span
                            className={`font-normal text-blue-700 italic ml-1.5 ${
                              isMiniPreview ? 'text-[6px]' : 'text-[12px]'
                            }`}
                          >
                            [{proj.technologies.join(', ')}]
                          </span>
                        )}
                      </span>
                      {proj.link && (
                        <a
                          href={formatUrl(proj.link)}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-blue-700 hover:underline flex items-center gap-1 ${
                            isMiniPreview ? 'text-[6px]' : 'text-[12px]'
                          }`}
                        >
                          <ExternalLinkIcon className="w-2.5 h-2.5" />
                          {cleanDomain(proj.link)}
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-slate-700 mt-0.5 leading-relaxed break-words [overflow-wrap:anywhere]">
                        {proj.description}
                      </p>
                    )}
                    {proj.bullets && proj.bullets.length > 0 && (
                      <ul
                        className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}`}
                      >
                        {proj.bullets.map((b, i) => (
                          <li key={i} className="break-words [overflow-wrap:anywhere]">{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* EXPERIENCE */}
          {validExp.length > 0 && (
            <section className="resume-section">
              <h2
                className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 ${
                  spacing.headingMarginBottom
                } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
              >
                {isFresher ? 'Practical & Internship Experience' : 'Professional Work History'}
              </h2>
              <div className={isMiniPreview ? 'space-y-1.5' : spacing.entryGap}>
                {validExp.map((exp) => (
                  <div key={exp.id} className="resume-entry">
                    <div className="flex justify-between items-baseline flex-wrap gap-1 font-bold">
                      <span className={`text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                        {exp.role} <span className="font-normal text-slate-600">@ {exp.company}</span>
                      </span>
                      <span className={`font-semibold text-slate-500 font-mono ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    {exp.location && (
                      <p className={`text-slate-500 italic ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                        {exp.location}
                      </p>
                    )}
                    {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                      <ul
                        className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}`}
                      >
                        {exp.bulletPoints.map((bp, i) => (
                          <li key={i} className="break-words [overflow-wrap:anywhere]">{bp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* EXPERIENCED: PROJECTS HERE */}
          {!isFresher && validProj.length > 0 && (
            <section className="resume-section">
              <h2
                className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 ${
                  spacing.headingMarginBottom
                } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
              >
                Featured Projects & Systems
              </h2>
              <div className={isMiniPreview ? 'space-y-1.5' : spacing.entryGap}>
                {validProj.map((proj) => (
                  <div key={proj.id} className="resume-entry">
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                        {proj.title}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <span
                            className={`font-normal text-blue-700 italic ml-1.5 ${
                              isMiniPreview ? 'text-[6px]' : 'text-[12px]'
                            }`}
                          >
                            [{proj.technologies.join(', ')}]
                          </span>
                        )}
                      </span>
                      {proj.link && (
                        <a
                          href={formatUrl(proj.link)}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-blue-700 hover:underline flex items-center gap-1 ${
                            isMiniPreview ? 'text-[6px]' : 'text-[12px]'
                          }`}
                        >
                          <ExternalLinkIcon className="w-2.5 h-2.5" />
                          {cleanDomain(proj.link)}
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-slate-700 mt-0.5 leading-relaxed break-words [overflow-wrap:anywhere]">
                        {proj.description}
                      </p>
                    )}
                    {proj.bullets && proj.bullets.length > 0 && (
                      <ul
                        className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}`}
                      >
                        {proj.bullets.map((b, i) => (
                          <li key={i} className="break-words [overflow-wrap:anywhere]">{b}</li>
                        ))}
                      </ul>
                    )}
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

export { ModernTwoColumnTemplate as ContemporaryTemplate };
