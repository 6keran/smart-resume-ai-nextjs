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
  LinkedinIcon,
  getTemplateSpacing,
} from './templateUtils';
import { Mail, Phone, MapPin, Globe, Home } from 'lucide-react';

export function ThomasHamptoneTemplate({
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

  // Split name for two-line editorial header if two or more words
  const nameParts = (personalInfo.fullName || 'THOMAS HAMPTONE').trim().split(/\s+/);
  const firstName = nameParts[0] || 'THOMAS';
  const lastName = nameParts.slice(1).join(' ') || 'HAMPTONE';

  // Get all skills in flat list
  const allSkills = [
    ...(skills?.technical || []),
    ...(skills?.tools || []),
    ...(skills?.soft || []),
  ];

  return (
    <div
      className={`w-full bg-white text-neutral-800 select-text leading-normal flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}
      style={{ fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif' }}
    >
      {/* HEADER: Editorial Serif Name + Headline + Top-Right Circular Photo */}
      <header className={`flex justify-between items-center border-b border-neutral-300 pb-3 sm:pb-3.5 ${isMiniPreview ? "pb-2 mb-2" : spacing.headerMarginBottom}`}>
        <div className="flex-1 pr-4">
          <p
            className={`font-sans uppercase tracking-[0.25em] text-neutral-500 font-semibold mb-1 ${
              isMiniPreview ? 'text-[6px]' : 'text-xs'
            }`}
          >
            {personalInfo.headline || 'PROJECT MANAGER'}
          </p>
          <h1
            className={`font-serif tracking-wider uppercase text-neutral-900 leading-tight font-normal ${
              isMiniPreview ? 'text-[12px]' : 'text-2xl sm:text-[28px]'
            }`}
            style={{ letterSpacing: '0.08em' }}
          >
            <span className="block">{firstName}</span>
            {lastName && <span className="block">{lastName}</span>}
          </h1>
        </div>

        {/* Circular Portrait Avatar matching reference */}
        <div className="shrink-0">
          <div
            className={`rounded-full overflow-hidden border border-neutral-300 shadow-sm bg-neutral-100 flex items-center justify-center ${
              isMiniPreview ? 'w-10 h-10' : 'w-20 h-20 sm:w-22 sm:h-22'
            }`}
          >
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300 text-neutral-600">
              <span className={`font-serif font-semibold tracking-wider ${isMiniPreview ? 'text-[10px]' : 'text-xl'}`}>
                {firstName[0]}{lastName ? lastName[0] : ''}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* TWO-COLUMN BODY DIVIDED BY VERTICAL HAIRLINE */}
      <div className="grid grid-cols-12 gap-0 flex-1">
        {/* LEFT COLUMN: ~34% (CONTACT, SKILLS, LANGUAGES/CERTS) */}
        <div className={`col-span-4 pr-5 sm:pr-6 border-r border-neutral-200 ${isMiniPreview ? "pr-2 space-y-2" : spacing.sectionGap}`}>
          {/* CONTACT */}
          {hasContactInfo(personalInfo) && (
            <section className="resume-section">
              <h2
                className={`font-serif font-bold uppercase tracking-[0.2em] text-neutral-900 pb-1 mb-2.5 ${
                  isMiniPreview ? 'text-[7px]' : 'text-[14px]'
                }`}
              >
                CONTACT
              </h2>
              <div className={`space-y-2 font-sans text-neutral-600 ${isMiniPreview ? 'space-y-1 text-[6px]' : 'text-[12.5px]'}`}>
                {personalInfo.location && (
                  <div className="flex items-start gap-2">
                    <Home className={`shrink-0 text-neutral-500 mt-0.5 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                    <span className="break-words">{personalInfo.location}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className={`shrink-0 text-neutral-500 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className={`shrink-0 text-neutral-500 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                    <a href={`mailto:${personalInfo.email}`} className="break-all hover:text-black">
                      {personalInfo.email}
                    </a>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center gap-2">
                    <LinkedinIcon className={`shrink-0 text-neutral-500 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                    <a
                      href={formatUrl(personalInfo.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all hover:text-black"
                    >
                      {cleanDomain(personalInfo.linkedin)}
                    </a>
                  </div>
                )}
                {personalInfo.portfolio && (
                  <div className="flex items-center gap-2">
                    <Globe className={`shrink-0 text-neutral-500 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                    <a
                      href={formatUrl(personalInfo.portfolio)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all hover:text-black"
                    >
                      {cleanDomain(personalInfo.portfolio)}
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* DIVIDER */}
          {allSkills.length > 0 && <div className="border-b border-neutral-200 my-4" />}

          {/* SKILLS */}
          {allSkills.length > 0 && (
            <section className="resume-section">
              <h2
                className={`font-serif font-bold uppercase tracking-[0.2em] text-neutral-900 pb-1 mb-2.5 ${
                  isMiniPreview ? 'text-[7px]' : 'text-[14px]'
                }`}
              >
                SKILLS
              </h2>
              <ul className={`space-y-1.5 font-sans text-neutral-700 ${isMiniPreview ? 'space-y-0.5 text-[6px]' : 'text-[12.5px]'}`}>
                {allSkills.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* DIVIDER */}
          {validCerts.length > 0 && <div className="border-b border-neutral-200 my-4" />}

          {/* CERTIFICATIONS / LANGUAGES */}
          {validCerts.length > 0 && (
            <section className="mb-4 resume-section">
              <h2
                className={`font-serif font-bold uppercase tracking-[0.2em] text-neutral-900 pb-1 mb-2.5 ${
                  isMiniPreview ? 'text-[7px]' : 'text-[14px]'
                }`}
              >
                CERTIFICATIONS
              </h2>
              <ul className={`space-y-2 font-sans text-neutral-700 ${isMiniPreview ? 'space-y-0.5 text-[6px]' : 'text-[12.5px]'}`}>
                {validCerts.map((c) => (
                  <li key={c.id} className="flex items-start gap-1.5 resume-entry">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    <div>
                      <p className="font-semibold text-neutral-800">{c.name}</p>
                      <p className={`text-neutral-500 ${isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px]'}`}>{c.issuer} {c.date ? `| ${c.date}` : ''}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: ~66% (SUMMARY, EXPERIENCE, EDUCATION, PROJECTS) */}
        <div className={`col-span-8 pl-5 sm:pl-6 ${isMiniPreview ? "pl-2 space-y-2" : spacing.sectionGap}`}>
          {/* SUMMARY */}
          {summary && (
            <section className="resume-section">
              <h2
                className={`font-serif font-bold uppercase tracking-[0.2em] text-neutral-900 pb-1 mb-2 ${
                  isMiniPreview ? 'text-[7px]' : 'text-[14px]'
                }`}
              >
                SUMMARY
              </h2>
              <p className={`font-sans text-neutral-600 leading-relaxed ${isMiniPreview ? 'text-[6px]' : 'text-[13px]'}`}>
                {summary}
              </p>
            </section>
          )}

          {/* DIVIDER */}
          {(validExp.length > 0 || validProj.length > 0) && summary && <div className="border-b border-neutral-200 my-4" />}

          {/* WORK EXPERIENCE */}
          {validExp.length > 0 && (
            <section className="resume-section">
              <h2
                className={`font-serif font-bold uppercase tracking-[0.2em] text-neutral-900 pb-1 mb-3 ${
                  isMiniPreview ? 'text-[7px]' : 'text-[14px]'
                }`}
              >
                WORK EXPERIENCE
              </h2>
              <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                {validExp.map((exp) => (
                  <div key={exp.id} className="font-sans resume-entry">
                    <h3 className={`font-bold uppercase tracking-wide text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {exp.role}
                    </h3>
                    <p className={`text-neutral-700 font-semibold mt-0.5 mb-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12.5px]'}`}>
                      <span>{exp.company}</span>
                      {exp.location && <span> . {exp.location}</span>}
                      {(exp.startDate || exp.endDate) && (
                        <span className="text-neutral-500 font-normal">
                          {' '}. | {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      )}
                    </p>
                    {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                      <ul className={`space-y-1 text-neutral-600 ${isMiniPreview ? 'text-[5.5px]' : 'text-[13px]'}`}>
                        {exp.bulletPoints.map((bp, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-neutral-400 mt-0.5">•</span>
                            <span>{bp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* DIVIDER */}
          {validEdu.length > 0 && (validExp.length > 0 || summary) && <div className="border-b border-neutral-200 my-4" />}

          {/* EDUCATION */}
          {validEdu.length > 0 && (
            <section className="resume-section">
              <h2
                className={`font-serif font-bold uppercase tracking-[0.2em] text-neutral-900 pb-1 mb-3 ${
                  isMiniPreview ? 'text-[7px]' : 'text-[14px]'
                }`}
              >
                EDUCATION
              </h2>
              <div className="space-y-3 font-sans">
                {validEdu.map((edu) => (
                  <div key={edu.id} className="resume-entry">
                    <h3 className={`font-bold uppercase tracking-wide text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                      {edu.degree}
                    </h3>
                    <p className={`text-neutral-600 mt-0.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12.5px]'}`}>
                      <span>{edu.institution}</span>
                      {edu.location && <span> . {edu.location}</span>}
                      {edu.graduationYear && <span> . | {edu.graduationYear}</span>}
                    </p>
                    {edu.gpa && (
                      <p className={`text-neutral-500 italic mt-0.5 ${isMiniPreview ? 'text-[5.5px]' : 'text-[12px]'}`}>
                        GPA: {edu.gpa}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PROJECTS */}
          {validProj.length > 0 && (
            <>
              <div className="border-b border-neutral-200 my-4" />
              <section className="mb-4 resume-section">
                <h2
                  className={`font-serif font-bold uppercase tracking-[0.2em] text-neutral-900 pb-1 mb-3 ${
                    isMiniPreview ? 'text-[7px]' : 'text-[14px]'
                  }`}
                >
                  PROJECTS
                </h2>
                <div className="space-y-3 font-sans">
                  {validProj.map((proj) => (
                    <div key={proj.id} className="resume-entry">
                      <h3 className={`font-bold uppercase tracking-wide text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                        {proj.title}
                      </h3>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <p className={`text-neutral-500 mb-1 ${isMiniPreview ? 'text-[5.5px]' : 'text-[12px]'}`}>
                          Tech: {proj.technologies.join(', ')}
                        </p>
                      )}
                      <p className={`text-neutral-600 leading-relaxed ${isMiniPreview ? 'text-[6px]' : 'text-[13px]'}`}>
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
