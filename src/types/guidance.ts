import { SupportedSkill } from './skills';

export interface InterviewRound {
  round: number;
  name: string;
  description: string;
  duration: string;
  tips: string;
}

export interface CompanyRole {
  id: string;
  title: string;
  category: 'Software Engineering' | 'Data & AI' | 'Frontend' | 'Cloud & Systems';
  level: string;
  experienceRequired: string;
  packageRange: string;
  requiredSkills: SupportedSkill[];
  recommendedSkills: SupportedSkill[];
  eligibility: string;
  dsaWeight: 'High' | 'Medium' | 'Low';
  systemDesignWeight: 'High' | 'Medium' | 'Low';
  interviewRounds: InterviewRound[];
  resumeKeywords: string[];
  preparationTips: string[];
}

export interface CompanyProfile {
  id: string;
  name: string;
  tier: 'Top Tech / Product' | 'Global IT Services' | 'High-Growth Tech';
  headquarters: string;
  overview: string;
  hiringCycle: string;
  selectionProcess: string;
  minAcademicPercentage: string;
  roles: CompanyRole[];
}

export interface SkillMatchDetail {
  skill: SupportedSkill;
  isRequired: boolean;
  isVerified: boolean;
  isClaimed: boolean;
  score?: number;
  certificateId?: string;
  status: 'verified' | 'claimed' | 'missing';
}

export interface ReadinessEvaluation {
  readinessScore: number; // 0 to 100
  status: 'Interview Ready' | 'Needs Preparation' | 'Beginning Journey';
  totalRequired: number;
  verifiedRequired: number;
  totalRecommended: number;
  verifiedRecommended: number;
  matchedSkills: SkillMatchDetail[];
  missingRequired: SupportedSkill[];
  nextSteps: string[];
}
