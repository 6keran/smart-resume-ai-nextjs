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

export function ModernProfessionalTemplate({
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
      <header className={`pb-3.5 ${spacing.headerMarginBottom} border-b border-slate-200 shrink-0`}>
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h1
              className={`font-extrabold tracking-tight text-slate-900 ${
                isMiniPreview ? 'text-[13px]' : 'text-3xl'
              }`}
            >
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            {personalInfo.headline && (
              <p className={`font-semibold text-indigo-700 mt-0.5 ${isMiniPreview ? 'text-[8px]' : 'text-sm'}`}>
                {personalInfo.headline}
              </p>
            )}
          </div>
        </div>

        {hasContactInfo(personalInfo) && (
          <div
            className={`flex flex-wrap items-center gap-x-3.5 gap-y-1 mt-2 text-slate-600 ${
              isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'
            }`}
          >
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                <Mail className={`text-indigo-600 shrink-0 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                <a href={`mailto:${personalInfo.email}`} className="hover:text-indigo-600">
                  {personalInfo.email}
                </a>
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                <Phone className={`text-indigo-600 shrink-0 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                <span>{personalInfo.phone}</span>
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1">
                <MapPin className={`text-indigo-600 shrink-0 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                <span>{personalInfo.location}</span>
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1">
                <Link2 className={`text-indigo-600 shrink-0 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                <a
                  href={formatUrl(personalInfo.linkedin)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600"
                >
                  {cleanDomain(personalInfo.linkedin)}
                </a>
              </span>
            )}
            {personalInfo.github && (
              <span className="flex items-center gap-1">
                <Code2 className={`text-indigo-600 shrink-0 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                <a
                  href={formatUrl(personalInfo.github)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600"
                >
                  {cleanDomain(personalInfo.github)}
                </a>
              </span>
            )}
            {personalInfo.portfolio && (
              <span className="flex items-center gap-1">
                <Globe className={`text-indigo-600 shrink-0 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                <a
                  href={formatUrl(personalInfo.portfolio)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600"
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
            <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-l-4 border-indigo-600 bg-slate-50 pl-3 py-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
              {isFresher ? 'CAREER OBJECTIVE' : 'EXECUTIVE SUMMARY'}
            </h2>
            <p className="text-slate-700 leading-relaxed text-justify px-0.5">{summary}</p>
          </section>
        )}

        {isFresher ? (
          <>
            {/* EDUCATION */}
            {validEdu.length > 0 && (
              <section className="resume-section">
                <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-l-4 border-indigo-600 bg-slate-50 pl-3 py-1 ${spacing.headingMarginBottom}.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
                  EDUCATION & ACADEMIC CREDENTIALS
                </h2>
                <div className={`${isMiniPreview ? "space-y-1.5" : spacing.entryGap} px-0.5`}>
                  {validEdu.map((edu) => (
                    <div key={edu.id} className="resume-entry">
                      <div className="flex justify-between items-baseline">
                        <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>{edu.degree}</span>
                        <span className={`font-medium text-indigo-700 ${isMiniPreview ? 'text-[5.5px]' : 'text-[12px]'}`}>{edu.graduationYear}</span>
                      </div>
                      <div className={`flex justify-between items-baseline text-slate-600 ${isMiniPreview ? 'text-[5px]' : 'text-[12.5px]'}`}>
                        <span>{edu.institution}</span>
                        {edu.location && <span>{edu.location}</span>}
                      </div>
                      {(edu.gpa || edu.honors) && (
                        <p className={`text-slate-600 mt-0.5 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                          {edu.gpa && <span className="font-semibold text-slate-700">GPA: {edu.gpa}</span>}
                          {edu.gpa && edu.honors && <span> · </span>}
                          {edu.honors && <span className="text-emerald-700 font-medium">{edu.honors}</span>}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SKILLS */}
            {hasSkillsData(skills) && (
              <section className="resume-section">
                <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-l-4 border-indigo-600 bg-slate-50 pl-3 py-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
                  SKILLS & EXPERTISE
                </h2>
                <div className="space-y-1 px-0.5 text-slate-700">
                  {skills.technical && skills.technical.length > 0 && (
                    <p>
                      <strong className="text-slate-900">Technical Proficiencies: </strong>
                      <span>{skills.technical.join(' · ')}</span>
                    </p>
                  )}
                  {skills.tools && skills.tools.length > 0 && (
                    <p>
                      <strong className="text-slate-900">Tools & Frameworks: </strong>
                      <span>{skills.tools.join(' · ')}</span>
                    </p>
                  )}
                  {skills.soft && skills.soft.length > 0 && (
                    <p>
                      <strong className="text-slate-900">Core Competencies: </strong>
                      <span>{skills.soft.join(' · ')}</span>
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* PROJECTS */}
            {validProj.length > 0 && (
              <section className="resume-section">
                <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-l-4 border-indigo-600 bg-slate-50 pl-3 py-1 ${spacing.headingMarginBottom}.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
                  FEATURED PROJECTS & CODE
                </h2>
                <div className={`${isMiniPreview ? "space-y-1.5" : spacing.entryGap} px-0.5`}>
                  {validProj.map((proj) => (
                    <div key={proj.id} className="resume-entry">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900">
                          <span className={isMiniPreview ? 'text-[7px]' : 'text-[14px]'}>{proj.title}</span>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className={`font-medium text-indigo-700 ml-1.5 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                              ({proj.technologies.join(', ')})
                            </span>
                          )}
                        </span>
                        {proj.link && (
                          <a
                            href={formatUrl(proj.link)}
                            target="_blank"
                            rel="noreferrer"
                            className={`text-indigo-600 hover:underline ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}
                          >
                            {cleanDomain(proj.link)}
                          </a>
                        )}
                      </div>
                      {proj.description && (
                        <p className={`text-slate-700 mt-0.5 leading-relaxed ${isMiniPreview ? 'text-[5.5px]' : 'text-[13px]'}`}>
                          {proj.description}
                        </p>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <ul className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed ${isMiniPreview ? 'text-[5px]' : 'text-[13px]'}`}>
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

            {/* INTERNSHIPS / EXPERIENCE */}
            {validExp.length > 0 && (
              <section className="resume-section">
                <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-l-4 border-indigo-600 bg-slate-50 pl-3 py-1 ${spacing.headingMarginBottom}.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
                  PRACTICAL EXPERIENCE
                </h2>
                <div className={`${isMiniPreview ? "space-y-1.5" : spacing.entryGap} px-0.5`}>
                  {validExp.map((exp) => (
                    <div key={exp.id} className="resume-entry">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900">
                          <span className={isMiniPreview ? 'text-[7px]' : 'text-[14px]'}>{exp.role}</span> <span className="font-normal text-slate-600">| {exp.company}</span>
                        </span>
                        <span className={`text-slate-500 font-medium ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      {exp.location && (
                        <p className={`text-slate-500 italic ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>{exp.location}</p>
                      )}
                      {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                        <ul className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed ${isMiniPreview ? 'text-[5px]' : 'text-[13px]'}`}>
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
          </>
        ) : (
          <>
            {/* SKILLS */}
            {hasSkillsData(skills) && (
              <section className="resume-section">
                <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-l-4 border-indigo-600 bg-slate-50 pl-3 py-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
                  CORE COMPETENCIES & TECHNICAL STACK
                </h2>
                <div className="space-y-1 px-0.5 text-slate-700">
                  {skills.technical && skills.technical.length > 0 && (
                    <p>
                      <strong className="text-slate-900">Core Technologies: </strong>
                      <span>{skills.technical.join(' · ')}</span>
                    </p>
                  )}
                  {skills.tools && skills.tools.length > 0 && (
                    <p>
                      <strong className="text-slate-900">Tools & Architecture: </strong>
                      <span>{skills.tools.join(' · ')}</span>
                    </p>
                  )}
                  {skills.soft && skills.soft.length > 0 && (
                    <p>
                      <strong className="text-slate-900">Professional Leadership: </strong>
                      <span>{skills.soft.join(' · ')}</span>
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* EXPERIENCE */}
            {validExp.length > 0 && (
              <section className="resume-section">
                <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-l-4 border-indigo-600 bg-slate-50 pl-3 py-1 ${spacing.headingMarginBottom}.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
                  PROFESSIONAL EXPERIENCE
                </h2>
                <div className={`${isMiniPreview ? "space-y-1.5" : spacing.entryGap} px-0.5`}>
                  {validExp.map((exp) => (
                    <div key={exp.id} className="resume-entry">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900">
                          <span className={isMiniPreview ? 'text-[7px]' : 'text-[14px]'}>{exp.role}</span> <span className="font-normal text-slate-600">| {exp.company}</span>
                        </span>
                        <span className={`text-slate-500 font-medium ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      {exp.location && (
                        <p className={`text-slate-500 italic ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>{exp.location}</p>
                      )}
                      {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                        <ul className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed ${isMiniPreview ? 'text-[5px]' : 'text-[13px]'}`}>
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
                <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-l-4 border-indigo-600 bg-slate-50 pl-3 py-1 ${spacing.headingMarginBottom}.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
                  NOTABLE PROJECTS & INITIATIVES
                </h2>
                <div className={`${isMiniPreview ? "space-y-1.5" : spacing.entryGap} px-0.5`}>
                  {validProj.map((proj) => (
                    <div key={proj.id} className="resume-entry">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900">
                          <span className={isMiniPreview ? 'text-[7px]' : 'text-[14px]'}>{proj.title}</span>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className={`font-medium text-indigo-700 ml-1.5 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                              [{proj.technologies.join(', ')}]
                            </span>
                          )}
                        </span>
                        {proj.link && (
                          <a
                            href={formatUrl(proj.link)}
                            target="_blank"
                            rel="noreferrer"
                            className={`text-indigo-600 hover:underline ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}
                          >
                            {cleanDomain(proj.link)}
                          </a>
                        )}
                      </div>
                      {proj.description && (
                        <p className={`text-slate-700 mt-0.5 leading-relaxed ${isMiniPreview ? 'text-[5.5px]' : 'text-[13px]'}`}>
                          {proj.description}
                        </p>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <ul className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-slate-700 ${spacing.lineHeight} leading-relaxed ${isMiniPreview ? 'text-[5px]' : 'text-[13px]'}`}>
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
                <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-l-4 border-indigo-600 bg-slate-50 pl-3 py-1 ${spacing.headingMarginBottom}.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
                  EDUCATION
                </h2>
                <div className={`${isMiniPreview ? "space-y-1.5" : spacing.entryGap} px-0.5`}>
                  {validEdu.map((edu) => (
                    <div key={edu.id} className="resume-entry">
                      <div className="flex justify-between items-baseline">
                        <span className={`font-bold text-slate-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>{edu.degree}</span>
                        <span className={`font-medium text-indigo-700 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>{edu.graduationYear}</span>
                      </div>
                      <div className={`flex justify-between items-baseline text-slate-600 ${isMiniPreview ? 'text-[5px]' : 'text-[12.5px]'}`}>
                        <span>{edu.institution}</span>
                        {edu.location && <span>{edu.location}</span>}
                      </div>
                      {(edu.gpa || edu.honors) && (
                        <p className={`text-slate-600 mt-0.5 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                          {edu.gpa && <span>GPA: {edu.gpa}</span>}
                          {edu.gpa && edu.honors && <span> · </span>}
                          {edu.honors && <span className="text-emerald-700 font-medium">{edu.honors}</span>}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* CERTIFICATIONS */}
        {validCerts.length > 0 && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider text-slate-900 border-l-4 border-indigo-600 bg-slate-50 pl-3 py-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'}`}>
              LICENSES & CERTIFICATIONS
            </h2>
            <div className="space-y-1 px-0.5">
              {validCerts.map((cert) => (
                <div key={cert.id} className="flex justify-between items-baseline text-slate-800 resume-entry">
                  <span>
                    <strong className="text-slate-900">{cert.name}</strong> · {cert.issuer}
                    {cert.credentialId && (
                      <span className={`text-slate-500 ml-1 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>({cert.credentialId})</span>
                    )}
                  </span>
                  <span className={`text-slate-500 font-medium ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>{cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
