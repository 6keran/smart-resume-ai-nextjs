export type SupportedSkill =
  | 'Python'
  | 'Java'
  | 'JavaScript'
  | 'SQL'
  | 'React'
  | 'C++'
  | 'C#'
  | 'Machine Learning'
  | 'Data Analysis'
  | 'Git'
  | 'AWS';

export type SkillStatus = 'verified' | 'claimed' | 'not-verified';

export interface UserSkill {
  id: string;
  name: SupportedSkill;
  category: 'Programming' | 'Frontend' | 'Backend' | 'Database' | 'AI / Data' | 'Cloud & DevOps';
  status: SkillStatus;
  claimedDate?: string;
  verifiedDate?: string;
  score?: number;
  certificateId?: string;
}

export type QuestionType = 'multiple-choice' | 'code-output' | 'debugging' | 'practical-coding';

export interface AssessmentQuestion {
  id: string;
  skill: SupportedSkill;
  type: QuestionType;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  topic: string;
}

export type ProctoringEventType =
  | 'ASSESSMENT_STARTED'
  | 'FULLSCREEN_ENTER'
  | 'FULLSCREEN_EXIT'
  | 'TAB_SWITCH'
  | 'WINDOW_BLUR'
  | 'WINDOW_FOCUS'
  | 'CAMERA_STARTED'
  | 'CAMERA_DISCONNECTED'
  | 'CAMERA_RECONNECTED'
  | 'ASSESSMENT_SUBMITTED'
  | 'ASSESSMENT_TERMINATED';

export interface ProctoringEvent {
  id: string;
  type: ProctoringEventType;
  timestamp: string;
  details?: string;
  severity: 'info' | 'warning' | 'violation';
}

export interface AssessmentAttempt {
  id: string;
  skill: SupportedSkill;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number; // e.g. 1200 for 20 mins
  userAnswers: Record<string, number>; // questionId -> selectedOptionIndex
  score: number; // 0 to 10
  passed: boolean;
  status: 'in-progress' | 'passed' | 'failed' | 'terminated' | 'INCOMPLETE';
  proctoringEvents: ProctoringEvent[];
  violationCount: number;
  terminationReason?: string;
  topicBreakdown: {
    topic: string;
    correct: number;
    total: number;
  }[];
  certificateId?: string;
}

export interface SkillCertificate {
  id: string;
  verificationCode: string; // e.g. "SRA-VER-2026-9281"
  userName: string;
  skill: SupportedSkill;
  score: number;
  passingScore: number;
  issuedAt: string;
  verificationStatus: 'VERIFIED';
  issuer: 'Smart Resume AI Career Intelligence';
  certificateUrl?: string;
}
