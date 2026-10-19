import { ResumeData } from '@/types/resume';

export const SAMPLE_EXPERIENCED_RESUME: ResumeData = {
  id: 'res_sample_01',
  title: 'Senior Software & AI Engineer',
  candidateType: 'experienced',
  personalInfo: {
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    headline: 'Senior Full Stack & AI Engineer',
    linkedin: 'linkedin.com/in/rahulsharma-dev',
    github: 'github.com/rahulsharma-dev',
    portfolio: 'rahulsharma.dev',
  },
  summary:
    'Full Stack & AI Engineer with 6+ years of experience designing and deploying high-scale distributed web applications and production LLM pipelines. Architected microservices serving 4M+ monthly active users with 99.98% uptime. Proficient in React, TypeScript, Python, PostgreSQL, and cloud-native Kubernetes environments.',
  skills: {
    technical: [
      'Python',
      'JavaScript',
      'React',
      'SQL',
      'Machine Learning',
      'Git',
      'AWS',
      'Docker',
      'Kubernetes',
      'FastAPI',
      'PostgreSQL',
      'Redis',
    ],
    soft: [
      'Technical Leadership',
      'System Architecture Design',
      'Cross-functional Mentorship',
      'Agile Sprint Planning',
    ],
    tools: [
      'Visual Studio Code',
      'GitLab CI/CD',
      'Datadog',
      'Terraform',
      'Postman',
      'Jira',
    ],
  },
  experience: [
    {
      id: 'exp_01',
      company: 'Nexus AI Technologies',
      role: 'Staff Engineer - Core Platform',
      location: 'San Francisco, CA',
      startDate: '2023-01',
      endDate: '',
      current: true,
      bulletPoints: [
        'Architected real-time semantic search and retrieval-augmented generation (RAG) platform reducing query latency by 42% for 2.5M enterprise queries/day.',
        'Spearheaded transition from monolith to containerized Go/Python microservices on AWS EKS, cutting cloud infrastructure costs by $180,000 annually.',
        'Mentored 8 mid-level engineers and established bi-weekly technical design review standards that decreased critical production defects by 34%.',
      ],
    },
    {
      id: 'exp_02',
      company: 'Synthetix Cloud',
      role: 'Senior Full Stack Engineer',
      location: 'Seattle, WA',
      startDate: '2020-03',
      endDate: '2022-12',
      current: false,
      bulletPoints: [
        'Built enterprise analytics dashboard in React/TypeScript with sub-100ms client-side aggregation over 500,000 streaming telemetry rows.',
        'Engineered PostgreSQL read-replica pool with Redis caching layer, scaling queries per second from 1,200 to 9,800 under peak burst traffic.',
        'Automated CI/CD deployment pipelines using GitHub Actions and Terraform, shrinking release cycle times from 2 days to 18 minutes.',
      ],
    },
  ],
  education: [
    {
      id: 'edu_01',
      degree: 'B.S. in Computer Science',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      graduationYear: '2019',
      gpa: '3.86',
      honors: 'Dean’s Honors List, Magna Cum Laude',
    },
  ],
  projects: [
    {
      id: 'proj_01',
      title: 'NeuralFlow - Open Source Vector Search Index',
      description:
        'Engineered high-performance HNSW index in C++ with Python bindings. Achieved 94% recall at 12,000 QPS on million-scale embeddings dataset.',
      technologies: ['Python', 'C++', 'Docker', 'NumPy'],
      link: 'github.com/rahulsharma-dev/neuralflow',
      bullets: [
        'Adopted by 1,400+ developers on GitHub with 850 stars within 4 months of initial release.',
        'Implemented custom quantization reducing memory footprint by 65% with minimal accuracy degradation.',
      ],
    },
  ],
  certifications: [
    {
      id: 'cert_01',
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      date: '2023',
      credentialId: 'AWS-SAP-892401',
    },
  ],
  templateId: 'ats-classic',
  lastUpdated: new Date().toISOString(),
};
