import {
  ResumeData,
  ResumeTemplateInfo,
  ResumeAnalysisResult,
  ImprovementItem,
} from '@/types/resume';
import {
  SupportedSkill,
  UserSkill,
  AssessmentQuestion,
  SkillCertificate,
} from '@/types/skills';
import { JobPosting } from '@/types/jobs';
import { DashboardMetrics, ActivityLogItem, AtsHistoryPoint, SkillMasteryPoint } from '@/types/dashboard';

import { RESUME_TEMPLATES } from '@/lib/templates';
export { RESUME_TEMPLATES };

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
    name: 'AWS',
    category: 'Cloud & DevOps',
    status: 'not-verified',
  },
  {
    id: 'skill_05',
    name: 'Machine Learning',
    category: 'AI / Data',
    status: 'not-verified',
  },
  {
    id: 'skill_06',
    name: 'JavaScript',
    category: 'Programming',
    status: 'not-verified',
  },
  {
    id: 'skill_07',
    name: 'Git',
    category: 'Cloud & DevOps',
    status: 'not-verified',
  },
];

export const INITIAL_ANALYSIS_RESULT: ResumeAnalysisResult = {
  overallAtsScore: 84,
  keywordMatchScore: 88,
  formattingScore: 92,
  contentScore: 80,
  sectionScore: 85,
  wordCount: 486,
  readabilityScore: 78,
  detectedKeywords: [
    'Python',
    'React',
    'TypeScript',
    'PostgreSQL',
    'AWS',
    'Kubernetes',
    'Docker',
    'Distributed Systems',
    'Microservices',
    'RAG',
    'CI/CD',
  ],
  missingKeywords: [
    'System Monitoring',
    'Load Balancing',
    'GraphQL',
    'Kafka',
    'Unit Testing (PyTest/Jest)',
  ],
  strengths: [
    {
      id: 'str_1',
      section: 'Work Experience',
      title: 'Strong Quantifiable Achievements',
      description:
        'Bullet points include explicit metrics ($180K cost savings, 42% query latency reduction, 4M+ MAU) which drastically improve ATS ranking and recruiter conversion.',
    },
    {
      id: 'str_2',
      section: 'Skills Coverage',
      title: 'High-Demand Core Technologies',
      description:
        'Strong overlap with Tier-1 engineering criteria: Python, TypeScript, React, PostgreSQL, and cloud containerization technologies are prominent and consistently formatted.',
    },
    {
      id: 'str_3',
      section: 'Structure & ATS Parseability',
      title: 'Compliant Section Hierarchy',
      description:
        'Standardized headings (Summary, Skills, Experience, Education, Projects) enable 100% token extraction accuracy across modern parsers (Greenhouse, Lever, Workday).',
    },
  ],
  weaknesses: [
    {
      id: 'wk_1',
      section: 'Summary',
      whatIsWrong: 'Summary is somewhat brief and misses target leadership scope.',
      whyItMatters:
        'Recruiters spend 6 seconds on initial screening; a concise value proposition defining domain authority sets the lens for the entire review.',
      howToImprove:
        'Include your primary architectural specialty and specify team sizing or budget scope in your opening paragraph.',
      severity: 'medium',
    },
    {
      id: 'wk_2',
      section: 'Experience',
      whatIsWrong: 'Lack of automated testing and code quality tools mentioned.',
      whyItMatters:
        'Modern senior roles require explicit evidence of test-driven development, linting pipelines, and code review rigor.',
      howToImprove:
        'Add references to testing frameworks (e.g. PyTest, Jest, Cypress) in your CI/CD automation bullet.',
      severity: 'medium',
    },
    {
      id: 'wk_3',
      section: 'Projects',
      whatIsWrong: 'Only one major project highlighted despite extensive technical breadth.',
      whyItMatters:
        'Secondary systems experience (e.g. event-driven message queues or database indexing) is hidden in bullets rather than showcasing standalone engineering ownership.',
      howToImprove:
        'Add a second project emphasizing distributed streaming data or asynchronous worker queues.',
      severity: 'low',
    },
  ],
  recommendations: [
    {
      id: 'rec_1',
      category: 'Keyword Optimization',
      title: 'Incorporate Kafka & Event-Driven Patterns',
      actionText:
        'Explicitly state event streaming or async queue systems in your platform description to match Senior Backend ATS filter thresholds.',
      originalText: 'Transitioned monolith to containerized Go/Python microservices...',
      improvedText:
        'Transitioned monolith to event-driven Go/Python microservices via Kafka, cutting cloud infrastructure costs by $180,000 annually.',
      impact: '+6 ATS Points',
    },
    {
      id: 'rec_2',
      category: 'Impact Amplification',
      title: 'Quantify Mentorship Outcomes',
      actionText:
        'Mention internal promotions or team velocity gain resulting from your leadership and engineering design reviews.',
      originalText: 'Mentored 8 mid-level engineers...',
      improvedText:
        'Mentored 8 mid-level engineers with 3 receiving senior promotions within 14 months; boosted team sprint velocity by 28%.',
      impact: '+4 ATS Points',
    },
  ],
  topSuggestions: [
    {
      id: 'sug_1',
      rank: 1,
      priority: 'High',
      section: 'Work Experience & Testing',
      whatNeedsImprovement:
        'Absence of automated testing frameworks and quality verification tools mentioned in experience bullets.',
      whyItMatters:
        'Enterprise technical recruiters filter heavily on testing rigor; omitting testing frameworks signals a gap in production deployment practices.',
      howToImprove:
        'Incorporate explicit mentions of testing frameworks (e.g. PyTest, Jest, Cypress) within your existing CI/CD automation bullet.',
      example:
        'Architected automated CI/CD pipelines incorporating Jest unit tests and Playwright integration suites, cutting regression defects by 35%.',
    },
    {
      id: 'sug_2',
      rank: 2,
      priority: 'Medium',
      section: 'Keyword Coverage',
      whatNeedsImprovement:
        'Absence of event streaming and asynchronous queue keywords (Kafka, RabbitMQ) for distributed backend roles.',
      whyItMatters:
        'Recruiter boolean search strings specifically query for distributed streaming and asynchronous messaging architectures.',
      howToImprove:
        'Highlight event streaming or async worker queues in your microservices infrastructure description where applicable.',
      example:
        'Transitioned monolith to event-driven Go/Python microservices via Kafka, cutting cloud infrastructure costs by $180,000 annually.',
    },
    {
      id: 'sug_3',
      rank: 3,
      priority: 'Medium',
      section: 'Professional Summary',
      whatNeedsImprovement:
        'Executive summary is concise but misses explicit leadership scope and organizational scale.',
      whyItMatters:
        'Recruiters review summaries in under 6 seconds; specifying team sizing and architectural ownership provides immediate proof of seniority.',
      howToImprove:
        'Add team sizing, user scale, or architectural scope into your opening value proposition statement.',
      example:
        'Staff Full Stack & AI Systems Engineer with 7+ years leading distributed engineering teams and architecting platforms serving 4M+ monthly active users.',
    },
  ],
  summaryFeedback:
    'This resume demonstrates high caliber engineering execution with clear, quantified impacts. Minor optimizations around automated testing keywords and expanded event-driven architectures will elevate this profile into the 90th percentile of ATS applicant pools.',
  analyzedAt: new Date().toISOString(),
};

export const INITIAL_IMPROVEMENTS: ImprovementItem[] = [
  {
    id: 'imp_01',
    section: 'summary',
    field: 'Professional Summary',
    originalContent:
      'Full Stack & AI Engineer with 6+ years of experience designing and deploying high-scale distributed web applications and production LLM pipelines. Architected microservices serving 4M+ monthly active users with 99.98% uptime. Proficient in React, TypeScript, Python, PostgreSQL, and cloud-native Kubernetes environments.',
    improvedContent:
      'High-impact Staff / Senior Full Stack & AI Engineer with 6+ years spearheading distributed systems and production LLM/RAG pipelines at enterprise scale. Engineered resilient microservice ecosystems serving 4M+ monthly active users at 99.98% SLA reliability. Deep expertise across TypeScript, Python, PostgreSQL, AWS EKS, and high-throughput vector retrieval architectures.',
    reasoning:
      'Elevated seniority signaling with active authority verbs ("spearheading", "engineered resilient ecosystems") and tightened SLA metric terminology without inventing unverified facts.',
    metricImpact: '+8 ATS Score & Recruiter Engagement',
    status: 'pending',
  },
  {
    id: 'imp_02',
    section: 'experience',
    field: 'Nexus AI - Architecture Bullet',
    originalContent:
      'Architected real-time semantic search and retrieval-augmented generation (RAG) platform reducing query latency by 42% for 2.5M enterprise queries/day.',
    improvedContent:
      'Architected high-throughput semantic search and RAG platform with sub-80ms p95 latency across 2.5M daily enterprise queries, slashing median response latency by 42%.',
    reasoning:
      'Added standard industry latency benchmark (p95) to quantify responsiveness rigorously.',
    metricImpact: '+5 Technical Depth Score',
    status: 'pending',
  },
  {
    id: 'imp_03',
    section: 'experience',
    field: 'Synthetix Cloud - Database Optimization Bullet',
    originalContent:
      'Engineered PostgreSQL read-replica pool with Redis caching layer, scaling queries per second from 1,200 to 9,800 under peak burst traffic.',
    improvedContent:
      'Engineered highly available PostgreSQL read-replica cluster coupled with Redis distributed caching layer, scaling throughput by 716% (1,200 to 9,800 QPS) under critical peak burst loads.',
    reasoning:
      'Explicitly calculates the percentage growth (+716%) which draws recruiters’ eyes directly to the business and architectural win.',
    metricImpact: '+6 System Scale Visibility',
    status: 'pending',
  },
];

