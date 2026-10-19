import { CompanyProfile, CompanyRole, ReadinessEvaluation, SkillMatchDetail } from '@/types/guidance';
import { SupportedSkill, UserSkill } from '@/types/skills';

export const COMPANY_PROFILES: CompanyProfile[] = [
  {
    id: 'tcs',
    name: 'TCS (Tata Consultancy Services)',
    tier: 'Global IT Services',
    headquarters: 'Mumbai, India',
    overview:
      'Largest IT services multinational in India. Recruits freshers heavily through the nationwide TCS National Qualifier Test (TCS NQT) across Ninja, Digital, and Prime bands.',
    hiringCycle: 'August - November (On-Campus & Off-Campus NQT)',
    selectionProcess: 'TCS NQT Online Cognitive & Coding -> Technical Round -> Managerial & HR Interview',
    minAcademicPercentage: '60% throughout 10th, 12th, and B.Tech / BCA (Maximum 1 active backlog)',
    roles: [
      {
        id: 'tcs-digital-dev',
        title: 'TCS Digital Software Developer',
        category: 'Software Engineering',
        level: 'Entry-Level / Fresher (Digital Cadre)',
        experienceRequired: '0 - 1 Years',
        packageRange: '₹7.0 - ₹9.0 LPA',
        requiredSkills: ['Java', 'SQL', 'Python', 'Git'],
        recommendedSkills: ['React', 'AWS'],
        eligibility: 'B.Tech / B.E / M.Tech in CS, IT, ECE, EE with 70%+ aggregate',
        dsaWeight: 'High',
        systemDesignWeight: 'Low',
        interviewRounds: [
          {
            round: 1,
            name: 'TCS NQT Digital Assessment',
            description: 'Advanced quantitative reasoning, logical ability, verbal ability, and 2 advanced coding challenges in Java/Python/C++.',
            duration: '180 Mins',
            tips: 'Practice medium array manipulation, dynamic programming, and string tokenization.',
          },
          {
            round: 2,
            name: 'Technical Interview',
            description: 'Deep dive into OOP concepts, SQL joins/subqueries, data structures, and capstone college projects.',
            duration: '45 Mins',
            tips: 'Explain your college projects thoroughly and be prepared to write SQL queries on a whiteboard.',
          },
          {
            round: 3,
            name: 'Managerial & HR Round',
            description: 'Situational judgment, teamwork under deadlines, willingness to relocate, and communication skills.',
            duration: '25 Mins',
            tips: 'Demonstrate enthusiasm for learning new cloud and digital technologies.',
          },
        ],
        resumeKeywords: ['Java', 'Spring Boot', 'SQL', 'Git', 'Agile', 'Object Oriented Programming', 'Relational Database'],
        preparationTips: [
          'Master TCS NQT previous year advanced coding problems.',
          'Review database normalization (1NF, 2NF, 3NF) and indexed SQL queries.',
          'Prepare your resume projects to highlight real coding contribution rather than team certificates.',
        ],
      },
      {
        id: 'tcs-ninja-eng',
        title: 'TCS Ninja Systems Engineer',
        category: 'Software Engineering',
        level: 'Entry-Level / Fresher (Ninja Cadre)',
        experienceRequired: '0 Years',
        packageRange: '₹3.6 - ₹4.5 LPA',
        requiredSkills: ['Python', 'SQL', 'Git'],
        recommendedSkills: ['Java', 'JavaScript'],
        eligibility: 'All Engineering branches with 60%+ aggregate',
        dsaWeight: 'Medium',
        systemDesignWeight: 'Low',
        interviewRounds: [
          {
            round: 1,
            name: 'TCS NQT Foundation Assessment',
            description: 'Numerical ability, verbal ability, reasoning ability, and 1 standard coding problem.',
            duration: '120 Mins',
            tips: 'Speed and accuracy in quantitative aptitude are crucial for clearing cutoffs.',
          },
          {
            round: 2,
            name: 'Combined Technical & HR Round',
            description: 'Basic programming syntax, loops, functions, basic SQL, and academic background evaluation.',
            duration: '30 Mins',
            tips: 'Be confident in at least one primary programming language (Python or Java).',
          },
        ],
        resumeKeywords: ['Python', 'SQL Queries', 'Software Engineering', 'Problem Solving', 'Data Analysis Basics'],
        preparationTips: [
          'Focus on basic loops, string reversals, and prime number algorithms.',
          'Have a well-structured single-page A4 fresher resume highlighting academic projects.',
        ],
      },
    ],
  },
  {
    id: 'infosys',
    name: 'Infosys',
    tier: 'Global IT Services',
    headquarters: 'Bengaluru, India',
    overview:
      'Premier Indian multinational IT service corporation. Offers accelerated fresh graduate career tracks through HackWithInfy, InfyTQ, and National Recruitment Drives.',
    hiringCycle: 'July - October (Campus & Off-Campus)',
    selectionProcess: 'Online Coding Test -> Technical Interview -> HR Round',
    minAcademicPercentage: '65% or 6.5 CGPA in graduation with no active backlogs',
    roles: [
      {
        id: 'infosys-sp',
        title: 'Specialist Programmer (Power Programmer)',
        category: 'Software Engineering',
        level: 'Entry-Level / Elite Fresher',
        experienceRequired: '0 - 1 Years',
        packageRange: '₹9.5 - ₹12.0 LPA',
        requiredSkills: ['Java', 'C++', 'SQL', 'Git'],
        recommendedSkills: ['Python', 'AWS', 'React'],
        eligibility: 'B.Tech / M.Tech in CS/IT or circuital branches through HackWithInfy coding competition',
        dsaWeight: 'High',
        systemDesignWeight: 'Medium',
        interviewRounds: [
          {
            round: 1,
            name: 'HackWithInfy Coding Challenge',
            description: '3 competitive programming problems covering Graphs, Trees, Dynamic Programming, and Greedy Algorithms.',
            duration: '180 Mins',
            tips: 'Test cases have strict time complexity (O(N log N) or O(N)). Efficient algorithms are mandatory.',
          },
          {
            round: 2,
            name: 'Elite Technical Interview',
            description: 'Rigorous live coding, algorithmic optimization, OS concurrency, database indexing, and system architecture.',
            duration: '60 Mins',
            tips: 'Expect questions on space-time trade-offs and thread-safe data structures.',
          },
        ],
        resumeKeywords: ['Data Structures', 'Algorithms', 'Competitive Programming', 'Java', 'C++', 'Distributed Systems', 'Git'],
        preparationTips: [
          'Practice Graph traversals (BFS, DFS, Dijkstra) and Dynamic Programming on LeetCode/CodeChef.',
          'Review memory management and pointer mechanics if using C++.',
        ],
      },
      {
        id: 'infosys-dse',
        title: 'Digital Specialist Engineer (DSE)',
        category: 'Software Engineering',
        level: 'Entry-Level / Fresher (Digital)',
        experienceRequired: '0 Years',
        packageRange: '₹6.25 - ₹7.0 LPA',
        requiredSkills: ['Java', 'SQL', 'Git'],
        recommendedSkills: ['Python', 'React'],
        eligibility: 'B.Tech graduates with 65%+ marks',
        dsaWeight: 'Medium',
        systemDesignWeight: 'Low',
        interviewRounds: [
          {
            round: 1,
            name: 'InfyTQ Certification & DSE Test',
            description: 'Hands-on programming test in Java/Python + Database and SQL evaluation.',
            duration: '150 Mins',
            tips: 'Scoring 65%+ grants automatic interview qualification.',
          },
          {
            round: 2,
            name: 'Technical Interview',
            description: 'OOP design patterns, DBMS queries, recursion, and project implementation review.',
            duration: '45 Mins',
            tips: 'Know how to design schema tables with primary and foreign keys.',
          },
        ],
        resumeKeywords: ['Object Oriented Programming', 'Java', 'Database Management', 'SQL', 'Web Development'],
        preparationTips: [
          'Review Java collections framework (ArrayList, HashMap, HashSet).',
          'Have your GitHub repository links properly formatted on your resume.',
        ],
      },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    tier: 'Top Tech / Product',
    headquarters: 'Mountain View, California (Offices: Bengaluru, Hyderabad, Gurugram)',
    overview:
      'Global technology titan in search, cloud, AI, and consumer platforms. Hiring process emphasizes algorithmic problem solving, clean maintainable code, and Googleyness & Leadership.',
    hiringCycle: 'August - November (University Graduate), Rolling Off-Campus',
    selectionProcess: 'Online Assessment -> 3-4 Rounds of Virtual Coding & Problem Solving -> Googleyness & Leadership Interview',
    minAcademicPercentage: 'No strict percentage cutoff; strong engineering fundamentals required',
    roles: [
      {
        id: 'google-swe-early',
        title: 'Software Engineer (Early Career / L3)',
        category: 'Software Engineering',
        level: 'Early Career / University Graduate',
        experienceRequired: '0 - 1 Years',
        packageRange: '₹28 - ₹42 LPA (Total Compensation)',
        requiredSkills: ['C++', 'Python', 'Java', 'Git'],
        recommendedSkills: ['SQL', 'Machine Learning'],
        eligibility: 'Degree in Computer Science, Mathematics, or equivalent practical experience',
        dsaWeight: 'High',
        systemDesignWeight: 'Medium',
        interviewRounds: [
          {
            round: 1,
            name: 'Google Online Challenge (GOC)',
            description: '2 complex algorithmic problem scenarios testing edge-case handling and optimal runtime complexity.',
            duration: '60 Mins',
            tips: 'Watch out for boundary conditions (integer overflow, empty inputs, disconnected components).',
          },
          {
            round: 2,
            name: 'Technical Coding Round 1',
            description: 'Live coding in Google Docs / CoderPad. Focus on trees, binary search, graphs, or dynamic programming.',
            duration: '45 Mins',
            tips: 'Think out loud. Clarify assumptions with the interviewer before writing code.',
          },
          {
            round: 3,
            name: 'Technical Coding Round 2',
            description: 'Complex algorithmic puzzle or simulation with evolving constraints. Clean, modular code is evaluated.',
            duration: '45 Mins',
            tips: 'Write modular functions with clear naming and calculate exact Big-O complexity.',
          },
          {
            round: 4,
            name: 'Googleyness & Leadership',
            description: 'Behavioral evaluation on intellectual humility, navigating ambiguity, teamwork, and ethical decision-making.',
            duration: '45 Mins',
            tips: 'Use the STAR format (Situation, Task, Action, Result) with honest reflection.',
          },
        ],
        resumeKeywords: ['Algorithms', 'Data Structures', 'C++', 'Python', 'System Architecture', 'Clean Code', 'Performance Optimization'],
        preparationTips: [
          'Solve 250+ LeetCode Medium/Hard problems across Graphs, Trees, and Dynamic Programming.',
          'Focus on communicative problem solving and discussing trade-offs.',
          'Quantify accomplishments on your resume (e.g., "Reduced latency by 35% using memoization").',
        ],
      },
      {
        id: 'google-data-analyst',
        title: 'Data Analyst & Insights Specialist',
        category: 'Data & AI',
        level: 'Entry-Level / Early Career',
        experienceRequired: '0 - 2 Years',
        packageRange: '₹18 - ₹26 LPA',
        requiredSkills: ['SQL', 'Python', 'Data Analysis'],
        recommendedSkills: ['Machine Learning', 'Git'],
        eligibility: 'Degree in Statistics, CS, Data Science, or Economics',
        dsaWeight: 'Medium',
        systemDesignWeight: 'Low',
        interviewRounds: [
          {
            round: 1,
            name: 'Analytical & SQL Assessment',
            description: 'Complex window functions, aggregations, self-joins, and data manipulation puzzles.',
            duration: '75 Mins',
            tips: 'Master RANK, DENSE_RANK, PARTITION BY, and cumulative sum queries.',
          },
          {
            round: 2,
            name: 'Data Case Study & Business Modeling',
            description: 'Deriving root causes for metric drops, A/B test interpretation, and statistical hypothesis testing.',
            duration: '45 Mins',
            tips: 'Structure your thinking with MECE (Mutually Exclusive, Collectively Exhaustive) framework.',
          },
        ],
        resumeKeywords: ['SQL Window Functions', 'Python', 'Pandas', 'Statistical Modeling', 'A/B Testing', 'Data Storytelling'],
        preparationTips: [
          'Be prepared to answer metric diagnostic questions like "If YouTube watch time drops 5% in Brazil, how would you investigate?"',
          'Include real data projects with visualization charts on your resume.',
        ],
      },
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    tier: 'Top Tech / Product',
    headquarters: 'Seattle, Washington (Offices: Bengaluru, Hyderabad, Chennai, Pune)',
    overview:
      'Global e-commerce and AWS cloud infrastructure leader. Heavy emphasis on Amazon 16 Leadership Principles (Customer Obsession, Ownership, Bias for Action) and algorithmic scalability.',
    hiringCycle: 'August - December (Amazon Campus Hiring), Rolling Off-Campus',
    selectionProcess: 'Amazon Online Assessment (OA 1, OA 2) -> 3-4 Video Coding & Leadership Principle Interviews',
    minAcademicPercentage: '65% / 6.5 CGPA in B.Tech / M.Tech / MCA',
    roles: [
      {
        id: 'amazon-sde1',
        title: 'Software Development Engineer I (SDE 1)',
        category: 'Software Engineering',
        level: 'Entry-Level / University Graduate',
        experienceRequired: '0 - 1 Years',
        packageRange: '₹22 - ₹36 LPA (Total Compensation)',
        requiredSkills: ['Java', 'C++', 'SQL', 'Git'],
        recommendedSkills: ['AWS', 'Python', 'React'],
        eligibility: 'B.Tech / M.Tech / MCA in CS, IT, or related fields',
        dsaWeight: 'High',
        systemDesignWeight: 'Medium',
        interviewRounds: [
          {
            round: 1,
            name: 'Amazon Online Assessment (OA 1: Code & Work Style)',
            description: '2 LeetCode Medium coding questions + Amazon Work Style behavioral assessment.',
            duration: '90 Mins',
            tips: 'Consistency in behavioral questions matching Amazon Leadership Principles is critical.',
          },
          {
            round: 2,
            name: 'Technical Round 1 (DSA + Customer Obsession)',
            description: 'Data structures (HashMaps, Heaps, Trees) + 20 minutes of Leadership Principle storytelling.',
            duration: '60 Mins',
            tips: 'Every interview dedicares 20 minutes to LP questions. Prepare 2 STAR stories per principle.',
          },
          {
            round: 3,
            name: 'Technical Round 2 (OOP / Low-Level Design + Ownership)',
            description: 'Design a system component (e.g. Parking Lot, Amazon Locker, Movie Booking) using OOP principles.',
            duration: '60 Mins',
            tips: 'Use SOLID principles and design patterns (Singleton, Factory, Strategy).',
          },
          {
            round: 4,
            name: 'Bar Raiser Round (Algorithms + Bias for Action)',
            description: 'Rigorous cross-team interviewer assessing long-term engineering potential and cultural alignment.',
            duration: '60 Mins',
            tips: 'Stay calm under pressure and never compromise on data integrity or customer impact.',
          },
        ],
        resumeKeywords: ['Java', 'Object Oriented Design', 'Data Structures', 'AWS', 'Scalability', 'Leadership Principles', 'Git'],
        preparationTips: [
          'Review Amazon-tagged questions on LeetCode (Priority Queues, Breadth-First Search, Intervals).',
          'Study Low-Level Object Oriented Design with class diagrams and interface contracts.',
          'Prepare concise STAR stories with metrics (cost reduced, latency improved, bugs fixed).',
        ],
      },
    ],
  },
  {
    id: 'wipro',
    name: 'Wipro',
    tier: 'Global IT Services',
    headquarters: 'Bengaluru, India',
    overview:
      'Major multinational technology services and consulting company. Recruits through the Elite National Talent Hunt (NTH) and Turbo assessment tracks.',
    hiringCycle: 'August - November',
    selectionProcess: 'Wipro NTH Assessment -> Technical Interview -> HR Round',
    minAcademicPercentage: '60% throughout 10th, 12th, and Degree',
    roles: [
      {
        id: 'wipro-turbo',
        title: 'Project Engineer (Wipro Turbo / Velocity)',
        category: 'Software Engineering',
        level: 'Entry-Level / Fresher',
        experienceRequired: '0 - 1 Years',
        packageRange: '₹6.5 - ₹8.0 LPA',
        requiredSkills: ['Java', 'Python', 'SQL', 'Git'],
        recommendedSkills: ['React', 'AWS'],
        eligibility: 'B.Tech / M.Tech in CS/IT/ECE with 65%+ marks',
        dsaWeight: 'Medium',
        systemDesignWeight: 'Low',
        interviewRounds: [
          {
            round: 1,
            name: 'Turbo Elite Assessment',
            description: 'Aptitude, communication ability, and 2 algorithmic coding problems.',
            duration: '140 Mins',
            tips: 'Solve both coding questions to secure the elevated Turbo salary band.',
          },
          {
            round: 2,
            name: 'Technical & Academic Interview',
            description: 'Database design, core programming fundamentals, and college mini-project review.',
            duration: '35 Mins',
            tips: 'Be ready to explain how your code compiles and handles runtime exceptions.',
          },
        ],
        resumeKeywords: ['Java', 'Python', 'SQL Queries', 'Object Oriented Programming', 'Software Engineering'],
        preparationTips: [
          'Practice basic coding problems (Matrix rotation, string anagrams, palindrome substrings).',
          'Format your resume cleanly with A4 margins and zero typos.',
        ],
      },
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    tier: 'Top Tech / Product',
    headquarters: 'Redmond, Washington (Offices: Hyderabad, Bengaluru, Noida)',
    overview:
      'Global computing pioneer behind Windows, Azure, Office 365, and GitHub. Recruits fresh graduates through Microsoft University Hiring and the Engage mentorship initiative.',
    hiringCycle: 'August - October',
    selectionProcess: 'Codility Online Assessment -> 3-4 Rounds of Technical Problem Solving & Design',
    minAcademicPercentage: '7.0 CGPA or 70%+ in B.Tech / M.Tech',
    roles: [
      {
        id: 'msft-swe-fresher',
        title: 'Software Engineer (University Graduate)',
        category: 'Software Engineering',
        level: 'Entry-Level / Fresher',
        experienceRequired: '0 - 1 Years',
        packageRange: '₹24 - ₹40 LPA (Total Compensation)',
        requiredSkills: ['C++', 'Java', 'Python', 'Git'],
        recommendedSkills: ['SQL', 'React', 'AWS'],
        eligibility: 'B.Tech / M.Tech / MS in CS, IT, ECE with strong coding proficiency',
        dsaWeight: 'High',
        systemDesignWeight: 'Medium',
        interviewRounds: [
          {
            round: 1,
            name: 'Codility Online Coding Test',
            description: '3 coding problems with focus on performance, edge cases, and memory bounds.',
            duration: '90 Mins',
            tips: 'Codility evaluates both correctness and execution performance score.',
          },
          {
            round: 2,
            name: 'Technical Interview 1 (Algorithms & Data Structures)',
            description: 'Trees, Linked Lists, Matrix traversal, and algorithmic efficiency.',
            duration: '45 Mins',
            tips: 'Write bug-free code and proactively write test cases verifying your solution.',
          },
          {
            round: 3,
            name: 'Technical Interview 2 (System Components & Concurrency)',
            description: 'Threading, synchronization, operating system concepts, and data structures.',
            duration: '45 Mins',
            tips: 'Understand processes vs threads, deadlocks, and caching mechanics.',
          },
          {
            round: 4,
            name: 'AA / Partner Round (Leadership & Growth Mindset)',
            description: 'Evaluation of passion for technology, growth mindset, and handling setbacks.',
            duration: '45 Mins',
            tips: 'Emphasize your willingness to learn, adapt, and build accessible technology.',
          },
        ],
        resumeKeywords: ['C++', 'Data Structures', 'Algorithms', 'Azure', 'System Programming', 'Object Oriented Design', 'Git'],
        preparationTips: [
          'Review Linked List pointers, Tree reconstructions, and Dynamic Programming.',
          'Demonstrate Microsoft Growth Mindset in your behavioral explanations.',
        ],
      },
    ],
  },
];

// Calculate candidate readiness for a specific company and role
export function evaluateCandidateReadiness(
  role: CompanyRole,
  userSkills: UserSkill[]
): ReadinessEvaluation {
  const userSkillMap = new Map<SupportedSkill, UserSkill>();
  userSkills.forEach((s) => userSkillMap.set(s.name, s));

  const matchedSkills: SkillMatchDetail[] = [];
  const missingRequired: SupportedSkill[] = [];

  let requiredVerifiedCount = 0;
  let requiredClaimedCount = 0;
  let recommendedVerifiedCount = 0;
  let recommendedClaimedCount = 0;

  // Process required skills
  role.requiredSkills.forEach((skill: SupportedSkill) => {
    const userSk = userSkillMap.get(skill);
    if (userSk && userSk.status === 'verified') {
      requiredVerifiedCount++;
      matchedSkills.push({
        skill,
        isRequired: true,
        isVerified: true,
        isClaimed: true,
        score: userSk.score,
        certificateId: userSk.certificateId,
        status: 'verified',
      });
    } else if (userSk && userSk.status === 'claimed') {
      requiredClaimedCount++;
      matchedSkills.push({
        skill,
        isRequired: true,
        isVerified: false,
        isClaimed: true,
        status: 'claimed',
      });
    } else {
      missingRequired.push(skill);
      matchedSkills.push({
        skill,
        isRequired: true,
        isVerified: false,
        isClaimed: false,
        status: 'missing',
      });
    }
  });

  // Process recommended skills
  role.recommendedSkills.forEach((skill: SupportedSkill) => {
    const userSk = userSkillMap.get(skill);
    if (userSk && userSk.status === 'verified') {
      recommendedVerifiedCount++;
      matchedSkills.push({
        skill,
        isRequired: false,
        isVerified: true,
        isClaimed: true,
        score: userSk.score,
        certificateId: userSk.certificateId,
        status: 'verified',
      });
    } else if (userSk && userSk.status === 'claimed') {
      recommendedClaimedCount++;
      matchedSkills.push({
        skill,
        isRequired: false,
        isVerified: false,
        isClaimed: true,
        status: 'claimed',
      });
    } else {
      matchedSkills.push({
        skill,
        isRequired: false,
        isVerified: false,
        isClaimed: false,
        status: 'missing',
      });
    }
  });

  // Calculate weighted readiness score
  // Required skills are 70% of total score, Recommended are 30%
  const totalReq = role.requiredSkills.length;
  const totalRec = role.recommendedSkills.length;

  const reqScore = totalReq > 0
    ? ((requiredVerifiedCount * 1.0 + requiredClaimedCount * 0.4) / totalReq) * 70
    : 70;

  const recScore = totalRec > 0
    ? ((recommendedVerifiedCount * 1.0 + recommendedClaimedCount * 0.4) / totalRec) * 30
    : 30;

  const readinessScore = Math.min(100, Math.round(reqScore + recScore));

  let status: ReadinessEvaluation['status'] = 'Beginning Journey';
  if (readinessScore >= 75) {
    status = 'Interview Ready';
  } else if (readinessScore >= 45) {
    status = 'Needs Preparation';
  }

  const nextSteps: string[] = [];
  if (missingRequired.length > 0) {
    nextSteps.push(
      `Take proctored assessments for required missing skills: ${missingRequired.join(', ')}.`
    );
  }
  if (requiredClaimedCount > 0) {
    nextSteps.push('Verify your claimed skills with an online proctored exam to earn digital credentials.');
  }
  if (role.dsaWeight === 'High') {
    nextSteps.push(`Focus on Data Structures & Algorithms (Trees, Graphs, DP) as ${role.title} places heavy weight on DSA.`);
  }
  nextSteps.push(`Tailor your resume using keywords: ${role.resumeKeywords.slice(0, 4).join(', ')}.`);

  return {
    readinessScore,
    status,
    totalRequired: totalReq,
    verifiedRequired: requiredVerifiedCount,
    totalRecommended: totalRec,
    verifiedRecommended: recommendedVerifiedCount,
    matchedSkills,
    missingRequired,
    nextSteps,
  };
}
