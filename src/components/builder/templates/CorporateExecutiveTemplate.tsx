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

export function CorporateExecutiveTemplate({
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
      className={`w-full bg-white text-slate-800 font-sans select-text flex-1 flex flex-col min-h-full ${isMiniPreview ? "text-[7px] leading-tight p-4" : `text-[13px] ${spacing.containerPadding} ${spacing.lineHeight}`}`}
    >
      {/* HEADER: Deep Navy Executive Banner */}
      <header
        className={`bg-slate-900 text-white ${
          isMiniPreview
            ? '-mx-4 -mt-4 p-3 mb-2'
            : '-mx-8 -mt-8 sm:-mx-10 sm:-mt-10 p-6 sm:p-8 mb-4'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <h1
              className={`font-serif font-bold uppercase tracking-wider text-white ${
                isMiniPreview ? 'text-[13px]' : 'text-3xl'
              }`}
            >
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            {personalInfo.headline && (
              <p className={`font-sans tracking-wide text-amber-300 font-medium mt-0.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-sm'}`}>
                {personalInfo.headline}
              </p>
            )}
          </div>
        </div>

        {hasContactInfo(personalInfo) && (
          <div
            className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2.5 text-slate-300 border-t border-slate-700/80 pt-2 ${
              isMiniPreview ? 'text-[6px]' : 'text-[12.5px]'
            }`}
          >
            {personalInfo.email && (
              <a href={`mailto:${personalInfo.email}`} className="text-slate-200 hover:text-white">
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
                  className="text-slate-200 hover:text-white"
                >
                  {cleanDomain(personalInfo.linkedin)}
                </a>
              </>
            )}
            {personalInfo.portfolio && (
              <>
                <span>·</span>
                <a
                  href={formatUrl(personalInfo.portfolio)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-200 hover:text-white"
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
            <h2 className={`font-serif font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-0.5 mb-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
              {isFresher ? 'CAREER OBJECTIVE & FOCUS' : 'EXECUTIVE SUMMARY & LEADERSHIP PROFILE'}
            </h2>
            <p className="text-slate-700 leading-relaxed text-justify">{summary}</p>
          </section>
        )}

        {/* SKILLS */}
        {hasSkillsData(skills) && (
          <section className="resume-section">
            <h2 className={`font-serif font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-0.5 mb-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
              CORE LEADERSHIP & TECHNICAL COMPETENCIES
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-700">
              {skills.technical && skills.technical.length > 0 && (
                <p>
                  <strong className="text-slate-900 font-semibold">Technical Infrastructure: </strong>
                  <span>{skills.technical.join(', ')}</span>
                </p>
              )}
              {skills.tools && skills.tools.length > 0 && (
                <p>
                  <strong className="text-slate-900 font-semibold">Enterprise Platforms: </strong>
                  <span>{skills.tools.join(', ')}</span>
                </p>
              )}
              {skills.soft && skills.soft.length > 0 && (
                <p className="sm:col-span-2">
                  <strong className="text-slate-900 font-semibold">Strategic Governance: </strong>
                  <span>{skills.soft.join(', ')}</span>
                </p>
              )}
            </div>
          </section>
        )}

        {/* EXPERIENCE */}
        {validExp.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-serif font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-0.5 mb-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
              EXECUTIVE & PROFESSIONAL EXPERIENCE
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validExp.map((exp) => (
                <div key={exp.id} className="resume-entry">
                  <div className="flex justify-between items-baseline font-serif">
                    <span className={`font-bold text-slate-950 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {exp.role} — <span className="font-normal italic text-slate-800">{exp.company}</span>
                    </span>
                    <span className={`font-sans font-semibold text-slate-600 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.location && (
                    <p className={`text-slate-500 italic mb-0.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{exp.location}</p>
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

        {/* PROJECTS */}
        {validProj.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-serif font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-0.5 mb-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
              STRATEGIC INITIATIVES & DELIVERABLES
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validProj.map((proj) => (
                <div key={proj.id} className="resume-entry">
                  <div className="flex justify-between items-baseline">
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {proj.title}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span className={`font-normal text-slate-600 ml-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                          [{proj.technologies.join(', ')}]
                        </span>
                      )}
                    </span>
                    {proj.link && (
                      <a
                        href={formatUrl(proj.link)}
                        target="_blank"
                        rel="noreferrer"
                        className={`text-slate-600 hover:text-black ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}
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
            <h2 className={`font-serif font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-0.5 mb-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
              EDUCATION & CREDENTIALS
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validEdu.map((edu) => (
                <div key={edu.id} className="resume-entry flex justify-between items-baseline">
                  <div>
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>{edu.degree}</span>
                    <span className={`text-slate-700 ${isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'}`}> — {edu.institution}</span>
                    {edu.honors && (
                      <span className={`text-slate-600 italic ml-1 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>({edu.honors})</span>
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
            <h2 className={`font-serif font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-0.5 mb-1 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
              EXECUTIVE CERTIFICATIONS
            </h2>
            <div className={`${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}`}>
              {validCerts.map((cert) => (
                <div key={cert.id} className="resume-entry flex justify-between items-baseline">
                  <span>
                    <strong className="text-slate-900 font-semibold">{cert.name}</strong> · {cert.issuer}
                  </span>
                  <span className={`text-slate-500 font-medium ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
