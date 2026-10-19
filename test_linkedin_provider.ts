import { executeJobSearch } from './src/lib/jobs/search';

async function testPipeline() {
  console.log('Testing executeJobSearch with Python Developer in Bengaluru...');
  const res = await executeJobSearch({
    keywords: 'Python Developer',
    location: 'Bengaluru',
    limit: 6,
    resumeSkills: ['Python', 'SQL', 'React', 'Git', 'Django', 'Docker'],
    resumeHeadline: 'Senior Full Stack Engineer',
    resumeYearsExp: 4,
    candidateContext: {
      skills: ['Python', 'SQL', 'React', 'Git', 'Django', 'Docker'],
      headline: 'Senior Full Stack Engineer',
      yearsOfExperience: 4,
      education: [{ degree: 'B.Tech in Computer Science', institution: 'VTU' }],
      projects: [{ title: 'Resume AI', description: 'Built with React and Python', technologies: ['Python', 'React', 'SQL'] }],
      detectedKeywords: ['Python', 'API', 'Backend', 'Software']
    }
  });

  console.log('Result Status:');
  console.log('  isConfigured:', res.isConfigured);
  console.log('  configuredProviders:', res.configuredProviders);
  console.log('  activeSources:', res.activeSources);
  console.log('  unavailableSources:', res.unavailableSources);
  console.log('  totalJobs returned:', res.jobs.length);

  if (res.jobs.length > 0) {
    console.log('\n--- First 3 Jobs ---');
    res.jobs.slice(0, 3).forEach((job, idx) => {
      console.log(`[Job ${idx + 1}]`);
      console.log('  Title:', job.title);
      console.log('  Company:', job.company);
      console.log('  Location:', job.location);
      console.log('  Source:', job.source);
      console.log('  Apply URL:', job.applyUrl);
      console.log('  Match Score:', job.matchScore + '%');
      console.log('  Match Breakdown:', job.matchBreakdown);
      console.log('  Matched Skills:', job.matchedSkills);
      console.log('  Partial Skills:', job.partialSkills);
      console.log('  Missing Skills:', job.missingSkills);
      console.log('  Match Reason:', job.matchReason);
    });
  }
  console.log('\n==========================================');
  console.log('Testing React Developer in Hyderabad...');
  const res2 = await executeJobSearch({
    keywords: 'React Developer',
    location: 'Hyderabad',
    limit: 3,
    resumeSkills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Redux'],
  });
  console.log('React Dev Hyderabad jobs count:', res2.jobs.length);
  if (res2.jobs.length > 0) {
    console.log('  Job 1:', res2.jobs[0].title, '|', res2.jobs[0].company, '|', res2.jobs[0].location);
    console.log('  Apply URL:', res2.jobs[0].applyUrl);
    console.log('  Match:', res2.jobs[0].matchScore + '%');
  }

  console.log('\n==========================================');
  console.log('Testing Data Analyst in Bengaluru...');
  const res3 = await executeJobSearch({
    keywords: 'Data Analyst',
    location: 'Bengaluru',
    limit: 3,
    resumeSkills: ['SQL', 'Python', 'Excel', 'Tableau', 'Power BI'],
  });
  console.log('Data Analyst Bengaluru jobs count:', res3.jobs.length);
  if (res3.jobs.length > 0) {
    console.log('  Job 1:', res3.jobs[0].title, '|', res3.jobs[0].company, '|', res3.jobs[0].location);
    console.log('  Apply URL:', res3.jobs[0].applyUrl);
    console.log('  Match:', res3.jobs[0].matchScore + '%');
  }
}

testPipeline().catch(console.error);
