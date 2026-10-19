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
import { Mail, Phone, MapPin, Globe, ArrowUpRight } from 'lucide-react';

export function NickKoeTemplate({
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

  const hardSkills = [...(skills?.technical || []), ...(skills?.tools || [])];
  const softSkills = skills?.soft || [];

  return (
    <div
      className={`w-full bg-white text-neutral-800 select-text leading-normal flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      {/* HEADER: Nick Koe Top Section with Teal Accent Block + Aligned Contact Stack */}
      <header className={`border-b border-neutral-300 pb-4 ${isMiniPreview ? "pb-2 mb-2" : spacing.headerMarginBottom}`}>
        <div className="flex justify-between items-start gap-4">
          {/* Top Left: Teal block + Name + Subtitle + Summary */}
          <div className="flex-1">
            <div className="flex items-start gap-3">
              {/* Deep Teal Accent Block matching reference */}
              <div
                className={`bg-[#135274] shrink-0 mt-0.5 ${
                  isMiniPreview ? 'w-2 h-4' : 'w-4 h-8'
                }`}
              />
              <div>
                <h1
                  className={`font-semibold text-neutral-900 tracking-tight leading-tight ${
                    isMiniPreview ? 'text-[11px]' : 'text-2xl sm:text-3xl'
                  }`}
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {personalInfo.fullName || 'Nick Koe'}
                </h1>
                <p
                  className={`font-medium text-[#2a9d8f] tracking-wide mt-0.5 ${
                    isMiniPreview ? 'text-[6.5px]' : 'text-sm'
                  }`}
                >
                  {personalInfo.headline || 'Event Photographer'}
                </p>
              </div>
            </div>

            {/* Summary right under name matching reference */}
            {summary && (
              <p
                className={`text-neutral-600 leading-relaxed mt-2.5 max-w-xl ${
                  isMiniPreview ? 'text-[5.5px] mt-1' : 'text-[13px]'
                }`}
              >
                {summary}
              </p>
            )}
          </div>

          {/* Top Right: Aligned Contact Stack with right-hand icons */}
          {hasContactInfo(personalInfo) && (
            <div
              className={`shrink-0 text-right space-y-1.5 text-neutral-600 ${
                isMiniPreview ? 'text-[5.5px] space-y-0.5' : 'text-[12.5px]'
              }`}
            >
              {personalInfo.email && (
                <div className="flex items-center justify-end gap-1.5">
                  <a href={`mailto:${personalInfo.email}`} className="hover:text-black">
                    {personalInfo.email}
                  </a>
                  <Mail className={`text-[#135274] shrink-0 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center justify-end gap-1.5">
                  <span>{personalInfo.phone}</span>
                  <Phone className={`text-[#135274] shrink-0 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center justify-end gap-1.5">
                  <span>{personalInfo.location}</span>
                  <MapPin className={`text-[#135274] shrink-0 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                </div>
              )}
              {personalInfo.portfolio && (
                <div className="flex items-center justify-end gap-1.5">
                  <a
                    href={formatUrl(personalInfo.portfolio)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black"
                  >
                    {cleanDomain(personalInfo.portfolio)}
                  </a>
                  <Globe className={`text-[#135274] shrink-0 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center justify-end gap-1.5">
                  <a
                    href={formatUrl(personalInfo.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black"
                  >
                    {cleanDomain(personalInfo.linkedin)}
                  </a>
                  <LinkedinIcon className={`text-[#135274] shrink-0 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* TWO COLUMNS */}
      <div className="grid grid-cols-12 gap-5 sm:gap-6 flex-1">
        {/* LEFT COLUMN: ~58% (EXPERIENCE, PROJECTS, EDUCATION) */}
        <div className={`col-span-7 ${isMiniPreview ? "space-y-2" : spacing.sectionGap}`}>
          {/* IF FRESHER: PROJECTS FIRST, THEN EXPERIENCE, THEN EDUCATION */}
          {isFresher ? (
            <>
              {/* PORTFOLIO / PROJECTS */}
              {validProj.length > 0 && (
                <section className="resume-section">
                  <h2
                    className={`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 ${
                      isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'
                    }`}
                  >
                    PORTFOLIO & PROJECTS
                  </h2>
                  <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                    {validProj.map((proj) => (
                      <div key={proj.id} className="relative pl-4 resume-entry">
                        <div
                          className={`absolute left-0 top-1 bg-[#2a9d8f] ${
                            isMiniPreview ? 'w-1.5 h-3' : 'w-2 h-4'
                          }`}
                        />
                        <div className={`flex items-center gap-1 font-semibold text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[13px] sm:text-[13.5px]'}`}>
                          <span>{proj.title}</span>
                          {proj.link && (
                            <a
                              href={formatUrl(proj.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2a9d8f] hover:underline"
                            >
                              <ArrowUpRight className={`inline ${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'}`} />
                            </a>
                          )}
                        </div>
                        {proj.description && (
                          <p className={`text-neutral-600 leading-snug mt-0.5 ${isMiniPreview ? 'text-[5.5px]' : 'text-[12px] sm:text-[12.5px]'}`}>
                            {proj.description}
                          </p>
                        )}
                        {proj.bullets && proj.bullets.length > 0 && (
                          <ul className={`space-y-0.5 mt-0.5 text-neutral-600 ${isMiniPreview ? 'text-[5px]' : 'text-[11.5px] sm:text-[12px]'}`}>
                            {proj.bullets.map((b, bIdx) => (
                              <li key={bIdx} className="flex items-start gap-1">
                                <span className="text-[#2a9d8f]">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* WORK EXPERIENCE */}
              {validExp.length > 0 && (
                <section className="resume-section">
                  <h2
                    className={`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 ${
                      isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'
                    }`}
                  >
                    WORK EXPERIENCE
                  </h2>
                  <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                    {validExp.map((exp) => (
                      <div key={exp.id} className="relative pl-4 resume-entry">
                        <div
                          className={`absolute left-0 top-1 bg-[#2a9d8f] ${
                            isMiniPreview ? 'w-1.5 h-3' : 'w-2 h-4'
                          }`}
                        />
                        <div>
                          <h3
                            className={`font-semibold text-neutral-900 leading-snug ${
                              isMiniPreview ? 'text-[7px]' : 'text-[13px] sm:text-[13.5px]'
                            }`}
                          >
                            {exp.role}
                          </h3>
                          <div className={`flex items-center gap-1 text-neutral-700 font-medium mt-0.5 mb-0.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px] sm:text-[12.5px]'}`}>
                            <span>{exp.company}</span>
                            <ArrowUpRight className={`text-[#2a9d8f] ${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'}`} />
                          </div>
                          <p
                            className={`text-[#2a9d8f] font-medium mb-1 ${
                              isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px]'
                            }`}
                          >
                            {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                            {exp.location ? ` | ${exp.location}` : ''}
                          </p>
                          {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                            <ul className={`space-y-0.5 text-neutral-600 ${isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px] sm:text-[12px]'}`}>
                              {exp.bulletPoints.map((bp, bIdx) => (
                                <li key={bIdx} className="flex items-start gap-1 leading-snug">
                                  <span className="text-[#2a9d8f] mt-0.5">•</span>
                                  <span>{bp}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <>
              {/* WORK EXPERIENCE */}
              {validExp.length > 0 && (
                <section className="resume-section">
                  <h2
                    className={`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 ${
                      isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'
                    }`}
                  >
                    WORK EXPERIENCE
                  </h2>
                  <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                    {validExp.map((exp) => (
                      <div key={exp.id} className="relative pl-4 resume-entry">
                        <div
                          className={`absolute left-0 top-1 bg-[#2a9d8f] ${
                            isMiniPreview ? 'w-1.5 h-3' : 'w-2 h-4'
                          }`}
                        />
                        <div>
                          <h3
                            className={`font-semibold text-neutral-900 leading-snug ${
                              isMiniPreview ? 'text-[7px]' : 'text-[13px] sm:text-[13.5px]'
                            }`}
                          >
                            {exp.role}
                          </h3>
                          <div className={`flex items-center gap-1 text-neutral-700 font-medium mt-0.5 mb-0.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px] sm:text-[12.5px]'}`}>
                            <span>{exp.company}</span>
                            <ArrowUpRight className={`text-[#2a9d8f] ${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'}`} />
                          </div>
                          <p
                            className={`text-[#2a9d8f] font-medium mb-1 ${
                              isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px]'
                            }`}
                          >
                            {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                            {exp.location ? ` | ${exp.location}` : ''}
                          </p>
                          {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                            <ul className={`space-y-0.5 text-neutral-600 ${isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px] sm:text-[12px]'}`}>
                              {exp.bulletPoints.map((bp, bIdx) => (
                                <li key={bIdx} className="flex items-start gap-1 leading-snug">
                                  <span className="text-[#2a9d8f] mt-0.5">•</span>
                                  <span>{bp}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* PORTFOLIO / PROJECTS */}
              {validProj.length > 0 && (
                <section className="resume-section">
                  <h2
                    className={`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 ${
                      isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'
                    }`}
                  >
                    PORTFOLIO & PROJECTS
                  </h2>
                  <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                    {validProj.map((proj) => (
                      <div key={proj.id} className="relative pl-4 resume-entry">
                        <div
                          className={`absolute left-0 top-1 bg-[#2a9d8f] ${
                            isMiniPreview ? 'w-1.5 h-3' : 'w-2 h-4'
                          }`}
                        />
                        <div className={`flex items-center gap-1 font-semibold text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[13px] sm:text-[13.5px]'}`}>
                          <span>{proj.title}</span>
                          {proj.link && (
                            <a
                              href={formatUrl(proj.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2a9d8f] hover:underline"
                            >
                              <ArrowUpRight className={`inline ${isMiniPreview ? 'w-2 h-2' : 'w-3 h-3'}`} />
                            </a>
                          )}
                        </div>
                        {proj.description && (
                          <p className={`text-neutral-600 leading-snug mt-0.5 ${isMiniPreview ? 'text-[5.5px]' : 'text-[12px] sm:text-[12.5px]'}`}>
                            {proj.description}
                          </p>
                        )}
                        {proj.bullets && proj.bullets.length > 0 && (
                          <ul className={`space-y-0.5 mt-0.5 text-neutral-600 ${isMiniPreview ? 'text-[5px]' : 'text-[11.5px] sm:text-[12px]'}`}>
                            {proj.bullets.map((b, bIdx) => (
                              <li key={bIdx} className="flex items-start gap-1">
                                <span className="text-[#2a9d8f]">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* EDUCATION */}
          {validEdu.length > 0 && (
            <section className="resume-section">
              <h2
                className={`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 ${
                  isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'
                }`}
              >
                EDUCATION
              </h2>
              <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                {validEdu.map((edu) => (
                  <div key={edu.id} className="relative pl-4 resume-entry">
                    {/* Teal indicator */}
                    <div
                      className={`absolute left-0 top-1 bg-[#2a9d8f] ${
                        isMiniPreview ? 'w-1.5 h-3' : 'w-2 h-4'
                      }`}
                    />
                    <h3 className={`font-semibold text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[13px] sm:text-[13.5px]'}`}>
                      {edu.degree}
                    </h3>
                    <p className={`text-neutral-700 ${isMiniPreview ? 'text-[6px]' : 'text-[12px] sm:text-[12.5px]'}`}>
                      {edu.institution}
                    </p>
                    <p className={`text-[#2a9d8f] font-medium ${isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px]'}`}>
                      {edu.graduationYear}
                      {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: ~42% (HARD SKILLS PILLS, SOFT SKILLS PILLS, CERTIFICATES) */}
        <div className={`col-span-5 ${isMiniPreview ? "space-y-2" : spacing.sectionGap}`}>
          {/* HARD SKILLS */}
          {hardSkills.length > 0 && (
            <section className="resume-section">
              <h2
                className={`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 ${
                  isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'
                }`}
              >
                HARD SKILLS
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {hardSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className={`bg-[#135274] text-white font-medium rounded tracking-wide ${
                      isMiniPreview ? 'text-[5px] px-1 py-0.2' : 'text-[11.5px] px-2 py-0.5'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* SOFT SKILLS */}
          {softSkills.length > 0 && (
            <section className="resume-section">
              <h2
                className={`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 ${
                  isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'
                }`}
              >
                SOFT SKILLS
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {softSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className={`bg-[#135274] text-white font-medium rounded tracking-wide ${
                      isMiniPreview ? 'text-[5px] px-1 py-0.2' : 'text-[11.5px] px-2 py-0.5'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* CERTIFICATES */}
          {validCerts.length > 0 && (
            <section className="resume-section">
              <h2
                className={`font-bold uppercase tracking-wider text-neutral-900 pb-0.5 mb-2 ${
                  isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'
                }`}
              >
                CERTIFICATES
              </h2>
              <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                {validCerts.map((cert) => (
                  <div key={cert.id} className="text-neutral-700 resume-entry">
                    <p className={`font-semibold text-neutral-800 ${isMiniPreview ? 'text-[6px]' : 'text-[12.5px]'}`}>
                      {cert.name} {cert.date ? `– ${cert.date}` : ''}
                    </p>
                    <p className={`text-neutral-500 ${isMiniPreview ? 'text-[5px]' : 'text-[11.5px]'}`}>
                      {cert.issuer}
                    </p>
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
