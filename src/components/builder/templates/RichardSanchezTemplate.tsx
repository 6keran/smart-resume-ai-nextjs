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
import { Mail, Phone, MapPin, Globe, User, Briefcase, GraduationCap, Award } from 'lucide-react';

export function RichardSanchezTemplate({
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

  const allSkills = [
    ...(skills?.technical || []),
    ...(skills?.tools || []),
    ...(skills?.soft || []),
  ];

  const nameParts = (personalInfo.fullName || 'RICHARD SANCHEZ').trim().split(/\s+/);
  const initials = `${nameParts[0]?.[0] || 'R'}${nameParts[1]?.[0] || 'S'}`;

  return (
    <div
      className={`w-full bg-white text-neutral-800 select-text leading-normal flex flex-col flex-1 min-h-full ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      {/* 1. DEEP NAVY FULL-WIDTH TOP HEADER BANNER */}
      <div
        className={`bg-[#2c3442] text-white relative flex items-center justify-between px-8 sm:px-10 ${
          isMiniPreview ? 'h-14 px-4' : 'h-28 sm:h-32'
        }`}
      >
        {/* Placeholder spacer for the avatar circle overlapping */}
        <div className={isMiniPreview ? 'w-12' : 'w-28 sm:w-32'} />

        {/* Name and Title aligned to the right/center right */}
        <div className="text-right flex-1 pl-4">
          <h1
            className={`font-bold tracking-wider uppercase text-white leading-tight ${
              isMiniPreview ? 'text-[12px]' : 'text-2xl sm:text-3xl'
            }`}
          >
            {personalInfo.fullName || 'RICHARD SANCHEZ'}
          </h1>
          <p
            className={`tracking-[0.25em] uppercase text-neutral-300 font-medium mt-1 ${
              isMiniPreview ? 'text-[6px]' : 'text-[13px]'
            }`}
          >
            {personalInfo.headline || 'MARKETING MANAGER'}
          </p>
        </div>
      </div>

      {/* 2. MAIN BODY: LEFT GREY SIDEBAR + RIGHT CONNECTED TIMELINE */}
      <div className="grid grid-cols-12 flex-1 relative min-h-[750px]">
        {/* CIRCULAR AVATAR OVERLAPPING NAVY HEADER & GREY SIDEBAR */}
        <div
          className={`absolute z-10 ${
            isMiniPreview
              ? 'left-4 -top-7 w-12 h-12'
              : 'left-8 sm:left-10 -top-14 sm:-top-16 w-24 h-24 sm:w-28 sm:h-28'
          }`}
        >
          <div className="w-full h-full rounded-full bg-white p-1 shadow-md">
            <div className="w-full h-full rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center text-neutral-700 font-bold overflow-hidden">
              <span className={isMiniPreview ? 'text-[10px]' : 'text-xl'}>
                {initials}
              </span>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN: ~32% Cool Grey Background */}
        <div
          className={`col-span-4 bg-[#ededed] text-neutral-800 border-r border-neutral-300 ${
            isMiniPreview ? 'p-3 pt-8' : 'p-6 sm:p-8 pt-16 sm:pt-20'
          }`}
        >
          {/* CONTACT */}
          {hasContactInfo(personalInfo) && (
            <section className="mb-6 resume-section">
              <h2
                className={`font-bold uppercase tracking-widest text-neutral-900 pb-1 mb-2 border-b border-neutral-400 ${
                  isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'
                }`}
              >
                CONTACT
              </h2>
              <div className={`space-y-2 text-neutral-700 ${isMiniPreview ? 'space-y-1 text-[6px]' : 'text-[12.5px]'}`}>
                {personalInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className={`shrink-0 text-neutral-800 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className={`shrink-0 text-neutral-800 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                    <a href={`mailto:${personalInfo.email}`} className="break-all hover:text-black">
                      {personalInfo.email}
                    </a>
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className={`shrink-0 text-neutral-800 mt-0.5 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
                    <span className="break-words">{personalInfo.location}</span>
                  </div>
                )}
                {personalInfo.portfolio && (
                  <div className="flex items-center gap-2">
                    <Globe className={`shrink-0 text-neutral-800 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
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
                {personalInfo.linkedin && (
                  <div className="flex items-center gap-2">
                    <LinkedinIcon className={`shrink-0 text-neutral-800 ${isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'}`} />
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
              </div>
            </section>
          )}

          {/* SKILLS */}
          {allSkills.length > 0 && (
            <section className="mb-6 resume-section">
              <h2
                className={`font-bold uppercase tracking-widest text-neutral-900 pb-1 mb-2 border-b border-neutral-400 ${
                  isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'
                }`}
              >
                SKILLS
              </h2>
              <ul className={`space-y-1.5 text-neutral-700 ${isMiniPreview ? 'space-y-0.5 text-[6px]' : 'text-[12.5px]'}`}>
                {allSkills.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-neutral-500">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* LANGUAGES / CERTIFICATIONS */}
          {validCerts.length > 0 && (
            <section className="mb-6 resume-section">
              <h2
                className={`font-bold uppercase tracking-widest text-neutral-900 pb-1 mb-2 border-b border-neutral-400 ${
                  isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'
                }`}
              >
                CERTIFICATES
              </h2>
              <ul className={`space-y-2 text-neutral-700 ${isMiniPreview ? 'space-y-1 text-[6px]' : 'text-[12.5px]'}`}>
                {validCerts.map((c) => (
                  <li key={c.id} className="resume-entry">
                    <p className="font-semibold text-neutral-900">• {c.name}</p>
                    <p className={`text-neutral-500 pl-2 ${isMiniPreview ? 'text-[5.5px]' : 'text-[11.5px]'}`}>{c.issuer} {c.date ? `(${c.date})` : ''}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* REFERENCES PLACEHOLDER */}
          <section className="resume-section">
            <h2
              className={`font-bold uppercase tracking-widest text-neutral-900 pb-1 mb-2 border-b border-neutral-400 ${
                isMiniPreview ? 'text-[7.5px]' : 'text-[14px]'
              }`}
            >
              REFERENCES
            </h2>
            <p className={`italic text-neutral-600 ${isMiniPreview ? 'text-[5.5px]' : 'text-[12px]'}`}>
              Available upon request
            </p>
          </section>
        </div>

        {/* RIGHT COLUMN: ~68% White Background with ICON-CONNECTED VERTICAL TIMELINE */}
        <div
          className={`col-span-8 bg-white text-neutral-800 ${
            isMiniPreview ? 'p-3 pl-4' : 'p-6 sm:p-8 pl-8 sm:pl-10'
          }`}
        >
          <div className={`relative pl-6 sm:pl-8 border-l-2 border-neutral-300 flex-1 ${isMiniPreview ? "space-y-2" : spacing.sectionGap}`}>
            {/* TIMELINE SECTION 1: PROFILE / SUMMARY */}
            {summary && (
              <div className="relative resume-section">
                {/* Node icon on vertical line */}
                <div
                  className={`absolute rounded-full bg-[#2c3442] text-white flex items-center justify-center -left-[31px] sm:-left-[41px] top-0 ${
                    isMiniPreview ? 'w-4 h-4 -left-[27px]' : 'w-6 h-6'
                  }`}
                >
                  <User className={isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} />
                </div>

                <div className="border-b border-neutral-300 pb-1 mb-2.5">
                  <h2
                    className={`font-bold uppercase tracking-widest text-neutral-900 ${
                      isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'
                    }`}
                  >
                    PROFILE
                  </h2>
                </div>

                <p className={`text-neutral-600 leading-relaxed ${isMiniPreview ? 'text-[6px]' : 'text-[13px]'}`}>
                  {summary}
                </p>
              </div>
            )}

            {/* TIMELINE SECTION 2: WORK EXPERIENCE */}
            {validExp.length > 0 && (
              <div className="relative resume-section">
                {/* Node icon on vertical line */}
                <div
                  className={`absolute rounded-full bg-[#2c3442] text-white flex items-center justify-center -left-[31px] sm:-left-[41px] top-0 ${
                    isMiniPreview ? 'w-4 h-4 -left-[27px]' : 'w-6 h-6'
                  }`}
                >
                  <Briefcase className={isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} />
                </div>

                <div className="border-b border-neutral-300 pb-1 mb-3">
                  <h2
                    className={`font-bold uppercase tracking-widest text-neutral-900 ${
                      isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'
                    }`}
                  >
                    WORK EXPERIENCE
                  </h2>
                </div>

                <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                  {validExp.map((exp) => (
                    <div key={exp.id} className="relative resume-entry">
                      {/* Small hollow circle node on timeline for individual role */}
                      <div
                        className={`absolute w-2 h-2 rounded-full border-2 border-[#2c3442] bg-white -left-[29px] sm:-left-[37px] top-1.5 ${
                          isMiniPreview ? '-left-[27px] w-1.5 h-1.5' : ''
                        }`}
                      />

                      <div className="flex justify-between items-baseline">
                        <h3 className={`font-bold text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                          {exp.company}
                        </h3>
                        <span className={`text-neutral-500 font-medium ${isMiniPreview ? 'text-[5.5px]' : 'text-[12px]'}`}>
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>

                      <p className={`text-neutral-700 italic mt-0.5 mb-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[13px]'}`}>
                        {exp.role} {exp.location ? `| ${exp.location}` : ''}
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
              </div>
            )}

            {/* TIMELINE SECTION 3: EDUCATION */}
            {validEdu.length > 0 && (
              <div className="relative resume-section">
                {/* Node icon on vertical line */}
                <div
                  className={`absolute rounded-full bg-[#2c3442] text-white flex items-center justify-center -left-[31px] sm:-left-[41px] top-0 ${
                    isMiniPreview ? 'w-4 h-4 -left-[27px]' : 'w-6 h-6'
                  }`}
                >
                  <GraduationCap className={isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} />
                </div>

                <div className="border-b border-neutral-300 pb-1 mb-3">
                  <h2
                    className={`font-bold uppercase tracking-widest text-neutral-900 ${
                      isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'
                    }`}
                  >
                    EDUCATION
                  </h2>
                </div>

                <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                  {validEdu.map((edu) => (
                    <div key={edu.id} className="relative resume-entry">
                      {/* Timeline circle node */}
                      <div
                        className={`absolute w-2 h-2 rounded-full border-2 border-[#2c3442] bg-white -left-[29px] sm:-left-[37px] top-1.5 ${
                          isMiniPreview ? '-left-[27px] w-1.5 h-1.5' : ''
                        }`}
                      />

                      <div className="flex justify-between items-baseline">
                        <h3 className={`font-bold text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                          {edu.degree}
                        </h3>
                        <span className={`text-neutral-500 font-medium ${isMiniPreview ? 'text-[5.5px]' : 'text-[12px]'}`}>
                          {edu.graduationYear}
                        </span>
                      </div>

                      <p className={`text-neutral-700 ${isMiniPreview ? 'text-[6px]' : 'text-[12.5px]'}`}>
                        {edu.institution} {edu.location ? `| ${edu.location}` : ''}
                      </p>
                      {edu.gpa && (
                        <p className={`text-neutral-500 font-medium ${isMiniPreview ? 'text-[5.5px]' : 'text-[12px]'}`}>
                          GPA: {edu.gpa}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TIMELINE SECTION 4: PROJECTS (if any) */}
            {validProj.length > 0 && (
              <div className="relative resume-section">
                <div
                  className={`absolute rounded-full bg-[#2c3442] text-white flex items-center justify-center -left-[31px] sm:-left-[41px] top-0 ${
                    isMiniPreview ? 'w-4 h-4 -left-[27px]' : 'w-6 h-6'
                  }`}
                >
                  <Award className={isMiniPreview ? 'w-2 h-2' : 'w-3.5 h-3.5'} />
                </div>

                <div className="border-b border-neutral-300 pb-1 mb-3">
                  <h2
                    className={`font-bold uppercase tracking-widest text-neutral-900 ${
                      isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px]'
                    }`}
                  >
                    PROJECTS
                  </h2>
                </div>

                <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                  {validProj.map((proj) => (
                    <div key={proj.id} className="relative resume-entry">
                      <div
                        className={`absolute w-2 h-2 rounded-full border-2 border-[#2c3442] bg-white -left-[29px] sm:-left-[37px] top-1.5 ${
                          isMiniPreview ? '-left-[27px] w-1.5 h-1.5' : ''
                        }`}
                      />
                      <h3 className={`font-bold text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                        {proj.title}
                      </h3>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <p className={`text-neutral-500 text-[12px] ${isMiniPreview ? 'text-[5.5px]' : ''}`}>
                          {proj.technologies.join(', ')}
                        </p>
                      )}
                      <p className={`text-neutral-600 mt-0.5 leading-relaxed ${isMiniPreview ? 'text-[5.5px]' : 'text-[13px]'}`}>
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
