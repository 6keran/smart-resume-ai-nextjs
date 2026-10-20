import 'server-only';
import {
  ResumeValidationResult,
  ResumeValidationStatus,
  ResumeValidationReasonCode,
  ResumeValidationSignals,
} from '@/types/resume';

export interface ValidationOptions {
  fileName?: string;
  allowUncertainOverride?: boolean;
}

// -------------------------------------------------------------
// REGEX DEFINITIONS & PATTERNS
// -------------------------------------------------------------

// Contact Info Patterns
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b(?:\+91[-\s]?)?[6-9]\d{9}\b|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/;
const PROFILE_REGEX = /\b(?:linkedin\.com\/in\/[a-zA-Z0-9_\-]+|github\.com\/[a-zA-Z0-9_\-]+|gitlab\.com\/[a-zA-Z0-9_\-]+|behance\.net\/[a-zA-Z0-9_\-]+|dribbble\.com\/[a-zA-Z0-9_\-]+|portfolio|personal\s+website)\b/i;

// Resume Section Headers
const SECTION_SUMMARY_REGEX = /^(?:[#*_\s-]*)(?:professional\s+summary|executive\s+summary|career\s+summary|personal\s+statement|profile\s+summary|about\s+me|career\s+objective|summary|objective)(?:[:\s\-*#_]*)$/im;
const SECTION_EXPERIENCE_REGEX = /^(?:[#*_\s-]*)(?:work\s+experience|professional\s+experience|employment\s+history|career\s+history|work\s+history|relevant\s+experience|internships?(?:\s+experience)?|experience)(?:[:\s\-*#_]*)$/im;
const SECTION_EDUCATION_REGEX = /^(?:[#*_\s-]*)(?:education(?:al\s+background)?|academic\s+background|academic\s+qualifications|educational\s+history|academic\s+history|qualifications)(?:[:\s\-*#_]*)$/im;
const SECTION_SKILLS_REGEX = /^(?:[#*_\s-]*)(?:technical\s+skills|core\s+competencies|key\s+skills|skills\s*(?:&|and)\s*(?:abilities|tools|competencies)|areas\s+of\s+expertise|proficiencies|technologies|skills)(?:[:\s\-*#_]*)$/im;
const SECTION_PROJECTS_REGEX = /^(?:[#*_\s-]*)(?:projects|key\s+projects|academic\s+projects|personal\s+projects|technical\s+projects|selected\s+projects|notable\s+projects)(?:[:\s\-*#_]*)$/im;
const SECTION_CERTIFICATIONS_REGEX = /^(?:[#*_\s-]*)(?:certifications?|licenses?(?:\s*(?:&|and)\s*certifications?)?|professional\s+certifications?)(?:[:\s\-*#_]*)$/im;
const SECTION_ACADEMIC_REGEX = /^(?:[#*_\s-]*)(?:publications|peer-reviewed\s+publications|research\s+experience|teaching\s+experience|presentations|conference\s+proceedings|grants\s*(?:&|and)\s*fellowships)(?:[:\s\-*#_]*)$/im;

// Chronology Patterns
const DATE_RANGE_REGEX = /\b(?:(?:19|20)\d{2}\s*[-–—to\/]+\s*(?:(?:19|20)\d{2}|present|current|ongoing)|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:19|20)\d{2}\s*[-–—to\/]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:19|20)\d{2}|present|current)|(?:0[1-9]|1[0-2])\/(?:19|20)\d{2}\s*[-–—to\/]+\s*(?:(?:0[1-9]|1[0-2])\/(?:19|20)\d{2}|present))\b/i;
const YEAR_REGEX = /\b(?:19|20)\d{2}\b/;

// Degree Keywords
const DEGREE_REGEX = /\b(?:B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|Ph\.?D\.?|B\.?Tech\.?|M\.?Tech\.?|B\.?E\.?|M\.?E\.?|BCA|MCA|BBA|MBA|Bachelor|Master|Doctorate|Diploma|Associate|Dean'?s\s+List|CGPA|GPA|Major\s+in)\b/i;

// Action Verbs
const ACTION_VERBS = [
  'developed', 'built', 'led', 'architected', 'engineered', 'implemented', 'designed',
  'created', 'spearheaded', 'managed', 'organized', 'researched', 'analyzed', 'collaborated',
  'contributed', 'supervised', 'maintained', 'optimized', 'delivered', 'accelerated', 'launched',
  'streamlined', 'conducted', 'authored', 'established', 'formulated', 'executed'
];

// Role Titles
const ROLE_TITLES = [
  'engineer', 'developer', 'manager', 'intern', 'analyst', 'consultant', 'specialist',
  'lead', 'architect', 'designer', 'researcher', 'coordinator', 'associate', 'director',
  'administrator', 'scientist', 'assistant', 'officer', 'student', 'graduate'
];

// Negative Indicator Patterns: Non-Resumes
const INVOICE_PATTERNS = [
  /\b(?:tax\s+invoice|commercial\s+invoice|proforma\s+invoice)\b/i,
  /\b(?:invoice\s+(?:no|num|number|#|date|id))\b/i,
  /\b(?:bill\s+to|sold\s+to|billed\s+to|client\s+name\s*[:\-]|customer\s+id)\b/i,
  /\b(?:subtotal|total\s+amount|amount\s+due|balance\s+due|payment\s+due|total\s+due)\b/i,
  /\b(?:payment\s+terms|payment\s+method|due\s+date\s*[:\-])\b/i,
  /\b(?:gstin|vat\s+registration|pan\s+number|remit\s+to|bank\s+transfer\s+details)\b/i,
  /\b(?:unit\s+price|qty|quantity|line\s+total|shipping\s+address)\b/i,
];

const ASSIGNMENT_PATTERNS = [
  /\b(?:assignment\s+(?:#|\d+|one|two|three|iv|v)|homework\s+(?:#|\d+)|problem\s+set)\b/i,
  /\b(?:course\s+(?:name|code|title)\s*[:\-]|instructor\s*[:\-]|professor\s*[:\-])\b/i,
  /\b(?:submitted\s+(?:by|to)\s*[:\-]|submission\s+date\s*[:\-])\b/i,
  /\b(?:question\s+\d+\s*[:\-]|problem\s+\d+\s*[:\-]|exercise\s+\d+\s*[:\-])\b/i,
  /\b(?:grading\s+rubric|maximum\s+marks|total\s+marks\s*[:\-]|academic\s+integrity\s+pledge)\b/i,
  /\b(?:solution\s+to\s+question|proof\s*[:\-]|theorem\s+\d+)\b/i,
];

const CERTIFICATE_PATTERNS = [
  /\b(?:certificate\s+of\s+(?:completion|achievement|appreciation|excellence|participation|recognition))\b/i,
  /\b(?:this\s+is\s+to\s+certify\s+that|is\s+hereby\s+awarded\s+to|has\s+successfully\s+completed\s+(?:the\s+course|the\s+program)?)\b/i,
  /\b(?:authorized\s+signatory|certificate\s+id\s*[:\-]|verification\s+code\s*[:\-]|in\s+witness\s+whereof)\b/i,
];

const REPORT_PATTERNS = [
  /\b(?:table\s+of\s+contents|executive\s+summary\s+for\s+the\s+project|system\s+design\s+document)\b/i,
  /\b(?:software\s+requirements\s+specification|functional\s+requirements|scope\s+of\s+work)\b/i,
  /\b(?:chapter\s+\d+|figure\s+\d+\.\d+|table\s+\d+\.\d+|appendix\s+[a-z]|user\s+manual)\b/i,
  /\b(?:deliverables\s+and\s+milestones|conclusion\s+and\s+future\s+scope)\b/i,
];

const LEGAL_PATTERNS = [
  /\b(?:terms\s+and\s+conditions|privacy\s+policy|non-disclosure\s+agreement|mutual\s+nda)\b/i,
  /\b(?:lease\s+agreement|whereas\s+the\s+parties|governing\s+law|indemnification\s+clause)\b/i,
  /\b(?:in\s+witness\s+whereof\s+the\s+parties|hereby\s+agree\s+as\s+follows)\b/i,
];

/**
 * Validates whether an extracted document text represents an authentic resume/CV.
 * Computes positive structural resume signals vs. domain negative non-resume signals.
 */
export function validateResumeDocument(
  rawText: string,
  options: ValidationOptions = {}
): ResumeValidationResult {
  const text = (rawText || '').trim();
  const lowerText = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const signals: ResumeValidationSignals = {
    hasContactInfo: false,
    hasExperienceOrInternship: false,
    hasEducation: false,
    hasSkills: false,
    hasProjectsOrAchievements: false,
    hasSummaryOrObjective: false,
    hasChronology: false,
    detectedSections: [],
    negativeIndicators: [],
  };

  // 1. Extreme shortness, empty, or unreadable document check
  if (text.length < 35 || wordCount < 8) {
    return {
      status: 'invalid',
      isValid: false,
      confidence: 100,
      reasonCode: 'EMPTY_OR_CORRUPT',
      message: 'Unable to detect readable content in this document. Please ensure the file is not empty, corrupted, or password-protected, and upload a valid PDF, DOCX, or TXT resume.',
      signals,
    };
  }

  // 2. Contact Information Evaluation
  const hasEmail = EMAIL_REGEX.test(text);
  const hasPhone = PHONE_REGEX.test(text);
  const hasProfile = PROFILE_REGEX.test(text);
  if (hasEmail || hasPhone || hasProfile) {
    signals.hasContactInfo = true;
  }

  // 3. Section Headers Extraction
  if (SECTION_SUMMARY_REGEX.test(text) || /\b(?:summary|objective|career\s+profile)\b/i.test(text)) {
    signals.hasSummaryOrObjective = true;
    signals.detectedSections.push('Summary / Objective');
  }
  if (SECTION_EXPERIENCE_REGEX.test(text) || /\b(?:work\s+experience|professional\s+experience|employment|internships?)\b/i.test(text)) {
    signals.hasExperienceOrInternship = true;
    signals.detectedSections.push('Work Experience / Internships');
  }
  if (SECTION_EDUCATION_REGEX.test(text) || /\b(?:education|academic|qualifications)\b/i.test(text)) {
    signals.hasEducation = true;
    signals.detectedSections.push('Education');
  }
  if (SECTION_SKILLS_REGEX.test(text) || /\b(?:technical\s+skills|core\s+competencies|skills)\b/i.test(text)) {
    signals.hasSkills = true;
    signals.detectedSections.push('Skills & Competencies');
  }
  if (SECTION_PROJECTS_REGEX.test(text) || /\b(?:key\s+projects|academic\s+projects|personal\s+projects)\b/i.test(text)) {
    signals.hasProjectsOrAchievements = true;
    signals.detectedSections.push('Projects / Achievements');
  }
  if (SECTION_CERTIFICATIONS_REGEX.test(text) || /\b(?:certifications?|licenses?)\b/i.test(text)) {
    signals.detectedSections.push('Certifications');
  }
  let hasAcademicCvSection = false;
  if (SECTION_ACADEMIC_REGEX.test(text) || /\b(?:publications|peer-reviewed|research\s+experience|teaching\s+experience)\b/i.test(text)) {
    hasAcademicCvSection = true;
    signals.detectedSections.push('Academic Publications / Research');
  }

  // 4. Chronology & Dates
  const hasDateRange = DATE_RANGE_REGEX.test(text);
  const yearMatches = text.match(new RegExp(YEAR_REGEX, 'g')) || [];
  if (hasDateRange || yearMatches.length >= 2) {
    signals.hasChronology = true;
  }

  // 5. Degrees & Degrees Mentions
  const hasDegrees = DEGREE_REGEX.test(text);

  // 6. Action Verbs Count
  let actionVerbCount = 0;
  for (const verb of ACTION_VERBS) {
    if (new RegExp(`\\b${verb}\\b`, 'i').test(text)) {
      actionVerbCount++;
    }
  }

  // 7. Role Titles Count
  let roleTitleCount = 0;
  for (const role of ROLE_TITLES) {
    if (new RegExp(`\\b${role}\\b`, 'i').test(text)) {
      roleTitleCount++;
    }
  }

  // 8. Evaluate Negative Indicators (Invoices, Assignments, Certificates, Reports, Legal)
  let invoiceScore = 0;
  for (const p of INVOICE_PATTERNS) {
    if (p.test(text)) {
      invoiceScore++;
      signals.negativeIndicators.push('Invoice / Billing terms detected');
    }
  }

  let assignmentScore = 0;
  for (const p of ASSIGNMENT_PATTERNS) {
    if (p.test(text)) {
      assignmentScore++;
      signals.negativeIndicators.push('Course assignment / Homework markers detected');
    }
  }

  let certificateScore = 0;
  for (const p of CERTIFICATE_PATTERNS) {
    if (p.test(text)) {
      certificateScore++;
      signals.negativeIndicators.push('Single completion certificate award phrasing detected');
    }
  }

  let reportScore = 0;
  for (const p of REPORT_PATTERNS) {
    if (p.test(text)) {
      reportScore++;
      signals.negativeIndicators.push('Project report / Specification document markers detected');
    }
  }

  let legalScore = 0;
  for (const p of LEGAL_PATTERNS) {
    if (p.test(text)) {
      legalScore++;
      signals.negativeIndicators.push('Legal contract / Terms phrasing detected');
    }
  }

  // -------------------------------------------------------------
  // WEIGHTED SCORING ENGINE
  // -------------------------------------------------------------
  let positiveScore = 0;

  // Contact info
  if (hasEmail) positiveScore += 18;
  if (hasPhone) positiveScore += 12;
  if (hasProfile) positiveScore += 10;

  // Section weights
  if (signals.hasExperienceOrInternship) positiveScore += 25;
  if (signals.hasEducation) positiveScore += 20;
  if (signals.hasSkills) positiveScore += 20;
  if (signals.hasSummaryOrObjective) positiveScore += 10;
  if (signals.hasProjectsOrAchievements) positiveScore += 15;
  if (hasAcademicCvSection) positiveScore += 20;

  // Structural anchors
  if (signals.hasChronology) positiveScore += 15;
  if (hasDegrees) positiveScore += 15;
  if (actionVerbCount >= 2) positiveScore += 10;
  else if (actionVerbCount === 1) positiveScore += 6;
  if (roleTitleCount >= 1) positiveScore += 10;

  // Career intent markers (detects early drafts / career statements)
  const CAREER_INTENT_REGEX = /\b(?:aspiring|seeking|entry-level|junior|developer|engineer|software|enthusiast|coding|programmer|proficient|looking\s+to\s+grow|hire|grow\s+in\s+tech)\b/i;
  if (CAREER_INTENT_REGEX.test(text)) {
    positiveScore += 14;
  }

  // Unique sections count
  const sectionCount = signals.detectedSections.length;

  // -------------------------------------------------------------
  // CLASSIFICATION DECISION LOGIC
  // -------------------------------------------------------------

  // Check 1: Invoice / Receipt / Bill Dominance
  // If 2+ invoice signals and not a multi-section resume
  if (invoiceScore >= 2 && sectionCount < 3) {
    return {
      status: 'invalid',
      isValid: false,
      confidence: Math.min(95, 60 + invoiceScore * 10),
      reasonCode: 'NON_RESUME_INVOICE',
      detectedType: 'Invoice / Billing Receipt',
      message: 'This document does not appear to be a resume or CV. It has been identified as an invoice, bill, or receipt. Please upload your resume in PDF, DOCX, or TXT format.',
      signals,
    };
  }

  // Check 2: College Assignment / Problem Set
  if (assignmentScore >= 2 && (!signals.hasExperienceOrInternship || assignmentScore >= 3)) {
    return {
      status: 'invalid',
      isValid: false,
      confidence: Math.min(95, 60 + assignmentScore * 10),
      reasonCode: 'NON_RESUME_ASSIGNMENT',
      detectedType: 'Academic Assignment / Homework',
      message: 'This document does not appear to be a resume or CV. It has been identified as a course assignment, homework, or problem set. Please upload your resume in PDF, DOCX, or TXT format.',
      signals,
    };
  }

  // Check 3: Certificate / Award
  if (certificateScore >= 2 && wordCount < 300 && !signals.hasExperienceOrInternship) {
    return {
      status: 'invalid',
      isValid: false,
      confidence: 90,
      reasonCode: 'NON_RESUME_CERTIFICATE',
      detectedType: 'Certificate / Award Document',
      message: 'This document does not appear to be a resume or CV. It has been identified as a standalone course certificate or award rather than a comprehensive CV. Please upload your resume in PDF, DOCX, or TXT format.',
      signals,
    };
  }

  // Check 4: Project Report / Specification
  if (reportScore >= 2 && !signals.hasContactInfo && sectionCount < 2) {
    return {
      status: 'invalid',
      isValid: false,
      confidence: 90,
      reasonCode: 'NON_RESUME_REPORT',
      detectedType: 'Project Report / Documentation',
      message: 'This document does not appear to be a resume or CV. It has been identified as a project report, specification, or manual. Please upload your resume in PDF, DOCX, or TXT format.',
      signals,
    };
  }

  // Check 5: Legal Contract / Agreement
  if (legalScore >= 2 && sectionCount < 2) {
    return {
      status: 'invalid',
      isValid: false,
      confidence: 95,
      reasonCode: 'NON_RESUME_LEGAL_CONTRACT',
      detectedType: 'Legal Agreement / Policy',
      message: 'This document does not appear to be a resume or CV. It has been identified as a legal agreement, terms, or policy document. Please upload your resume in PDF, DOCX, or TXT format.',
      signals,
    };
  }

  // Check 6: Valid Resume Classification
  // A valid resume has substantial positive structure.
  // Profiles that must pass:
  // - Experienced: Experience + (Education | Skills | Summary) + Chronology
  // - Fresher: Education + Skills + Projects + (Contact | Degree)
  // - Internship: Education + (Internship | Projects) + Skills
  // - Academic CV: Education + Publications / Research
  // - Creative / Non-standard layout: Contact + Experience/Skills with chronology
  const isExperiencedValid = signals.hasExperienceOrInternship && (signals.hasEducation || signals.hasSkills || signals.hasSummaryOrObjective) && positiveScore >= 40;
  const isFresherValid = signals.hasEducation && (signals.hasSkills || signals.hasProjectsOrAchievements) && (hasDegrees || signals.hasContactInfo || signals.hasChronology) && positiveScore >= 35;
  const isAcademicValid = (signals.hasEducation || hasDegrees) && hasAcademicCvSection && positiveScore >= 35;
  const isCreativeLayoutValid = signals.hasContactInfo && (signals.hasSkills || signals.hasExperienceOrInternship || signals.hasProjectsOrAchievements) && (signals.hasChronology || actionVerbCount >= 2 || roleTitleCount >= 1) && positiveScore >= 35;

  if (isExperiencedValid || isFresherValid || isAcademicValid || isCreativeLayoutValid || positiveScore >= 50) {
    return {
      status: 'valid',
      isValid: true,
      confidence: Math.min(99, Math.max(70, Math.round(positiveScore * 0.75))),
      reasonCode: 'VALID_RESUME',
      message: 'Document successfully identified and validated as a resume/CV.',
      signals,
    };
  }

  // Check 7: Uncertain Document Classification
  // Document has some resume tokens or partial structure, but lacks depth (e.g. draft, incomplete notes, unusual format)
  // Positive score between 18 and 34, or only 1 isolated section without contact details or chronology
  if (positiveScore >= 18 || (sectionCount >= 1 && (actionVerbCount >= 1 || roleTitleCount >= 1))) {
    if (options.allowUncertainOverride) {
      return {
        status: 'valid',
        isValid: true,
        confidence: 60,
        reasonCode: 'VALID_RESUME',
        message: 'Proceeding with best-effort ATS analysis based on user confirmation.',
        signals,
      };
    }

    return {
      status: 'uncertain',
      isValid: false,
      confidence: 50,
      reasonCode: 'UNCERTAIN_STRUCTURE',
      message: 'This document has limited resume structure or appears incomplete. For accurate ATS analysis, please upload a clearer or more complete resume including your work history, education, or skills.',
      signals,
    };
  }

  // Check 8: Insufficient Signals / Plain Text / Unrelated Document
  return {
    status: 'invalid',
    isValid: false,
    confidence: 85,
    reasonCode: 'INSUFFICIENT_SIGNALS',
    message: 'This document does not appear to be a resume or CV. Please upload your resume in PDF, DOCX, or TXT format to proceed with ATS analysis.',
    signals,
  };
}

/**
 * Validates a structured ResumeData payload before persisting to the database.
 * Rejects malformed types, corrupted arrays, invalid nesting, or oversized payloads.
 */
export function validateResumeData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errors: ['Resume data must be a non-null JSON object.'] };
  }

  // Check personalInfo
  if (data.personalInfo !== undefined) {
    if (typeof data.personalInfo !== 'object' || Array.isArray(data.personalInfo) || data.personalInfo === null) {
      errors.push('personalInfo must be a JSON object.');
    } else {
      if (data.personalInfo.fullName !== undefined && typeof data.personalInfo.fullName !== 'string') {
        errors.push('personalInfo.fullName must be a string.');
      }
      if (data.personalInfo.email !== undefined && typeof data.personalInfo.email !== 'string') {
        errors.push('personalInfo.email must be a string.');
      }
      if (data.personalInfo.phone !== undefined && typeof data.personalInfo.phone !== 'string') {
        errors.push('personalInfo.phone must be a string.');
      }
      if (data.personalInfo.location !== undefined && typeof data.personalInfo.location !== 'string') {
        errors.push('personalInfo.location must be a string.');
      }
    }
  }

  // Check summary
  if (data.summary !== undefined && typeof data.summary !== 'string') {
    errors.push('summary must be a string.');
  }

  // Check skills
  if (data.skills !== undefined) {
    if (typeof data.skills !== 'object' || Array.isArray(data.skills) || data.skills === null) {
      errors.push('skills must be an object.');
    } else {
      if (data.skills.technical !== undefined && !Array.isArray(data.skills.technical)) {
        errors.push('skills.technical must be an array of strings.');
      }
      if (data.skills.soft !== undefined && !Array.isArray(data.skills.soft)) {
        errors.push('skills.soft must be an array of strings.');
      }
      if (data.skills.tools !== undefined && !Array.isArray(data.skills.tools)) {
        errors.push('skills.tools must be an array of strings.');
      }
    }
  }

  // Check experience
  if (data.experience !== undefined) {
    if (!Array.isArray(data.experience)) {
      errors.push('experience must be an array.');
    } else {
      for (let i = 0; i < data.experience.length; i++) {
        const exp = data.experience[i];
        if (!exp || typeof exp !== 'object') {
          errors.push(`experience[${i}] must be an object.`);
          break;
        }
        if (exp.bulletPoints !== undefined && !Array.isArray(exp.bulletPoints)) {
          errors.push(`experience[${i}].bulletPoints must be an array of strings.`);
        }
      }
    }
  }

  // Check education
  if (data.education !== undefined && !Array.isArray(data.education)) {
    errors.push('education must be an array.');
  }

  // Check projects
  if (data.projects !== undefined && !Array.isArray(data.projects)) {
    errors.push('projects must be an array.');
  }

  // Check certifications
  if (data.certifications !== undefined && !Array.isArray(data.certifications)) {
    errors.push('certifications must be an array.');
  }

  // Size guard: serialized payload limit (2MB)
  try {
    const serialized = JSON.stringify(data);
    if (serialized.length > 2 * 1024 * 1024) {
      errors.push('Resume payload exceeds maximum permitted size of 2MB.');
    }
  } catch {
    errors.push('Resume data cannot be serialized.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

