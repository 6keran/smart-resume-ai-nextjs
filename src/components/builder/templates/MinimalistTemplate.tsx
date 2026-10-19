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

export function MinimalistTemplate({
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
      className={`w-full bg-white text-neutral-800 font-sans select-text flex-1 flex flex-col min-h-full ${spacing.containerPadding} ${isMiniPreview ? "text-[7px] leading-tight" : `text-[13px] ${spacing.lineHeight}`}`}
    >
      {/* HEADER: Ultra Clean & Minimal */}
      <header className={`shrink-0 ${spacing.headerMarginBottom}`}>
        <div className="w-12 h-0.5 bg-neutral-300 mb-3" />
        <h1
          className={`font-light tracking-wider uppercase text-neutral-900 ${
            isMiniPreview ? 'text-[13px]' : 'text-3xl'
          }`}
        >
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        {personalInfo.headline && (
          <p className={`font-normal text-neutral-500 tracking-wide mt-0.5 ${isMiniPreview ? 'text-[7.5px]' : 'text-sm'}`}>
            {personalInfo.headline}
          </p>
        )}

        {hasContactInfo(personalInfo) && (
          <div
            className={`flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-2 text-neutral-500 ${
              isMiniPreview ? 'text-[6px]' : 'text-[12.5px]'
            }`}
          >
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.location && personalInfo.phone && <span>·</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.phone && personalInfo.email && <span>·</span>}
            {personalInfo.email && (
              <a href={`mailto:${personalInfo.email}`} className="hover:text-black">
                {personalInfo.email}
              </a>
            )}
            {personalInfo.linkedin && (
              <>
                <span>·</span>
                <a
                  href={formatUrl(personalInfo.linkedin)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-black"
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
                  className="hover:text-black"
                >
                  {cleanDomain(personalInfo.github)}
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
                  className="hover:text-black"
                >
                  {cleanDomain(personalInfo.portfolio)}
                </a>
              </>
            )}
          </div>
        )}
        <div className="w-12 h-0.5 bg-neutral-300 mt-3" />
      </header>

      {/* BODY SECTIONS */}
      <div className={`${isMiniPreview ? "space-y-2" : spacing.sectionGap} flex-1`}>
        {summary?.trim() && (
          <section className="resume-section">
            <h2 className={`font-semibold tracking-widest uppercase text-neutral-500 ${spacing.headingMarginBottom} ${isMiniPreview ? "text-[7.5px]" : "text-[14px]"}`}>
              {isFresher ? 'Profile' : 'Summary'}
            </h2>
            <p className="text-neutral-700 leading-relaxed font-normal">{summary}</p>
          </section>
        )}

        {isFresher ? (
          <>
            {/* EDUCATION */}
            {validEdu.length > 0 && (
              <section className="resume-section">
                <h2 className={`font-semibold tracking-widest uppercase text-neutral-500 ${spacing.headingMarginBottom} ${isMiniPreview ? "text-[7.5px]" : "text-[14px]"}`}>
                  Education
                </h2>
                <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                  {validEdu.map((edu) => (
                    <div key={edu.id} className="resume-entry">
                      <div className="flex justify-between items-baseline">
                        <span className={`font-medium text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>{edu.degree}</span>
                        <span className={`text-neutral-400 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{edu.graduationYear}</span>
                      </div>
                      <div className={`flex justify-between items-baseline text-neutral-600 ${isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'}`}>
                        <span>{edu.institution}</span>
                        {edu.location && <span>{edu.location}</span>}
                      </div>
                      {(edu.gpa || edu.honors) && (
                        <p className={`text-neutral-500 mt-0.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                          {edu.gpa && <span>GPA: {edu.gpa}</span>}
                          {edu.gpa && edu.honors && <span> · </span>}
                          {edu.honors && <span>{edu.honors}</span>}
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
                <h2 className={`font-semibold tracking-widest uppercase text-neutral-500 ${spacing.headingMarginBottom} ${isMiniPreview ? "text-[7.5px]" : "text-[14px]"}`}>
                  Skills
                </h2>
                <div className={`${spacing.bulletGap} text-neutral-700 ${spacing.lineHeight}`}>
                  {skills.technical && skills.technical.length > 0 && (
                    <p>
                      <span className="text-neutral-900 font-medium">Technical: </span>
                      <span>{skills.technical.join(' · ')}</span>
                    </p>
                  )}
                  {skills.tools && skills.tools.length > 0 && (
                    <p>
                      <span className="text-neutral-900 font-medium">Tools: </span>
                      <span>{skills.tools.join(' · ')}</span>
                    </p>
                  )}
                  {skills.soft && skills.soft.length > 0 && (
                    <p>
                      <span className="text-neutral-900 font-medium">Competencies: </span>
                      <span>{skills.soft.join(' · ')}</span>
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* PROJECTS */}
            {validProj.length > 0 && (
              <section className="resume-section">
                <h2 className={`font-semibold tracking-widest uppercase text-neutral-500 ${spacing.headingMarginBottom} ${isMiniPreview ? "text-[7.5px]" : "text-[14px]"}`}>
                  Projects
                </h2>
                <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                  {validProj.map((proj) => (
                    <div key={proj.id} className="resume-entry">
                      <div className="flex justify-between items-baseline">
                        <span className={`font-medium text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                          {proj.title}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className={`text-neutral-500 font-normal ml-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                              ({proj.technologies.join(', ')})
                            </span>
                          )}
                        </span>
                        {proj.link && (
                          <a
                            href={formatUrl(proj.link)}
                            target="_blank"
                            rel="noreferrer"
                            className={`text-neutral-400 hover:text-black ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}
                          >
                            {cleanDomain(proj.link)}
                          </a>
                        )}
                      </div>
                      {proj.description && (
                        <p className="text-neutral-600 mt-0.5 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-neutral-600 leading-relaxed">
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

            {/* INTERNSHIPS / EXP */}
            {validExp.length > 0 && (
              <section className="resume-section">
                <h2 className={`font-semibold tracking-widest uppercase text-neutral-500 ${spacing.headingMarginBottom} ${isMiniPreview ? "text-[7.5px]" : "text-[14px]"}`}>
                  Experience
                </h2>
                <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                  {validExp.map((exp) => (
                    <div key={exp.id} className="resume-entry">
                      <div className="flex justify-between items-baseline">
                        <span className={`font-medium text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                          {exp.role} <span className="text-neutral-500 font-normal">/ {exp.company}</span>
                        </span>
                        <span className={`text-neutral-400 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                        <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-neutral-600 leading-relaxed">
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
                <h2 className={`font-semibold tracking-widest uppercase text-neutral-500 ${spacing.headingMarginBottom} ${isMiniPreview ? "text-[7.5px]" : "text-[14px]"}`}>
                  Skills
                </h2>
                <div className={`${spacing.bulletGap} text-neutral-700 ${spacing.lineHeight}`}>
                  {skills.technical && skills.technical.length > 0 && (
                    <p>
                      <span className="text-neutral-900 font-medium">Core Stack: </span>
                      <span>{skills.technical.join(' · ')}</span>
                    </p>
                  )}
                  {skills.tools && skills.tools.length > 0 && (
                    <p>
                      <span className="text-neutral-900 font-medium">Tooling: </span>
                      <span>{skills.tools.join(' · ')}</span>
                    </p>
                  )}
                  {skills.soft && skills.soft.length > 0 && (
                    <p>
                      <span className="text-neutral-900 font-medium">Strengths: </span>
                      <span>{skills.soft.join(' · ')}</span>
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* EXPERIENCE */}
            {validExp.length > 0 && (
              <section className="resume-section">
                <h2 className={`font-semibold tracking-widest uppercase text-neutral-500 ${spacing.headingMarginBottom} ${isMiniPreview ? "text-[7.5px]" : "text-[14px]"}`}>
                  Experience
                </h2>
                <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                  {validExp.map((exp) => (
                    <div key={exp.id} className="resume-entry">
                      <div className="flex justify-between items-baseline">
                        <span className={`font-medium text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                          {exp.role} <span className="text-neutral-500 font-normal">/ {exp.company}</span>
                        </span>
                        <span className={`text-neutral-400 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                        <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-neutral-600 leading-relaxed">
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
                <h2 className={`font-semibold tracking-widest uppercase text-neutral-500 ${spacing.headingMarginBottom} ${isMiniPreview ? "text-[7.5px]" : "text-[14px]"}`}>
                  Projects
                </h2>
                <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                  {validProj.map((proj) => (
                    <div key={proj.id} className="resume-entry">
                      <div className="flex justify-between items-baseline">
                        <span className={`font-medium text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>
                          {proj.title}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className={`text-neutral-500 font-normal ml-1.5 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>
                              [{proj.technologies.join(', ')}]
                            </span>
                          )}
                        </span>
                        {proj.link && (
                          <a
                            href={formatUrl(proj.link)}
                            target="_blank"
                            rel="noreferrer"
                            className={`text-neutral-400 hover:text-black ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}
                          >
                            {cleanDomain(proj.link)}
                          </a>
                        )}
                      </div>
                      {proj.description && (
                        <p className="text-neutral-600 mt-0.5 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                      {proj.bullets && proj.bullets.length > 0 && (
                        <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-neutral-600 leading-relaxed">
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
                <h2 className={`font-semibold tracking-widest uppercase text-neutral-500 ${spacing.headingMarginBottom} ${isMiniPreview ? "text-[7.5px]" : "text-[14px]"}`}>
                  Education
                </h2>
                <div className={isMiniPreview ? "space-y-1.5" : spacing.entryGap}>
                  {validEdu.map((edu) => (
                    <div key={edu.id} className="resume-entry">
                      <div className="flex justify-between items-baseline">
                        <span className={`font-medium text-neutral-900 ${isMiniPreview ? 'text-[7px]' : 'text-[14px]'}`}>{edu.degree}</span>
                        <span className={`text-neutral-400 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{edu.graduationYear}</span>
                      </div>
                      <div className={`flex justify-between items-baseline text-neutral-600 ${isMiniPreview ? 'text-[6.5px]' : 'text-[12.5px]'}`}>
                        <span>{edu.institution}</span>
                        {edu.location && <span>{edu.location}</span>}
                      </div>
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
            <h2 className={`font-semibold tracking-widest uppercase text-neutral-500 ${spacing.headingMarginBottom} ${isMiniPreview ? "text-[7.5px]" : "text-[14px]"}`}>
              Certifications
            </h2>
            <div className={`${spacing.bulletGap} text-neutral-700 ${spacing.lineHeight}`}>
              {validCerts.map((cert) => (
                <div key={cert.id} className="resume-entry flex justify-between items-baseline">
                  <span>
                    <span className="text-neutral-900 font-medium">{cert.name}</span> · {cert.issuer}
                  </span>
                  <span className={`text-neutral-400 ${isMiniPreview ? 'text-[6px]' : 'text-[12px]'}`}>{cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
