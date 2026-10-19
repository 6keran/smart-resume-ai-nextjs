import { ResumeData } from '@/types/resume';
import { UserSkill } from '@/types/skills';
import { DashboardMetrics, ActivityLogItem } from '@/types/dashboard';

export const INITIAL_RESUME_DATA: ResumeData = {
  id: 'res_default',
  title: 'Untitled Resume',
  candidateType: 'experienced',
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  summary: '',
  skills: {
    technical: [],
    soft: [],
    tools: [],
  },
  experience: [
    {
      id: 'exp_init',
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      current: true,
      bulletPoints: [],
    },
  ],
  education: [
    {
      id: 'edu_init',
      degree: '',
      institution: '',
      graduationYear: '',
      gpa: '',
    },
  ],
  projects: [
    {
      id: 'proj_init',
      title: '',
      description: '',
      technologies: [],
    },
  ],
  certifications: [],
  templateId: 'modern-ats',
  lastUpdated: new Date().toISOString(),
};

export const INITIAL_USER_SKILLS: UserSkill[] = [
  {
    id: 'skill_01',
    name: 'Python',
    category: 'Programming',
    status: 'not-verified',
  },
  {
    id: 'skill_02',
    name: 'SQL',
    category: 'Database',
    status: 'not-verified',
  },
  {
    id: 'skill_03',
    name: 'React',
    category: 'Frontend',
    status: 'not-verified',
  },
  {
    id: 'skill_04',
    name: 'JavaScript',
    category: 'Programming',
    status: 'not-verified',
  },
  {
    id: 'skill_05',
    name: 'Git',
    category: 'Cloud & DevOps',
    status: 'not-verified',
  },
];

export const INITIAL_METRICS: DashboardMetrics = {
  resumesAnalyzed: 0,
  averageAtsScore: 0,
  skillsVerified: 0,
  assessmentsCompleted: 0,
  jobMatches: 0,
  careerReadinessScore: 0,
};

export const INITIAL_ACTIVITIES: ActivityLogItem[] = [];
