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

export function FullStackDeveloperTemplate({
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
      className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${
        isMiniPreview ? 'text-[7px] leading-tight' : `text-[13px] ${spacing.lineHeight}`
      }`}
    >
      {/* HEADER: Full Stack Engineering */}
      <header className={`pb-3 ${spacing.headerMarginBottom} border-b-2 border-slate-900 shrink-0`}>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
          <div>
            <h1
              className={`font-mono font-bold tracking-tight text-slate-900 break-words ${
                isMiniPreview ? 'text-[13px]' : 'text-3xl'
              }`}
            >
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            {personalInfo.headline && (
              <p
                className={`font-mono text-blue-700 font-medium mt-0.5 break-words ${
                  isMiniPreview ? 'text-[8px]' : 'text-[13.5px]'
                }`}
              >
                &lt;{personalInfo.headline} /&gt;
              </p>
            )}
          </div>

          {/* Dual Repository & Portfolio Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0 font-mono text-xs">
            {personalInfo.github && (
              <a
                href={formatUrl(personalInfo.github)}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-blue-700 bg-slate-100 border border-slate-300 rounded px-2 py-0.5 ${
                  isMiniPreview ? 'text-[6px] px-1 py-0.2' : 'text-[11.5px]'
                }`}
              >
                <GithubIcon className="w-2.5 h-2.5" />
                <span>{cleanDomain(personalInfo.github)}</span>
              </a>
            )}
            {personalInfo.portfolio && (
              <a
                href={formatUrl(personalInfo.portfolio)}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 ${
                  isMiniPreview ? 'text-[6px] px-1 py-0.2' : 'text-[11.5px]'
                }`}
              >
                <GlobeIcon className="w-2.5 h-2.5" />
                <span>{cleanDomain(personalInfo.portfolio)}</span>
              </a>
            )}
          </div>
        </div>

        {hasContactInfo(personalInfo) && (
          <div
            className={`flex flex-wrap items-center gap-x-3.5 gap-y-1 mt-2 text-slate-600 font-mono ${
              isMiniPreview ? 'text-[6px]' : 'text-[12px]'
            }`}
          >
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <MailIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-blue-700`} />
                <a href={`mailto:${personalInfo.email}`} className="text-slate-700 hover:text-blue-700 break-all">
                  {personalInfo.email}
                </a>
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                <PhoneIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-blue-700`} />
                <span>{personalInfo.phone}</span>
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1">
                <MapPinIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-blue-700`} />
                <span>{personalInfo.location}</span>
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1">
                <LinkedinIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-blue-700`} />
                <a
                  href={formatUrl(personalInfo.linkedin)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-700 break-all"
                >
                  {cleanDomain(personalInfo.linkedin)}
                </a>
              </span>
            )}
          </div>
        )}
      </header>

      {/* BODY SECTIONS */}
      <div className={`${isMiniPreview ? 'space-y-2' : spacing.sectionGap} flex-1`}>
        {/* SUMMARY */}
        {summary?.trim() && (
          <section className="resume-section">
            <h2
              className={`font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 ${
                spacing.headingMarginBottom
              } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
            >
              {'// '}Architecture Profile & Summary
            </h2>
            <p className="text-slate-700 leading-relaxed font-sans text-justify break-words [overflow-wrap:anywhere]">
              {summary}
            </p>
          </section>
        )}

        {/* FULL STACK TECH STACK GRID */}
        {hasSkillsData(skills) && (
          <section className="resume-section">
            <h2
              className={`font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 ${
                spacing.headingMarginBottom
              } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
            >
              {'// '}Full Stack Skills Matrix
            </h2>
            <div
              className={`grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded p-2.5 font-mono ${
                isMiniPreview ? 'text-[6px]' : 'text-[12px]'
              }`}
            >
              <div className="space-y-0.5">
                <span className="font-bold text-blue-800 block text-[11px] uppercase tracking-wide">
                  Frontend Stack
                </span>
                <p className="text-slate-700 break-words leading-snug">
                  {skills?.technical && skills.technical.length > 0
                    ? skills.technical.join(', ')
                    : 'TypeScript, React, Next.js, CSS'}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-blue-800 block text-[11px] uppercase tracking-wide">
                  Backend & APIs
                </span>
                <p className="text-slate-700 break-words leading-snug">
                  {skills?.tools && skills.tools.length > 0
                    ? skills.tools.join(', ')
                    : 'Node.js, Go, PostgreSQL, REST, GraphQL'}
                </p>
              </div>
              <div className="space-y-0.5 sm:col-span-1">
                <span className="font-bold text-blue-800 block text-[11px] uppercase tracking-wide">
                  Cloud & Practices
                </span>
                <p className="text-slate-700 break-words leading-snug">
                  {skills?.soft && skills.soft.length > 0
                    ? skills.soft.join(', ')
                    : 'Docker, AWS, CI/CD, Microservices'}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* FRESHER: PROJECTS FIRST */}
        {isFresher && validProj.length > 0 && (
          <section className="resume-section">
            <h2
              className={`font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 ${
                spacing.headingMarginBottom
              } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
            >
              {'// '}Production & Open-Source Projects
            </h2>
            <div className={isMiniPreview ? 'space-y-1.5' : spacing.entryGap}>
              {validProj.map((proj) => (
                <div key={proj.id} className="resume-entry">
                  <div className="flex justify-between items-baseline flex-wrap gap-1">
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {proj.title}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span
                          className={`font-mono text-blue-700 font-semibold ml-1.5 ${
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
                        className={`font-mono text-blue-700 hover:underline flex items-center gap-1 ${
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

        {/* WORK EXPERIENCE */}
        {validExp.length > 0 && (
          <section className="resume-section">
            <h2
              className={`font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 ${
                spacing.headingMarginBottom
              } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
            >
              {'// '}Engineering Experience
            </h2>
            <div className={isMiniPreview ? 'space-y-1.5' : spacing.entryGap}>
              {validExp.map((exp) => (
                <div key={exp.id} className="resume-entry">
                  <div className="flex justify-between items-baseline flex-wrap gap-1">
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {exp.role} <span className="font-normal text-slate-600">@ {exp.company}</span>
                    </span>
                    <span className={`font-mono text-slate-500 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.location && (
                    <p className={`font-mono text-slate-500 italic ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
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
              className={`font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 ${
                spacing.headingMarginBottom
              } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
            >
              {'// '}Production & Open-Source Projects
            </h2>
            <div className={isMiniPreview ? 'space-y-1.5' : spacing.entryGap}>
              {validProj.map((proj) => (
                <div key={proj.id} className="resume-entry">
                  <div className="flex justify-between items-baseline flex-wrap gap-1">
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {proj.title}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span
                          className={`font-mono text-blue-700 font-semibold ml-1.5 ${
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
                        className={`font-mono text-blue-700 hover:underline flex items-center gap-1 ${
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

        {/* EDUCATION */}
        {validEdu.length > 0 && (
          <section className="resume-section">
            <h2
              className={`font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 ${
                spacing.headingMarginBottom
              } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
            >
              {'// '}Education
            </h2>
            <div className={isMiniPreview ? 'space-y-1.5' : spacing.entryGap}>
              {validEdu.map((edu) => (
                <div key={edu.id} className="resume-entry flex justify-between items-baseline flex-wrap gap-1">
                  <div>
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {edu.degree}
                    </span>
                    <span className={`text-slate-600 ${isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'}`}>
                      {' '}— {edu.institution}
                    </span>
                    {edu.gpa && (
                      <span
                        className={`font-mono text-blue-700 ml-1.5 font-semibold ${
                          isMiniPreview ? 'text-[6px]' : 'text-[12px]'
                        }`}
                      >
                        [GPA: {edu.gpa}]
                      </span>
                    )}
                  </div>
                  <span className={`font-mono text-slate-500 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                    {edu.graduationYear}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS */}
        {validCerts.length > 0 && (
          <section className="resume-section">
            <h2
              className={`font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 ${
                spacing.headingMarginBottom
              } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
            >
              {'// '}Cloud & Professional Certifications
            </h2>
            <div
              className={`${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} font-mono ${
                isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'
              }`}
            >
              {validCerts.map((cert) => (
                <div key={cert.id} className="resume-entry flex justify-between items-baseline flex-wrap gap-1">
                  <span>
                    <strong className="text-slate-900 font-semibold">{cert.name}</strong> · {cert.issuer}
                  </span>
                  <span className={`text-slate-500 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
