'use client';

import React from 'react';
import { ResumeData } from '@/types/resume';
import { Terminal, Globe, Mail, Phone, MapPin } from 'lucide-react';

function GithubIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

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

export function SoftwareEngineerTemplate({
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
      {/* HEADER: Tech & Code Focused */}
      <header className={`pb-3.5 ${spacing.headerMarginBottom} border-b-2 border-emerald-600 shrink-0`}>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div>
            <h1
              className={`font-mono font-bold tracking-tight text-slate-900 ${
                isMiniPreview ? 'text-[13px]' : 'text-3xl'
              }`}
            >
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            {personalInfo.headline && (
              <p className={`font-mono text-emerald-700 font-medium mt-0.5 ${isMiniPreview ? 'text-[8px]' : 'text-sm'}`}>
                &gt; {personalInfo.headline}
              </p>
            )}
          </div>
        </div>

        {hasContactInfo(personalInfo) && (
          <div
            className={`flex flex-wrap items-center gap-x-3.5 gap-y-1 mt-2 text-slate-600 font-mono ${
              isMiniPreview ? 'text-[6px]' : 'text-[12.5px]'
            }`}
          >
            {personalInfo.email && (
              <span className="flex items-center gap-1.5">
                <Mail className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-emerald-600`} />
                <a href={`mailto:${personalInfo.email}`} className="text-slate-700 hover:text-emerald-700">
                  {personalInfo.email}
                </a>
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-emerald-600`} />
                <span>{personalInfo.phone}</span>
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-emerald-600`} />
                <span>{personalInfo.location}</span>
              </span>
            )}
            {personalInfo.github && (
              <span className="flex items-center gap-1.5">
                <GithubIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-emerald-600`} />
                <a
                  href={formatUrl(personalInfo.github)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  {cleanDomain(personalInfo.github)}
                </a>
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1.5">
                <LinkedinIcon className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-emerald-600`} />
                <a
                  href={formatUrl(personalInfo.linkedin)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {cleanDomain(personalInfo.linkedin)}
                </a>
              </span>
            )}
            {personalInfo.portfolio && (
              <span className="flex items-center gap-1.5">
                <Globe className={`${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'} text-emerald-600`} />
                <a
                  href={formatUrl(personalInfo.portfolio)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {cleanDomain(personalInfo.portfolio)}
                </a>
              </span>
            )}
          </div>
        )}
      </header>

      {/* BODY SECTIONS */}
      <div className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}>
        {/* SUMMARY */}
        {summary?.trim() && (
          <section className="resume-section">
            <h2 className={`font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1 flex items-center gap-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              <Terminal className={`${isMiniPreview ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} text-emerald-600`} />
              {'// '}{isFresher ? 'ENGINEERING OBJECTIVE' : 'SYSTEMS PROFILE & SUMMARY'}
            </h2>
            <p className="text-slate-700 leading-relaxed font-sans text-justify">{summary}</p>
          </section>
        )}

        {/* TECHNICAL SKILLS MATRIX */}
        {hasSkillsData(skills) && (
          <section className="resume-section">
            <h2 className={`font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5 flex items-center gap-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              <Terminal className={`${isMiniPreview ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} text-emerald-600`} />
              {'// TECHNICAL SKILLS & STACK'}
            </h2>
            <div className={`bg-slate-50 border border-slate-200 rounded p-3 space-y-1 font-mono ${isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'}`}>
              {skills.technical && skills.technical.length > 0 && (
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="font-bold text-slate-900 shrink-0">Languages & Core:</span>
                  <span className="text-slate-700">{skills.technical.join(' · ')}</span>
                </div>
              )}
              {skills.tools && skills.tools.length > 0 && (
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="font-bold text-slate-900 shrink-0">Frameworks & Cloud:</span>
                  <span className="text-slate-700">{skills.tools.join(' · ')}</span>
                </div>
              )}
              {skills.soft && skills.soft.length > 0 && (
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="font-bold text-slate-900 shrink-0">Architecture & Methods:</span>
                  <span className="text-slate-700">{skills.soft.join(' · ')}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* PROJECTS: Highlighted early for Software Engineers */}
        {validProj.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5 flex items-center gap-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              <Terminal className={`${isMiniPreview ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} text-emerald-600`} />
              {'// FEATURED OPEN SOURCE & SYSTEMS'}
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validProj.map((proj) => (
                <div key={proj.id} className="resume-entry">
                  <div className="flex justify-between items-baseline flex-wrap gap-1">
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {proj.title}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span className={`font-mono text-emerald-700 font-semibold ml-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                          [{proj.technologies.join(', ')}]
                        </span>
                      )}
                    </span>
                    {proj.link && (
                      <a
                        href={formatUrl(proj.link)}
                        target="_blank"
                        rel="noreferrer"
                        className={`font-mono text-emerald-600 hover:underline flex items-center gap-1 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}
                      >
                        <GithubIcon className="w-2.5 h-2.5" />
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
                    <ul className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed`}>
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
            <h2 className={`font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5 flex items-center gap-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              <Terminal className={`${isMiniPreview ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} text-emerald-600`} />
              {'// ENGINEERING EXPERIENCE'}
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validExp.map((exp) => (
                <div key={exp.id} className="resume-entry">
                  <div className="flex justify-between items-baseline">
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {exp.role} <span className="font-normal text-slate-600">@ {exp.company}</span>
                    </span>
                    <span className={`font-mono text-slate-500 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.location && (
                    <p className={`font-mono text-slate-500 italic ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{exp.location}</p>
                  )}
                  {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                    <ul className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed`}>
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
            <h2 className={`font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1 flex items-center gap-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              <Terminal className={`${isMiniPreview ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} text-emerald-600`} />
              {'// EDUCATION'}
            </h2>
            <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
              {validEdu.map((edu) => (
                <div key={edu.id} className="resume-entry flex justify-between items-baseline">
                  <div>
                    <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>{edu.degree}</span>
                    <span className={`text-slate-600 ${isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'}`}> — {edu.institution}</span>
                    {edu.gpa && (
                      <span className={`font-mono text-emerald-700 ml-1.5 font-semibold ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                        [GPA: {edu.gpa}]
                      </span>
                    )}
                  </div>
                  <span className={`font-mono text-slate-500 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{edu.graduationYear}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS */}
        {validCerts.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1 flex items-center gap-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
              <Terminal className={`${isMiniPreview ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} text-emerald-600`} />
              {'// CERTIFICATIONS'}
            </h2>
            <div className={`${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} font-mono ${isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'}`}>
              {validCerts.map((cert) => (
                <div key={cert.id} className="resume-entry flex justify-between items-baseline">
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
