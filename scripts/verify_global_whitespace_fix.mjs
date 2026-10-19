import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const ARTIFACTS_DIR = 'C:/Users/kiran/.gemini/antigravity-ide/brain/8b0c1bfc-4324-4535-b7a7-8e8286467afa/scratch';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getUserCookie() {
  const testEmail = `whitespace_test_${Date.now()}@example.com`;
  const regRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Verification Candidate',
      email: testEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }),
  });
  const regCookies = regRes.headers.getSetCookie ? regRes.headers.getSetCookie() : [regRes.headers.get('set-cookie') || ''];
  for (const c of regCookies) {
    const match = c.match(/sra_user_session=([^;]+)/);
    if (match) return match[1];
  }
  throw new Error('Could not obtain session cookie');
}

// Representative Datasets
const shortResumeData = {
  templateId: 'ats-classic',
  candidateType: 'fresher',
  personalInfo: {
    fullName: 'Jordan S. Reed',
    headline: 'Junior Web Developer',
    email: 'jordan.reed@example.com',
    phone: '+1 (555) 019-2834',
    location: 'Austin, TX',
    linkedin: 'linkedin.com/in/jordanreed',
    github: 'github.com/jordanreed',
  },
  summary: 'Motivated Junior Web Developer with a strong foundation in modern JavaScript, HTML5, and CSS3. Passionate about building accessible, performant web applications and eager to contribute to collaborative engineering teams.',
  skills: {
    technical: ['JavaScript (ES6+)', 'TypeScript', 'HTML5 & CSS3', 'React basics'],
    tools: ['Git', 'VS Code', 'Chrome DevTools'],
    soft: ['Problem Solving', 'Communication', 'Adaptability'],
  },
  experience: [],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Computer Science',
      institution: 'University of Texas at Austin',
      location: 'Austin, TX',
      graduationYear: '2024',
      gpa: '3.75',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Personal Portfolio & Tech Blog',
      technologies: ['Next.js', 'Tailwind CSS', 'Vercel'],
      link: 'github.com/alexmorgan/portfolio',
      description: 'Designed and launched a responsive personal portfolio featuring markdown blog posts, dynamic dark mode, and 98+ Lighthouse scores across all metrics.',
      bullets: [
        'Implemented responsive layout supporting mobile, tablet, and desktop viewports.',
        'Optimized asset loading and typography achieving 100% Core Web Vitals score.',
      ],
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'Meta Front-End Developer Certificate',
      issuer: 'Coursera / Meta',
      date: '2024',
    },
  ],
};

