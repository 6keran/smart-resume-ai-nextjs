'use client';

import React from 'react';
import { ResumeData, ResumeTemplateId } from '@/types/resume';
import { normalizeTemplateId } from '@/lib/templates';
import { ATSClassicTemplate } from './ATSClassicTemplate';
import { ModernProfessionalTemplate } from './ModernProfessionalTemplate';
import { MinimalistTemplate } from './MinimalistTemplate';
import { CorporateExecutiveTemplate } from './CorporateExecutiveTemplate';
import { SoftwareEngineerTemplate } from './SoftwareEngineerTemplate';
import { FreshGraduateTemplate } from './FreshGraduateTemplate';
import { DataAnalystTemplate } from './DataAnalystTemplate';
import { CreativeProfessionalTemplate } from './CreativeProfessionalTemplate';
import { CompactOnePageTemplate } from './CompactOnePageTemplate';
import { AcademicTemplate } from './AcademicTemplate';
import { ExperiencedProfessionalTemplate } from './ExperiencedProfessionalTemplate';
import { ContemporaryTemplate } from './ContemporaryTemplate';
import { ThomasHamptoneTemplate } from './ThomasHamptoneTemplate';
import { NickKoeTemplate } from './NickKoeTemplate';
import { RichardSanchezTemplate } from './RichardSanchezTemplate';
import { OliviaWilsonGridTemplate } from './OliviaWilsonGridTemplate';
import { OliviaWilsonBlushTemplate } from './OliviaWilsonBlushTemplate';

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
    case 'ats-classic':
      return <ATSClassicTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'modern-professional':
      return <ModernProfessionalTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'minimalist':
      return <MinimalistTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'corporate-executive':
      return <CorporateExecutiveTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'software-engineer':
      return <SoftwareEngineerTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'fresh-graduate':
      return <FreshGraduateTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'data-analyst':
      return <DataAnalystTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'creative-professional':
      return <CreativeProfessionalTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'compact-one-page':
      return <CompactOnePageTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'academic':
      return <AcademicTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'experienced-professional':
      return <ExperiencedProfessionalTemplate data={data} isMiniPreview={isMiniPreview} />;
    case 'contemporary':
      return <ContemporaryTemplate data={data} isMiniPreview={isMiniPreview} />;
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
