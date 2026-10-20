'use client';

import React from 'react';
import { ResumeData, ResumeTemplateId } from '@/types/resume';
import { normalizeTemplateId } from '@/lib/templates';
import { ATSClassicTemplate } from './ATSClassicTemplate';
import { SoftwareEngineerTemplate } from './SoftwareEngineerTemplate';
import { FreshGraduateTemplate } from './FreshGraduateTemplate';
import { CorporateExecutiveTemplate } from './CorporateExecutiveTemplate';
import { DataAnalystTemplate } from './DataAnalystTemplate';
import { UIUXDesignerTemplate } from './UIUXDesignerTemplate';
import { FullStackDeveloperTemplate } from './FullStackDeveloperTemplate';
import { InternshipApplicantTemplate } from './InternshipApplicantTemplate';
import { AcademicTemplate } from './AcademicTemplate';
import { SalesMarketingTemplate } from './SalesMarketingTemplate';
import { OperationsManagementTemplate } from './OperationsManagementTemplate';
import { ModernTwoColumnTemplate } from './ModernTwoColumnTemplate';

import dynamic from 'next/dynamic';

// Legacy / Reference components loaded dynamically on demand for backward compatibility
const ModernProfessionalTemplate = dynamic(() => import('./ModernProfessionalTemplate').then((m) => m.ModernProfessionalTemplate));
const MinimalistTemplate = dynamic(() => import('./MinimalistTemplate').then((m) => m.MinimalistTemplate));
const CreativeProfessionalTemplate = dynamic(() => import('./CreativeProfessionalTemplate').then((m) => m.CreativeProfessionalTemplate));
const CompactOnePageTemplate = dynamic(() => import('./CompactOnePageTemplate').then((m) => m.CompactOnePageTemplate));
const ExperiencedProfessionalTemplate = dynamic(() => import('./ExperiencedProfessionalTemplate').then((m) => m.ExperiencedProfessionalTemplate));
const ContemporaryTemplate = dynamic(() => import('./ContemporaryTemplate').then((m) => m.ContemporaryTemplate));
const ThomasHamptoneTemplate = dynamic(() => import('./ThomasHamptoneTemplate').then((m) => m.ThomasHamptoneTemplate));
const NickKoeTemplate = dynamic(() => import('./NickKoeTemplate').then((m) => m.NickKoeTemplate));
const RichardSanchezTemplate = dynamic(() => import('./RichardSanchezTemplate').then((m) => m.RichardSanchezTemplate));
const OliviaWilsonGridTemplate = dynamic(() => import('./OliviaWilsonGridTemplate').then((m) => m.OliviaWilsonGridTemplate));
const OliviaWilsonBlushTemplate = dynamic(() => import('./OliviaWilsonBlushTemplate').then((m) => m.OliviaWilsonBlushTemplate));

export function ResumeRenderer({
  data,
  templateId,
  isMiniPreview = false,
}: {
  data: ResumeData;
  templateId?: ResumeTemplateId;
  isMiniPreview?: boolean;
}) {
  const activeTemplate = normalizeTemplateId(templateId || data.templateId);

  switch (activeTemplate) {
    // 12 Production SaaS Templates
    case 'ats-classic':
      return <ATSClassicTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'software-engineer':
      return <SoftwareEngineerTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'graduate-fresher':
    case 'fresh-graduate':
      return <FreshGraduateTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'executive-professional':
    case 'corporate-executive':
      return <CorporateExecutiveTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'data-analyst':
      return <DataAnalystTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'ui-ux-designer':
      return <UIUXDesignerTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'full-stack-developer':
      return <FullStackDeveloperTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'internship-applicant':
      return <InternshipApplicantTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'academic-research':
    case 'academic':
      return <AcademicTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'sales-marketing':
      return <SalesMarketingTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'operations-management':
      return <OperationsManagementTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'modern-two-column':
    case 'contemporary':
      return <ModernTwoColumnTemplate data={data} isMiniPreview={isMiniPreview} />;

    // Legacy Reference Templates
    case 'modern-professional':
      return <ModernProfessionalTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'minimalist':
      return <MinimalistTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'creative-professional':
      return <CreativeProfessionalTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'compact-one-page':
      return <CompactOnePageTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'experienced-professional':
      return <ExperiencedProfessionalTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'thomas-hamptone':
      return <ThomasHamptoneTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'nick-koe':
      return <NickKoeTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'richard-sanchez':
      return <RichardSanchezTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'olivia-wilson-grid':
      return <OliviaWilsonGridTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'olivia-wilson-blush':
      return <OliviaWilsonBlushTemplate data={data} isMiniPreview={isMiniPreview} />;

    default:
      return <ATSClassicTemplate data={data} isMiniPreview={isMiniPreview} />;
  }
}