const mediumResumeData = {
  templateId: 'ats-classic',
  candidateType: 'fresher',
  personalInfo: {
    fullName: 'Maya Chen',
    headline: 'Recent Computer Science Graduate | Aspiring Full Stack Engineer',
    email: 'maya.chen@university.edu',
    phone: '+1 (555) 234-5678',
    location: 'San Jose, CA',
    linkedin: 'linkedin.com/in/mayachen-dev',
    github: 'github.com/mayachen',
    portfolio: 'mayachen.dev',
  },
  summary: 'Detail-oriented Computer Science graduate with hands-on project experience in full-stack web development, RESTful APIs, and relational databases. Strong foundation in algorithms, cloud infrastructure, and collaborative Agile workflows. Looking to leverage technical skills in React, Node.js, and TypeScript to drive impactful software solutions.',
  skills: {
    technical: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS'],
    tools: ['Git/GitHub', 'Docker', 'Postman', 'Vercel', 'AWS (S3, EC2)', 'Jest'],
    soft: ['Agile / Scrum', 'Technical Writing', 'Cross-functional Collaboration', 'Analytical Thinking'],
  },
  experience: [
    {
      id: 'exp-1',
      role: 'Software Engineering Intern',
      company: 'Innovatech Solutions',
      location: 'San Jose, CA',
      startDate: 'Jun 2023',
      endDate: 'Aug 2023',
      current: false,
      bulletPoints: [
        'Developed reusable UI components in React and TypeScript for an enterprise analytics dashboard used by 12,000+ daily active users.',
        'Reduced client-side render latencies by 28% through memoization and code-splitting.',
        'Collaborated with backend engineers to integrate RESTful endpoints and improve error handling across customer-facing forms.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Computer Science (Summa Cum Laude)',
      institution: 'San Jose State University',
      location: 'San Jose, CA',
      graduationYear: '2024',
      gpa: '3.91 / 4.0',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'DevCollab – Real-Time Code Collaboration Platform',
      technologies: ['React', 'Node.js', 'WebSocket', 'Monaco Editor', 'PostgreSQL'],
      link: 'github.com/mayachen/devcollab',
      description: 'Built a web-based collaborative code editor featuring synchronized typing, syntax highlighting, and virtual workspace rooms.',
      bullets: [
        'Architected real-time synchronization using WebSockets and operational transformation, achieving sub-40ms latency.',
        'Implemented secure JWT-based authentication and role-based permissions for private project workspaces.',
        'Automated CI/CD deployment pipelines using GitHub Actions to deploy containerized services on AWS ECS.',
      ],
    },
    {
      id: 'proj-2',
      title: 'SmartExpense – AI-Assisted Financial Tracker',
      technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'OpenAI API'],
      link: 'github.com/mayachen/smartexpense',
      description: 'Engineered a personal finance analytics app that categorizes bank statements and generates monthly budget forecasts.',
      bullets: [
        'Integrated OCR extraction pipeline processing receipt uploads with 94% categorization accuracy.',
        'Constructed interactive data visualizations using Recharts displaying spending patterns over custom date intervals.',
      ],
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Cloud Practitioner (CLF-C02)',
      issuer: 'Amazon Web Services',
      date: '2024',
    },
  ],
};

