'use client';

import React from 'react';
import { ResumeData } from '@/types/resume';
import { GraduationCap, Award, FolderGit2 } from 'lucide-react';
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

export function FreshGraduateTemplate({
  data,
  isMiniPreview = false,
}: {
  data: ResumeData;
  isMiniPreview?: boolean;
}) {
  const { personalInfo, summary, skills, experience, education, projects, certifications } = data;
  const spacing = getTemplateSpacing(data, isMiniPreview);

  const validExp = (experience || []).filter((e) => e.role?.trim() || e.company?.trim());
  const validEdu = (education || []).filter((e) => e.degree?.trim() || e.institution?.trim());
  const validProj = (projects || []).filter((p) => p.title?.trim());
  const validCerts = (certifications || []).filter((c) => c.name?.trim());

  return (
    <div
      className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${
        isMiniPreview
          ? 'text-[7px] leading-tight'
          : `text-[13px] ${spacing.lineHeight}`
      }`}
    >
      {/* HEADER */}
      <header
        className={`text-center border-b-2 border-teal-600 shrink-0 ${
          isMiniPreview ? 'pb-2 mb-2' : `pb-3.5 ${spacing.headerMarginBottom}`
        }`}
      >
        <h1
          className={`font-extrabold tracking-tight text-slate-900 ${
            isMiniPreview ? 'text-[13px]' : 'text-3xl sm:text-[31px]'
          }`}
        >
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        {personalInfo.headline ? (
          <p
            className={`font-medium text-teal-700 ${
              isMiniPreview ? 'text-[8px] mt-0.5' : 'text-[13.5px] mt-0.5'
            }`}
          >
            {personalInfo.headline}
          </p>
        ) : (
          <p
            className={`font-medium text-teal-700 ${
              isMiniPreview ? 'text-[8px] mt-0.5' : 'text-[13.5px] mt-0.5'
            }`}
          >
            Entry-Level Professional & Graduate
          </p>
        )}

        {hasContactInfo(personalInfo) && (
          <div
            className={`flex flex-wrap justify-center items-center text-slate-600 ${
              isMiniPreview
                ? 'gap-x-2 gap-y-0.5 mt-1.5 text-[6px]'
                : 'gap-x-3 gap-y-0.5 mt-2 text-[12px]'
            }`}
          >
            {personalInfo.email && (
              <a href={`mailto:${personalInfo.email}`} className="text-teal-800 hover:underline">
                {personalInfo.email}
              </a>
            )}
            {personalInfo.phone && <span>•</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>•</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.linkedin && (
              <>
                <span>•</span>
                <a
                  href={formatUrl(personalInfo.linkedin)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-800 hover:underline"
                >
                  {cleanDomain(personalInfo.linkedin)}
                </a>
              </>
            )}
            {personalInfo.github && (
              <>
                <span>•</span>
                <a
                  href={formatUrl(personalInfo.github)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-800 hover:underline"
                >
                  {cleanDomain(personalInfo.github)}
                </a>
              </>
            )}
            {personalInfo.portfolio && (
              <>
                <span>•</span>
                <a
                  href={formatUrl(personalInfo.portfolio)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-800 hover:underline"
                >
                  {cleanDomain(personalInfo.portfolio)}
                </a>
              </>
            )}
          </div>
        )}
      </header>

      {/* BODY SECTIONS: Evenly distributed with consistent vertical rhythm */}
      <div
        className={`flex-1 flex flex-col ${
          isMiniPreview ? 'space-y-2' : spacing.sectionGap
        }`}
      >
        {/* OBJECTIVE */}
        {summary?.trim() && (
          <section className="resume-section">
            <h2
              className={`font-bold uppercase tracking-wider text-teal-900 border-b border-teal-200 ${
                isMiniPreview
                  ? 'pb-0.5 mb-1 text-[7.5px]'
                  : `pb-1 ${spacing.headingMarginBottom} text-[14px]`
              }`}
            >
              CAREER OBJECTIVE & FOCUS
            </h2>
            <p
              className={`text-slate-700 text-justify ${
                isMiniPreview ? 'text-[6.5px] leading-tight' : `text-[13px] ${spacing.lineHeight}`
              }`}
            >
              {summary}
            </p>
          </section>
        )}

        {/* EDUCATION & ACADEMIC CREDENTIALS (ELEVATED) */}
        {validEdu.length > 0 && (
          <section className="resume-section">
            <h2
              className={`font-bold uppercase tracking-wider text-teal-900 border-b border-teal-200 flex items-center ${
                isMiniPreview
                  ? 'pb-0.5 mb-1 text-[7.5px] gap-1'
                  : `pb-1 ${spacing.headingMarginBottom} text-[14px] gap-1.5`
              }`}
            >
              <GraduationCap
                className={`${isMiniPreview ? 'w-2.5 h-2.5' : 'w-4 h-4'} text-teal-700 shrink-0`}
              />
              <span>EDUCATION & ACADEMIC ACHIEVEMENTS</span>
            </h2>
            <div className={isMiniPreview ? 'space-y-1.5' : spacing.entryGap}>
              {validEdu.map((edu) => (
                <div
                  key={edu.id}
                  className={`resume-entry bg-teal-50/40 rounded-md border border-teal-100/90 ${
                    isMiniPreview ? 'p-2' : 'p-3.5 sm:p-4'
                  }`}
                >
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className={isMiniPreview ? 'text-[7px]' : 'text-[14px]'}>
                      {edu.degree}
                    </span>
                    <span
                      className={`text-teal-800 font-semibold ${
                        isMiniPreview ? 'text-[6px]' : 'text-[12px]'
                      }`}
                    >
                      {edu.graduationYear}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between items-baseline text-slate-600 ${
                      isMiniPreview ? 'mt-0.5 text-[6.5px]' : 'mt-1 text-[12.5px]'
                    }`}
                  >
                    <span className="font-medium text-slate-800">{edu.institution}</span>
                    {edu.location && <span>{edu.location}</span>}
                  </div>
                  {(edu.gpa || edu.honors) && (
                    <div
                      className={`flex flex-wrap items-center ${
                        isMiniPreview ? 'mt-1 gap-1 text-[6px]' : 'mt-2 gap-2 text-[11.5px]'
                      }`}
                    >
                      {edu.gpa && (
                        <span className="px-2 py-0.5 bg-teal-600 text-white rounded-md font-semibold text-[11px] shadow-2xs">
                          GPA: {edu.gpa}
                        </span>
                      )}
                      {edu.honors && (
                        <span className="text-teal-800 font-medium italic">
                          Honors: {edu.honors}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TECHNICAL & PROFESSIONAL SKILLS */}
        {hasSkillsData(skills) && (
          <section className="resume-section">
            <h2
              className={`font-bold uppercase tracking-wider text-teal-900 border-b border-teal-200 ${
                isMiniPreview
                  ? 'pb-0.5 mb-1 text-[7.5px]'
                  : `pb-1 ${spacing.headingMarginBottom} text-[14px]`
              }`}
            >
              TECHNICAL & FOUNDATIONAL COMPETENCIES
            </h2>
            <div
              className={`text-slate-700 ${
                isMiniPreview
                  ? 'space-y-1 text-[6.5px]'
                  : `space-y-2 text-[13px] ${spacing.lineHeight}`
              }`}
            >
              {skills.technical && skills.technical.length > 0 && (
                <p>
                  <strong className="text-slate-900 font-semibold">Programming & Core: </strong>
                  <span>{skills.technical.join(', ')}</span>
                </p>
              )}
              {skills.tools && skills.tools.length > 0 && (
                <p>
                  <strong className="text-slate-900 font-semibold">Frameworks & Tools: </strong>
                  <span>{skills.tools.join(', ')}</span>
                </p>
              )}
              {skills.soft && skills.soft.length > 0 && (
                <p>
                  <strong className="text-slate-900 font-semibold">Collaboration & Strengths: </strong>
                  <span>{skills.soft.join(', ')}</span>
                </p>
              )}
            </div>
          </section>
        )}

        {/* ACADEMIC & CAPSTONE PROJECTS */}
        {validProj.length > 0 && (
          <section className="resume-section">
            <h2
              className={`font-bold uppercase tracking-wider text-teal-900 border-b border-teal-200 flex items-center ${
                isMiniPreview
                  ? 'pb-0.5 mb-1 text-[7.5px] gap-1'
                  : `pb-1 ${spacing.headingMarginBottom} text-[14px] gap-1.5`
              }`}
            >
              <FolderGit2
                className={`${isMiniPreview ? 'w-2.5 h-2.5' : 'w-4 h-4'} text-teal-700 shrink-0`}
              />
              <span>ACADEMIC & CAPSTONE PROJECTS</span>
            </h2>
            <div className={isMiniPreview ? 'space-y-2' : spacing.entryGap}>
              {validProj.map((proj) => (
                <div key={proj.id} className="resume-entry">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className={`text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {proj.title}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span
                          className={`font-normal text-teal-700 ml-1.5 ${
                            isMiniPreview ? 'text-[6px]' : 'text-[12px]'
                          }`}
                        >
                          ({proj.technologies.join(', ')})
                        </span>
                      )}
                    </span>
                    {proj.link && (
                      <a
                        href={formatUrl(proj.link)}
                        target="_blank"
                        rel="noreferrer"
                        className={`text-teal-700 hover:underline ${
                          isMiniPreview ? 'text-[6px]' : 'text-[12px]'
                        }`}
                      >
                        {cleanDomain(proj.link)}
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p
                      className={`text-slate-700 ${
                        isMiniPreview
                          ? 'mt-0.5 text-[6.5px] leading-tight'
                          : `mt-1 text-[13px] ${spacing.lineHeight}`
                      }`}
                    >
                      {proj.description}
                    </p>
                  )}
                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul
                      className={`list-disc list-outside ml-4 text-slate-700 ${
                        isMiniPreview
                          ? 'mt-0.5 space-y-0.5 text-[6px]'
                          : `mt-1.5 ${spacing.bulletGap} text-[13px] ${spacing.lineHeight}`
                      }`}
                    >
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

        {/* INTERNSHIPS (OPTIONAL) */}
        {validExp.length > 0 && (
          <section className="resume-section">
            <h2
              className={`font-bold uppercase tracking-wider text-teal-900 border-b border-teal-200 ${
                isMiniPreview
                  ? 'pb-0.5 mb-1 text-[7.5px]'
                  : `pb-1 ${spacing.headingMarginBottom} text-[14px]`
              }`}
            >
              INTERNSHIPS & PRACTICAL TENURE
            </h2>
            <div className={isMiniPreview ? 'space-y-2' : spacing.entryGap}>
              {validExp.map((exp) => (
                <div key={exp.id} className="resume-entry">
                  <div className="flex justify-between items-baseline">
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {exp.role} <span className="font-normal text-slate-600">| {exp.company}</span>
                    </span>
                    <span
                      className={`text-slate-500 font-medium ${
                        isMiniPreview ? 'text-[6px]' : 'text-[12px]'
                      }`}
                    >
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                    <ul
                      className={`list-disc list-outside ml-4 text-slate-700 ${
                        isMiniPreview
                          ? 'mt-0.5 space-y-0.5 text-[6px]'
                          : `mt-1.5 ${spacing.bulletGap} text-[13px] ${spacing.lineHeight}`
                      }`}
                    >
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

        {/* CERTIFICATIONS */}
        {validCerts.length > 0 && (
          <section className="resume-section">
            <h2
              className={`font-bold uppercase tracking-wider text-teal-900 border-b border-teal-200 flex items-center ${
                isMiniPreview
                  ? 'pb-0.5 mb-1 text-[7.5px] gap-1'
                  : `pb-1 ${spacing.headingMarginBottom} text-[14px] gap-1.5`
              }`}
            >
              <Award
                className={`${isMiniPreview ? 'w-2.5 h-2.5' : 'w-4 h-4'} text-teal-700 shrink-0`}
              />
              <span>CERTIFICATIONS & CREDENTIALS</span>
            </h2>
            <div
              className={`text-slate-700 ${
                isMiniPreview
                  ? 'space-y-1 text-[6.5px]'
                  : `space-y-2 text-[13px] ${spacing.lineHeight}`
              }`}
            >
              {validCerts.map((cert) => (
                <div key={cert.id} className="resume-entry flex justify-between items-baseline py-1">
                  <span>
                    <strong className="text-slate-900 font-semibold">{cert.name}</strong> · {cert.issuer}
                  </span>
                  <span
                    className={`text-teal-700 font-semibold ${
                      isMiniPreview ? 'text-[6px]' : 'text-[12px]'
                    }`}
                  >
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