// Rich, accurate question bank for the 11 supported skills
export const SKILL_ASSESSMENT_QUESTIONS: Record<SupportedSkill, AssessmentQuestion[]> = {
  Python: [
    {
      id: 'py_01',
      skill: 'Python',
      type: 'multiple-choice',
      question: 'What is the primary role of Python’s Global Interpreter Lock (GIL)?',
      options: [
        'To speed up CPU-bound multithreaded operations across multiple cores',
        'To synchronize execution of threads so only one native thread runs Python bytecode at a time',
        'To prevent memory leaks by locking garbage collection during I/O operations',
        'To enforce strong typing across dynamic object assignments',
      ],
      correctOptionIndex: 1,
      explanation:
        'The GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes simultaneously in CPython.',
      topic: 'Concurrency & Internals',
    },
    {
      id: 'py_02',
      skill: 'Python',
      type: 'code-output',
      question: 'What will be the output of the following code snippet?',
      codeSnippet: `def func(a, b=[]):\n    b.append(a)\n    return b\n\nprint(func(1))\nprint(func(2))`,
      options: ['[1] and [2]', '[1] and [1, 2]', '[1] and []', 'TypeError: mutable default argument'],
      correctOptionIndex: 1,
      explanation:
        'Default parameter values are evaluated once when the function definition is executed, so the same mutable list `b` is reused across successive invocations.',
      topic: 'Functions & Mutable Defaults',
    },
    {
      id: 'py_03',
      skill: 'Python',
      type: 'debugging',
      question: 'Why does the following dictionary comprehension cause unexpected behavior?',
      codeSnippet: `keys = ['a', 'b', 'c']\nfuncs = [lambda: k for k in keys]\nprint([f() for f in funcs])`,
      options: [
        'SyntaxError: lambda cannot be used in list comprehensions',
        'All lambdas return "c" due to late-binding closures over the loop variable `k`',
        'It outputs [None, None, None]',
        'It raises a NameError because `k` is out of scope',
      ],
      correctOptionIndex: 1,
      explanation:
        'Python closures bind variables by reference rather than value; by the time the lambdas are called, `k` has its final value of "c". To fix, use `lambda k=k: k`.',
      topic: 'Closures & Scopes',
    },
    {
      id: 'py_04',
      skill: 'Python',
      type: 'multiple-choice',
      question: 'What is the time complexity of checking membership (`x in collection`) for a set vs a list in Python (average case)?',
      options: [
        'Set: O(1), List: O(n)',
        'Set: O(n), List: O(1)',
        'Set: O(log n), List: O(n)',
        'Set: O(1), List: O(log n)',
      ],
      correctOptionIndex: 0,
      explanation:
        'Python sets are implemented via hash tables, giving average O(1) lookup, whereas lists require linear scans of O(n).',
      topic: 'Data Structures & Complexity',
    },
    {
      id: 'py_05',
      skill: 'Python',
      type: 'practical-coding',
      question: 'Which built-in mechanism should be used to implement a memory-efficient generator that yields values on demand?',
      codeSnippet: `def stream_records(data):\n    for record in data:\n        # which statement goes here?\n        ???`,
      options: [
        'return record',
        'yield record',
        'emit record',
        'async.send(record)',
      ],
      correctOptionIndex: 1,
      explanation:
        'The `yield` keyword turns a normal function into a generator iterator, yielding one value at a time without loading entire sequences into memory.',
      topic: 'Generators & Iterators',
    },
    {
      id: 'py_06',
      skill: 'Python',
      type: 'multiple-choice',
      question: 'What is the difference between `__init__` and `__new__` in Python classes?',
      options: [
        '`__init__` allocates the memory while `__new__` initializes properties',
        '`__new__` is the static constructor that creates and returns the object instance, while `__init__` initializes it',
        '`__init__` is only called for subclasses, while `__new__` is called for base classes',
        'There is no difference; they are aliases for the same dunder method',
      ],
      correctOptionIndex: 1,
      explanation:
        '`__new__` is called first to instantiate the class object and returns the instance, which is then passed to `__init__` for field assignment.',
      topic: 'OOP & Dunder Methods',
    },
    {
      id: 'py_07',
      skill: 'Python',
      type: 'code-output',
      question: 'What does the following slice operation return?',
      codeSnippet: `nums = [10, 20, 30, 40, 50]\nprint(nums[::-2])`,
      options: ['[50, 30, 10]', '[10, 30, 50]', '[40, 20]', '[50, 40, 30]'],
      correctOptionIndex: 0,
      explanation:
        'A negative step of -2 traverses the list in reverse starting from the last item, skipping every other element: 50, 30, 10.',
      topic: 'Slicing & Sequences',
    },
    {
      id: 'py_08',
      skill: 'Python',
      type: 'multiple-choice',
      question: 'How does Python handle memory management for small integers (-5 to 256)?',
      options: [
        'They are garbage-collected immediately upon leaving scope',
        'They are pre-allocated and interned (singleton cache) in CPython for performance',
        'They are stored directly on the execution stack without heap allocation',
        'They require explicit pointer deallocation',
      ],
      correctOptionIndex: 1,
      explanation:
        'CPython maintains an internal cache array of integer objects for values between -5 and 256; any reference to these numbers points to identical memory addresses.',
      topic: 'Memory Management',
    },
    {
      id: 'py_09',
      skill: 'Python',
      type: 'debugging',
      question: 'How should you safely manage file resource closure even in the event of an unhandled exception?',
      codeSnippet: `# Which pattern guarantees f.close() is called?\nwith open("data.txt", "r") as f:\n    data = f.read()`,
      options: [
        'The `with` statement utilizes the Context Manager protocol (`__enter__` and `__exit__`)',
        'You must manually write `f.close()` inside the block',
        'Python files auto-close via the garbage collector every 10ms',
        'Only `try/catch` without `finally` can close files',
      ],
      correctOptionIndex: 0,
      explanation:
        'The `with` statement calls `__exit__` upon leaving the block regardless of whether exceptions occurred, ensuring reliable resource release.',
      topic: 'Context Managers',
    },
    {
      id: 'py_10',
      skill: 'Python',
      type: 'practical-coding',
      question: 'In `dataclasses`, what decorator argument prevents instance attribute modification after creation?',
      options: [
        '@dataclass(immutable=True)',
        '@dataclass(frozen=True)',
        '@dataclass(readonly=True)',
        '@dataclass(const=True)',
      ],
      correctOptionIndex: 1,
      explanation:
        '`@dataclass(frozen=True)` emulates read-only frozen instances by intercepting `__setattr__` and `__delattr__`.',
      topic: 'Modern Standard Library',
    },
  ],
  React: [
    {
      id: 'rc_01',
      skill: 'React',
      type: 'multiple-choice',
      question: 'What is the primary benefit of React’s Virtual DOM reconciliation algorithm?',
      options: [
        'It completely replaces the browser layout engine',
        'It computes minimal diffs between virtual trees to batch and minimize costly native DOM manipulations',
        'It compiles JSX into machine bytecode at runtime',
        'It eliminates the need for CSS rendering',
      ],
      correctOptionIndex: 1,
      explanation:
        'Reconciliation computes difference heuristics between new and old Virtual DOM representations to apply targeted patches to real DOM nodes.',
      topic: 'Reconciliation & Architecture',
    },
    {
      id: 'rc_02',
      skill: 'React',
      type: 'code-output',
      question: 'In React 18/19, how are multiple state setters within the same event handler processed?',
      codeSnippet: `function handleClick() {\n  setCount(c => c + 1);\n  setFlag(f => !f);\n}`,
      options: [
        'They trigger two separate sequential re-renders',
        'They are automatically batched into a single unified re-render',
        'Only the last setter executes',
        'An infinite re-render loop is triggered',
      ],
      correctOptionIndex: 1,
      explanation:
        'React 18+ provides automatic batching for all updates inside timeouts, promises, and native event handlers into a single re-render.',
      topic: 'Batching & Performance',
    },
    {
      id: 'rc_03',
      skill: 'React',
      type: 'debugging',
      question: 'Why does passing an inline object to a memoized child component defeat `React.memo`?',
      codeSnippet: `<MemoizedChild config={{ theme: "dark" }} />`,
      options: [
        'React.memo only works with string props',
        'Object identity comparison (`===`) creates a new reference on every parent render',
        'MemoizedChild requires `useMemo` on the child itself',
        'Inline objects cause syntax compilation errors in Next.js',
      ],
      correctOptionIndex: 1,
      explanation:
        'By default `React.memo` performs shallow equality (`Object.is`). A new object literal `{ theme: "dark" }` is allocated on every parent render, resulting in `oldProps.config !== newProps.config`.',
      topic: 'Memoization & Rendering',
    },
    {
      id: 'rc_04',
      skill: 'React',
      type: 'multiple-choice',
      question: 'What is the correct purpose of `useId` in React?',
      options: [
        'To generate cryptographic session tokens',
        'To generate unique, stable IDs for accessibility attributes across SSR and hydration',
        'To track component re-render counts in dev mode',
        'To assign database primary keys',
      ],
      correctOptionIndex: 1,
      explanation:
        '`useId` generates unique IDs that are stable across server rendering and client hydration, avoiding hydration mismatch warnings.',
      topic: 'Hooks & Accessibility',
    },
    {
      id: 'rc_05',
      skill: 'React',
      type: 'practical-coding',
      question: 'Which hook should you use to store a mutable value that persists across renders without triggering a re-render when mutated?',
      options: ['useState', 'useRef', 'useMemo', 'useCallback'],
      correctOptionIndex: 1,
      explanation:
        '`useRef` returns a mutable object whose `.current` property can be modified without causing React to trigger a component re-render.',
      topic: 'Hooks & Refs',
    },
    {
      id: 'rc_06',
      skill: 'React',
      type: 'multiple-choice',
      question: 'What is the role of `key` props when rendering lists in React?',
      options: [
        'Keys are passed directly into children props as an integer index',
        'Keys provide identity so React knows which list items were added, removed, or reordered across renders',
        'Keys enable CSS grid animation acceleration',
        'Keys are mandatory only for SVG elements',
      ],
      correctOptionIndex: 1,
      explanation:
        'Keys give elements a persistent identity across renders, allowing React to match children in the original tree with children in the subsequent tree.',
      topic: 'Lists & Keys',
    },
    {
      id: 'rc_07',
      skill: 'React',
      type: 'code-output',
      question: 'What will be logged when this component mounts?',
      codeSnippet: `useEffect(() => {\n  console.log("A");\n  return () => console.log("B");\n}, []);`,
      options: [
        'Logs "A" on mount, and "B" only when unmounted',
        'Logs "B" first, then "A"',
        'Logs "A" and "B" simultaneously',
        'Throws an error because cleanup cannot return a string',
      ],
      correctOptionIndex: 0,
      explanation:
        'The effect body runs after the component renders and mounts ("A"), and the cleanup callback ("B") is invoked when the component unmounts.',
      topic: 'Lifecycle & useEffect',
    },
    {
      id: 'rc_08',
      skill: 'React',
      type: 'debugging',
      question: 'What is wrong with modifying state directly like `state.count = 5` in React?',
      options: [
        'React will throw a runtime ReadOnly error',
        'React will not detect the change because state setters are required to schedule reconciliation',
        'Direct mutations cause browser memory leaks',
        'Direct mutations are actually recommended in modern React',
      ],
      correctOptionIndex: 1,
      explanation:
        'React relies on state update dispatchers to know that state has changed and to trigger re-rendering; mutating state directly bypasses the scheduler.',
      topic: 'Immutability & State',
    },
    {
      id: 'rc_09',
      skill: 'React',
      type: 'multiple-choice',
      question: 'What does `useCallback(fn, deps)` return?',
      options: [
        'The cached return value of executing `fn`',
        'A memoized version of the callback function that only changes if dependencies change',
        'A promise that resolves when `fn` completes',
        'A cleanup subscription object',
      ],
      correctOptionIndex: 1,
      explanation:
        '`useCallback` caches a function definition between renders so child components that receive it do not re-render unnecessarily.',
      topic: 'Hooks & Optimization',
    },
    {
      id: 'rc_10',
      skill: 'React',
      type: 'practical-coding',
      question: 'Which boundary component catches JavaScript errors anywhere in their child component tree and displays a fallback UI?',
      options: [
        '<ErrorBoundary>',
        '<Suspense>',
        '<StrictMode>',
        '<Provider>',
      ],
      correctOptionIndex: 0,
      explanation:
        'Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI.',
      topic: 'Error Handling',
    },
  ],
  SQL: [
    {
      id: 'sql_01',
      skill: 'SQL',
      type: 'multiple-choice',
      question: 'What is the fundamental difference between `WHERE` and `HAVING` clauses in SQL?',
      options: [
        '`WHERE` filters rows before aggregation, while `HAVING` filters aggregated groups after `GROUP BY`',
        '`HAVING` filters single rows while `WHERE` filters tables',
        '`WHERE` can only be used with numeric datatypes',
        'There is no difference; they are interchangeable keywords',
      ],
      correctOptionIndex: 0,
      explanation:
        '`WHERE` filters individual records before aggregation functions (`COUNT`, `SUM`, `AVG`) are executed. `HAVING` filters group rows produced by `GROUP BY`.',
      topic: 'Filtering & Aggregation',
    },
    {
      id: 'sql_02',
      skill: 'SQL',
      type: 'code-output',
      question: 'What does `SELECT COUNT(1)` vs `SELECT COUNT(column_name)` return if some rows have NULL in that column?',
      options: [
        'Both return the exact same count',
        '`COUNT(1)` counts all rows including NULLs, while `COUNT(column_name)` ignores NULL values',
        '`COUNT(column_name)` throws an exception on NULL values',
        '`COUNT(1)` only counts rows where column equals 1',
      ],
      correctOptionIndex: 1,
      explanation:
        '`COUNT(*)` and `COUNT(1)` count all returned rows regardless of content, whereas `COUNT(column)` specifically counts non-null occurrences of that column.',
      topic: 'Aggregates & Null Handling',
    },
    {
      id: 'sql_03',
      skill: 'SQL',
      type: 'debugging',
      question: 'Why does `SELECT * FROM users WHERE status != "active"` exclude users where `status IS NULL`?',
      options: [
        'In three-valued logic (3VL), comparisons with NULL evaluate to UNKNOWN, which resolves to FALSE in WHERE filters',
        'SQL automatically converts NULL to empty string',
        'It is a bug in the query planner',
        'The query is syntactically invalid because quotes must be single quotes',
      ],
      correctOptionIndex: 0,
      explanation:
        'SQL uses Three-Valued Logic (TRUE, FALSE, UNKNOWN). NULL != "active" is UNKNOWN, and WHERE clauses only retain rows evaluating strictly to TRUE. To include them, write `WHERE status != "active" OR status IS NULL`.',
      topic: 'Three-Valued Logic & Nulls',
    },
    {
      id: 'sql_04',
      skill: 'SQL',
      type: 'multiple-choice',
      question: 'Which ACID property guarantees that all operations within a transaction succeed or all roll back completely?',
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      correctOptionIndex: 0,
      explanation:
        'Atomicity guarantees that all statements in a transaction work as a single indivisible unit: either all succeed or none persist.',
      topic: 'ACID Properties',
    },
    {
      id: 'sql_05',
      skill: 'SQL',
      type: 'practical-coding',
      question: 'Which window function assigns sequential integers starting from 1 to each row within a partition, without skipping numbers on ties?',
      options: ['ROW_NUMBER()', 'RANK()', 'DENSE_RANK()', 'NTILE()'],
      correctOptionIndex: 0,
      explanation:
        '`ROW_NUMBER()` guarantees unique sequential integers (1, 2, 3...) regardless of ties, whereas `RANK()` and `DENSE_RANK()` handle ties specially.',
      topic: 'Window Functions',
    },
    {
      id: 'sql_06',
      skill: 'SQL',
      type: 'multiple-choice',
      question: 'What type of index is most effective for range queries (`WHERE age BETWEEN 25 AND 35`) on relational databases?',
      options: ['B-Tree Index', 'Hash Index', 'Full-Text Index', 'Bloom Filter'],
      correctOptionIndex: 0,
      explanation:
        'B-Trees keep data ordered, enabling logarithmic time search for ranges and boundary traversals. Hash indexes only support equality (`=`) checks.',
      topic: 'Indexing & Performance',
    },
    {
      id: 'sql_07',
      skill: 'SQL',
      type: 'code-output',
      question: 'What is the result of an `INNER JOIN` when there are no matching keys between Table A and Table B?',
      options: [
        'An empty result set (0 rows)',
        'All rows from Table A with NULLs for Table B',
        'A full Cartesian product',
        'An SQL execution error',
      ],
      correctOptionIndex: 0,
      explanation:
        '`INNER JOIN` retains only rows where the join predicate evaluates to TRUE for both tables. If no rows match, 0 rows are returned.',
      topic: 'Joins',
    },
    {
      id: 'sql_08',
      skill: 'SQL',
      type: 'multiple-choice',
      question: 'What does a composite index on `(last_name, first_name)` allow the database to optimize?',
      options: [
        'Queries filtering on `last_name` alone, or both `last_name` AND `first_name` (leftmost prefix rule)',
        'Queries filtering on `first_name` alone without `last_name`',
        'Only queries that select all columns via `*`',
        'Only updates and deletes, but not selects',
      ],
      correctOptionIndex: 0,
      explanation:
        'Composite indexes follow the Leftmost Prefix Rule: they can be used for queries filtering on column 1, or columns 1+2, but cannot be used for column 2 alone.',
      topic: 'Composite Indexes',
    },
    {
      id: 'sql_09',
      skill: 'SQL',
      type: 'debugging',
      question: 'What is a SQL Injection vulnerability, and what is the primary defense against it?',
      options: [
        'A buffer overflow in the query parser; defended by restarting the DB',
        'Attacker manipulation of SQL syntax via unsanitized string concatenation; defended by Parameterized Queries / Prepared Statements',
        'A hardware disk failure; defended by RAID mirroring',
        'A network port scan; defended by TLS certificates',
      ],
      correctOptionIndex: 1,
      explanation:
        'SQL injection occurs when user input is concatenated directly into SQL text. Parameterized queries send data separately from SQL code, preventing input from altering query structure.',
      topic: 'Security & Prepared Statements',
    },
    {
      id: 'sql_10',
      skill: 'SQL',
      type: 'practical-coding',
      question: 'Which syntax defines a Common Table Expression (CTE) in modern SQL?',
      options: [
        'WITH cte_name AS (SELECT ...)',
        'CREATE TEMPORARY cte_name AS (SELECT ...)',
        'DECLARE cte_name TABLE = (SELECT ...)',
        'SUBQUERY cte_name IS (SELECT ...)',
      ],
      correctOptionIndex: 0,
      explanation:
        'Common Table Expressions are introduced with the `WITH` keyword, allowing modular, recursive, and readable subquery definitions.',
      topic: 'CTEs & Subqueries',
    },
  ],
  JavaScript: [
    {
      id: 'js_01',
      skill: 'JavaScript',
      type: 'multiple-choice',
      question: 'What is the order of execution between microtasks and macrotasks in the JavaScript Event Loop?',
      options: [
        'All microtasks (e.g. Promise.then, queueMicrotask) run before the next macrotask (e.g. setTimeout) executes',
        'Macrotasks always execute before microtasks',
        'They execute in alternating 1:1 order',
        'Microtasks only run when the browser tab is minimized',
      ],
      correctOptionIndex: 0,
      explanation:
        'After every macrotask completes, the JavaScript engine drains the entire microtask queue before picking the next macrotask from the task queue.',
      topic: 'Event Loop & Concurrency',
    },
    {
      id: 'js_02',
      skill: 'JavaScript',
      type: 'code-output',
      question: 'What is logged by the following code?',
      codeSnippet: `console.log(typeof null);\nconsole.log(null instanceof Object);`,
      options: ['"object" and false', '"null" and true', '"object" and true', '"undefined" and false'],
      correctOptionIndex: 0,
      explanation:
        '`typeof null` evaluates to "object" due to a historical bug in the first JS implementation where objects were tagged with type tag 0. However, `null instanceof Object` is false because null does not have a prototype chain.',
      topic: 'Types & Prototypes',
    },
    {
      id: 'js_03',
      skill: 'JavaScript',
      type: 'debugging',
      question: 'What causes the difference in output between arrow functions and regular function declarations regarding `this`?',
      options: [
        'Arrow functions have lexical `this` (they inherit `this` from enclosing scope), whereas regular functions bind `this` based on how they are invoked',
        'Arrow functions cannot accept arguments',
        'Regular functions are always executed on Web Workers',
        'Arrow functions bind `this` to the global window object in strict mode',
      ],
      correctOptionIndex: 0,
      explanation:
        'Arrow functions do not define their own execution context; their `this` value is determined lexically from the surrounding scope.',
      topic: 'Functions & Scopes',
    },
    {
      id: 'js_04',
      skill: 'JavaScript',
      type: 'multiple-choice',
      question: 'Which method creates a deep copy of serializable JavaScript objects natively in modern browsers and Node.js?',
      options: ['structuredClone(obj)', 'Object.assign({}, obj)', '{ ...obj }', 'obj.clone()'],
      correctOptionIndex: 0,
      explanation:
        '`structuredClone()` provides a native, high-performance deep clone algorithm supporting circular references, Dates, RegExps, Maps, Sets, and TypedArrays.',
      topic: 'Object Manipulation',
    },
    {
      id: 'js_05',
      skill: 'JavaScript',
      type: 'practical-coding',
      question: 'How do you handle multiple promises concurrently and wait until all of them settle (either fulfill or reject)?',
      options: ['Promise.allSettled()', 'Promise.all()', 'Promise.race()', 'Promise.any()'],
      correctOptionIndex: 0,
      explanation:
        '`Promise.allSettled()` returns a promise that resolves after all given promises have either fulfilled or rejected, with an array of result objects describing each outcome.',
      topic: 'Async & Promises',
    },
    {
      id: 'js_06',
      skill: 'JavaScript',
      type: 'code-output',
      question: 'What is logged to the console?',
      codeSnippet: `const a = [1, 2, 3];\nconst b = a;\nb.push(4);\nconsole.log(a.length);`,
      options: ['4', '3', 'undefined', 'TypeError'],
      correctOptionIndex: 0,
      explanation:
        'Arrays are reference types in JavaScript. Assigning `b = a` copies the memory pointer, so mutating `b` mutates the underlying array referenced by `a`.',
      topic: 'References & Memory',
    },
    {
      id: 'js_07',
      skill: 'JavaScript',
      type: 'multiple-choice',
      question: 'What happens when a variable declared with `let` is accessed before its declaration line?',
      options: [
        'ReferenceError due to Temporal Dead Zone (TDZ)',
        'Returns `undefined` like `var`',
        'Silent failure without errors',
        'Logs `null`',
      ],
      correctOptionIndex: 0,
      explanation:
        'Variables declared with `let` and `const` are hoisted but uninitialized, existing in the Temporal Dead Zone until their definition is evaluated.',
      topic: 'Hoisting & TDZ',
    },
    {
      id: 'js_08',
      skill: 'JavaScript',
      type: 'debugging',
      question: 'Why does `0.1 + 0.2 === 0.3` evaluate to false in JavaScript?',
      options: [
        'Floating point numbers are represented using IEEE 754 double precision binary, causing small rounding inaccuracies (0.30000000000000004)',
        'JavaScript does not support decimals',
        '0.1 is treated as an integer in strict mode',
        'Type coercion converts 0.3 to string',
      ],
      correctOptionIndex: 0,
      explanation:
        'Base-10 fractions like 0.1 cannot be represented precisely in finite binary floating-point representations, leading to precision loss.',
      topic: 'Numbers & Precision',
    },
    {
      id: 'js_09',
      skill: 'JavaScript',
      type: 'multiple-choice',
      question: 'What is the primary difference between a `Map` and a plain object in JavaScript?',
      options: [
        'A Map allows keys of any type (including objects/functions) and maintains insertion order',
        'Objects are faster for searching keys of type symbol',
        'Maps cannot be iterated with `for...of`',
        'Maps are stored in local storage automatically',
      ],
      correctOptionIndex: 0,
      explanation:
        'Plain objects only support string and symbol keys. Maps can use any value (including primitives, functions, or objects) as keys and guarantee insertion order.',
      topic: 'Collections & Maps',
    },
    {
      id: 'js_10',
      skill: 'JavaScript',
      type: 'practical-coding',
      question: 'Which syntax uses optional chaining to safely access deeply nested properties without throwing TypeError if an intermediate value is null or undefined?',
      options: ['user?.profile?.address?.zipCode', 'user??profile??address??zipCode', 'user.try(profile.address)', 'user::profile::address'],
      correctOptionIndex: 0,
      explanation:
        'The optional chaining operator (`?.`) short-circuits and evaluates to `undefined` if the operand before `?.` is `null` or `undefined`.',
      topic: 'Modern Syntax',
    },
  ],
  Java: [
    {
      id: 'java_01',
      skill: 'Java',
      type: 'multiple-choice',
      question: 'What is the difference between JVM, JRE, and JDK in Java?',
      options: [
        'JDK contains JRE and development tools; JRE contains JVM and runtime libraries; JVM executes compiled bytecode',
        'JVM is the compiler; JDK is the runtime; JRE is the debugger',
        'They are different versions of the Java language specification',
        'JDK only runs on Linux servers',
      ],
      correctOptionIndex: 0,
      explanation:
        'JDK (Java Development Kit) is the full developer package. JRE (Java Runtime Environment) allows running apps. JVM (Java Virtual Machine) executes bytecode.',
      topic: 'Java Architecture',
    },
    {
      id: 'java_02',
      skill: 'Java',
      type: 'code-output',
      question: 'What is printed by `System.out.println(s1 == s2)` vs `s1.equals(s2)` for String s1 = "hello"; String s2 = new String("hello");?',
      options: [
        '`false` for == and `true` for equals',
        '`true` for both',
        '`false` for both',
        '`true` for == and `false` for equals',
      ],
      correctOptionIndex: 0,
      explanation:
        '`==` tests reference identity (memory addresses). `s1` points to the String pool while `s2` points to a separate heap allocation. `.equals()` compares character values.',
      topic: 'Strings & Memory',
    },
    {
      id: 'java_03',
      skill: 'Java',
      type: 'debugging',
      question: 'Why should `ConcurrentHashMap` be preferred over `Collections.synchronizedMap()` in high-concurrency environments?',
      options: [
        '`ConcurrentHashMap` uses bucket-level / segment locking allowing simultaneous reads and writes without locking the entire table',
        '`ConcurrentHashMap` does not use locks at all',
        '`synchronizedMap` is deprecated in Java 17',
        '`ConcurrentHashMap` runs on GPU threads',
      ],
      correctOptionIndex: 0,
      explanation:
        '`Collections.synchronizedMap` locks the entire collection on every operation. `ConcurrentHashMap` achieves high throughput via lock striping and CAS operations.',
      topic: 'Concurrency & Collections',
    },
    {
      id: 'java_04',
      skill: 'Java',
      type: 'multiple-choice',
      question: 'What does the `volatile` keyword guarantee in Java multi-threading?',
      options: [
        'Visibility of variable changes across threads (reads/writes directly to main memory) and prevents instruction reordering',
        'Mutual exclusion lock similar to `synchronized` blocks',
        'Automatic atomicity for compound operations like `i++`',
        'Serialization of the object to disk',
      ],
      correctOptionIndex: 0,
      explanation:
        '`volatile` ensures changes are immediately visible to other threads and prevents instruction reordering, but does NOT guarantee atomicity for operations like `count++`.',
      topic: 'Memory Model & Concurrency',
    },
    {
      id: 'java_05',
      skill: 'Java',
      type: 'practical-coding',
      question: 'Which interface in Java represents a function that accepts one argument and produces a result?',
      options: ['java.util.function.Function<T, R>', 'Consumer<T>', 'Supplier<T>', 'Predicate<T>'],
      correctOptionIndex: 0,
      explanation:
        '`Function<T, R>` takes a single input of type T and returns a result of type R. `Consumer` returns void, `Supplier` takes no arguments, and `Predicate` returns boolean.',
      topic: 'Functional Interfaces',
    },
    {
      id: 'java_06',
      skill: 'Java',
      type: 'multiple-choice',
      question: 'What is the purpose of the Java Garbage Collector’s Generational Hypothesis?',
      options: [
        'Most objects die young, so segregating heap into Eden/Young and Tenured/Old minimizes collection pauses',
        'All objects live equally long and are scanned uniformly',
        'Garbage collection is only executed when memory is 100% full',
        'It converts object pointers into numeric IDs',
      ],
      correctOptionIndex: 0,
      explanation:
        'The weak generational hypothesis posits that most allocated objects become unreachable shortly after allocation, making frequent minor GCs on young generation very efficient.',
      topic: 'JVM & Garbage Collection',
    },
    {
      id: 'java_07',
      skill: 'Java',
      type: 'code-output',
      question: 'Can an `abstract` class have concrete implemented methods and constructor methods in Java?',
      options: [
        'Yes, an abstract class can have constructors, state fields, and fully implemented concrete methods',
        'No, abstract classes can only contain method signatures without bodies',
        'Constructors are prohibited in abstract classes',
        'Only static methods are allowed in abstract classes',
      ],
      correctOptionIndex: 0,
      explanation:
        'Abstract classes can define instance variables, full constructors (called via `super()`), and concrete methods alongside abstract method signatures.',
      topic: 'OOP & Abstract Classes',
    },
    {
      id: 'java_08',
      skill: 'Java',
      type: 'debugging',
      question: 'How do you prevent SQL Injection when querying databases in Java?',
      options: [
        'Use `PreparedStatement` with placeholders (`?`) instead of `Statement` with string concatenation',
        'Use `Runtime.getRuntime().exec("sanitize")`',
        'Encrypt all table names before querying',
        'Cast all inputs to String',
      ],
      correctOptionIndex: 0,
      explanation:
        '`PreparedStatement` compiles the SQL template once and binds parameters safely, preventing user input from altering query structure.',
      topic: 'JDBC & Security',
    },
    {
      id: 'java_09',
      skill: 'Java',
      type: 'multiple-choice',
      question: 'What is the difference between checked and unchecked exceptions in Java?',
      options: [
        'Checked exceptions (subclasses of Exception excluding RuntimeException) must be declared or caught at compile time',
        'Unchecked exceptions must be handled with a throws clause',
        'Checked exceptions only occur at system boot',
        'Java eliminated checked exceptions in version 8',
      ],
      correctOptionIndex: 0,
      explanation:
        'Checked exceptions are verified at compile-time by the Java compiler and require explicit handling (`try-catch` or `throws`). Unchecked exceptions inherit from `RuntimeException`.',
      topic: 'Exception Handling',
    },
    {
      id: 'java_10',
      skill: 'Java',
      type: 'practical-coding',
      question: 'What feature introduced in Java 16 provides an immutable, transparent carrier for data with concise syntax?',
      options: ['Records (`record Point(int x, int y) {}`)', 'Enums', 'Sealed Interfaces', 'Structs'],
      correctOptionIndex: 0,
      explanation:
        'Java records automatically generate constructors, getters, `equals()`, `hashCode()`, and `toString()` implementations for immutable data transfer.',
      topic: 'Modern Java Features',
    },
  ],
  'Machine Learning': [
    {
      id: 'ml_01',
      skill: 'Machine Learning',
      type: 'multiple-choice',
      question: 'What does the Bias-Variance tradeoff describe in supervised machine learning?',
      options: [
        'Underfitting (high bias, overly simple models) vs Overfitting (high variance, overly sensitive to training noise)',
        'The trade-off between CPU memory and GPU core clock speed',
        'The balance between precision and batch size',
        'The difference between classification and clustering algorithms',
      ],
      correctOptionIndex: 0,
      explanation:
        'High bias causes underfitting (ignoring underlying patterns); high variance causes overfitting (modeling random noise). The goal is minimizing their sum plus irreducible error.',
      topic: 'Core Theory & Evaluation',
    },
    {
      id: 'ml_02',
      skill: 'Machine Learning',
      type: 'debugging',
      question: 'Why should you fit feature scalers (like StandardScaler) ONLY on training data, and not the combined train + test dataset?',
      options: [
        'To prevent Data Leakage from test distribution into model training',
        'Because test data cannot be converted to floats',
        'StandardScaler raises a ValueError on test sets',
        'Scaling test sets reduces classification speed',
      ],
      correctOptionIndex: 0,
      explanation:
        'Fitting preprocessing scalers on the test set leaks distribution statistics (mean, variance) from future unseen data into the training phase, giving falsely optimistic validation scores.',
      topic: 'Data Preprocessing & Leakage',
    },
    {
      id: 'ml_03',
      skill: 'Machine Learning',
      type: 'multiple-choice',
      question: 'In highly imbalanced classification datasets (e.g. fraud detection at 99.8% negative), why is Accuracy a misleading metric?',
      options: [
        'A trivial classifier predicting negative for all rows achieves 99.8% accuracy while failing to detect any fraud; PR-AUC or F1-Score are more informative',
        'Accuracy cannot be calculated on binary labels',
        'Accuracy values exceed 100% on imbalanced sets',
        'Gradient descent cannot optimize accuracy',
      ],
      correctOptionIndex: 0,
      explanation:
        'With extreme class imbalance, a model that simply predicts the majority class gets deceptive 99%+ accuracy. Metrics like Precision-Recall AUC, Recall, and F1 evaluate true fraud capture.',
      topic: 'Metrics & Imbalance',
    },
    {
      id: 'ml_04',
      skill: 'Machine Learning',
      type: 'multiple-choice',
      question: 'What is the primary role of the Self-Attention mechanism in Transformer architectures?',
      options: [
        'It allows tokens to weigh representations of all other tokens in a sequence regardless of distance, overcoming RNN sequential bottlenecks',
        'It converts floating point matrices into integer vectors',
        'It enforces convolutional weight sharing across spatial grids',
        'It eliminates the need for matrix multiplication during inference',
      ],
      correctOptionIndex: 0,
      explanation:
        'Self-attention computes dot-product query-key relationships across all sequence positions simultaneously, allowing direct modeling of long-range dependencies in parallel.',
      topic: 'Deep Learning & Transformers',
    },
    {
      id: 'ml_05',
      skill: 'Machine Learning',
      type: 'practical-coding',
      question: 'What technique adds an L2 penalty to model weights to prevent coefficients from growing excessively large?',
      options: ['Ridge Regularization (Weight Decay)', 'Lasso Regularization (L1)', 'Dropout', 'Batch Normalization'],
      correctOptionIndex: 0,
      explanation:
        'L2 regularization (Ridge) adds the sum of squared weights to the loss function, shrinking weights smoothly toward zero without forcing exact sparsity.',
      topic: 'Regularization',
    },
    {
      id: 'ml_06',
      skill: 'Machine Learning',
      type: 'multiple-choice',
      question: 'What does the ROC-AUC score represent geometrically?',
      options: [
        'The Area Under the Receiver Operating Characteristic curve plotting True Positive Rate vs False Positive Rate across all classification thresholds',
        'The distance between cluster centroids in k-means',
        'The cosine angle between prompt embeddings',
        'The variance of the training loss curve',
      ],
      correctOptionIndex: 0,
      explanation:
        'ROC curves plot TPR against FPR across varied decision thresholds. The AUC measures overall diagnostic ranking ability (1.0 = perfect, 0.5 = random guess).',
      topic: 'Evaluation Metrics',
    },
    {
      id: 'ml_07',
      skill: 'Machine Learning',
      type: 'debugging',
      question: 'What common phenomenon causes gradients to shrink exponentially during backpropagation in deep neural networks with sigmoid activations?',
      options: [
        'Vanishing Gradient Problem',
        'Exploding Gradient Problem',
        'Catastrophic Forgetting',
        'Curse of Dimensionality',
      ],
      correctOptionIndex: 0,
      explanation:
        'Because the derivative of the sigmoid function caps at 0.25, multiplying many small derivatives through deep layers causes gradients to approach zero, stalling weight updates.',
      topic: 'Optimization & Backpropagation',
    },
    {
      id: 'ml_08',
      skill: 'Machine Learning',
      type: 'multiple-choice',
      question: 'What is the main distinction between Bagging (e.g. Random Forest) and Boosting (e.g. XGBoost, LightGBM)?',
      options: [
        'Bagging trains independent models in parallel and averages results to reduce variance; Boosting trains sequential models where each corrects errors of previous models to reduce bias',
        'Boosting only works on image data',
        'Bagging requires neural networks while boosting requires linear regression',
        'There is no algorithmic difference',
      ],
      correctOptionIndex: 0,
      explanation:
        'Bagging uses bootstrap aggregation in parallel to damp variance. Boosting builds sequential trees iteratively focused on hard-to-predict residual samples.',
      topic: 'Ensemble Learning',
    },
    {
      id: 'ml_09',
      skill: 'Machine Learning',
      type: 'multiple-choice',
      question: 'What is Retrieval-Augmented Generation (RAG) used for in LLM applications?',
      options: [
        'Retrieving external factual context from a vector database and injecting it into the prompt to reduce hallucinations and ground LLM answers',
        'Re-training all model weights from scratch every 24 hours',
        'Compressing 70B parameter models down to 8-bit quantized weights',
        'Automatically translating Python code into CUDA C++',
      ],
      correctOptionIndex: 0,
      explanation:
        'RAG combines dense vector retrieval (semantic search) over private knowledge bases with generative LLMs, ensuring answers cite factual company sources without requiring fine-tuning.',
      topic: 'Modern LLM & RAG Systems',
    },
    {
      id: 'ml_10',
      skill: 'Machine Learning',
      type: 'practical-coding',
      question: 'Which method reduces the dimensionality of high-dimensional data while preserving the axes of maximal variance?',
      options: ['Principal Component Analysis (PCA)', 'K-Means', 'DBSCAN', 'Linear Discriminant Analysis'],
      correctOptionIndex: 0,
      explanation:
        'PCA projects data onto orthogonal eigenvectors (principal components) corresponding to the largest eigenvalues of the covariance matrix.',
      topic: 'Unsupervised Learning',
    },
  ],
  AWS: [
    {
      id: 'aws_01',
      skill: 'AWS',
      type: 'multiple-choice',
      question: 'What is the key difference between AWS IAM Roles and IAM Users?',
      options: [
        'IAM Users have long-term credentials (password, access keys); IAM Roles provide temporary security credentials assumed by trusted entities or AWS services',
        'IAM Roles are only for human administrators',
        'IAM Users cannot be assigned policies',
        'Roles can only be used within the AWS management console',
      ],
      correctOptionIndex: 0,
      explanation:
        'IAM Roles do not have permanent security credentials; instead, they are assumed dynamically by EC2 instances, Lambda functions, or federated identities via STS for temporary tokens.',
      topic: 'IAM & Security',
    },
    {
      id: 'aws_02',
      skill: 'AWS',
      type: 'debugging',
      question: 'An EC2 instance in a private subnet needs to download packages from the internet without allowing inbound internet connections. What should you configure?',
      options: [
        'NAT Gateway located in a public subnet with a route in the private route table',
        'Assign a public IP address directly to the private EC2 instance',
        'Open port 80/443 in the Security Group inbound rules from 0.0.0.0/0',
        'Attach an Internet Gateway directly to the private subnet',
      ],
      correctOptionIndex: 0,
      explanation:
        'A NAT (Network Address Translation) Gateway resides in a public subnet and enables outbound IPv4 traffic to the internet while preventing external hosts from initiating connections.',
      topic: 'VPC & Networking',
    },
    {
      id: 'aws_03',
      skill: 'AWS',
      type: 'multiple-choice',
      question: 'Which AWS service provides serverless event-driven compute that scales automatically from zero to thousands of concurrent executions?',
      options: ['AWS Lambda', 'Amazon EC2', 'Amazon ECS on EC2', 'AWS Elastic Beanstalk'],
      correctOptionIndex: 0,
      explanation:
        'AWS Lambda runs code in response to events and automatically manages the underlying compute resources without provisioned server overhead.',
      topic: 'Serverless Compute',
    },
    {
      id: 'aws_04',
      skill: 'AWS',
      type: 'multiple-choice',
      question: 'What S3 storage class is best for data accessed less than once a month, requiring millisecond retrieval times at lower storage cost?',
      options: ['S3 Standard-Infrequent Access (S3 Standard-IA)', 'S3 Glacier Flexible Retrieval', 'S3 Glacier Deep Archive', 'S3 One Zone'],
      correctOptionIndex: 0,
      explanation:
        'S3 Standard-IA is designed for data that is accessed less frequently, but requires rapid millisecond access when needed.',
      topic: 'Storage & S3',
    },
    {
      id: 'aws_05',
      skill: 'AWS',
      type: 'practical-coding',
      question: 'Which service enables decoupled, asynchronous communication between microservices using managed message queues with guaranteed order in FIFO mode?',
      options: ['Amazon SQS', 'Amazon SNS', 'Amazon Kinesis Data Streams', 'Amazon EventBridge'],
      correctOptionIndex: 0,
      explanation:
        'Amazon Simple Queue Service (SQS) offers standard and FIFO queues to decouple microservices and distributed software systems.',
      topic: 'Messaging & Queues',
    },
    {
      id: 'aws_06',
      skill: 'AWS',
      type: 'multiple-choice',
      question: 'What is the primary difference between AWS Security Groups and Network Access Control Lists (NACLs)?',
      options: [
        'Security Groups are stateful and operate at the instance/ENI level; NACLs are stateless and operate at the subnet boundary level',
        'Security Groups are stateless while NACLs are stateful',
        'NACLs cannot block specific IP addresses',
        'Security Groups operate at the VPC peering level only',
      ],
      correctOptionIndex: 0,
      explanation:
        'Security Groups are stateful (inbound traffic allowed implies outbound response is automatically permitted) at the ENI level. NACLs evaluate rules in numerical order statelessly at the subnet boundary.',
      topic: 'VPC Security',
    },
    {
      id: 'aws_07',
      skill: 'AWS',
      type: 'multiple-choice',
      question: 'Which managed AWS database engine provides a multi-model NoSQL database with single-digit millisecond latency at any scale?',
      options: ['Amazon DynamoDB', 'Amazon RDS PostgreSQL', 'Amazon Aurora Serverless', 'Amazon DocumentDB'],
      correctOptionIndex: 0,
      explanation:
        'Amazon DynamoDB is a fully managed, serverless key-value and document database delivering consistent single-digit millisecond performance with automatic partitioning.',
      topic: 'Databases & NoSQL',
    },
    {
      id: 'aws_08',
      skill: 'AWS',
      type: 'debugging',
      question: 'What AWS service should be used to securely manage, rotate, and retrieve database passwords and API keys without hardcoding them in code?',
      options: ['AWS Secrets Manager', 'AWS KMS alone', 'Amazon S3 metadata', 'AWS CloudTrail'],
      correctOptionIndex: 0,
      explanation:
        'AWS Secrets Manager enables you to rotate, manage, and retrieve database credentials, API keys, and other secrets throughout their lifecycle.',
      topic: 'Security & Secrets',
    },
    {
      id: 'aws_09',
      skill: 'AWS',
      type: 'multiple-choice',
      question: 'What is the role of an AWS Application Load Balancer (ALB) compared to a Network Load Balancer (NLB)?',
      options: [
        'ALB operates at Layer 7 (HTTP/HTTPS) and supports path-based and host-based routing; NLB operates at Layer 4 (TCP/UDP) for ultra-low latency',
        'ALB only supports UDP traffic',
        'NLB can inspect HTTP headers and cookies',
        'ALB cannot distribute traffic across Availability Zones',
      ],
      correctOptionIndex: 0,
      explanation:
        'ALBs evaluate Layer 7 HTTP/HTTPS headers, routing rules, and path prefixes, while NLBs operate at Layer 4 handling millions of requests per second at ultra-low latency.',
      topic: 'Networking & Elastic Load Balancing',
    },
    {
      id: 'aws_10',
      skill: 'AWS',
      type: 'practical-coding',
      question: 'Which Infrastructure as Code (IaC) service is native to AWS and defines cloud resources using JSON or YAML templates?',
      options: ['AWS CloudFormation', 'AWS CodeDeploy', 'AWS OpsWorks', 'AWS CodePipeline'],
      correctOptionIndex: 0,
      explanation:
        'AWS CloudFormation lets you model, provision, and manage AWS and third-party resources by treating infrastructure as code.',
      topic: 'DevOps & IaC',
    },
  ],
  Git: [
    {
      id: 'git_01',
      skill: 'Git',
      type: 'multiple-choice',
      question: 'What is the core difference between `git merge` and `git rebase`?',
      options: [
        '`git merge` creates a new merge commit combining history branches; `git rebase` reapplies commits on top of another base tip for a linear history',
        '`git rebase` deletes all remote branches',
        '`git merge` can only be performed by repository owners',
        'There is no difference; they are aliases',
      ],
      correctOptionIndex: 0,
      explanation:
        'Merge retains chronological branch history with explicit merge commits. Rebase rewires the commit ancestry, moving the entire feature branch to begin on the tip of the target branch.',
      topic: 'Branching & History',
    },
    {
      id: 'git_02',
      skill: 'Git',
      type: 'debugging',
      question: 'You accidentally ran `git reset --hard HEAD~1` and lost an unpushed commit. How do you recover it?',
      options: [
        'Use `git reflog` to locate the commit hash, then run `git checkout` or `git reset` to that SHA',
        'The commit is permanently destroyed and cannot be recovered',
        'Run `git clean -fd`',
        'Delete the `.git` folder and re-clone',
      ],
      correctOptionIndex: 0,
      explanation:
        '`git reflog` records all updates to the tips of branches and HEAD in the local repository. Even orphaned commits remain in Git’s object database until pruned by garbage collection.',
      topic: 'Recovery & Reflog',
    },
    {
      id: 'git_03',
      skill: 'Git',
      type: 'multiple-choice',
      question: 'What is the difference between `git fetch` and `git pull`?',
      options: [
        '`git fetch` downloads remote objects and refs without modifying your local working branch; `git pull` does `git fetch` followed by `git merge`',
        '`git pull` downloads without merging; `git fetch` overwrites local files',
        '`git fetch` only checks commit counts',
        '`git pull` requires root administrator privileges',
      ],
      correctOptionIndex: 0,
      explanation:
        '`git fetch` updates remote-tracking branches (`origin/main`) safely. `git pull` fetches the remote changes and immediately attempts to merge them into your checked-out branch.',
      topic: 'Remotes & Synchronization',
    },
    {
      id: 'git_04',
      skill: 'Git',
      type: 'code-output',
      question: 'What command temporarily shelves uncommitted local changes so you can switch branches cleanly?',
      options: ['git stash', 'git pause', 'git shelf', 'git freeze'],
      correctOptionIndex: 0,
      explanation:
        '`git stash` records the current state of the working directory and index into a stack, reverting the working directory to match the HEAD commit.',
      topic: 'Stashing',
    },
    {
      id: 'git_05',
      skill: 'Git',
      type: 'practical-coding',
      question: 'How do you selectively apply a specific single commit from one branch onto your current active branch?',
      options: ['git cherry-pick <commit-sha>', 'git extract <commit-sha>', 'git patch-apply <commit-sha>', 'git adopt <commit-sha>'],
      correctOptionIndex: 0,
      explanation:
        '`git cherry-pick` applies the changes introduced by some existing commits onto the current active branch.',
      topic: 'Cherry-picking',
    },
    {
      id: 'git_06',
      skill: 'Git',
      type: 'multiple-choice',
      question: 'What does the `.gitignore` file do?',
      options: [
        'Specifies intentionally untracked files and patterns that Git should ignore',
        'Deletes files from disk when committing',
        'Encrypts sensitive passwords in repository history',
        'Limits repository size to 100MB',
      ],
      correctOptionIndex: 0,
      explanation:
        'A `.gitignore` file specifies patterns matching files (like `node_modules`, `.env`, build artifacts) that should not be tracked by Git.',
      topic: 'Configuration & Ignore',
    },
    {
      id: 'git_07',
      skill: 'Git',
      type: 'debugging',
      question: 'Why is it dangerous to run `git push --force` on shared public branches like `main`?',
      options: [
        'It overwrites remote history, causing other developers’ local repositories to diverge and potentially destroying collaborators’ commits',
        'It terminates the remote GitHub server process',
        'It converts private repositories into public repositories',
        'Git will permanently lock the branch against future commits',
      ],
      correctOptionIndex: 0,
      explanation:
        'Forced push replaces the remote branch pointer with your local history, overwriting any commits pushed by others. `git push --force-with-lease` is safer.',
      topic: 'Team Collaboration & Best Practices',
    },
    {
      id: 'git_08',
      skill: 'Git',
      type: 'multiple-choice',
      question: 'What is a detached HEAD state in Git?',
      options: [
        'HEAD points directly to a specific commit rather than to a named branch pointer',
        'The repository is corrupt and cannot record new commits',
        'The local master branch was deleted on the remote',
        'Git is running in headless daemon mode',
      ],
      correctOptionIndex: 0,
      explanation:
        'In detached HEAD state, HEAD points to a commit hash directly. New commits made here will become orphaned once you switch to another branch unless tagged or branched.',
      topic: 'HEAD & References',
    },
    {
      id: 'git_09',
      skill: 'Git',
      type: 'practical-coding',
      question: 'Which tool allows you to perform an automated binary search through commit history to identify the commit that introduced a bug?',
      options: ['git bisect', 'git debug', 'git trace', 'git grep-commit'],
      correctOptionIndex: 0,
      explanation:
        '`git bisect` uses a binary search algorithm to test commits between a known "good" state and a "bad" state, isolating the exact breaking commit quickly.',
      topic: 'Bisect & Debugging',
    },
    {
      id: 'git_10',
      skill: 'Git',
      type: 'code-output',
      question: 'What does `git commit --amend` accomplish?',
      options: [
        'Combines staged changes with the previous commit, modifying its content and/or commit message',
        'Reverts the last commit completely',
        'Pushes commits directly to production',
        'Creates an annotated tag',
      ],
      correctOptionIndex: 0,
      explanation:
        '`git commit --amend` replaces the tip of the current branch with a new commit containing staged adjustments and updated commit messages.',
      topic: 'Modifying History',
    },
  ],
  'C++': [
    {
      id: 'cpp_01',
      skill: 'C++',
      type: 'multiple-choice',
      question: 'What is RAII (Resource Acquisition Is Initialization) in modern C++?',
      options: [
        'A design pattern where resource lifecycle is bound to object lifetime; constructors acquire resources and destructors release them deterministically',
        'A compiler flag that optimizes recursive functions',
        'An external garbage collection library for C++',
        'A multithreading semaphore system',
      ],
      correctOptionIndex: 0,
      explanation:
        'RAII guarantees that resources (heap memory, file handles, mutex locks) are tied to stack objects and automatically released in destructors when leaving scope.',
      topic: 'Resource Management & RAII',
    },
    {
      id: 'cpp_02',
      skill: 'C++',
      type: 'debugging',
      question: 'Why should you prefer `std::unique_ptr` over raw pointers for dynamic heap allocations?',
      options: [
        'It expresses exclusive ownership and automatically frees memory via `delete` upon destruction, eliminating memory leaks and double-free bugs',
        '`std::unique_ptr` compiles to assembly with zero overhead and is faster than raw arrays',
        'Raw pointers are deprecated in C++20',
        '`unique_ptr` automatically parallelizes array lookups',
      ],
      correctOptionIndex: 0,
      explanation:
        '`std::unique_ptr` is a smart pointer that owns and manages another object through a pointer and disposes of that object when the unique_ptr goes out of scope.',
      topic: 'Smart Pointers & Memory',
    },
    {
      id: 'cpp_03',
      skill: 'C++',
      type: 'multiple-choice',
      question: 'What does Move Semantics (`std::move`, rvalue references `T&&`) achieve in C++11 and above?',
      options: [
        'Allows transferring ownership of resources from temporary objects without making expensive deep copies',
        'Moves memory from RAM to SSD cache',
        'Enables running C++ code on multiple CPU architectures',
        'Compiles code during execution instead of ahead-of-time',
      ],
      correctOptionIndex: 0,
      explanation:
        'Move semantics allows objects to steal the internal heap buffers of expiring temporary rvalues rather than allocating and copying memory byte-for-byte.',
      topic: 'Move Semantics',
    },
    {
      id: 'cpp_04',
      skill: 'C++',
      type: 'code-output',
      question: 'What happens if a base class destructor is NOT declared `virtual` when deleting a derived object via a base pointer?',
      options: [
        'Undefined Behavior: the derived class destructor will not be called, resulting in resource leaks',
        'Compilation error: C++ forbids non-virtual base destructors',
        'The derived destructor runs twice',
        'Memory is freed correctly regardless',
      ],
      correctOptionIndex: 0,
      explanation:
        'Deleting a derived class through a pointer to base with a non-virtual destructor results in undefined behavior per the C++ standard; derived cleanup code never executes.',
      topic: 'Polymorphism & Destructors',
    },
    {
      id: 'cpp_05',
      skill: 'C++',
      type: 'practical-coding',
      question: 'What keyword indicates that a function can be evaluated at compile time if provided with constant expressions?',
      options: ['constexpr', 'const', 'inline', 'static'],
      correctOptionIndex: 0,
      explanation:
        '`constexpr` specifies that the value of an object or return value of a function can be computed at compile time.',
      topic: 'Compile-Time Computation',
    },
    {
      id: 'cpp_06',
      skill: 'C++',
      type: 'multiple-choice',
      question: 'What is the Rule of 5 in modern C++?',
      options: [
        'If a class defines any of Destructor, Copy Constructor, Copy Assignment, Move Constructor, or Move Assignment, it should likely define or explicitly delete all 5',
        'A class cannot inherit from more than 5 base classes',
        'Functions should not have more than 5 parameters',
        'Code must be checked by 5 different compilers',
      ],
      correctOptionIndex: 0,
      explanation:
        'The Rule of 5 ensures safe resource management: custom resource acquisition requires managing copy, move, and destruction semantics consistently.',
      topic: 'Class Design & Rule of 5',
    },
    {
      id: 'cpp_07',
      skill: 'C++',
      type: 'debugging',
      question: 'What is the danger of returning a reference to a local stack variable from a function?',
      options: [
        'Dangling Reference: the local variable is destroyed when the function returns, leaving the reference pointing to invalid memory',
        'Memory leak because stack memory cannot be reclaimed',
        'Compiler will automatically promote the variable to global scope',
        'It causes integer overflow',
      ],
      correctOptionIndex: 0,
      explanation:
        'Local stack variables are popped from the stack when a function finishes; returning a reference or pointer to them leads to undefined behavior upon dereference.',
      topic: 'References & Lifetimes',
    },
    {
      id: 'cpp_08',
      skill: 'C++',
      type: 'multiple-choice',
      question: 'What is the difference between `std::vector` and `std::array` in the C++ Standard Template Library?',
      options: [
        '`std::vector` is a dynamically sized container allocated on the heap; `std::array` has fixed size known at compile-time and lives on the stack',
        '`std::vector` cannot store objects with constructors',
        '`std::array` is dynamically resizable at runtime',
        '`std::vector` uses linked lists internally',
      ],
      correctOptionIndex: 0,
      explanation:
        '`std::array<T, N>` is a wrapper around fixed-size C-style arrays with stack storage. `std::vector<T>` manages a dynamic contiguous buffer on the heap.',
      topic: 'STL Containers',
    },
    {
      id: 'cpp_09',
      skill: 'C++',
      type: 'practical-coding',
      question: 'Which lock guard in C++11 locks an associated mutex upon construction and unlocks it automatically upon destruction?',
      options: ['std::lock_guard<std::mutex>', 'std::atomic_thread', 'std::mutex_holder', 'std::semaphore'],
      correctOptionIndex: 0,
      explanation:
        '`std::lock_guard` is an RAII wrapper for mutexes that acquires the lock in its constructor and guarantees release when leaving the enclosing block.',
      topic: 'Threading & Concurrency',
    },
    {
      id: 'cpp_10',
      skill: 'C++',
      type: 'code-output',
      question: 'What is the time complexity of lookup in `std::unordered_map` vs `std::map` (average case)?',
      options: [
        '`std::unordered_map`: O(1) via hash table; `std::map`: O(log n) via Red-Black Tree',
        'Both are O(1)',
        '`std::unordered_map`: O(n); `std::map`: O(1)',
        '`std::unordered_map`: O(log n); `std::map`: O(1)',
      ],
      correctOptionIndex: 0,
      explanation:
        '`std::map` is ordered and implemented via self-balancing binary search trees (O(log n)). `std::unordered_map` uses hash buckets (average O(1)).',
      topic: 'Data Structures & STL',
    },
  ],
  'C#': [
    {
      id: 'cs_01',
      skill: 'C#',
      type: 'multiple-choice',
      question: 'What is the primary difference between a `class` and a `struct` in C#?',
      options: [
        'A `class` is a reference type allocated on the managed heap; a `struct` is a value type typically allocated inline on the stack',
        'A `struct` supports full inheritance while a `class` does not',
        'A `class` cannot implement interfaces',
        'A `struct` has built-in garbage collection separate from the CLR',
      ],
      correctOptionIndex: 0,
      explanation:
        'Classes are reference types (passed by reference, allocated on heap). Structs are value types (passed by value copy, allocated inline).',
      topic: 'Type System',
    },
    {
      id: 'cs_02',
      skill: 'C#',
      type: 'code-output',
      question: 'How does the `async` / `await` pattern work under the hood in C#?',
      options: [
        'The Roslyn compiler generates a state machine implementing `IAsyncStateMachine` to preserve local execution context across awaits without blocking threads',
        'It starts a new operating system process for every await',
        'It pauses the entire CLR garbage collector',
        'It is merely syntactic sugar for `Thread.Sleep`',
      ],
      correctOptionIndex: 0,
      explanation:
        'The C# compiler lowers async methods into state machine structs that register completion continuations with awaitable tasks, freeing worker threads while waiting for I/O.',
      topic: 'Asynchronous Programming',
    },
    {
      id: 'cs_03',
      skill: 'C#',
      type: 'debugging',
      question: 'What causes a memory leak in a managed C# application where garbage collection is active?',
      options: [
        'Long-lived objects holding event subscriptions or static references to short-lived objects, preventing them from being collected',
        'Using `foreach` loops on arrays',
        'Declaring variables inside loops',
        'Compiling in Release mode',
      ],
      correctOptionIndex: 0,
      explanation:
        'The GC traces reachable roots. If an event publisher or static collection maintains a reference to a subscriber, the subscriber remains root-reachable and cannot be collected.',
      topic: 'Garbage Collection & Leaks',
    },
    {
      id: 'cs_04',
      skill: 'C#',
      type: 'multiple-choice',
      question: 'What is the purpose of the `using` statement (or `using` declaration) in C#?',
      options: [
        'Guarantees that `Dispose()` is called on an `IDisposable` object when execution exits the scope',
        'Imports external C++ DLL libraries',
        'Allocates memory directly on the GPU',
        'Disables null checking for the block',
      ],
      correctOptionIndex: 0,
      explanation:
        '`using` translates into a `try { ... } finally { obj.Dispose(); }` construct, guaranteeing prompt release of unmanaged resources (database connections, file streams).',
      topic: 'Resource Management & IDisposable',
    },
    {
      id: 'cs_05',
      skill: 'C#',
      type: 'practical-coding',
      question: 'Which keyword in C# prevents a class from being inherited by any derived class?',
      options: ['sealed', 'final', 'static', 'readonly'],
      correctOptionIndex: 0,
      explanation:
        'When applied to a class, the `sealed` modifier prevents other classes from inheriting from it.',
      topic: 'OOP & Modifiers',
    },
    {
      id: 'cs_06',
      skill: 'C#',
      type: 'multiple-choice',
      question: 'What is the benefit of LINQ deferred execution?',
      options: [
        'The query is not executed when defined; it runs only when the data is enumerated (e.g. via `foreach`, `.ToList()`, or `.Count()`)',
        'It executes queries in the background on startup',
        'It caches all results permanently in memory',
        'It compiles C# into JavaScript at runtime',
      ],
      correctOptionIndex: 0,
      explanation:
        'Deferred execution means the expression evaluation is delayed until its realized value is actually required, allowing query chaining and avoiding unnecessary data fetching.',
      topic: 'LINQ & Generics',
    },
    {
      id: 'cs_07',
      skill: 'C#',
      type: 'code-output',
      question: 'What is the null-coalescing assignment operator in C#?',
      options: ['??=', '?=', '?:', '||='],
      correctOptionIndex: 0,
      explanation:
        '`variable ??= expression;` assigns the value of expression to variable only if variable is currently null.',
      topic: 'Operators & Nullability',
    },
    {
      id: 'cs_08',
      skill: 'C#',
      type: 'debugging',
      question: 'In Entity Framework Core, what problem does `.AsNoTracking()` solve for read-only queries?',
      options: [
        'Improves query performance and reduces memory usage by bypassing change tracker snapshot tracking',
        'Prevents database deadlocks during migrations',
        'Disables SQL generation',
        'Encrypts data transferred over the wire',
      ],
      correctOptionIndex: 0,
      explanation:
        '`AsNoTracking()` informs EF Core not to track entities in the `DbContext` snapshot memory, boosting performance and saving significant memory on read queries.',
      topic: 'EF Core & Databases',
    },
    {
      id: 'cs_09',
      skill: 'C#',
      type: 'multiple-choice',
      question: 'What is dependency injection lifetime `Scoped` in ASP.NET Core?',
      options: [
        'A single instance created once per HTTP request and shared across all components handling that request',
        'A single instance created when the application starts and shared globally',
        'A new instance created every time it is requested from the service container',
        'An instance tied to client browser localStorage',
      ],
      correctOptionIndex: 0,
      explanation:
        '`Scoped` lifetime creates one instance per client request (connection). `Singleton` is per application lifetime, and `Transient` creates a new instance on every injection.',
      topic: 'ASP.NET Core & DI',
    },
    {
      id: 'cs_10',
      skill: 'C#',
      type: 'practical-coding',
      question: 'What feature introduced in C# 9 allows declaring concise immutable data objects with value-based equality semantics?',
      options: ['record (e.g. `public record User(string Name);`)', 'struct', 'enum', 'delegate'],
      correctOptionIndex: 0,
      explanation:
        'C# records provide built-in value equality, non-destructive mutation (`with` expressions), and formatted display output.',
      topic: 'Modern C# Features',
    },
  ],
  'Data Analysis': [
    {
      id: 'da_01',
      skill: 'Data Analysis',
      type: 'multiple-choice',
      question: 'In Pandas, what is the key difference between `.loc[]` and `.iloc[]`?',
      options: [
        '`.loc[]` is label-based indexing; `.iloc[]` is integer position-based indexing',
        '`.iloc[]` can only select single cells',
        '`.loc[]` works only on string data',
        'They are identical and interchangeable',
      ],
      correctOptionIndex: 0,
      explanation:
        '`.loc` indexes using label names of rows and columns. `.iloc` indexes using zero-based integer positions.',
      topic: 'Pandas & Manipulation',
    },
    {
      id: 'da_02',
      skill: 'Data Analysis',
      type: 'debugging',
      question: 'What is the primary indicator of multicollinearity in a multiple linear regression model?',
      options: [
        'Variance Inflation Factor (VIF) > 5 or 10 among independent features',
        'P-values less than 0.05',
        'R-squared value equal to zero',
        'Residuals showing normal distribution',
      ],
      correctOptionIndex: 0,
      explanation:
        'Multicollinearity occurs when predictor variables are highly correlated with each other, inflating the variance of regression coefficients; VIF measures this inflation.',
      topic: 'Statistics & Regression',
    },
    {
      id: 'da_03',
      skill: 'Data Analysis',
      type: 'multiple-choice',
      question: 'What does Simpson’s Paradox describe in statistical analysis?',
      options: [
        'A trend appearing in several distinct groups reverses or disappears when the groups are combined',
        'Sample means always diverge from population means',
        'Correlation implies causation in large datasets',
        'Standard deviation increases as sample size grows',
      ],
      correctOptionIndex: 0,
      explanation:
        'Simpson’s Paradox occurs when aggregate data masks confounding variables, causing a trend visible in subpopulations to invert when aggregated.',
      topic: 'Statistical Fallacies',
    },
    {
      id: 'da_04',
      skill: 'Data Analysis',
      type: 'code-output',
      question: 'What is the effect of applying a logarithmic transformation `np.log1p(df["revenue"])` on right-skewed revenue data?',
      options: [
        'It compresses extreme large values, transforming the distribution closer to normal and stabilizing variance',
        'It converts revenue into negative values',
        'It deletes missing zero values',
        'It doubles the mean value',
      ],
      correctOptionIndex: 0,
      explanation:
        'Log transforms compress the long right tail of power-law or exponential distributions (income, revenue, page views), stabilizing variance for linear modeling.',
      topic: 'Feature Engineering & Transforms',
    },
    {
      id: 'da_05',
      skill: 'Data Analysis',
      type: 'practical-coding',
      question: 'Which chart type is best suited for identifying outliers and understanding the 5-number summary (Min, Q1, Median, Q3, Max) of a distribution?',
      options: ['Box Plot (Box-and-Whisker)', 'Pie Chart', 'Scatter Plot', 'Stacked Bar Chart'],
      correctOptionIndex: 0,
      explanation:
        'Box plots display the median, interquartile range (IQR), and explicitly mark points beyond 1.5 * IQR as outliers.',
      topic: 'Data Visualization',
    },
    {
      id: 'da_06',
      skill: 'Data Analysis',
      type: 'multiple-choice',
      question: 'What is an A/B test p-value of 0.03 commonly interpreted as under a 5% significance level (alpha = 0.05)?',
      options: [
        'Statistically significant: we reject the null hypothesis that there is no true difference between variant A and B',
        'The null hypothesis is 97% likely to be true',
        'There is a 3% probability that variant B is better',
        'The sample size was too small',
      ],
      correctOptionIndex: 0,
      explanation:
        'A p-value below alpha indicates that the observed effect is unlikely to have occurred by random sampling noise under the null hypothesis, warranting rejection of H0.',
      topic: 'Hypothesis Testing',
    },
    {
      id: 'da_07',
      skill: 'Data Analysis',
      type: 'debugging',
      question: 'What is the risk of using mean imputation for missing values in numerical columns with extreme outliers?',
      options: [
        'Outliers distort the calculated mean, shifting the imputation value away from true central tendency and artificially deflating sample variance',
        'Mean imputation is prohibited in Python',
        'It doubles the row count of the DataFrame',
        'It causes categorical columns to fail',
      ],
      correctOptionIndex: 0,
      explanation:
        'Outliers skew the mean. Furthermore, filling missing entries with a single constant reduces natural variance and artificially spikes the central distribution; median imputation or model-based imputation is preferred.',
      topic: 'Missing Data Handling',
    },
    {
      id: 'da_08',
      skill: 'Data Analysis',
      type: 'multiple-choice',
      question: 'What is the difference between Pearson correlation and Spearman rank correlation?',
      options: [
        'Pearson measures linear relationships on continuous variables; Spearman assesses monotonic relationships using ranked values (robust to outliers and non-linear monotonic curves)',
        'Spearman only works on categorical text',
        'Pearson values range from 0 to 100 while Spearman is -1 to 1',
        'There is no difference in mathematical result',
      ],
      correctOptionIndex: 0,
      explanation:
        'Pearson evaluates straight-line linearity. Spearman evaluates whether variables increase or decrease together regardless of linearity by ranking observations.',
      topic: 'Correlation & Statistics',
    },
    {
      id: 'da_09',
      skill: 'Data Analysis',
      type: 'practical-coding',
      question: 'In SQL or Pandas, what operation transforms rows into columns to summarize multi-dimensional cross-tabulations?',
      options: ['Pivot / Pivot Table', 'Union All', 'Inner Join', 'Drop Duplicates'],
      correctOptionIndex: 0,
      explanation:
        'Pivoting reshapes data from long format to wide format, summarizing aggregated values across specified row and column indexes.',
      topic: 'Data Reshaping',
    },
    {
      id: 'da_10',
      skill: 'Data Analysis',
      type: 'multiple-choice',
      question: 'What does the Central Limit Theorem state?',
      options: [
        'The distribution of sample means approximates a normal distribution as the sample size becomes sufficiently large, regardless of the underlying population distribution shape',
        'All data in nature is normally distributed',
        'Sample variance always equals population variance',
        'Machine learning models converge in O(1) time',
      ],
      correctOptionIndex: 0,
      explanation:
        'The CLT is a foundational theorem: regardless of the population distribution, the distribution of independent sample means will approach a normal distribution as n increases (typically n >= 30).',
      topic: 'Probability & CLT',
    },
  ],
};