const longResumeData = {
  templateId: 'ats-classic',
  candidateType: 'experienced',
  personalInfo: {
    fullName: 'David K. Vance',
    headline: 'Senior Full Stack Software Architect | Distributed Systems & Cloud Infrastructure',
    email: 'david.vance@techlead.io',
    phone: '+1 (555) 789-0123',
    location: 'Seattle, WA',
    linkedin: 'linkedin.com/in/davidkvance',
    github: 'github.com/dkvance',
    portfolio: 'davidvance.dev',
  },
  summary: 'Accomplished Senior Software Architect with 8+ years of engineering leadership in high-scale distributed systems, microservices architectures, and developer tooling. Proven track record of scaling cloud infrastructure to support 100M+ monthly transactions while reducing operational overhead. Champion of engineering excellence, automated testing, and developer mentorship.',
  skills: {
    technical: ['TypeScript', 'Go', 'Python', 'React / Next.js', 'Node.js', 'Kubernetes', 'GraphQL', 'Kafka', 'PostgreSQL', 'Redis'],
    tools: ['Terraform', 'AWS (EKS, RDS, S3, CloudFront)', 'Docker', 'Prometheus', 'Grafana', 'GitHub Actions', 'Datadog'],
    soft: ['System Architecture', 'Technical Strategy', 'Cross-functional Leadership', 'Mentorship & Hiring', 'Agile / Scrum'],
  },
  experience: [
    {
      id: 'exp-1',
      role: 'Staff Software Engineer & Technical Lead',
      company: 'Stratos Cloud Systems',
      location: 'Seattle, WA',
      startDate: '2021',
      endDate: 'Present',
      current: true,
      bulletPoints: [
        'Spearheaded the migration of a legacy monolithic platform into 14 event-driven microservices on AWS EKS, improving overall system availability from 99.8% to 99.99%.',
        'Engineered an asynchronous streaming data pipeline using Apache Kafka and Go processing 45,000 events/sec with under 15ms p99 latency.',
        'Mentored a team of 12 mid-level and senior engineers, establishing standardized architecture reviews and automated CI/CD gating.',
        'Decreased cloud infrastructure expenditure by $420,000 annually through intelligent autoscaling policies and database query optimization.',
      ],
    },
    {
      id: 'exp-2',
      role: 'Senior Full Stack Engineer',
      company: 'Nexus Fintech Technologies',
      location: 'San Francisco, CA',
      startDate: '2018',
      endDate: '2021',
      current: false,
      bulletPoints: [
        'Architected and delivered the customer onboarding portal handling over $2.4B in annual transactional volume.',
        'Designed high-throughput GraphQL APIs and integrated zero-trust security controls meeting strict PCI-DSS Level 1 compliance.',
        'Introduced end-to-end integration testing using Playwright and Jest, slashing regression defects in production releases by 65%.',
      ],
    },
    {
      id: 'exp-3',
      role: 'Software Engineer',
      company: 'Horizon Web Dynamics',
      location: 'Austin, TX',
      startDate: '2016',
      endDate: '2018',
      current: false,
      bulletPoints: [
        'Developed full-stack web applications for Fortune 500 retail clients using React, TypeScript, and Node.js.',
        'Integrated third-party payment gateways (Stripe, Adyen) and inventory management systems.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'M.S. in Computer Science',
      institution: 'University of Washington',
      location: 'Seattle, WA',
      graduationYear: '2016',
      gpa: '3.94',
    },
    {
      id: 'edu-2',
      degree: 'B.S. in Software Engineering',
      institution: 'Purdue University',
      location: 'West Lafayette, IN',
      graduationYear: '2014',
      gpa: '3.88',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'HyperQueue – Distributed Task Orchestration Engine',
      technologies: ['Go', 'gRPC', 'Raft', 'Redis', 'Docker'],
      link: 'github.com/dkvance/hyperqueue',
      description: 'Open-source distributed task scheduler with fault-tolerant leader election and exactly-once execution semantics.',
      bullets: [
        'Benchmarked at 120,000 scheduled tasks/sec with zero job loss during simulated node failures.',
        'Gained 3,200+ GitHub stars and adopted by several high-growth startups for background worker orchestration.',
      ],
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Professional (SAP-C02)',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
    {
      id: 'cert-2',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation',
      date: '2022',
    },
  ],
};

const ALL_17_TEMPLATES = [
  'ats-classic',
  'modern-professional',
  'minimalist',
  'corporate-executive',
  'software-engineer',
  'fresh-graduate',
  'data-analyst',
  'creative-professional',
  'compact-one-page',
  'academic',
  'experienced-professional',
  'contemporary',
  'thomas-hamptone',
  'nick-koe',
  'richard-sanchez',
  'olivia-wilson-grid',
  'olivia-wilson-blush',
];

async function runGlobalVerification() {
  console.log('===============================================================');
  console.log('   GLOBAL AUDIT & VERIFICATION: ALL 17 RESUME TEMPLATES       ');
  console.log('===============================================================');

  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const cookieValue = await getUserCookie();
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_global_test_${Date.now()}`;

  const proc = spawn(
    edgePath,
    [
      '--headless=new',
      `--remote-debugging-port=9232`,
      `--user-data-dir=${userDataDir}`,
      `--window-size=1440,1100`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  const consoleErrors = [];

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await wait(300);
      try {
        targets = await getJson('http://localhost:9232/json');
        if (targets && targets.length > 0) break;
      } catch {}
    }

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.on('open', resolve));

    let msgId = 1;
    const send = (method, params = {}) => {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (data) => {
          const msg = JSON.parse(data.toString());
          if (msg.id === id) {
            ws.off('message', handler);
            resolve(msg.result);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.method === 'Runtime.consoleAPICalled' && msg.params?.type === 'error') {
          consoleErrors.push(msg.params.args?.map((a) => a.value || a.description).join(' '));
        }
      } catch {}
    });

    await send('Page.enable');
    await send('Network.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1100,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await send('Network.setCookie', {
      name: 'sra_user_session',
      value: cookieValue,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    });

    console.log('Navigating to http://localhost:3000/builder...');
    await send('Page.navigate', { url: 'http://localhost:3000/builder' });
    await wait(3500);

    // Navigate to step 9 (Preview & Download)
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-step-9');
          if (btn) btn.click();
        })()
      `,
    });
    await wait(1200);

    const testResults = [];

    // Helper to evaluate layout metrics of #resume-a4-document
    const measureLayout = async (templateId, datasetName, resumeData) => {
      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            // Find react internal state setter or update resumeData
            const doc = document.getElementById('resume-a4-document');
            if (!doc) return { error: 'Document not found' };

            const docRect = doc.getBoundingClientRect();
            // Find all rendered text elements and sections
            const elements = doc.querySelectorAll('section, header, p, li, h1, h2, h3, div');
            let maxBottom = 0;
            elements.forEach((el) => {
              const r = el.getBoundingClientRect();
              if (r.bottom > maxBottom && r.height > 0) {
                maxBottom = r.bottom;
              }
            });

            const contentEndFromDocTop = Math.round(maxBottom - docRect.top);
            const a4PageHeight = 1123; // 297mm in standard 96dpi pixels
            const pagesCount = Math.ceil(contentEndFromDocTop / a4PageHeight);
            const page1Fill = Math.min(100, Math.round((contentEndFromDocTop / a4PageHeight) * 100));
            const remainingPage1Whitespace = Math.max(0, a4PageHeight - contentEndFromDocTop);

            return {
              docWidth: Math.round(docRect.width),
              docHeight: Math.round(docRect.height),
              contentEndPx: contentEndFromDocTop,
              page1FillPercent: page1Fill,
              remainingWhitespacePx: remainingPage1Whitespace,
              estimatedPages: pagesCount,
            };
          })()
        `,
        returnByValue: true,
      });
      return evalRes.result?.value;
    };

    // Helper to update resume data inside the page state
    const setResumeState = async (templateId, data) => {
      data.templateId = templateId;
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const dataToSet = ${JSON.stringify(data)};
            // Dispatch custom event or update local storage / state if accessible
            localStorage.setItem('sra_resume_data', JSON.stringify(dataToSet));
            window.location.reload();
          })()
        `,
      });
      await wait(3000);
      // Ensure on step 9
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const btn = document.getElementById('btn-step-9');
            if (btn) btn.click();
          })()
        `,
      });
      await wait(1000);
    };

    console.log('\n--- 1. AUDITING ALL 17 TEMPLATES WITH MEDIUM RESUME (MAYA CHEN) ---');
    console.log('Target fill ratio: 80%–90% of A4 usable height (900px – 1020px out of 1123px)\n');

    for (const tid of ALL_17_TEMPLATES) {
      await setResumeState(tid, mediumResumeData);
      const metrics = await measureLayout(tid, 'Medium', mediumResumeData);

      // Emulate print media and capture PDF
      await send('Emulation.setEmulatedMedia', { media: 'print' });
      await wait(300);

      // Print to PDF
      const pdfData = await send('Page.printToPDF', {
        paperWidth: 8.27, // A4 inches (210mm)
        paperHeight: 11.69, // A4 inches (297mm)
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        printBackground: true,
      });

      const pdfFilename = `audit_${tid}_medium.pdf`;
      const pdfPath = path.join(ARTIFACTS_DIR, pdfFilename);
      fs.writeFileSync(pdfPath, Buffer.from(pdfData.data, 'base64'));

      // Capture screenshot of print preview
      const screenshot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 794, height: 1123, scale: 1 },
      });
      const imgFilename = `audit_${tid}_medium.png`;
      const imgPath = path.join(ARTIFACTS_DIR, imgFilename);
      fs.writeFileSync(imgPath, Buffer.from(screenshot.data, 'base64'));

      // Reset media emulation
      await send('Emulation.setEmulatedMedia', { media: '' });

      const result = {
        template: tid,
        dataset: 'Medium (Maya Chen)',
        ...metrics,
        pdfPath,
        imgPath,
      };
      testResults.push(result);

      console.log(`[${tid}] Content End: ${metrics.contentEndPx}px / 1123px | Fill: ${metrics.page1FillPercent}% | Whitespace: ${metrics.remainingWhitespacePx}px | Pages: ${metrics.estimatedPages} | PDF: ${pdfFilename}`);
    }

    console.log('\n--- 2. TESTING SHORT RESUME (ALEX MORGAN) ACROSS REPRESENTATIVE TEMPLATES ---');
    const representativeTemplates = ['ats-classic', 'modern-professional', 'minimalist', 'corporate-executive', 'fresh-graduate', 'compact-one-page', 'olivia-wilson-grid'];
    for (const tid of representativeTemplates) {
      await setResumeState(tid, shortResumeData);
      const metrics = await measureLayout(tid, 'Short', shortResumeData);
      console.log(`[${tid} - SHORT] Content End: ${metrics.contentEndPx}px / 1123px | Fill: ${metrics.page1FillPercent}% | Breathing room: ${metrics.remainingWhitespacePx}px | Pages: ${metrics.estimatedPages}`);
    }

    console.log('\n--- 3. TESTING LONG RESUME (DAVID VANCE) ACROSS REPRESENTATIVE TEMPLATES ---');
    for (const tid of representativeTemplates) {
      await setResumeState(tid, longResumeData);
      const metrics = await measureLayout(tid, 'Long', longResumeData);
      console.log(`[${tid} - LONG] Total Content Height: ${metrics.contentEndPx}px | Multi-Page Count: ${metrics.estimatedPages} pages | Naturally Flowing`);
    }

    console.log('\n--- 4. AUDITING STEP 8 TEMPLATE SELECTION PREVIEW CARDS ---');
    // Go to step 8
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-step-8');
          if (btn) btn.click();
        })()
      `,
    });
    await wait(1500);

    const cardAudit = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const cards = document.querySelectorAll('[id^="template-card-"]');
          const results = [];
          cards.forEach((card) => {
            const id = card.id.replace('template-card-', '');
            const preview = document.getElementById('template-preview-' + id);
            if (preview) {
              const rect = preview.getBoundingClientRect();
              const h1 = preview.querySelector('h1');
              const h2 = preview.querySelector('h2');
              results.push({
                id,
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                ratio: (rect.width / rect.height).toFixed(3),
                h1Font: h1 ? window.getComputedStyle(h1).fontSize : 'none',
                h2Font: h2 ? window.getComputedStyle(h2).fontSize : 'none',
              });
            }
          });
          return results;
        })()
      `,
      returnByValue: true,
    });

    console.log(`Audited ${cardAudit.result?.value?.length} Template Preview Cards:`);
    cardAudit.result?.value?.forEach((c) => {
      console.log(`  Card [${c.id}]: ${c.width}x${c.height}px (Ratio: ${c.ratio}) | H1: ${c.h1Font} | H2: ${c.h2Font}`);
    });

    console.log('\nConsole Errors during audit:', consoleErrors.length === 0 ? 'ZERO (Clean)' : consoleErrors);

    // Save full JSON summary
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'global_whitespace_verification_results.json'),
      JSON.stringify({ testResults, cardAudit: cardAudit.result?.value, consoleErrors }, null, 2),
      'utf8'
    );

    console.log('\n>>> GLOBAL VERIFICATION COMPLETE. Results saved to scratch/global_whitespace_verification_results.json');
  } finally {
    proc.kill();
  }
}

runGlobalVerification().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
