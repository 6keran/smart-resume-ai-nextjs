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
} from './templateUtils';

export function CompactOnePageTemplate({
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
      className={`w-full bg-white text-slate-900 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[6.5px] leading-tight" : `text-[12.5px] ${spacing.lineHeight}`}`}
    >
      {/* HEADER: Ultra Compact Inline Header */}
      <header className={`pb-2.5 ${spacing.headerMarginBottom} border-b border-slate-900 shrink-0 flex justify-between items-baseline flex-wrap gap-x-3 gap-y-1`}>
        <div>
          <h1
            className={`font-black uppercase tracking-tight text-slate-950 inline-block ${
              isMiniPreview ? 'text-[12px]' : 'text-2xl'
            }`}
          >
            {personalInfo.fullName || 'YOUR NAME'}
          </h1>
          {personalInfo.headline && (
            <span className={`text-slate-600 font-semibold ml-2 ${isMiniPreview ? 'text-[7.5px]' : 'text-sm'}`}>
              | {personalInfo.headline}
            </span>
          )}
        </div>

        {hasContactInfo(personalInfo) && (
          <div
            className={`flex flex-wrap items-center gap-x-2.5 text-slate-600 ${
              isMiniPreview ? 'text-[6px]' : 'text-[12px]'
            }`}
          >
            {personalInfo.email && (
              <a href={`mailto:${personalInfo.email}`} className="text-slate-900 hover:underline">
                {personalInfo.email}
              </a>
            )}
            {personalInfo.phone && <span>·</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>·</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.linkedin && (
              <>
                <span>·</span>
                <a
                  href={formatUrl(personalInfo.linkedin)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {cleanDomain(personalInfo.linkedin)}
                </a>
              </>
            )}
            {personalInfo.github && (
              <>
                <span>·</span>
                <a
                  href={formatUrl(personalInfo.github)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {cleanDomain(personalInfo.github)}
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
            <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1 ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}>
              {isFresher ? 'PROFILE & OBJECTIVE' : 'SUMMARY'}
            </h2>
            <p className="text-slate-800 leading-snug">{summary}</p>
          </section>
        )}

        {/* SKILLS */}
        {hasSkillsData(skills) && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1 ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}>
              SKILLS & EXPERTISE
            </h2>
            <div className={`${spacing.bulletGap} text-slate-800 ${spacing.lineHeight}`}>
              {skills.technical && skills.technical.length > 0 && (
                <p>
                  <strong>Technical: </strong>
                  <span>{skills.technical.join(', ')}</span>
                </p>
              )}
              {skills.tools && skills.tools.length > 0 && (
                <p>
                  <strong>Tools: </strong>
                  <span>{skills.tools.join(', ')}</span>
                </p>
              )}
              {skills.soft && skills.soft.length > 0 && (
                <p>
                  <strong>Leadership: </strong>
                  <span>{skills.soft.join(', ')}</span>
                </p>
              )}
            </div>
          </section>
        )}

        {/* EXPERIENCE */}
        {validExp.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1 ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}>
              EXPERIENCE
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validExp.map((exp) => (
                <div key={exp.id} className="resume-entry">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className={isMiniPreview ? 'text-[7px]' : 'text-[13.5px]'}>
                      {exp.role} — <span className="font-semibold text-slate-700">{exp.company}</span>
                    </span>
                    <span className={`font-normal text-slate-600 ${isMiniPreview ? 'text-[6px]' : 'text-[11.5px]'}`}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                    <ul className="list-disc list-outside ml-4 ${spacing.bulletGap} text-slate-800 ${spacing.lineHeight} leading-snug">
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

        {/* PROJECTS */}
        {validProj.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1 ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}>
              PROJECTS
            </h2>
            <div className="space-y-1.5">
              {validProj.map((proj) => (
                <div key={proj.id} className="resume-entry">
                  <div className="flex justify-between items-baseline">
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[13.5px]'}`}>
                      {proj.title}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span className={`font-normal text-slate-600 ml-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[11.5px]'}`}>
                          [{proj.technologies.join(', ')}]
                        </span>
                      )}
                    </span>
                    {proj.link && (
                      <a
                        href={formatUrl(proj.link)}
                        target="_blank"
                        rel="noreferrer"
                        className={`text-slate-600 hover:underline ${isMiniPreview ? 'text-[6px]' : 'text-[11.5px]'}`}
                      >
                        {cleanDomain(proj.link)}
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-slate-700 leading-snug">{proj.description}</p>
                  )}
                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-snug">
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
            <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1 ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}>
              EDUCATION
            </h2>
            <div className="space-y-1">
              {validEdu.map((edu) => (
                <div key={edu.id} className="resume-entry flex justify-between items-baseline">
                  <div>
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[13.5px]'}`}>{edu.degree}</span>
                    <span className={`text-slate-700 ${isMiniPreview ? 'text-[6.5px]' : 'text-[12px]'}`}>, {edu.institution}</span>
                    {edu.gpa && <span className={`text-slate-600 ml-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[11.5px]'}`}>(GPA: {edu.gpa})</span>}
                  </div>
                  <span className={`text-slate-500 ${isMiniPreview ? 'text-[6px]' : 'text-[11.5px]'}`}>{edu.graduationYear}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS */}
        {validCerts.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1 ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px]'}`}>
              CERTIFICATIONS
            </h2>
            <div className={`${spacing.bulletGap} text-slate-800 ${spacing.lineHeight}`}>
              {validCerts.map((cert) => (
                <div key={cert.id} className="resume-entry flex justify-between items-baseline">
                  <span>
                    <strong>{cert.name}</strong> · {cert.issuer}
                  </span>
                  <span className={`text-slate-500 ${isMiniPreview ? 'text-[6px]' : 'text-[11.5px]'}`}>{cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