// Fill in remaining skills with high-quality questions for full coverage
export function getQuestionsForSkill(skill: SupportedSkill): AssessmentQuestion[] {
  if (SKILL_ASSESSMENT_QUESTIONS[skill]) {
    return SKILL_ASSESSMENT_QUESTIONS[skill];
  }
  // Fallback high quality template for any remaining skill
  return [
    {
      id: `${skill.toLowerCase()}_01`,
      skill,
      type: 'multiple-choice',
      question: `What is the primary architectural principle of ${skill}?`,
      options: [
        `High cohesion, modular component abstractions, and decoupled state management in ${skill}`,
        'Monolithic single-threaded blocking execution',
        'Hardcoded configurations stored in operating system registry',
        'Manual memory pointer arithmetic without bounds checking',
      ],
      correctOptionIndex: 0,
      explanation: `Modern production standards for ${skill} mandate modularity, clear separation of concerns, and robust error handling.`,
      topic: 'Architecture & Foundations',
    },
    {
      id: `${skill.toLowerCase()}_02`,
      skill,
      type: 'code-output',
      question: `How are exceptions and error conditions cleanly handled in ${skill}?`,
      options: [
        'Structured exception handling with typed catches and guaranteed resource cleanup',
        'Silent exit without logging errors',
        'Restarting the entire operating system',
        'Converting all errors into string alerts',
      ],
      correctOptionIndex: 0,
      explanation: 'Typed exception handling ensures unexpected states can be captured, audited, and gracefully degraded.',
      topic: 'Error Handling',
    },
    {
      id: `${skill.toLowerCase()}_03`,
      skill,
      type: 'debugging',
      question: `What is a common performance bottleneck in production ${skill} applications?`,
      options: [
        'Unnecessary redundant allocations, blocking I/O on the main thread, or lack of caching',
        'Having too many comments in code files',
        'Using modern version control systems',
        'Running on 64-bit processors',
      ],
      correctOptionIndex: 0,
      explanation: 'Unindexed lookups and blocking synchronous operations degrade throughput and latency.',
      topic: 'Performance & Optimization',
    },
    {
      id: `${skill.toLowerCase()}_04`,
      skill,
      type: 'multiple-choice',
      question: `What security practice is mandatory when handling untrusted user input in ${skill}?`,
      options: [
        'Strict schema validation, parameterized queries, and output encoding',
        'Assuming internal networks are always completely safe',
        'Disabling HTTPS encryption to improve latency',
        'Storing credentials in client-side code',
      ],
      correctOptionIndex: 0,
      explanation: 'Input validation and defense-in-depth prevent injection, XSS, and authorization bypasses.',
      topic: 'Security & Best Practices',
    },
    {
      id: `${skill.toLowerCase()}_05`,
      skill,
      type: 'practical-coding',
      question: `Which testing methodology verifies that individual units in ${skill} function as expected in isolation?`,
      options: ['Unit Testing with automated mocks/stubs', 'Manual QA clicking', 'Deploying directly to production', 'Code minification'],
      correctOptionIndex: 0,
      explanation: 'Automated unit tests with mocks ensure deterministic, fast verification of discrete functions.',
      topic: 'Testing & Quality Assurance',
    },
    {
      id: `${skill.toLowerCase()}_06`,
      skill,
      type: 'multiple-choice',
      question: `How does ${skill} manage concurrency and asynchronous tasks efficiently?`,
      options: [
        'Event-driven loops, worker thread pools, or async/await concurrency primitives',
        'Spawning 10,000 OS processes for every single HTTP request',
        'Freezing the CPU until background tasks return',
        'Ignoring concurrency altogether',
      ],
      correctOptionIndex: 0,
      explanation: 'Concurrency primitives coordinate non-blocking operations without exhausting system threads.',
      topic: 'Concurrency & Scaling',
    },
    {
      id: `${skill.toLowerCase()}_07`,
      skill,
      type: 'debugging',
      question: `What causes race conditions in multithreaded ${skill} code?`,
      options: [
        'Multiple threads accessing and mutating shared state concurrently without synchronization',
        'Compiling with optimization flags',
        'Using UTF-8 character encoding',
        'Running on SSD drives',
      ],
      correctOptionIndex: 0,
      explanation: 'Race conditions emerge when shared mutable data is accessed concurrently without locks, atomic primitives, or channels.',
      topic: 'Thread Safety',
    },
    {
      id: `${skill.toLowerCase()}_08`,
      skill,
      type: 'multiple-choice',
      question: `What is the role of CI/CD pipelines for ${skill} projects?`,
      options: [
        'Automating linting, security scans, unit tests, and production artifact deployment',
        'Manually copying files via FTP at midnight',
        'Generating user passwords automatically',
        'Managing local desktop wallpapers',
      ],
      correctOptionIndex: 0,
      explanation: 'Continuous Integration / Continuous Deployment enforces reproducible quality and automated release gates.',
      topic: 'DevOps & Tooling',
    },
    {
      id: `${skill.toLowerCase()}_09`,
      skill,
      type: 'practical-coding',
      question: `What is the recommended approach for versioning production APIs and schemas in ${skill}?`,
      options: [
        'Semantic Versioning (SemVer) with explicit deprecation cycles and backward compatibility',
        'Overwriting API routes without notice',
        'Random string versioning',
        'Changing response types arbitrarily',
      ],
      correctOptionIndex: 0,
      explanation: 'SemVer (Major.Minor.Patch) and backward-compatible additive changes protect downstream consumers.',
      topic: 'API Design & Versioning',
    },
    {
      id: `${skill.toLowerCase()}_10`,
      skill,
      type: 'multiple-choice',
      question: `How does ${skill} ensure type safety or runtime validation?`,
      options: [
        'Static type checking or runtime assertion schemas to catch interface mismatches early',
        'Relying entirely on runtime user complaints',
        'Converting all variables to generic untyped pointers',
        'Disabling compiler warnings',
      ],
      correctOptionIndex: 0,
      explanation: 'Type safety and runtime schema validation eliminate whole classes of common interface defects before production deployment.',
      topic: 'Types & Reliability',
    },
  ];
}

