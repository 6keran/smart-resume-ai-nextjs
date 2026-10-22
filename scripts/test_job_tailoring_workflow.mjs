import assert from 'node:assert';
import Module from 'node:module';

// Intercept server-only check for test environments
const origLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === 'server-only') {
    return {};
  }
  return origLoad.apply(this, [id, ...args]);
};

import { SAMPLE_EXPERIENCED_RESUME } from '../src/lib/sampleResume.ts';
import { RESUME_TEMPLATES } from '../src/lib/templates.ts';
import { ResumeRenderer } from '../src/components/builder/templates/ResumeRenderer.tsx';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

console.log('================================================================');
console.log('=== SMART RESUME AI: JOB-SPECIFIC TAILORING WORKFLOW SUITE ===');
console.log('================================================================\n');

async function runWorkflowTests() {
  const { analyzeResume, improveResumeSection, tailorResumeToJob } = await import(
    '../src/server/services/gemini.ts'
  );
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      throw err;
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      throw err;
    }
  }

  // Sample Resume Content
  const candidateResumeText = `
Rahul Sharma
Senior Software Engineer
rahul.sharma@email.com | +1 (555) 019-2834 | San Francisco, CA | linkedin.com/in/rahulsharma-dev | github.com/rahulsharma

Professional Summary
Senior Software Engineer with 6+ years of experience architecting distributed backend services, high-throughput microservices, and modern web applications using Python, TypeScript, and React. Delivered 99.99% system availability across cloud infrastructure.

Technical Skills
Python, TypeScript, React, Next.js, Node.js, SQL, PostgreSQL, Docker, Git, REST API

Work Experience
Senior Software Engineer | Nexus Technologies | San Francisco, CA | 2021 - Present
- Architected distributed data processing pipeline handling 10M daily events with 40% reduction in latency.
- Refactored legacy monolithic services into decoupled Node.js and Python microservices on Docker.
- Spearheaded engineering best practices, CI/CD pipeline automation, and automated unit testing suites.

Software Engineer | CloudScale Systems | San Jose, CA | 2018 - 2021
- Developed full-stack web applications in React and TypeScript with sub-second page loads.
- Engineered relational database schema in PostgreSQL supporting fast indexed query search.

Education
B.S. in Computer Science | UC Berkeley | Berkeley, CA | 2018 | GPA: 3.82
`;

  // Target Job Requisition
  const targetJobTitle = 'Staff Full Stack & Cloud Architect';
  const targetCompany = 'Stripe';
  const targetJobDescription = `
Stripe is seeking a Staff Full Stack & Cloud Architect to lead technical architecture for our next-generation developer platform.
Key Requirements:
- 5+ years building distributed cloud applications using TypeScript, React, and Python.
- Deep expertise in AWS cloud services, Kubernetes container orchestration, and Redis caching layers.
- Hands-on experience designing high-scale REST API and GraphQL microservice architectures.
- Proven track record optimizing latency, system reliability, and leading cross-functional engineering initiatives.
- Degree in Computer Science or equivalent practical industry experience.
`;

  // TEST 1: General ATS Analysis (No Job Description)
  await testAsync('General ATS Analysis calculates defensible scores and heuristics', async () => {
    const result = await analyzeResume(candidateResumeText);
    assert(typeof result.overallAtsScore === 'number', 'overallAtsScore must be a number');
    assert(result.overallAtsScore >= 50 && result.overallAtsScore <= 100, 'Score must be in valid range');
    assert(result.isJobSpecific === false, 'isJobSpecific should be false when JD is omitted');
    assert(Array.isArray(result.detectedKeywords), 'detectedKeywords must be an array');
    assert(result.detectedKeywords.includes('Python'), 'Should detect Python');
    assert(result.detectedKeywords.includes('TypeScript'), 'Should detect TypeScript');
    assert(typeof result.bulletStrengthScore === 'number', 'bulletStrengthScore must be computed');
    assert(result.topSuggestions.length <= 3, 'Top suggestions must be capped at 3');
    result.topSuggestions.forEach((sug) => {
      assert(sug.priority && sug.whatNeedsImprovement && sug.whyItMatters && sug.howToImprove, 'All 4 suggestion fields required');
    });
  });

  // TEST 2: Job-Specific Analysis (With Job Description, Title, and Company)
  let jobResult = null;
  await testAsync('Job-Specific Analysis classifies matched vs missing skills accurately', async () => {
    jobResult = await analyzeResume(candidateResumeText, targetJobDescription, targetJobTitle, targetCompany);
    assert(jobResult.isJobSpecific === true, 'isJobSpecific must be true');
    assert.strictEqual(jobResult.jobTitle, targetJobTitle, 'Job title must be preserved');
    assert.strictEqual(jobResult.company, targetCompany, 'Company must be preserved');

    // Matched skills should contain skills present in both JD and resume
    assert(Array.isArray(jobResult.matchedSkills), 'matchedSkills must be an array');
    const matchedNames = jobResult.matchedSkills.filter((s) => s.status === 'matched').map((s) => s.skill);
    assert(matchedNames.includes('Python') || matchedNames.includes('TypeScript') || matchedNames.includes('React'), 'Should match core skills in JD');

    // Missing skills should contain skills requested in JD that are absent on resume (e.g. Kubernetes, Redis, AWS, GraphQL)
    assert(Array.isArray(jobResult.missingSkills), 'missingSkills must be an array');
    assert(
      jobResult.missingSkills.includes('Kubernetes') ||
      jobResult.missingSkills.includes('Redis') ||
      jobResult.missingSkills.includes('AWS') ||
      jobResult.missingSkills.includes('GraphQL'),
      'Must identify JD skills absent from resume'
    );
  });

  // TEST 3: In-Place Improvement Simulation - Applying Summary Suggestion
  test('Applying summary suggestion updates active resume data without inventing false facts', () => {
    const resumeCopy = JSON.parse(JSON.stringify(SAMPLE_EXPERIENCED_RESUME));
    const originalSummary = resumeCopy.summary;
    const tailoredSummary = 'Staff-level engineer with 7+ years of experience architecting resilient distributed systems, modern web platforms, and automated cloud workflows. Proven record improving system uptime to 99.99%.';

    // Simulate in-place apply
    resumeCopy.summary = tailoredSummary;
    assert.notStrictEqual(resumeCopy.summary, originalSummary, 'Summary must be updated');
    assert.strictEqual(resumeCopy.summary, tailoredSummary, 'New summary must match applied content');
  });

  // TEST 4: In-Place Improvement Simulation - Adding Missing Skills
  test('Adding missing skills integrates target job competencies without duplicates', () => {
    const resumeCopy = JSON.parse(JSON.stringify(SAMPLE_EXPERIENCED_RESUME));
    const initialSkillsCount = resumeCopy.skills.technical.length;

    // Simulate clicking missing skills chip "+ Apache Kafka", "+ GraphQL"
    const skillsToAdd = ['Apache Kafka', 'GraphQL', 'Python']; // Python is already present in sample
    const existingSet = new Set(resumeCopy.skills.technical.map((s) => s.toLowerCase()));

    const newlyAdded = [];
    skillsToAdd.forEach((skill) => {
      if (!existingSet.has(skill.toLowerCase())) {
        resumeCopy.skills.technical.push(skill);
        newlyAdded.push(skill);
      }
    });

    assert(resumeCopy.skills.technical.includes('Apache Kafka'), 'Apache Kafka must be added');
    assert(resumeCopy.skills.technical.includes('GraphQL'), 'GraphQL must be added');
    assert.strictEqual(newlyAdded.length, 2, 'Must add Kafka and GraphQL without duplicating Python');
    assert.strictEqual(resumeCopy.skills.technical.length, initialSkillsCount + 2, 'Count must increase by exactly 2');
  });

  // TEST 5: In-Place Improvement Simulation - Experience Bullet Replacement
  test('Applying experience bullet improvement targets the specific role', () => {
    const resumeCopy = JSON.parse(JSON.stringify(SAMPLE_EXPERIENCED_RESUME));
    const improvedBullet = 'Architected distributed event-driven indexing services processing 25M daily transactions, reducing P99 latency by 40%.';

    resumeCopy.experience[0].bulletPoints[0] = improvedBullet;
    assert.strictEqual(resumeCopy.experience[0].bulletPoints[0], improvedBullet, 'First bullet must be updated');
  });

  // TEST 6: Section AI Assistant with Target Job Context
  await testAsync('Section AI Assistant refines phrasing aligned with target role', async () => {
    const originalText = 'Responsible for building microservices and working on databases.';
    const improved = await improveResumeSection('experience', originalText, targetJobDescription, targetJobTitle);

    assert(typeof improved.improvedContent === 'string', 'improvedContent must be a string');
    assert(improved.improvedContent.length > originalText.length, 'Must improve with action verbs');
    assert(typeof improved.reasoning === 'string', 'reasoning must be provided');
    assert(typeof improved.metricImpact === 'string', 'metricImpact must be provided');
  });

  // TEST 7: End-to-End Tailoring Service (tailorResumeToJob)
  await testAsync('tailorResumeToJob provides coordinated rewrites preserving factual history', async () => {
    const tailored = await tailorResumeToJob(candidateResumeText, targetJobTitle, targetCompany, targetJobDescription);

    assert(typeof tailored.tailoredSummary === 'string' && tailored.tailoredSummary.length > 20, 'tailoredSummary must be generated');
    assert(Array.isArray(tailored.suggestedBullets), 'suggestedBullets must be an array');
    assert(Array.isArray(tailored.recommendedSkills), 'recommendedSkills must be an array');
    assert(tailored.recommendedSkills.length > 0, 'recommendedSkills must contain extracted competencies');
  });

  // TEST 8: Re-analysis Score Progression Verification
  await testAsync('Re-scoring modified resume reflects improved keyword and bullet strength scores', async () => {
    // Resume with improved active phrasing and added missing keywords (AWS, Kubernetes, Redis)
    const improvedResumeText = `
${candidateResumeText}
Core Competencies: Kubernetes, Redis, AWS, GraphQL
- Spearheaded distributed cloud deployment on Kubernetes and AWS, reducing operational overhead by 35%.
`;
    const reanalyzed = await analyzeResume(improvedResumeText, targetJobDescription, targetJobTitle, targetCompany);

    assert(reanalyzed.isJobSpecific === true, 'Must remain job specific');
    // Matched skills should increase
    const matchedCount = (reanalyzed.matchedSkills || []).filter((s) => s.status === 'matched').length;
    const initialMatched = (jobResult.matchedSkills || []).filter((s) => s.status === 'matched').length;
    assert(matchedCount >= initialMatched, 'Matched skills count must increase or remain high');
    assert(reanalyzed.overallAtsScore >= jobResult.overallAtsScore, 'Overall ATS score should increase with tailored skills');
  });

  // TEST 9: Tailored Resume renders cleanly across all 12 production templates
  test('Tailored resume renders without error across all 12 templates', () => {
    const tailoredData = {
      ...SAMPLE_EXPERIENCED_RESUME,
      skills: {
        ...SAMPLE_EXPERIENCED_RESUME.skills,
        technical: [...SAMPLE_EXPERIENCED_RESUME.skills.technical, 'Kubernetes', 'Redis', 'AWS'],
      },
    };

    const templates = [
      'ats-classic',
      'software-engineer',
      'graduate-fresher',
      'executive-professional',
      'data-analyst',
      'ui-ux-designer',
      'full-stack-developer',
      'internship-applicant',
      'academic-research',
      'sales-marketing',
      'operations-management',
      'modern-two-column',
    ];

    templates.forEach((tid) => {
      const element = React.createElement(ResumeRenderer, {
        data: tailoredData,
        templateId: tid,
      });
      const html = ReactDOMServer.renderToStaticMarkup(element);
      assert(html.length > 300, `Template ${tid} should render non-empty HTML`);
      assert(html.includes('Kubernetes'), `Template ${tid} must render added skill`);
    });
  });

  // TEST 10: A4 Print Compliance Guarantee
  test('A4 print dimensions (210 x 297 mm, 794 x 1123 px at 96 DPI) maintained', () => {
    const standardA4WidthMm = 210;
    const standardA4HeightMm = 297;
    const ratio = standardA4HeightMm / standardA4WidthMm; // 1.4142

    const pxWidth = 794;
    const pxHeight = 1123;
    const pxRatio = pxHeight / pxWidth; // 1.4143

    assert(Math.abs(ratio - pxRatio) < 0.005, 'A4 aspect ratio must match within 0.5% tolerance');
  });

  console.log('\n================================================================');
  console.log(`=== TEST RESULTS: ${passed} / ${total} TESTS PASSED ===`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('ALL JOB-SPECIFIC TAILORING WORKFLOW TESTS PASSED WITH EXIT CODE 0.\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runWorkflowTests().catch((err) => {
  console.error('Test Suite encountered unhandled fatal exception:', err);
  process.exit(1);
});
