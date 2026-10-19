import { AdzunaProvider } from './src/lib/jobs/providers/adzuna';
import { JoobleProvider } from './src/lib/jobs/providers/jooble';
import { deduplicateJobs } from './src/lib/jobs/dedupe';
import { rankJobsWithResume } from './src/lib/jobs/ranking';
import { NormalizedJob } from './src/lib/jobs/types';

async function testPipeline() {
  console.log('Testing provider pipeline and normalized models...');

  // Mock Adzuna normalized output
  const adzunaJobs: NormalizedJob[] = [
    {
      id: 'adzuna_1001',
      source: 'Adzuna',
      sourceJobId: '1001',
      title: 'Senior React / Next.js Developer',
      company: 'Razorpay',
      location: 'Bengaluru, Karnataka',
      country: 'IN',
      city: 'Bengaluru',
      description: 'Join our payments engineering team. Seeking expertise in React, TypeScript, Next.js, Redux, and AWS.',
      snippet: 'Seeking expertise in React, TypeScript, Next.js, Redux, and AWS.',
      salaryMin: 2000000,
      salaryMax: 3000000,
      salaryCurrency: 'INR',
      salaryDisplay: '₹20L - ₹30L / yr',
      employmentType: 'Full-time',
      experienceLevel: 'Senior',
      workplaceType: 'Hybrid',
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      applyUrl: 'https://careers.razorpay.com/jobs/1001',
      sourceUrl: 'https://careers.razorpay.com/jobs/1001',
      skills: ['React', 'TypeScript', 'Next.js', 'AWS'],
      category: 'Fintech Engineering',
      remote: false,
      hybrid: true,
      onsite: false,
    },
    {
      id: 'adzuna_1002',
      source: 'Adzuna',
      sourceJobId: '1002',
      title: 'Full Stack Engineer (Python & React)',
      company: 'Flipkart',
      location: 'Bengaluru',
      country: 'IN',
      city: 'Bengaluru',
      description: 'High scale e-commerce services using Python, Django, React, PostgreSQL, Docker, and Kubernetes.',
      snippet: 'Using Python, Django, React, PostgreSQL, Docker, and Kubernetes.',
      salaryMin: 1800000,
      salaryMax: 2600000,
      salaryCurrency: 'INR',
      salaryDisplay: '₹18L - ₹26L / yr',
      employmentType: 'Full-time',
      experienceLevel: 'Mid',
      workplaceType: 'On-site',
      postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      applyUrl: 'https://careers.flipkart.com/jobs/1002',
      sourceUrl: 'https://careers.flipkart.com/jobs/1002',
      skills: ['Python', 'Django', 'React', 'PostgreSQL', 'Docker', 'Kubernetes'],
      category: 'Software Development',
      remote: false,
      hybrid: false,
      onsite: true,
    },
  ];

  // Mock Jooble normalized output
  const joobleJobs: NormalizedJob[] = [
    {
      id: 'jooble_2001',
      source: 'Jooble',
      sourceJobId: '2001',
      title: 'Senior React / Next.js Developer',
      company: 'Razorpay Technologies',
      location: 'Bangalore',
      country: 'IN',
      city: 'Bangalore',
      description: 'Join our payments engineering team. Seeking expertise in React, TypeScript, Next.js, Redux, and AWS. Competitive compensation package.',
      snippet: 'Seeking expertise in React, TypeScript, Next.js, Redux, and AWS.',
      salaryMin: 2200000,
      salaryMax: 3200000,
      salaryCurrency: 'INR',
      salaryDisplay: '₹22L - ₹32L / yr',
      employmentType: 'Full-time',
      experienceLevel: 'Senior',
      workplaceType: 'Hybrid',
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      applyUrl: 'https://in.jooble.org/desc/2001',
      sourceUrl: 'https://in.jooble.org/desc/2001',
      skills: ['React', 'TypeScript', 'Next.js', 'AWS'],
      category: 'IT & Software',
      remote: false,
      hybrid: true,
      onsite: false,
    },
    {
      id: 'jooble_2002',
      source: 'Jooble',
      sourceJobId: '2002',
      title: 'Backend Systems Engineer',
      company: 'Swiggy',
      location: 'Bengaluru',
      country: 'IN',
      city: 'Bengaluru',
      description: 'Building microservices in Go, Java, Redis, Kafka, and AWS cloud infrastructure.',
      snippet: 'Building microservices in Go, Java, Redis, Kafka, and AWS.',
      salaryMin: 2400000,
      salaryMax: 3400000,
      salaryCurrency: 'INR',
      salaryDisplay: '₹24L - ₹34L / yr',
      employmentType: 'Full-time',
      experienceLevel: 'Senior',
      workplaceType: 'Hybrid',
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      applyUrl: 'https://in.jooble.org/desc/2002',
      sourceUrl: 'https://in.jooble.org/desc/2002',
      skills: ['Go', 'Java', 'Redis', 'Kafka', 'AWS'],
      category: 'Distributed Systems',
      remote: false,
      hybrid: true,
      onsite: false,
    },
  ];

  // 1. Test Deduplication between Adzuna and Jooble for the Razorpay job
  const combined = [...adzunaJobs, ...joobleJobs];
  const deduplicated = deduplicateJobs(combined);
  console.log(`Combined 4 jobs (2 Adzuna + 2 Jooble) -> Deduplicated count: ${deduplicated.length}`);

  if (deduplicated.length !== 3) {
    throw new Error(`Expected 3 unique jobs after deduplication, got ${deduplicated.length}`);
  }
  console.log('✓ Successfully detected and merged duplicate cross-provider listing (Razorpay)');

  // 2. Test Resume Ranking for candidate with React, TypeScript, Python
  const candidateSkills = ['React', 'TypeScript', 'Next.js', 'Python', 'SQL'];
  const ranked = rankJobsWithResume(deduplicated, {
    resumeSkills: candidateSkills,
    resumeHeadline: 'Senior React & Full Stack Developer',
    resumeYearsExp: 6,
  });

  console.log('\nRanked Jobs:');
  for (const job of ranked) {
    console.log(`- [${job.source}] ${job.title} at ${job.company}: ${job.matchScore}% Match`);
    console.log(`  Matched: ${job.matchedSkills?.join(', ')}`);
    console.log(`  Missing: ${job.missingSkills?.join(', ')}`);
    console.log(`  Explanation: ${job.matchReason}`);
  }

  // Top ranked job must be Razorpay (React, TypeScript, Next.js match candidate profile)
  if (ranked[0].title.includes('React') && (ranked[0].matchScore || 0) >= 75) {
    console.log('\n✓ Ranking algorithm correctly placed highest matching job at position 1');
  } else {
    throw new Error('Ranking order did not match expected skill relevance');
  }

  console.log('\n✓ Provider pipeline test passed with 100% success!');
}

testPipeline().catch((err) => {
  console.error('Pipeline test failed:', err);
  process.exit(1);
});