export const SAMPLE_JOBS: JobPosting[] = [
  {
    id: 'job_01',
    title: 'Senior Full Stack & AI Engineer',
    company: 'Anthropic Labs',
    location: 'San Francisco, CA',
    workplaceType: 'Hybrid',
    jobType: 'Full-time',
    experienceLevel: 'Senior',
    salaryRange: '$190,000 - $245,000 + Equity',
    postedDate: '2 days ago',
    description:
      'We are looking for a Senior Full Stack & AI Engineer to scale our frontier model evaluation platforms, enterprise RAG search tools, and high-performance interactive interfaces.',
    requiredSkills: ['Python', 'React', 'TypeScript', 'SQL', 'Machine Learning', 'AWS'],
    preferredSkills: ['Docker', 'Kubernetes', 'FastAPI', 'Vector Databases'],
    responsibilities: [
      'Design, build, and deploy high-throughput RAG search platforms and generative evaluation tools.',
      'Develop reactive Next.js / React interfaces with fluid micro-interactions and sub-100ms response times.',
      'Collaborate with AI researchers to ship production APIs and model serving infrastructure.',
    ],
    educationRequirement: 'B.S. or M.S. in Computer Science or equivalent practical experience',
    experienceYears: '5+ years',
    applyUrl: 'https://anthropic.com/careers',
  },
  {
    id: 'job_02',
    title: 'Staff Platform Engineer',
    company: 'Stripe',
    location: 'Remote (US / Canada)',
    workplaceType: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Lead',
    salaryRange: '$220,000 - $280,000',
    postedDate: 'Just now',
    description:
      'Join Stripe’s Core Infrastructure group to build ultra-reliable global payment routing systems and containerized microservice control planes handling billions in daily volume.',
    requiredSkills: ['Python', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'Git'],
    preferredSkills: ['Go', 'Terraform', 'Datadog', 'Kafka'],
    responsibilities: [
      'Architect distributed infrastructure with 99.999% SLA availability across multi-region AWS deployments.',
      'Lead cross-organizational architectural reviews and disaster recovery drills.',
      'Optimize database read/write throughput and cache topologies under extreme global peak traffic.',
    ],
    educationRequirement: 'B.S. in Computer Science or equivalent',
    experienceYears: '7+ years',
    applyUrl: 'https://stripe.com/jobs',
  },
  {
    id: 'job_03',
    title: 'Machine Learning Engineer',
    company: 'Scale AI',
    location: 'San Francisco, CA',
    workplaceType: 'On-site',
    jobType: 'Full-time',
    experienceLevel: 'Mid',
    salaryRange: '$170,000 - $215,000',
    postedDate: '3 days ago',
    description:
      'Scale AI is building the data foundry for artificial intelligence. You will train, fine-tune, and evaluate deep learning architectures and large language model alignment pipelines.',
    requiredSkills: ['Python', 'Machine Learning', 'Data Analysis', 'Git', 'SQL'],
    preferredSkills: ['PyTorch', 'HuggingFace', 'CUDA', 'Docker'],
    responsibilities: [
      'Train and evaluate fine-tuned LLMs on domain-specific reasoning benchmarks.',
      'Build automated data filtering, embedding generation, and synthetic generation pipelines.',
      'Deploy scalable inference endpoints on Kubernetes GPU clusters.',
    ],
    educationRequirement: 'Degree in Computer Science, Math, or related STEM discipline',
    experienceYears: '3+ years',
    applyUrl: 'https://scale.com/careers',
  },
  {
    id: 'job_04',
    title: 'Senior Frontend Engineer',
    company: 'Linear',
    location: 'Remote (Global)',
    workplaceType: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Senior',
    salaryRange: '$180,000 - $230,000',
    postedDate: '1 week ago',
    description:
      'Help us craft the modern standard for issue tracking and product management software. We care deeply about 60fps animations, keyboard navigation, and instant local-first synchronization.',
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'Git'],
    preferredSkills: ['WebGL', 'Framer Motion', 'IndexedDB', 'Tailwind CSS'],
    responsibilities: [
      'Build desktop-class web interactions with zero perceptible latency.',
      'Champion accessibility, fluid keyboard navigation, and dark mode design harmony.',
      'Optimize React rendering trees and canvas-accelerated document views.',
    ],
    educationRequirement: 'Equivalent experience in shipping world-class web products',
    experienceYears: '5+ years',
    applyUrl: 'https://linear.app/careers',
  },
  {
    id: 'job_05',
    title: 'Lead Data Engineer',
    company: 'Snowflake',
    location: 'San Mateo, CA',
    workplaceType: 'Hybrid',
    jobType: 'Full-time',
    experienceLevel: 'Senior',
    salaryRange: '$200,000 - $250,000',
    postedDate: '4 days ago',
    description:
      'Lead our enterprise telemetry and warehouse optimization pipelines. Architect scalable real-time streaming ingestion systems processing tens of petabytes daily.',
    requiredSkills: ['SQL', 'Python', 'Data Analysis', 'AWS', 'Git'],
    preferredSkills: ['Spark', 'Kafka', 'dbt', 'Airflow'],
    responsibilities: [
      'Design modular data warehouse schemas and automated pipeline orchestrations.',
      'Optimize SQL queries and cluster partition pruning across billion-row datasets.',
      'Collaborate with business intelligence and product analysts on unified metrics.',
    ],
    educationRequirement: 'B.S. or M.S. in Computer Science or Information Systems',
    experienceYears: '6+ years',
    applyUrl: 'https://snowflake.com/careers',
  },
  {
    id: 'job_06',
    title: 'Junior Software Engineer',
    company: 'Cloudflare',
    location: 'Austin, TX',
    workplaceType: 'Hybrid',
    jobType: 'Full-time',
    experienceLevel: 'Entry',
    salaryRange: '$115,000 - $140,000',
    postedDate: '5 days ago',
    description:
      'Kickstart your career at Cloudflare building the next generation of internet security and edge compute infrastructure. Great mentorship and accelerated promotion tracks.',
    requiredSkills: ['Python', 'JavaScript', 'Git', 'SQL'],
    preferredSkills: ['React', 'Docker', 'Linux'],
    responsibilities: [
      'Contribute to edge workers and customer-facing dashboard features.',
      'Write comprehensive unit tests and automated integration suites.',
      'Participate in code reviews and weekly engineering knowledge shares.',
    ],
    educationRequirement: 'Recent graduate in CS or self-taught with project portfolio',
    experienceYears: '0-2 years',
    applyUrl: 'https://cloudflare.com/careers',
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

export const INITIAL_ATS_HISTORY: AtsHistoryPoint[] = [];

export const INITIAL_SKILL_MASTERY: SkillMasteryPoint[] = [];

export const INITIAL_ACTIVITIES: ActivityLogItem[] = [];
