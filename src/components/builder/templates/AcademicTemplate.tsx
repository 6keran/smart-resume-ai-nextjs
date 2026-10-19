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

export function AcademicTemplate({
  data,
  isMiniPreview = false,
}: {
  data: ResumeData;
  isMiniPreview?: boolean;
}) {
  const spacing = getTemplateSpacing(data, isMiniPreview);
  const { personalInfo, summary, skills, experience, education, projects, certifications } = data;

  const validExp = (experience || []).filter((e) => e.role?.trim() || e.company?.trim());
  const validEdu = (education || []).filter((e) => e.degree?.trim() || e.institution?.trim());
  const validProj = (projects || []).filter((p) => p.title?.trim());
  const validCerts = (certifications || []).filter((c) => c.name?.trim());

  return (
    <div
      className={`w-full bg-white text-slate-900 font-serif select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}
      style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}
    >
      {/* HEADER: Academic CV Style */}
      <header className={`text-center pb-3 ${spacing.headerMarginBottom} border-b border-slate-400 shrink-0`}>
        <h1
          className={`font-normal tracking-wide text-slate-950 ${
            isMiniPreview ? 'text-[13px]' : 'text-3xl'
          }`}
        >
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        {personalInfo.headline && (
          <p className={`italic text-slate-700 mt-0.5 ${isMiniPreview ? 'text-[8px]' : 'text-sm'}`}>
            {personalInfo.headline}
          </p>
        )}

        {hasContactInfo(personalInfo) && (
          <div
            className={`flex flex-wrap justify-center items-center gap-x-3 gap-y-0.5 mt-2 text-slate-600 ${
              isMiniPreview ? 'text-[6px]' : 'text-[12.5px]'
            }`}
          >
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.location && (personalInfo.phone || personalInfo.email) && <span>·</span>}
            {personalInfo.email && (
              <a href={`mailto:${personalInfo.email}`} className="text-slate-900 hover:underline">
                {personalInfo.email}
              </a>
            )}
            {personalInfo.phone && <span>·</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.portfolio && (
              <>
                <span>·</span>
                <a
                  href={formatUrl(personalInfo.portfolio)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {cleanDomain(personalInfo.portfolio)}
                </a>
              </>
            )}
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
          </div>
        )}
      </header>

      {/* BODY SECTIONS: Academic Hierarchy */}
      <div className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}>
        {/* EDUCATION & HONORS (FIRST IN ACADEMIC CV) */}
        {validEdu.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
              Education & Academic Credentials
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validEdu.map((edu) => (
                <div key={edu.id} className="resume-entry">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className={isMiniPreview ? 'text-[7px]' : 'text-[14px]'}>{edu.degree}</span>
                    <span className={`text-slate-600 font-normal ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{edu.graduationYear}</span>
                  </div>
                  <div className={`flex justify-between items-baseline italic text-slate-800 ${isMiniPreview ? 'text-[6.5px]' : 'text-[13px]'}`}>
                    <span>{edu.institution}</span>
                    {edu.location && <span className="not-italic text-slate-600">{edu.location}</span>}
                  </div>
                  {(edu.gpa || edu.honors) && (
                    <p className={`text-slate-700 mt-0.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                      {edu.gpa && edu.honors && <span> · </span>}
                      {edu.honors && <span className="italic">{edu.honors}</span>}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RESEARCH PROFILE & SUMMARY */}
        {summary?.trim() && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
              Research Interests & Statement
            </h2>
            <p className="text-slate-800 leading-relaxed text-justify">{summary}</p>
          </section>
        )}

        {/* RESEARCH PROJECTS & PUBLICATIONS */}
        {validProj.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
              Research Projects & Working Papers
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validProj.map((proj) => (
                <div key={proj.id} className="resume-entry">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className={isMiniPreview ? 'text-[7px]' : 'text-[14px]'}>
                      {proj.title}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span className={`font-normal italic text-slate-600 ml-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                          ({proj.technologies.join(', ')})
                        </span>
                      )}
                    </span>
                    {proj.link && (
                      <a
                        href={formatUrl(proj.link)}
                        target="_blank"
                        rel="noreferrer"
                        className={`text-slate-600 font-normal hover:underline ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}
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

        {/* TEACHING & PROFESSIONAL APPOINTMENTS */}
        {validExp.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
              Academic & Professional Appointments
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validExp.map((exp) => (
                <div key={exp.id} className="resume-entry">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className={isMiniPreview ? 'text-[7px]' : 'text-[14px]'}>
                      {exp.role}, <span className="font-normal italic">{exp.company}</span>
                    </span>
                    <span className={`font-normal text-slate-600 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed">
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

        {/* METHODOLOGIES & SKILLS */}
        {hasSkillsData(skills) && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
              Methodologies & Technical Competencies
            </h2>
            <div className={`${spacing.bulletGap} text-slate-800 ${spacing.lineHeight}`}>
              {skills.technical && skills.technical.length > 0 && (
                <p>
                  <strong>Research & Technical: </strong>
                  <span>{skills.technical.join(', ')}</span>
                </p>
              )}
              {skills.tools && skills.tools.length > 0 && (
                <p>
                  <strong>Software & Lab Tools: </strong>
                  <span>{skills.tools.join(', ')}</span>
                </p>
              )}
              {skills.soft && skills.soft.length > 0 && (
                <p>
                  <strong>Academic Leadership: </strong>
                  <span>{skills.soft.join(', ')}</span>
                </p>
              )}
            </div>
          </section>
        )}

        {/* GRANTS & CERTIFICATIONS */}
        {validCerts.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
              Grants, Honors & Certifications
            </h2>
            <div className={`${spacing.bulletGap} text-slate-800 ${spacing.lineHeight}`}>
              {validCerts.map((cert) => (
                <div key={cert.id} className="resume-entry flex justify-between items-baseline">
                  <span>
                    <strong>{cert.name}</strong> — {cert.issuer}
                  </span>
                  <span className={`text-slate-600 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
