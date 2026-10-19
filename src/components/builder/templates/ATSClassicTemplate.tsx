'use client';

import React from 'react';
import { ResumeData } from '@/types/resume';
import {
  hasContactInfo,
  formatUrl,
  cleanDomain,
  hasSkillsData,
  getTemplateSpacing,
} from './templateUtils';

export function ATSClassicTemplate({
  data,
  isMiniPreview = false,
}: {
  data: ResumeData;
  isMiniPreview?: boolean;
}) {
  const { personalInfo, summary, skills, experience, education, projects, certifications, candidateType } = data;
  const isFresher = candidateType === 'fresher';
  const spacing = getTemplateSpacing(data, isMiniPreview);

  const validExp = (experience || []).filter((e) => e.role?.trim() || e.company?.trim());
  const validEdu = (education || []).filter((e) => e.degree?.trim() || e.institution?.trim());
  const validProj = (projects || []).filter((p) => p.title?.trim());
  const validCerts = (certifications || []).filter((c) => c.name?.trim());

  return (
    <div
      className={`w-full bg-white text-black font-serif select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${
        isMiniPreview ? 'text-[7px] leading-tight' : `text-[13px] sm:text-[13.5px] ${spacing.lineHeight}`
      }`}
      style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
    >
      {/* HEADER: Centered Traditional ATS */}
      <header className={`text-center pb-2 sm:pb-2.5 ${spacing.headerMarginBottom} border-b-2 border-black shrink-0`}>
        <h1
          className={`font-bold tracking-wide uppercase text-black break-words ${
            isMiniPreview ? 'text-[12px]' : 'text-2xl sm:text-[26px]'
          }`}
        >
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>

        {personalInfo.headline && (
          <p className={`italic text-neutral-800 mt-0.5 break-words ${isMiniPreview ? 'text-[8px]' : 'text-sm sm:text-[15px]'}`}>
            {personalInfo.headline}
          </p>
        )}

        {hasContactInfo(personalInfo) && (
          <div
            className={`flex flex-wrap justify-center items-center gap-x-2.5 gap-y-0.5 mt-1.5 text-neutral-800 ${
              isMiniPreview ? 'text-[6.5px]' : 'text-xs sm:text-[12.5px]'
            }`}
          >
            {personalInfo.location && <span className="break-words">{personalInfo.location}</span>}
            {personalInfo.location && (personalInfo.phone || personalInfo.email) && <span>•</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.phone && personalInfo.email && <span>•</span>}
            {personalInfo.email && (
              <a href={`mailto:${personalInfo.email}`} className="text-black hover:underline break-all">
                {personalInfo.email}
              </a>
            )}
            {personalInfo.linkedin && (
              <>
                <span>•</span>
                <a
                  href={formatUrl(personalInfo.linkedin)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-black hover:underline break-all"
                >
                  {cleanDomain(personalInfo.linkedin)}
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
                  className="text-black hover:underline break-all"
                >
                  {cleanDomain(personalInfo.portfolio)}
                </a>
              </>
            )}
          </div>
        )}
      </header>

      {/* BODY SECTIONS */}
      <div className={`${isMiniPreview ? 'space-y-2' : spacing.sectionGap} flex-1`}>
        {/* SUMMARY */}
        {summary?.trim() && (
          <section className="resume-section">
            <h2 className={`font-bold uppercase tracking-wider border-b-2 border-black pb-0.5 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'}`}>
              {isFresher ? 'CAREER OBJECTIVE' : 'PROFESSIONAL SUMMARY'}
            </h2>
            <p className={`text-neutral-900 ${spacing.lineHeight} text-justify break-words [overflow-wrap:anywhere] ${isMiniPreview ? 'text-[6px]' : 'text-[12.5px] sm:text-[13px]'}`}>
              {summary}
            </p>
          </section>
        )}

        {isFresher ? (
          <>
            {/* EDUCATION */}
            {validEdu.length > 0 && (
              <section className="resume-section">
                <h2 className={`font-bold uppercase tracking-wider border-b-2 border-black pb-0.5 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'}`}>
                  EDUCATION & ACADEMIC CREDENTIALS
                </h2>
                <div className={isMiniPreview ? 'space-y-2' : spacing.entryGap}>
                  {validEdu.map((edu) => (
                    <div key={edu.id} className="resume-entry min-w-0">
                      <div className="flex justify-between items-baseline font-bold flex-wrap gap-1">
                        <span className={`break-words ${isMiniPreview ? 'text-[7px]' : 'text-[13.5px] sm:text-[14px]'}`}>{edu.degree || 'Degree Program'}</span>
                        <span className={`text-neutral-800 ${isMiniPreview ? 'text-[5.5px]' : 'text-[12.5px]'}`}>{edu.graduationYear}</span>
                      </div>
                      <div className="flex justify-between items-baseline italic text-neutral-800 flex-wrap gap-1">
                        <span className="break-words text-[12.5px] sm:text-[13px]">{edu.institution}</span>
                        {edu.location && <span className="text-[12px]">{edu.location}</span>}
                      </div>
                      {(edu.gpa || edu.honors) && (
                        <p className={`text-neutral-700 mt-0.5 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                          {edu.gpa && <span>GPA: {edu.gpa}</span>}
                          {edu.gpa && edu.honors && <span> | </span>}
                          {edu.honors && <span>Honors: {edu.honors}</span>}
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
                <h2 className={`font-bold uppercase tracking-wider border-b-2 border-black pb-0.5 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'}`}>
                  AREAS OF EXPERTISE & SKILLS
                </h2>
                <div className={`space-y-1 text-neutral-900 ${spacing.lineHeight} ${isMiniPreview ? 'text-[6px]' : 'text-[12.5px] sm:text-[13px]'}`}>
                  {skills.technical && skills.technical.length > 0 && (
                    <p className="break-words">
                      <strong>Technical Skills: </strong>
                      <span>{skills.technical.join(', ')}</span>
                    </p>
                  )}
                  {skills.tools && skills.tools.length > 0 && (
                    <p className="break-words">
                      <strong>Tools & Frameworks: </strong>
                      <span>{skills.tools.join(', ')}</span>
                    </p>
                  )}
                  {skills.soft && skills.soft.length > 0 && (
                    <p className="break-words">
                      <strong>Professional Competencies: </strong>
                      <span>{skills.soft.join(', ')}</span>
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* ACADEMIC PROJECTS */}
            {validProj.length > 0 && (
              <section className="resume-section">
                <h2 className={`font-bold uppercase tracking-wider border-b-2 border-black pb-0.5 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'}`}>
                  ACADEMIC & CAPSTONE PROJECTS
                </h2>
                <div className={isMiniPreview ? 'space-y-2' : spacing.entryGap}>
                  {validProj.map((proj) => (
                    <div key={proj.id} className="resume-entry min-w-0">
                      <div className="flex justify-between items-baseline font-bold flex-wrap gap-1">
                        <span className={`break-words ${isMiniPreview ? 'text-[7px]' : 'text-[13.5px] sm:text-[14px]'}`}>
                          {proj.title}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className="font-normal italic ml-1">
                              ({proj.technologies.join(', ')})
                            </span>
                          )}
                        </span>
                        {proj.link && (
                          <a
                            href={formatUrl(proj.link)}
                            target="_blank"
                            rel="noreferrer"
                            className={`font-normal hover:underline break-all ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}
                          >
                            {cleanDomain(proj.link)}
                          </a>
                        )}
                      </div>
                      {proj.description && (
                        <p className={`text-neutral-800 mt-0.5 ${spacing.lineHeight} break-words [overflow-wrap:anywhere] ${isMiniPreview ? 'text-[5.5px]' : 'text-[12.5px] sm:text-[13px]'}`}>
                          {proj.description}
                        </p>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <ul className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-neutral-800 ${spacing.lineHeight} ${isMiniPreview ? 'text-[5px]' : 'text-[12.5px] sm:text-[13px]'}`}>
                          {proj.bullets.map((b, i) => (
                            <li key={i} className="break-words [overflow-wrap:anywhere]">{b}</li>
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
                <h2 className={`font-bold uppercase tracking-wider border-b-2 border-black pb-0.5 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'}`}>
                  INTERNSHIPS & PRACTICAL EXPERIENCE
                </h2>
                <div className={isMiniPreview ? 'space-y-2' : spacing.entryGap}>
                  {validExp.map((exp) => (
                    <div key={exp.id} className="resume-entry min-w-0">
                      <div className="flex justify-between items-baseline font-bold flex-wrap gap-1">
                        <span className={`break-words ${isMiniPreview ? 'text-[7px]' : 'text-[13.5px] sm:text-[14px]'}`}>
                          {exp.role} - <span className="font-normal italic">{exp.company}</span>
                        </span>
                        <span className={`text-neutral-800 ${isMiniPreview ? 'text-[5.5px]' : 'text-[12.5px]'}`}>
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      {exp.location && (
                        <p className={`italic text-neutral-700 mt-0.5 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>{exp.location}</p>
                      )}
                      {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                        <ul className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-neutral-900 ${spacing.lineHeight} ${isMiniPreview ? 'text-[5px]' : 'text-[12.5px] sm:text-[13px]'}`}>
                          {exp.bulletPoints.map((bp, i) => (
                            <li key={i} className="break-words [overflow-wrap:anywhere]">{bp}</li>
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
                <h2 className={`font-bold uppercase tracking-wider border-b-2 border-black pb-1 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[14.5px] sm:text-[15px]'}`}>
                  CORE COMPETENCIES & TECHNICAL SKILLS
                </h2>
                <div className={`space-y-2 text-neutral-900 ${spacing.lineHeight} ${isMiniPreview ? 'text-[6px]' : 'text-[14px]'}`}>
                  {skills.technical && skills.technical.length > 0 && (
                    <p className="break-words">
                      <strong>Technical Skills: </strong>
                      <span>{skills.technical.join(', ')}</span>
                    </p>
                  )}
                  {skills.tools && skills.tools.length > 0 && (
                    <p className="break-words">
                      <strong>Tools & Technologies: </strong>
                      <span>{skills.tools.join(', ')}</span>
                    </p>
                  )}
                  {skills.soft && skills.soft.length > 0 && (
                    <p className="break-words">
                      <strong>Leadership & Management: </strong>
                      <span>{skills.soft.join(', ')}</span>
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* PROFESSIONAL EXPERIENCE */}
            {validExp.length > 0 && (
              <section className="resume-section">
                <h2 className={`font-bold uppercase tracking-wider border-b-2 border-black pb-0.5 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'}`}>
                  PROFESSIONAL EXPERIENCE
                </h2>
                <div className={isMiniPreview ? 'space-y-2' : spacing.entryGap}>
                  {validExp.map((exp) => (
                    <div key={exp.id} className="resume-entry min-w-0">
                      <div className="flex justify-between items-baseline font-bold flex-wrap gap-1">
                        <span className={`break-words ${isMiniPreview ? 'text-[7px]' : 'text-[13.5px] sm:text-[14px]'}`}>
                          {exp.role} | <span className="font-normal italic">{exp.company}</span>
                        </span>
                        <span className={`text-neutral-800 ${isMiniPreview ? 'text-[5.5px]' : 'text-[12.5px]'}`}>
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      {exp.location && (
                        <p className={`italic text-neutral-700 mt-0.5 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>{exp.location}</p>
                      )}
                      {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                        <ul className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-neutral-900 ${spacing.lineHeight} ${isMiniPreview ? 'text-[5px]' : 'text-[12.5px] sm:text-[13px]'}`}>
                          {exp.bulletPoints.map((bp, i) => (
                            <li key={i} className="break-words [overflow-wrap:anywhere]">{bp}</li>
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
                <h2 className={`font-bold uppercase tracking-wider border-b-2 border-black pb-0.5 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'}`}>
                  KEY PROJECTS & ARCHITECTURE
                </h2>
                <div className={isMiniPreview ? 'space-y-2' : spacing.entryGap}>
                  {validProj.map((proj) => (
                    <div key={proj.id} className="resume-entry min-w-0">
                      <div className="flex justify-between items-baseline font-bold flex-wrap gap-1">
                        <span className={`break-words ${isMiniPreview ? 'text-[7px]' : 'text-[13.5px] sm:text-[14px]'}`}>
                          {proj.title}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className="font-normal italic ml-1">
                              [{proj.technologies.join(', ')}]
                            </span>
                          )}
                        </span>
                        {proj.link && (
                          <a
                            href={formatUrl(proj.link)}
                            target="_blank"
                            rel="noreferrer"
                            className={`font-normal hover:underline break-all ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}
                          >
                            {cleanDomain(proj.link)}
                          </a>
                        )}
                      </div>
                      {proj.description && (
                        <p className={`text-neutral-800 mt-0.5 ${spacing.lineHeight} break-words [overflow-wrap:anywhere] ${isMiniPreview ? 'text-[5.5px]' : 'text-[12.5px] sm:text-[13px]'}`}>
                          {proj.description}
                        </p>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <ul className={`list-disc list-outside ml-4 mt-0.5 ${spacing.bulletGap} text-neutral-800 ${spacing.lineHeight} ${isMiniPreview ? 'text-[5px]' : 'text-[12.5px] sm:text-[13px]'}`}>
                          {proj.bullets.map((b, i) => (
                            <li key={i} className="break-words [overflow-wrap:anywhere]">{b}</li>
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
                <h2 className={`font-bold uppercase tracking-wider border-b-2 border-black pb-0.5 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7px]' : 'text-[13.5px] sm:text-[14px]'}`}>
                  EDUCATION
                </h2>
                <div className={isMiniPreview ? 'space-y-2' : spacing.entryGap}>
                  {validEdu.map((edu) => (
                    <div key={edu.id} className="resume-entry min-w-0">
                      <div className="flex justify-between items-baseline font-bold flex-wrap gap-1">
                        <span className={`break-words ${isMiniPreview ? 'text-[7px]' : 'text-[13.5px] sm:text-[14px]'}`}>{edu.degree}</span>
                        <span className={`text-neutral-800 ${isMiniPreview ? 'text-[5.5px]' : 'text-[12.5px]'}`}>{edu.graduationYear}</span>
                      </div>
                      <div className="flex justify-between items-baseline italic text-neutral-800 flex-wrap gap-1">
                        <span className="break-words text-[12.5px] sm:text-[13px]">{edu.institution}</span>
                        {edu.location && <span className="text-[12px]">{edu.location}</span>}
                      </div>
                      {(edu.gpa || edu.honors) && (
                        <p className={`text-neutral-700 mt-0.5 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                          {edu.gpa && <span>GPA: {edu.gpa}</span>}
                          {edu.gpa && edu.honors && <span> | </span>}
                          {edu.honors && <span>Honors: {edu.honors}</span>}
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
            <h2 className={`font-bold uppercase tracking-wider border-b-2 border-black pb-0.5 ${spacing.headingMarginBottom} ${isMiniPreview ? 'text-[7.5px]' : 'text-[13.5px] sm:text-[14px]'}`}>
              CERTIFICATIONS & CREDENTIALS
            </h2>
            <div className={isMiniPreview ? 'space-y-1.5' : spacing.entryGap}>
              {validCerts.map((cert) => (
                <div key={cert.id} className="flex justify-between items-baseline text-neutral-900 resume-entry flex-wrap gap-1 py-0.5">
                  <span className="break-words text-[12.5px] sm:text-[13px]">
                    <strong>{cert.name}</strong> - {cert.issuer}
                    {cert.credentialId && (
                      <span className={`text-neutral-600 ml-1 ${isMiniPreview ? 'text-[5px]' : 'text-[12px]'}`}>
                        (ID: {cert.credentialId})
                      </span>
                    )}
                  </span>
                  <span className={`text-neutral-800 ${isMiniPreview ? 'text-[5.5px]' : 'text-[12.5px]'}`}>{cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
