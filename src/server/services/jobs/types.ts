export type WorkplaceType = 'Remote' | 'Hybrid' | 'On-site';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Temporary' | 'Other';
export type ExperienceLevel = 'Fresher' | 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive' | 'All';

export interface JobMatchBreakdown {
  skills: number; // 0 - 100
  experience: number; // 0 - 100
  keywords: number; // 0 - 100
  projects: number; // 0 - 100
  education: number; // 0 - 100
}

export interface NormalizedJob {
  id: string;
  source: 'LinkedIn' | 'Naukri' | 'Adzuna' | 'Jooble' | string;
  sourceJobId: string;
  title: string;
  company: string;
  location: string;
  country?: string;
  city?: string;
  description: string;
  snippet: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryDisplay?: string;
  salary?: string;
  experience?: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  workplaceType: WorkplaceType;
  postedAt: string; // ISO string
  updatedAt?: string;
  applyUrl: string;
  sourceUrl: string;
  logoUrl?: string;
  skills: string[];
  category?: string;
  remote: boolean;
  hybrid: boolean;
  onsite: boolean;
  // Personalization fields (computed when resume is provided)
  matchScore?: number; // 0 - 100
  matchBreakdown?: JobMatchBreakdown;
  matchedSkills?: string[];
  partialSkills?: string[];
  missingSkills?: string[];
  matchReason?: string;
}

// User-specified Job interface alias
export type Job = NormalizedJob;

export interface ResumeCandidateContext {
  skills?: string[];
  headline?: string;
  yearsOfExperience?: number;
  education?: Array<{ degree: string; institution: string }>;
  projects?: Array<{ title: string; description: string; technologies: string[] }>;
  experience?: Array<{ role: string; company: string; bulletPoints: string[] }>;
  detectedKeywords?: string[];
}

export interface JobSearchParams {
  keywords?: string;
  location?: string;
  radiusKm?: number; // 0, 4, 8, 16, 26, 40, 80
  workplaceType?: 'all' | WorkplaceType;
  employmentType?: 'all' | EmploymentType;
  experienceLevel?: 'all' | string;
  salaryMin?: number;
  salaryMax?: number;
  postedWithinDays?: number; // 1, 3, 7, 14, 30
  sortBy?: 'relevance' | 'date' | 'salary' | 'match';
  page?: number;
  limit?: number;
  bypassCache?: boolean;
  // Candidate resume context for transparent personalization
  resumeSkills?: string[];
  resumeHeadline?: string;
  resumeYearsExp?: number;
  candidateContext?: ResumeCandidateContext;
}

export interface JobSearchResponse {
  jobs: NormalizedJob[];
  totalJobs: number;
  page: number;
  totalPages: number;
  configuredProviders: string[];
  activeSources: string[];
  unavailableSources?: string[];
  isConfigured: boolean;
  searchLocation?: string;
  searchKeywords?: string;
  cachedAt?: string;
  lastUpdated?: string;
}

export interface JobProvider {
  name: string;
  isConfigured(): boolean;
  searchJobs(params: JobSearchParams): Promise<NormalizedJob[]>;
}

