import { ResumeTemplateId, ResumeTemplateInfo, ResumeData } from '@/types/resume';

export const RESUME_TEMPLATES: ResumeTemplateInfo[] = [
  {
    id: 'ats-classic',
    name: 'ATS Classic',
    category: 'ATS-Friendly',
    intendedUse: 'Corporate, Finance, Legal, Government, and high-volume ATS portals',
    description: 'Traditional single-column layout with clean serif typography, optimized for 100% compliance with applicant tracking systems.',
    styleDescription: 'Clean serif typography, centered header, traditional hairline rules',
    isAtsFriendly: true,
    atsScoreRating: 99,
    isPopular: true,
    tags: ['ATS-Friendly', 'Single-Column', 'Traditional', 'High Compliance'],
  },
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    category: 'Technical',
    intendedUse: 'Software Engineers, Backend/Frontend Developers, Cloud & DevOps Specialists',
    description: 'Engineering layout featuring categorized technical skills, monospace metadata badges, GitHub repositories, and architectural scale highlights.',
    styleDescription: 'Technical skills matrix, monospace repository tags, system scale callouts',
    isAtsFriendly: true,
    atsScoreRating: 98,
    isPopular: true,
    tags: ['Technical', 'Engineering', 'Code Repos', 'Monospace'],
  },
  {
    id: 'graduate-fresher',
    name: 'Graduate / Fresher',
    category: 'Freshers',
    intendedUse: 'Recent College Graduates, Entry-Level Candidates, and Career Transitioners',
    description: 'Strategic structure prioritizing degree credentials, GPA, honors, coursework, and capstone projects ahead of corporate tenure.',
    styleDescription: 'Education & project priority, academic honors, clean single-column',
    isAtsFriendly: true,
    atsScoreRating: 98,
    isPopular: true,
    tags: ['Freshers', 'Campus Projects', 'Academic Honors', 'Entry-Level'],
  },
  {
    id: 'executive-professional',
    name: 'Executive Professional',
    category: 'Experienced',
    intendedUse: 'C-Suite, VP, Directors, General Managers, and Senior Department Heads',
    description: 'Authoritative executive layout with deep charcoal header styling, strategic core competencies grid, and career progression milestones.',
    styleDescription: 'Executive charcoal header, strategic competencies matrix, P&L progression',
    isAtsFriendly: true,
    atsScoreRating: 97,
    isPopular: true,
    tags: ['Experienced', 'Leadership', 'Executive', 'P&L Management'],
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    category: 'Technical',
    intendedUse: 'Data Analysts, BI Engineers, Data Scientists, and Analytics Consultants',
    description: 'Analytical layout highlighting SQL, Python, BI tooling, business intelligence pipelines, and quantified business impact metrics.',
    styleDescription: 'Analytical tools matrix, KPI metrics emphasis, dataset projects',
    isAtsFriendly: true,
    atsScoreRating: 98,
    isPopular: false,
    tags: ['Technical', 'Data & AI', 'KPIs', 'BI Pipelines'],
  },
  {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    category: 'Creative',
    intendedUse: 'Product Designers, UI/UX Designers, Design System Leads, and UX Researchers',
    description: 'Typographically refined layout featuring design systems, UX research methods, Figma/portfolio links, and case-study project cards.',
    styleDescription: 'Geometric typography, portfolio showcase, design & research skills',
    isAtsFriendly: true,
    atsScoreRating: 96,
    isPopular: true,
    tags: ['Creative', 'Design Systems', 'Figma', 'Case Studies'],
  },
  {
    id: 'full-stack-developer',
    name: 'Full Stack Developer',
    category: 'Technical',
    intendedUse: 'Full Stack Engineers, Web Application Architects, and Cloud Solutions Developers',
    description: 'High-density technical layout highlighting dual frontend/backend stacks, database architectures, APIs, and live production deployments.',
    styleDescription: 'Dual-stack skill pills, live demo & repo links, web architecture',
    isAtsFriendly: true,
    atsScoreRating: 98,
    isPopular: true,
    tags: ['Technical', 'Full Stack', 'Web Architecture', 'DevOps'],
  },
  {
    id: 'internship-applicant',
    name: 'Internship Applicant',
    category: 'Freshers',
    intendedUse: 'University Students, Bootcamp Graduates, and Early Applicants seeking internships',
    description: 'Approachable single-column format emphasizing University standing, expected graduation, coursework, hackathons, and student leadership.',
    styleDescription: 'Balanced whitespace, coursework focus, student leadership highlights',
    isAtsFriendly: true,
    atsScoreRating: 98,
    isPopular: false,
    tags: ['Freshers', 'Internship', 'Coursework', 'Student Leadership'],
  },
  {
    id: 'academic-research',
    name: 'Academic / Research',
    category: 'Academic',
    intendedUse: 'PhD Candidates, Postdocs, Research Scientists, Faculty, and Fellowship Applicants',
    description: 'Formal scholarly curriculum vitae format highlighting education with thesis advisors, peer-reviewed publications, grant awards, and teaching experience.',
    styleDescription: 'Formal Garamond/Georgia serif, numbered publication citations, dissertation focus',
    isAtsFriendly: true,
    atsScoreRating: 96,
    isPopular: false,
    tags: ['Academic', 'Research', 'Scholarly CV', 'Publications'],
  },
  {
    id: 'sales-marketing',
    name: 'Sales & Marketing',
    category: 'Experienced',
    intendedUse: 'Account Executives, Sales Leaders, Growth Marketers, and Business Developers',
    description: 'High-impact commercial layout emphasizing quota attainment, revenue generation, client acquisition, and growth campaign metrics.',
    styleDescription: 'Commercial capabilities, quota performance callouts, revenue KPIs',
    isAtsFriendly: true,
    atsScoreRating: 97,
    isPopular: false,
    tags: ['Experienced', 'Sales & Growth', 'Quota Attainment', 'Revenue'],
  },
  {
    id: 'operations-management',
    name: 'Operations & Management',
    category: 'Experienced',
    intendedUse: 'Operations Directors, Program Managers, Scrum Masters, and Supply Chain Leaders',
    description: 'Disciplined executive structure focusing on Lean Six Sigma, Agile delivery, supply chain workflows, SLA improvements, and operational turnaround.',
    styleDescription: 'Process & operational competencies, efficiency KPIs, PMP/CSM credentials',
    isAtsFriendly: true,
    atsScoreRating: 97,
    isPopular: false,
    tags: ['Experienced', 'Operations', 'Process Optimization', 'Agile/PMP'],
  },
  {
    id: 'modern-two-column',
    name: 'Modern Two-Column',
    category: 'Creative',
    intendedUse: 'Visual layout for design, client-facing consulting, marketing, and creative tech',
    description: 'Contemporary split-view layout featuring a cool slate sidebar for contact info, skills, and credentials, paired with an expansive career narrative.',
    styleDescription: 'Contemporary dual-column, sidebar credentials, visual layout',
    isAtsFriendly: false,
    atsScoreRating: 92,
    isPopular: true,
    isVisualLayout: true,
    tags: ['Creative', 'Dual-Column', 'Visual Layout', 'Portfolio'],
  },
];

