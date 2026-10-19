'use client';

import React from 'react';
import { ResumeData } from '@/types/resume';
import { Sparkles, Palette } from 'lucide-react';
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

export function CreativeProfessionalTemplate({
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
      {/* HEADER: Creative Card Tint */}
      <header
        className={`bg-purple-50/70 border border-purple-200/80 rounded-xl ${
          isMiniPreview ? 'p-2 mb-2' : 'p-4 sm:p-4.5 mb-2.5'
        }`}
      >
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h1
              className={`font-black tracking-tight text-purple-950 ${
                isMiniPreview ? 'text-[13px]' : 'text-3xl'
              }`}
            >
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            {personalInfo.headline && (
              <p className={`font-semibold text-purple-700 mt-0.5 ${isMiniPreview ? 'text-[8px]' : 'text-sm'}`}>
                {personalInfo.headline}
              </p>
            )}
          </div>
        </div>

        {hasContactInfo(personalInfo) && (
          <div
            className={`flex flex-wrap items-center gap-x-3.5 gap-y-0.5 mt-2.5 text-purple-900 border-t border-purple-200/60 pt-2 ${
              isMiniPreview ? 'text-[6px]' : 'text-[12.5px]'
            }`}
          >
            {personalInfo.email && (
              <a href={`mailto:${personalInfo.email}`} className="hover:text-purple-600 font-medium">
                {personalInfo.email}
              </a>
            )}
            {personalInfo.phone && <span>·</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>·</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.portfolio && (
              <>
                <span>·</span>
                <a
                  href={formatUrl(personalInfo.portfolio)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-purple-700 hover:underline"
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
            <h2 className={`font-bold uppercase tracking-wider text-purple-900 border-b border-purple-200 pb-0.5 ${spacing.headingMarginBottom} flex items-center gap-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              <Sparkles className={`${isMiniPreview ? 'w-2.5 h-2.5' : 'w-4 h-4'} text-purple-600`} />
              {isFresher ? 'CREATIVE VISION & OBJECTIVE' : 'CREATIVE PHILOSOPHY & SUMMARY'}
            </h2>
            <p className="text-slate-700 leading-relaxed text-justify">{summary}</p>
          </section>
        )}

        {/* SKILLS */}
        {hasSkillsData(skills) && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-purple-900 border-b border-purple-200 pb-0.5 ${spacing.headingMarginBottom} flex items-center gap-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              <Palette className={`${isMiniPreview ? 'w-2.5 h-2.5' : 'w-4 h-4'} text-purple-600`} />
              SKILLS & CREATIVE TOOLKIT
            </h2>
            <div className={`${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}`}>
              {skills.technical && skills.technical.length > 0 && (
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="font-bold text-slate-900">Design & Core:</span>
                  <span>{skills.technical.join(' · ')}</span>
                </div>
              )}
              {skills.tools && skills.tools.length > 0 && (
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="font-bold text-slate-900">Platforms & Tools:</span>
                  <span>{skills.tools.join(' · ')}</span>
                </div>
              )}
              {skills.soft && skills.soft.length > 0 && (
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="font-bold text-slate-900">Design Leadership:</span>
                  <span>{skills.soft.join(' · ')}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* FEATURED PROJECTS (EMPHASIZED FOR CREATIVES) */}
        {validProj.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-purple-900 border-b border-purple-200 pb-0.5 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              SELECTED PORTFOLIO & CASE STUDIES
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              {validProj.map((proj) => (
                <div
                  key={proj.id}
                  className="resume-entry p-3 rounded-lg border border-purple-100 bg-purple-50/20"
                >
                  <div className="flex justify-between items-baseline">
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {proj.title}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span className={`font-normal text-purple-700 ml-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                          ({proj.technologies.join(', ')})
                        </span>
                      )}
                    </span>
                    {proj.link && (
                      <a
                        href={formatUrl(proj.link)}
                        target="_blank"
                        rel="noreferrer"
                        className={`text-purple-700 font-semibold hover:underline ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}
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
                    <ul className="list-disc list-outside ml-4 mt-1 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed">
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

        {/* EXPERIENCE */}
        {validExp.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-purple-900 border-b border-purple-200 pb-0.5 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              PROFESSIONAL EXPERIENCE
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validExp.map((exp) => (
                <div key={exp.id} className="resume-entry">
                  <div className="flex justify-between items-baseline">
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {exp.role} <span className="font-normal text-purple-800">/ {exp.company}</span>
                    </span>
                    <span className={`text-slate-500 font-medium ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.location && (
                    <p className={`text-slate-500 italic ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{exp.location}</p>
                  )}
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

        {/* EDUCATION */}
        {validEdu.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-purple-900 border-b border-purple-200 pb-0.5 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              EDUCATION & DESIGN BACKGROUND
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validEdu.map((edu) => (
                <div key={edu.id} className="resume-entry flex justify-between items-baseline">
                  <div>
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>{edu.degree}</span>
                    <span className={`text-slate-600 ${isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'}`}> — {edu.institution}</span>
                  </div>
                  <span className={`text-slate-500 font-medium ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{edu.graduationYear}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS */}
        {validCerts.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-purple-900 border-b border-purple-200 pb-0.5 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              HONORS & CERTIFICATIONS
            </h2>
            <div className={`${spacing.bulletGap} text-slate-700 ${spacing.lineHeight}`}>
              {validCerts.map((cert) => (
                <div key={cert.id} className="resume-entry flex justify-between items-baseline">
                  <span>
                    <strong className="text-slate-900">{cert.name}</strong> · {cert.issuer}
                  </span>
                  <span className={`text-purple-700 font-semibold ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
