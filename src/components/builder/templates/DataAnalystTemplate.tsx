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
} from './templateUtils';

export function DataAnalystTemplate({
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
      {/* HEADER: Analytical & Clean */}
      <header className={`pb-3 ${spacing.headerMarginBottom} border-b-2 border-blue-700 shrink-0`}>
        <div className="flex justify-between items-baseline flex-wrap gap-2">
          <div>
            <h1
              className={`font-black tracking-tight text-slate-900 break-words ${
                isMiniPreview ? 'text-[13px]' : 'text-3xl'
              }`}
            >
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            {personalInfo.headline && (
              <p
                className={`font-semibold text-blue-700 mt-0.5 break-words ${
                  isMiniPreview ? 'text-[8px]' : 'text-sm'
                }`}
              >
                {personalInfo.headline}
              </p>
            )}
          </div>
        </div>

        {hasContactInfo(personalInfo) && (
          <div
            className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2 text-slate-600 ${
              isMiniPreview ? 'text-[6px]' : 'text-[12.5px]'
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
            {personalInfo.phone && <span>|</span>}
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                <PhoneIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-blue-700`} />
                <span>{personalInfo.phone}</span>
              </span>
            )}
            {personalInfo.location && <span>|</span>}
            {personalInfo.location && (
              <span className="flex items-center gap-1">
                <MapPinIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-blue-700`} />
                <span>{personalInfo.location}</span>
              </span>
            )}
            {personalInfo.linkedin && (
              <>
                <span>|</span>
                <span className="flex items-center gap-1">
                  <LinkedinIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-blue-700`} />
                  <a
                    href={formatUrl(personalInfo.linkedin)}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline break-all"
                  >
                    {cleanDomain(personalInfo.linkedin)}
                  </a>
                </span>
              </>
            )}
            {personalInfo.github && (
              <>
                <span>|</span>
                <span className="flex items-center gap-1">
                  <GithubIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-blue-700`} />
                  <a
                    href={formatUrl(personalInfo.github)}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline break-all"
                  >
                    {cleanDomain(personalInfo.github)}
                  </a>
                </span>
              </>
            )}
            {personalInfo.portfolio && (
              <>
                <span>|</span>
                <span className="flex items-center gap-1">
                  <GlobeIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-blue-700`} />
                  <a
                    href={formatUrl(personalInfo.portfolio)}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline break-all"
                  >
                    {cleanDomain(personalInfo.portfolio)}
                  </a>
                </span>
              </>
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
              className={`font-bold uppercase tracking-wider text-slate-900 border-b border-blue-200 pb-1 ${
                spacing.headingMarginBottom
              } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
            >
              {isFresher ? 'ANALYTICAL OBJECTIVE' : 'EXECUTIVE SUMMARY & QUANTITATIVE IMPACT'}
            </h2>
            <p className="text-slate-700 leading-relaxed text-justify break-words [overflow-wrap:anywhere]">
              {summary}
            </p>
          </section>
        )}

        {/* ANALYTICAL & DATA TOOLING MATRIX */}
        {hasSkillsData(skills) && (
          <section className="resume-section">
            <h2
              className={`font-bold uppercase tracking-wider text-slate-900 border-b border-blue-200 pb-1 ${
                spacing.headingMarginBottom
              } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
            >
              ANALYTICAL STACK & DATA GOVERNANCE
            </h2>
            <div
              className={`bg-slate-50 p-2.5 rounded border border-slate-200 ${spacing.bulletGap} text-slate-800 ${
                spacing.lineHeight
              } ${isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'}`}
            >
              {skills?.technical && skills.technical.length > 0 && (
                <p className="break-words">
                  <strong className="text-slate-900 font-bold">Querying & Analysis: </strong>
                  <span>{skills.technical.join(' · ')}</span>
                </p>
              )}
              {skills?.tools && skills.tools.length > 0 && (
                <p className="break-words">
                  <strong className="text-slate-900 font-bold">BI & Visualization: </strong>
                  <span>{skills.tools.join(' · ')}</span>
                </p>
              )}
              {skills?.soft && skills.soft.length > 0 && (
                <p className="break-words">
                  <strong className="text-slate-900 font-bold">Business & Statistical Acumen: </strong>
                  <span>{skills.soft.join(' · ')}</span>
                </p>
              )}
            </div>
          </section>
        )}

        {/* FRESHER: PROJECTS FIRST */}
        {isFresher && validProj.length > 0 && (
          <section className="resume-section">
            <h2
              className={`font-bold uppercase tracking-wider text-slate-900 border-b border-blue-200 pb-1 ${
                spacing.headingMarginBottom
              } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
            >
              ANALYTICAL CASE STUDIES & DATA PIPELINES
            </h2>
            <div className={isMiniPreview ? 'space-y-1.5' : spacing.entryGap}>
              {validProj.map((proj) => (
                <div key={proj.id} className="resume-entry">
                  <div className="flex justify-between items-baseline font-bold flex-wrap gap-1">
                    <span className={`text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {proj.title}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span
                          className={`font-normal text-blue-700 ml-1.5 ${
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
                        className={`text-blue-700 hover:underline ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}
                      >
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
                      className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed`}
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

        {/* EXPERIENCE WITH QUANTIFIED IMPACT */}
        {validExp.length > 0 && (
          <section className="resume-section">
            <h2
              className={`font-bold uppercase tracking-wider text-slate-900 border-b border-blue-200 pb-1 ${
                spacing.headingMarginBottom
              } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
            >
              {isFresher ? 'INTERNSHIPS & ANALYTICAL EXPERIENCE' : 'PROFESSIONAL EXPERIENCE & BUSINESS IMPACT'}
            </h2>
            <div className={isMiniPreview ? 'space-y-1.5' : spacing.entryGap}>
              {validExp.map((exp) => (
                <div key={exp.id} className="resume-entry">
                  <div className="flex justify-between items-baseline font-bold text-slate-900 flex-wrap gap-1">
                    <span className={isMiniPreview ? 'text-[7px]' : 'text-[14px]'}>
                      {exp.role} <span className="text-blue-700 font-semibold">@ {exp.company}</span>
                    </span>
                    <span className={`font-medium text-slate-500 font-mono ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
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
                      className={`list-disc list-outside ml-4 mt-1 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed`}
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
              className={`font-bold uppercase tracking-wider text-slate-900 border-b border-blue-200 pb-1 ${
                spacing.headingMarginBottom
              } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
            >
              ANALYTICAL CASE STUDIES & DATA PIPELINES
            </h2>
            <div className={isMiniPreview ? 'space-y-1.5' : spacing.entryGap}>
              {validProj.map((proj) => (
                <div key={proj.id} className="resume-entry">
                  <div className="flex justify-between items-baseline font-bold flex-wrap gap-1">
                    <span className={`text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {proj.title}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span
                          className={`font-normal text-blue-700 ml-1.5 ${
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
                        className={`text-blue-700 hover:underline ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}
                      >
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
                      className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed`}
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
              className={`font-bold uppercase tracking-wider text-slate-900 border-b border-blue-200 pb-1 ${
                spacing.headingMarginBottom
              } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
            >
              EDUCATION & QUANTITATIVE BACKGROUND
            </h2>
            <div className={isMiniPreview ? 'space-y-1.5' : spacing.entryGap}>
              {validEdu.map((edu) => (
                <div key={edu.id} className="resume-entry flex justify-between items-baseline flex-wrap gap-1">
                  <div>
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {edu.degree}
                    </span>
                    <span className={`text-slate-700 ${isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'}`}>
                      {' '}— {edu.institution}
                    </span>
                    {edu.gpa && (
                      <span
                        className={`text-blue-700 font-semibold ml-1.5 ${
                          isMiniPreview ? 'text-[6px]' : 'text-[12px]'
                        }`}
                      >
                        (GPA: {edu.gpa})
                      </span>
                    )}
                  </div>
                  <span className={`font-medium text-slate-500 font-mono ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
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
              className={`font-bold uppercase tracking-wider text-slate-900 border-b border-blue-200 pb-1 ${
                spacing.headingMarginBottom
              } ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}
            >
              CREDENTIALS & SPECIALIZATIONS
            </h2>
            <div className={`${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}`}>
              {validCerts.map((cert) => (
                <div key={cert.id} className="resume-entry flex justify-between items-baseline flex-wrap gap-1">
                  <span>
                    <strong className="text-slate-900 font-semibold">{cert.name}</strong> · {cert.issuer}
                  </span>
                  <span className={`text-blue-700 font-semibold font-mono ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                    {cert.date}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
