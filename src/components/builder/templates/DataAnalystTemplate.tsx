'use client';

import React from 'react';
import { ResumeData } from '@/types/resume';
import { BarChart3, Database } from 'lucide-react';
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
      className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}
    >
      {/* HEADER */}
      <header className={`pb-3.5 ${spacing.headerMarginBottom} border-b-2 border-blue-600 shrink-0`}>
        <div className="flex justify-between items-baseline flex-wrap gap-2">
          <div>
            <h1
              className={`font-black tracking-tight text-slate-900 ${
                isMiniPreview ? 'text-[13px]' : 'text-3xl'
              }`}
            >
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            {personalInfo.headline && (
              <p className={`font-semibold text-blue-700 mt-0.5 ${isMiniPreview ? 'text-[8px]' : 'text-sm'}`}>
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
              <a href={`mailto:${personalInfo.email}`} className="text-blue-800 hover:underline">
                {personalInfo.email}
              </a>
            )}
            {personalInfo.phone && <span>|</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>|</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.linkedin && (
              <>
                <span>|</span>
                <a
                  href={formatUrl(personalInfo.linkedin)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  {cleanDomain(personalInfo.linkedin)}
                </a>
              </>
            )}
            {personalInfo.github && (
              <>
                <span>|</span>
                <a
                  href={formatUrl(personalInfo.github)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  {cleanDomain(personalInfo.github)}
                </a>
              </>
            )}
            {personalInfo.portfolio && (
              <>
                <span>|</span>
                <a
                  href={formatUrl(personalInfo.portfolio)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-800 hover:underline"
                >
                  {cleanDomain(personalInfo.portfolio)}
                </a>
              </>
            )}
          </div>
        )}
      </header>

      {/* BODY SECTIONS */}
      <div className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}>
        {/* SUMMARY */}
        {summary?.trim() && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 ${spacing.headingMarginBottom} flex items-center gap-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              <BarChart3 className={`${isMiniPreview ? 'w-2.5 h-2.5' : 'w-4 h-4'} text-blue-700`} />
              {isFresher ? 'ANALYTICAL OBJECTIVE' : 'EXECUTIVE SUMMARY & ANALYTICAL IMPACT'}
            </h2>
            <p className="text-slate-700 leading-relaxed text-justify">{summary}</p>
          </section>
        )}

        {/* ANALYTICAL & DATA TOOLING MATRIX */}
        {hasSkillsData(skills) && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 ${spacing.headingMarginBottom} flex items-center gap-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              <Database className={`${isMiniPreview ? 'w-2.5 h-2.5' : 'w-4 h-4'} text-blue-700`} />
              ANALYTICAL TOOLING & QUANTITATIVE EXPERTISE
            </h2>
            <div className={`bg-blue-50/50 p-3 rounded border border-blue-100 ${spacing.bulletGap} text-slate-800 ${spacing.lineHeight} ${isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'}`}>
              {skills.technical && skills.technical.length > 0 && (
                <p>
                  <strong className="text-blue-950 font-bold">Querying & Modeling: </strong>
                  <span>{skills.technical.join(' · ')}</span>
                </p>
              )}
              {skills.tools && skills.tools.length > 0 && (
                <p>
                  <strong className="text-blue-950 font-bold">BI Platforms & ETL: </strong>
                  <span>{skills.tools.join(' · ')}</span>
                </p>
              )}
              {skills.soft && skills.soft.length > 0 && (
                <p>
                  <strong className="text-blue-950 font-bold">Statistical Methods: </strong>
                  <span>{skills.soft.join(' · ')}</span>
                </p>
              )}
            </div>
          </section>
        )}

        {/* EXPERIENCE WITH QUANTIFIED IMPACT */}
        {validExp.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              PROFESSIONAL EXPERIENCE & BUSINESS IMPACT
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validExp.map((exp) => (
                <div key={exp.id} className="resume-entry">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className={isMiniPreview ? 'text-[7px]' : 'text-[14px]'}>
                      {exp.role} <span className="text-blue-800 font-semibold">@ {exp.company}</span>
                    </span>
                    <span className={`font-medium text-slate-600 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.location && (
                    <p className={`text-slate-500 italic ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{exp.location}</p>
                  )}
                  {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-1 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed">
                      {exp.bulletPoints.map((bp, i) => (
                        <li key={i}>{bp}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DATA PROJECTS & DASHBOARDS */}
        {validProj.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              ANALYTICAL CASE STUDIES & DATA PIPELINES
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validProj.map((proj) => (
                <div key={proj.id} className="resume-entry">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className={`text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {proj.title}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span className={`font-normal text-blue-700 ml-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
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
                    <p className="text-slate-700 mt-0.5 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed">
                      {proj.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
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
            <h2 className={`font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              EDUCATION & QUANTITATIVE BACKGROUND
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validEdu.map((edu) => (
                <div key={edu.id} className="resume-entry flex justify-between items-baseline">
                  <div>
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>{edu.degree}</span>
                    <span className={`text-slate-700 ${isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'}`}> — {edu.institution}</span>
                    {edu.gpa && (
                      <span className={`text-blue-800 font-semibold ml-1 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                        (GPA: {edu.gpa})
                      </span>
                    )}
                  </div>
                  <span className={`font-medium text-slate-600 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{edu.graduationYear}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS */}
        {validCerts.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              CREDENTIALS & SPECIALIZATIONS
            </h2>
            <div className={`${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}`}>
              {validCerts.map((cert) => (
                <div key={cert.id} className="resume-entry flex justify-between items-baseline">
                  <span>
                    <strong className="text-slate-900">{cert.name}</strong> · {cert.issuer}
                  </span>
                  <span className={`text-blue-800 font-semibold ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
