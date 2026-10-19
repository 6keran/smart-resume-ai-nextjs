import { ResumeTemplateId, ResumeTemplateInfo, ResumeData } from '@/types/resume';

export const RESUME_TEMPLATES: ResumeTemplateInfo[] = [
  {
    id: 'ats-classic',
    name: 'ATS Classic',
    category: 'ATS Classic',
    description: 'Traditional single-column layout with clean serif typography, optimized for 100% compliance with applicant tracking systems.',
    styleDescription: 'Single-column, clean typography, traditional professional layout',
    isAtsFriendly: true,
    atsScoreRating: 99,
    isPopular: true,
    tags: ['ATS Standard', 'Single-Column', 'Traditional'],
  },
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    category: 'Professional',
    description: 'Refined headings with left accent markers, balanced spacing, and subtle indigo touches suitable for modern corporate and tech roles.',
    styleDescription: 'Refined headings, balanced spacing, subtle accent color',
    isAtsFriendly: true,
    atsScoreRating: 98,
    isPopular: true,
    tags: ['Modern', 'Corporate', 'Balanced'],
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    category: 'Minimalist',
    description: 'Swiss-inspired airy design featuring elegant typography, generous whitespace, and restrained hairline dividers.',
    styleDescription: 'Elegant typography, generous whitespace, simple structure',
    isAtsFriendly: true,
    atsScoreRating: 96,
    isPopular: false,
    tags: ['Clean', 'Whitespace', 'Contemporary'],
  },
  {
    id: 'corporate-executive',
    name: 'Corporate Executive',
    category: 'Executive',
    description: 'Authoritative deep navy header and serif title hierarchy engineered for senior leaders, directors, and executives.',
    styleDescription: 'Strong hierarchy for experienced professionals and managers',
    isAtsFriendly: true,
    atsScoreRating: 97,
    isPopular: true,
    tags: ['Leadership', 'Executive', 'High Impact'],
  },
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    category: 'Tech',
    description: 'Technical layout with categorized skill matrices, monospace repository pills, and structured architecture project highlights.',
    styleDescription: 'Technical skills, projects, experience, and technologies emphasized',
    isAtsFriendly: true,
    atsScoreRating: 98,
    isPopular: true,
    tags: ['Engineering', 'Code Repos', 'Monospace'],
  },
  {
    id: 'fresh-graduate',
    name: 'Fresh Graduate',
    category: 'Entry Level',
    description: 'Strategic structure that prioritizes education, academic honors, GPA, and capstone projects above corporate tenure.',
    styleDescription: 'Education, academic achievements, internships, and projects emphasized',
    isAtsFriendly: true,
    atsScoreRating: 97,
    isPopular: true,
    tags: ['Entry-Level', 'Campus Projects', 'Academic Honors'],
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    category: 'Analytical',
    description: 'Analytical layout emphasizing data tooling (SQL, Python, BI), business intelligence pipelines, and quantified KPI achievements.',
    styleDescription: 'Analytical skills, tools, measurable achievements, and projects',
    isAtsFriendly: true,
    atsScoreRating: 97,
    isPopular: false,
    tags: ['Data & AI', 'KPIs', 'Metrics-Focused'],
  },
  {
    id: 'creative-professional',
    name: 'Creative Professional',
    category: 'Creative',
    description: 'Artistic typography, tasteful violet accent framing, and visual project showcases for designers, product managers, and creatives.',
    styleDescription: 'Tasteful typography and visual hierarchy while retaining readability',
    isAtsFriendly: false,
    atsScoreRating: 91,
    isPopular: false,
    tags: ['Creative', 'Portfolio', 'Visual Accent'],
  },
  {
    id: 'compact-one-page',
    name: 'Compact One-Page',
    category: 'Compact',
    description: 'Space-optimized formatting engineered to pack comprehensive career achievements onto a single pristine page.',
    styleDescription: 'Optimized spacing for concise resumes',
    isAtsFriendly: true,
    atsScoreRating: 98,
    isPopular: true,
    tags: ['One-Page', 'Dense', 'Concise'],
  },
  {
    id: 'academic',
    name: 'Academic / CV',
    category: 'Academic',
    description: 'Formal scholarly curriculum vitae format highlighting education, research publications, grants, and teaching experience.',
    styleDescription: 'Education, research, publications, and certifications',
    isAtsFriendly: true,
    atsScoreRating: 95,
    isPopular: false,
    tags: ['Scholarly', 'Research', 'CV Format'],
  },
  {
    id: 'experienced-professional',
    name: 'Experienced Professional',
    category: 'Executive',
    description: 'Longitudinal career narrative layout emphasizing progressive promotion milestones, organizational scale, and strategic leadership.',
    styleDescription: 'Detailed experience, leadership, and career progression',
    isAtsFriendly: true,
    atsScoreRating: 96,
    isPopular: false,
    tags: ['Progression', 'Senior Tenure', 'Leadership'],
  },
  {
    id: 'contemporary',
    name: 'Contemporary',
    category: 'Modern',
    description: 'Modern dual-column layout with a left sidebar for skills, credentials, and contact info, and an expansive right story panel.',
    styleDescription: 'Modern layout with restrained color accents and clear section organization',
    isAtsFriendly: false,
    atsScoreRating: 92,
    isPopular: true,
    tags: ['Dual-Column', 'Sidebar', 'Modern'],
  },
  {
    id: 'thomas-hamptone',
    name: 'Editorial Classic (Hamptone)',
    category: 'Executive',
    description: 'High-contrast editorial serif layout with circular portrait, dual columns, and clean horizontal hairline dividers faithfully recreating the Thomas Hamptone executive design.',
    styleDescription: 'Editorial serif typography, circular photo, clean column dividers, refined spacing',
    isAtsFriendly: true,
    atsScoreRating: 98,
    isPopular: true,
    tags: ['Reference Design', 'Editorial', 'Executive', 'Dual-Column'],
  },
  {
    id: 'nick-koe',
    name: 'Teal Modernist (Nick Koe)',
    category: 'Creative',
    description: 'Dual-column design featuring bold teal accent markers, right-aligned contact column, solid teal skill pills, and portfolio showcase matching the Nick Koe photographer resume.',
    styleDescription: 'Teal accent bars, solid skill pills, modern creative dual-column',
    isAtsFriendly: true,
    atsScoreRating: 95,
    isPopular: true,
    tags: ['Reference Design', 'Teal Badges', 'Creative', 'Portfolio'],
  },
  {
    id: 'richard-sanchez',
    name: 'Navy Timeline (Sanchez)',
    category: 'Professional',
    description: 'Deep navy header banner with overlapping circular portrait, cool-grey contact sidebar, and an icon-connected vertical career timeline faithfully recreating Richard Sanchez.',
    styleDescription: 'Dark navy header, overlapping avatar, slate sidebar, vertical connected timeline',
    isAtsFriendly: true,
    atsScoreRating: 96,
    isPopular: true,
    tags: ['Reference Design', 'Navy Banner', 'Career Timeline', 'Two-Tone'],
  },
  {
    id: 'olivia-wilson-grid',
    name: 'Architectural Grid (Olivia Wilson)',
    category: 'Modern',
    description: 'Architectural 2x2 framed box grid layout with artistic calligraphy monogram watermark and circular bullet badges recreating the Olivia Wilson grid design.',
    styleDescription: 'Monogram watermark, structured box grid, hairline frame borders',
    isAtsFriendly: true,
    atsScoreRating: 97,
    isPopular: true,
    tags: ['Reference Design', 'Framed Grid', 'Monogram Watermark', 'Structured'],
  },
  {
    id: 'olivia-wilson-blush',
    name: 'Blush Editorial (Olivia Wilson)',
    category: 'Creative',
    description: 'Soft blush-pink sidebar with framed portrait, white section pills, signature calligraphy script name, and blush accent section banners recreating the Olivia Wilson blush resume.',
    styleDescription: 'Blush pink sidebar, framed portrait, script signature, tinted section bars',
    isAtsFriendly: false,
    atsScoreRating: 92,
    isPopular: true,
    tags: ['Reference Design', 'Blush Pink', 'Framed Photo', 'Editorial Script'],
  },
];

export function normalizeTemplateId(id: string): ResumeTemplateId {
  switch (id) {
    case 'modern-ats':
      return 'ats-classic';
    case 'tech-professional':
      return 'software-engineer';
    case 'executive':
    case 'corporate':
      return 'corporate-executive';
    case 'data-ai':
      return 'data-analyst';
    case 'minimal':
      return 'minimalist';
    case 'graduate-entry':
      return 'fresh-graduate';
    case 'ats-classic':
    case 'modern-professional':
    case 'minimalist':
    case 'corporate-executive':
    case 'software-engineer':
    case 'fresh-graduate':
    case 'data-analyst':
    case 'creative-professional':
    case 'compact-one-page':
    case 'academic':
    case 'experienced-professional':
    case 'contemporary':
    case 'thomas-hamptone':
    case 'nick-koe':
    case 'richard-sanchez':
    case 'olivia-wilson-grid':
    case 'olivia-wilson-blush':
      return id;
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