export function normalizeTemplateId(id: string): ResumeTemplateId {
  switch (id) {
    case 'ats-classic':
    case 'modern-ats':
      return 'ats-classic';
    case 'software-engineer':
    case 'tech-professional':
      return 'software-engineer';
    case 'graduate-fresher':
    case 'fresh-graduate':
    case 'graduate-entry':
      return 'graduate-fresher';
    case 'executive-professional':
    case 'corporate-executive':
    case 'executive':
    case 'corporate':
    case 'experienced-professional':
      return 'executive-professional';
    case 'data-analyst':
    case 'data-ai':
      return 'data-analyst';
    case 'ui-ux-designer':
    case 'creative-professional':
      return 'ui-ux-designer';
    case 'full-stack-developer':
      return 'full-stack-developer';
    case 'internship-applicant':
      return 'internship-applicant';
    case 'academic-research':
    case 'academic':
      return 'academic-research';
    case 'sales-marketing':
      return 'sales-marketing';
    case 'operations-management':
      return 'operations-management';
    case 'modern-two-column':
    case 'contemporary':
      return 'modern-two-column';
    // Older reference designs mapped gracefully to canonical templates or preserved
    case 'modern-professional':
    case 'minimalist':
    case 'minimal':
    case 'compact-one-page':
    case 'thomas-hamptone':
    case 'nick-koe':
    case 'richard-sanchez':
    case 'olivia-wilson-grid':
    case 'olivia-wilson-blush':
      return id as ResumeTemplateId;
    default:
      return 'ats-classic';
  }
}

// Sample preview data used exclusively for miniature cards when user has not entered details yet
export const MINI_SAMPLE_RESUME_DATA: ResumeData = {
  id: 'mini_preview_sample',
  title: 'Sample Preview',
  candidateType: 'experienced',
  personalInfo: {
    fullName: 'Alexandra Chen',
    headline: 'Senior Full-Stack Engineer & Architect',
    email: 'alex.chen@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexchen',
    github: 'github.com/alexchen',
    portfolio: 'alexchen.dev',
  },
  summary:
    'Accomplished software engineer with 7+ years of experience spearheading distributed systems, cloud-native web architectures, and high-performance APIs.',
  skills: {
    technical: ['TypeScript', 'Next.js', 'React', 'Node.js', 'Go', 'PostgreSQL', 'AWS'],
    tools: ['Docker', 'Kubernetes', 'Git', 'Redis', 'Kafka', 'Terraform'],
    soft: ['Technical Leadership', 'System Architecture', 'Agile Mentorship'],
  },
  experience: [
    {
      id: 'exp_1',
      company: 'Stripe',
      role: 'Staff Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      bulletPoints: [
        'Architected real-time payment ingestion pipeline processing 24k requests/sec with 99.999% availability.',
        'Mentored 12 engineers across product squads and instituted automated end-to-end integration workflows.',
      ],
    },
    {
      id: 'exp_2',
      company: 'Datadog',
      role: 'Senior Software Engineer',
      location: 'New York, NY',
      startDate: '2019',
      endDate: '2022',
      current: false,
      bulletPoints: [
        'Decreased metric query latency by 42% through optimized memory cache tiers and query plan indexing.',
      ],
    },
  ],
  education: [
    {
      id: 'edu_1',
      degree: 'B.S. in Computer Science',
      institution: 'UC Berkeley',
      location: 'Berkeley, CA',
      graduationYear: '2019',
      gpa: '3.91',
      honors: 'Summa Cum Laude · Dean’s Honors List',
    },
  ],
  projects: [
    {
      id: 'proj_1',
      title: 'CloudMesh Engine',
      description: 'Open-source distributed service proxy built in Go with automated mTLS certificate rotation.',
      technologies: ['Go', 'gRPC', 'Docker', 'eBPF'],
      link: 'github.com/alexchen/cloudmesh',
      bullets: ['Grew community to 1.8k GitHub stars with 40+ active enterprise contributors.'],
    },
  ],
  certifications: [
    {
      id: 'cert_1',
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
  ],
  templateId: 'ats-classic',
  lastUpdated: new Date().toISOString(),
};
