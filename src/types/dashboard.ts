export type ActivityActionType =
  | 'resume_analyzed'
  | 'resume_improved'
  | 'skill_claimed'
  | 'skill_verified'
  | 'assessment_completed'
  | 'job_match_completed'
  | 'resume_generated';

export interface ActivityLogItem {
  id: string;
  type: ActivityActionType;
  title: string;
  description: string;
  timestamp: string;
  meta?: {
    score?: number;
    skillName?: string;
    jobTitle?: string;
    templateName?: string;
  };
}

export interface DashboardMetrics {
  resumesAnalyzed: number;
  averageAtsScore: number;
  skillsVerified: number;
  assessmentsCompleted: number;
  jobMatches: number;
  careerReadinessScore: number;
}

export interface AtsHistoryPoint {
  date: string;
  score: number;
  formatting: number;
  keywords: number;
}

export interface SkillMasteryPoint {
  skill: string;
  level: number;
  verified: boolean;
}

export interface JobMatchTrendPoint {
  month: string;
  matches: number;
  avgScore: number;
}

export interface UserFeedback {
  id: string;
  rating: number; // 1 to 5
  category: 'ATS Analyzer' | 'Resume Builder' | 'Skill Verification' | 'Job Matching' | 'General UX' | 'Other';
  feedback: string;
  suggestions?: string;
  submittedAt: string;
}
