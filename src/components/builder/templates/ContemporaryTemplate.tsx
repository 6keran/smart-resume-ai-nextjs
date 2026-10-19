'use client';

import React from 'react';
import { ResumeData } from '@/types/resume';
import { Mail, Phone, MapPin, Globe, Link2, Code2 } from 'lucide-react';
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

export function ContemporaryTemplate({
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
      className={`w-full bg-white text-slate-800 font-sans select-text flex flex-1 min-h-full ${isMiniPreview ? "text-[6.5px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}
    >
      {/* LEFT SIDEBAR (34%) */}
      <div
        className={`w-[34%] bg-slate-50 border-r border-slate-200 flex flex-col justify-between shrink-0 ${isMiniPreview ? "p-3 space-y-2" : `${spacing.containerPadding} space-y-4`}`}
      >
        <div className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}>
          {/* INITIALS BADGE */}
          <div className="flex items-center gap-2.5">
            <div
              className={`rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 ${
                isMiniPreview ? 'w-6 h-6 text-[9px]' : 'w-11 h-11 text-base'
              }`}
            >
              {(personalInfo.fullName || 'CR')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <span className={`font-bold text-slate-900 block leading-tight ${isMiniPreview ? 'text-[8px]' : 'text-[14px]'}`}>
                {personalInfo.fullName || 'YOUR NAME'}
              </span>
              {personalInfo.location && (
                <span className={`text-slate-500 block ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{personalInfo.location}</span>
              )}
            </div>
          </div>

          {/* CONTACT INFO */}
          {hasContactInfo(personalInfo) && (
            <div className={`space-y-1.5 text-slate-600 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
              <h3 className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5 ${isMiniPreview ? 'text-[7px]' : 'text-[13px]'}`}>
                CONTACT
              </h3>
              {personalInfo.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className={`${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} text-indigo-600 shrink-0`} />
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="truncate hover:text-indigo-600"
                  >
                    {personalInfo.email}
                  </a>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className={`${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} text-indigo-600 shrink-0`} />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className={`${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} text-indigo-600 shrink-0`} />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center gap-1.5">
                  <Link2 className={`${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} text-indigo-600 shrink-0`} />
                  <a
                    href={formatUrl(personalInfo.linkedin)}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:text-indigo-600"
                  >
                    {cleanDomain(personalInfo.linkedin)}
                  </a>
                </div>
              )}
              {personalInfo.github && (
                <div className="flex items-center gap-1.5">
                  <Code2 className={`${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} text-indigo-600 shrink-0`} />
                  <a
                    href={formatUrl(personalInfo.github)}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:text-indigo-600"
                  >
                    {cleanDomain(personalInfo.github)}
                  </a>
                </div>
              )}
              {personalInfo.portfolio && (
                <div className="flex items-center gap-1.5">
                  <Globe className={`${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} text-indigo-600 shrink-0`} />
                  <a
                    href={formatUrl(personalInfo.portfolio)}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:text-indigo-600"
                  >
                    {cleanDomain(personalInfo.portfolio)}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* SKILLS */}
          {hasSkillsData(skills) && (
            <div className={`space-y-1.5 text-slate-700 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
              <h3 className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5 ${isMiniPreview ? 'text-[7px]' : 'text-[13px]'}`}>
                SKILLS & TOOLS
              </h3>
              {skills.technical && skills.technical.length > 0 && (
                <div>
                  <span className={`font-semibold text-slate-900 block ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>Technical:</span>
                  <p className="text-slate-600 mt-0.5">{skills.technical.join(', ')}</p>
                </div>
              )}
              {skills.tools && skills.tools.length > 0 && (
                <div className="mt-1">
                  <span className={`font-semibold text-slate-900 block ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>Tools:</span>
                  <p className="text-slate-600 mt-0.5">{skills.tools.join(', ')}</p>
                </div>
              )}
              {skills.soft && skills.soft.length > 0 && (
                <div className="mt-1">
                  <span className={`font-semibold text-slate-900 block ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>Competencies:</span>
                  <p className="text-slate-600 mt-0.5">{skills.soft.join(', ')}</p>
                </div>
              )}
            </div>
          )}

          {/* EDUCATION */}
          {validEdu.length > 0 && (
            <div className={`space-y-2 text-slate-700 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
              <h3 className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5 ${isMiniPreview ? 'text-[7px]' : 'text-[13px]'}`}>
                EDUCATION
              </h3>
              {validEdu.map((edu) => (
                <div key={edu.id} className="resume-entry space-y-0.5">
                  <p className={`font-bold text-slate-900 leading-snug ${isMiniPreview ? 'text-[6.5px]' : 'text-[13px]'}`}>{edu.degree}</p>
                  <p className={`text-slate-600 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{edu.institution}</p>
                  <p className={`text-indigo-700 font-medium ${isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px]'}`}>{edu.graduationYear}</p>
                  {edu.gpa && <p className={`text-slate-500 ${isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px]'}`}>GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          )}

          {/* CERTIFICATIONS */}
          {validCerts.length > 0 && (
            <div className={`space-y-1.5 text-slate-700 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
              <h3 className={`font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5 ${isMiniPreview ? 'text-[7px]' : 'text-[13px]'}`}>
                CERTIFICATIONS
              </h3>
              {validCerts.map((cert) => (
                <div key={cert.id} className="resume-entry">
                  <p className={`font-semibold text-slate-900 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{cert.name}</p>
                  <p className={`text-slate-500 ${isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px]'}`}>{cert.issuer} · {cert.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT MAIN PANEL (66%) */}
      <div
        className={`w-[66%] flex-1 bg-white flex flex-col justify-between ${isMiniPreview ? "p-3 space-y-2" : `${spacing.containerPadding} space-y-4`}`}
      >
        <div className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}>
          {/* HEADER IN MAIN PANEL */}
          <div className="pb-2 border-b border-slate-200">
            <h1
              className={`font-black tracking-tight text-slate-900 ${
                isMiniPreview ? 'text-[14px]' : 'text-3xl'
              }`}
            >
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            {personalInfo.headline && (
              <p className={`font-semibold text-indigo-600 mt-0.5 ${isMiniPreview ? 'text-[8px]' : 'text-sm'}`}>
                {personalInfo.headline}
              </p>
            )}
          </div>

          {/* SUMMARY */}
          {summary?.trim() && (
            <section className="resume-section">
              <h2 className={`font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
                {isFresher ? 'CAREER OBJECTIVE' : 'EXECUTIVE SUMMARY'}
              </h2>
              <p className="text-slate-700 leading-relaxed text-justify">{summary}</p>
            </section>
          )}

          {/* EXPERIENCE */}
          {validExp.length > 0 && (
            <section className="resume-section">
              <h2 className={`font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
                PROFESSIONAL EXPERIENCE
              </h2>
              <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                {validExp.map((exp) => (
                  <div key={exp.id} className="resume-entry">
                    <div className="flex justify-between items-baseline">
                      <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                        {exp.role} <span className="font-normal text-slate-600">| {exp.company}</span>
                      </span>
                      <span className={`text-indigo-700 font-medium ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
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
              <h2 className={`font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'}`}>
                FEATURED PROJECTS
              </h2>
              <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                {validProj.map((proj) => (
                  <div key={proj.id} className="resume-entry">
                    <div className="flex justify-between items-baseline">
                      <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                        {proj.title}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <span className={`font-normal text-indigo-600 ml-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                            [{proj.technologies.join(', ')}]
                          </span>
                        )}
                      </span>
                      {proj.link && (
                        <a
                          href={formatUrl(proj.link)}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-indigo-600 hover:underline ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}
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
        </div>
      </div>
    </div>
  );
}
