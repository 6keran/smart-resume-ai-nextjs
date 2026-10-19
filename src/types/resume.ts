export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline?: string;
  title?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bulletPoints: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  graduationYear: string;
  gpa?: string;
  honors?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  bullets?: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface ResumeData {
  id: string;
  title: string;
  candidateType: 'experienced' | 'fresher';
  personalInfo: PersonalInfo;
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  templateId: ResumeTemplateId;
  lastUpdated: string;
}

export type ResumeTemplateId =
  | 'ats-classic'
  | 'modern-professional'
  | 'minimalist'
  | 'corporate-executive'
  | 'software-engineer'
  | 'fresh-graduate'
  | 'data-analyst'
  | 'creative-professional'
  | 'compact-one-page'
  | 'academic'
  | 'experienced-professional'
  | 'contemporary'
  // Reference Image Recreations
  | 'thomas-hamptone'
  | 'nick-koe'
  | 'richard-sanchez'
  | 'olivia-wilson-grid'
  | 'olivia-wilson-blush'
  // Legacy aliases for backward compatibility
  | 'modern-ats'
  | 'tech-professional'
  | 'executive'
  | 'data-ai'
  | 'corporate'
  | 'minimal'
  | 'graduate-entry';

export interface ResumeTemplateInfo {
  id: ResumeTemplateId;
  name: string;
  category: string;
  description: string;
  styleDescription: string;
  isAtsFriendly: boolean;
  atsScoreRating: number; // e.g., 99
  isPopular?: boolean;
  tags?: string[];
}

export interface AnalysisWeakness {
  id: string;
  section: string;
  whatIsWrong: string;
  whyItMatters: string;
  howToImprove: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AnalysisStrength {
  id: string;
  section: string;
  title: string;
  description: string;
}

export interface AnalysisRecommendation {
  id: string;
  category: string;
  title: string;
  actionText: string;
  originalText?: string;
  improvedText?: string;
  impact: string;
}

export interface PrioritizedSuggestion {
  id: string;
  rank: number;
  priority: 'High' | 'Medium' | 'Low';
  section: string;
  whatNeedsImprovement: string;
  whyItMatters: string;
  howToImprove: string;
  example?: string;
}

export interface ResumeAnalysisResult {
  overallAtsScore: number;
  keywordMatchScore: number;
  formattingScore: number;
  contentScore: number;
  sectionScore: number;
  wordCount: number;
  readabilityScore: number;
  detectedKeywords: string[];
  missingKeywords: string[];
  strengths: AnalysisStrength[];
  weaknesses: AnalysisWeakness[];
  recommendations: AnalysisRecommendation[];
  topSuggestions: PrioritizedSuggestion[];
  summaryFeedback: string;
  analyzedAt: string;
}

export interface ImprovementItem {
  id: string;
  section: 'summary' | 'experience' | 'projects' | 'skills' | 'education';
  field: string;
  originalContent: string;
  improvedContent: string;
  reasoning: string;
  metricImpact: string;
  status: 'pending' | 'accepted' | 'rejected';
}
