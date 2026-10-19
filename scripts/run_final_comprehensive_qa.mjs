import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

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

// 1. Medium Resume (Maya Chen)
const mediumResume = {
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

// 2. Sparse / Short Resume
const sparseResume = {
  templateId: 'minimalist',
  candidateType: 'fresher',
  personalInfo: {
    fullName: 'Elena Rostova',
    headline: 'Junior Frontend Developer',
    email: 'elena.rostova@example.com',
    phone: '+1 (555) 432-1098',
    location: 'Austin, TX',
    linkedin: 'linkedin.com/in/elenarostova',
    portfolio: 'elena.codes',
  },
  summary: 'Motivated Junior Frontend Developer proficient in modern HTML, CSS, and modern JavaScript libraries. Eager to bring creative problem-solving and rapid learning to a fast-paced development team.',
  skills: {
    technical: ['HTML5', 'CSS3', 'JavaScript', 'React'],
    tools: ['Git', 'VS Code', 'Figma'],
    soft: ['Quick Learner', 'Attention to Detail', 'Team Player'],
  },
  experience: [
    {
      id: 'exp-s1',
      role: 'Web Development Apprentice',
      company: 'PixelCraft Studio',
      location: 'Austin, TX',
      startDate: 'Jan 2024',
      endDate: 'May 2024',
      current: false,
      bulletPoints: [
        'Assisted in styling responsive landing pages and converting Figma wireframes into modular React components.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-s1',
      degree: 'B.A. in Digital Media & Web Design',
      institution: 'University of Texas at Austin',
      location: 'Austin, TX',
      graduationYear: '2024',
      gpa: '3.82',
    },
  ],
  projects: [
    {
      id: 'proj-s1',
      title: 'Minimalist Portfolio & Blog',
      technologies: ['React', 'CSS Modules'],
      link: 'github.com/elena/minimalist-portfolio',
      description: 'Personal portfolio showcase highlighting accessible design systems and clean responsive typography.',
      bullets: [
        'Achieved a perfect 100 Lighthouse score for accessibility and performance.',
      ],
    },
  ],
  certifications: [
    {
      id: 'cert-s1',
      name: 'Meta Front-End Developer Certificate',
      issuer: 'Coursera / Meta',
      date: '2023',
    },
  ],
};

// 3. Long / Multi-Page Resume (Senior Distributed Systems Lead)
const longResume = {
  templateId: 'ats-classic',
  candidateType: 'experienced',
  personalInfo: {
    fullName: 'Dr. Marcus Vance, Ph.D.',
    headline: 'VP of Infrastructure Engineering & Principal Distributed Systems Architect',
    email: 'm.vance@infranet-systems.org',
    phone: '+1 (555) 891-2345',
    location: 'Seattle, WA',
    linkedin: 'linkedin.com/in/marcus-vance-phd-infra',
    github: 'github.com/marcusvance-systems',
    portfolio: 'https://vance-distributed-systems.org/research/high-throughput-consensus-raft-engine-benchmarks',
  },
  summary: 'Distinguished Engineering Executive and Distributed Systems Architect with 14+ years of leadership experience designing fault-tolerant cloud backbones, low-latency transaction processing pipelines, and globally distributed databases. Proven track record managing global teams of 65+ engineers, reducing infrastructural expenditure by $4.2M annually, and publishing pioneering consensus algorithms.',
  skills: {
    technical: ['Go', 'Rust', 'C++', 'Java', 'Distributed Systems', 'Raft / Paxos', 'Kubernetes', 'gRPC', 'Apache Kafka', 'PostgreSQL', 'eBPF', 'Linux Kernel Internals'],
    tools: ['Docker', 'Terraform', 'Prometheus', 'Grafana', 'Jaeger Tracing', 'AWS Multi-Region', 'GCP Anthos', 'Datadog', 'Spinnaker'],
    soft: ['Executive Leadership', 'Organizational Strategy', 'Engineering Mentorship', 'Cross-Functional Governance', 'Public Speaking & Keynotes'],
  },
  experience: [
    {
      id: 'exp-l1',
      role: 'VP of Infrastructure & Platform Engineering',
      company: 'Global Cloud Systems Inc.',
      location: 'Seattle, WA',
      startDate: '2021',
      endDate: 'Present',
      current: true,
      bulletPoints: [
        'Oversee multi-region hybrid cloud platform supporting 45M concurrent real-time banking transactions across North America, EMEA, and APAC.',
        'Spearheaded transition from legacy monolith to decoupled asynchronous micro-services, improving 99.999% SLA availability and slashing P99 latencies by 42ms.',
        'Mentored 6 engineering directors and scaled global infrastructure organization from 28 to 72 engineers across 4 international hubs.',
        'Negotiated cloud infrastructure agreements across AWS and GCP, driving $4.2M in annual recurring infrastructure cost optimization.',
      ],
    },
    {
      id: 'exp-l2',
      role: 'Principal Systems Architect',
      company: 'Apex Data Networks',
      location: 'San Francisco, CA',
      startDate: '2017',
      endDate: '2021',
      current: false,
      bulletPoints: [
        'Architected custom Raft consensus engine capable of processing 2.5 million replicated state transitions per second with strictly serializable transactions.',
        'Engineered zero-copy memory pipelines leveraging eBPF and XDP kernel bypass, decreasing networking CPU overhead by 34%.',
        'Authored and maintained comprehensive architecture decision records (ADRs) guiding company-wide multi-datacenter replication standards.',
      ],
    },
    {
      id: 'exp-l3',
      role: 'Senior Staff Infrastructure Engineer',
      company: 'HyperScale Cloud Labs',
      location: 'Palo Alto, CA',
      startDate: '2014',
      endDate: '2017',
      current: false,
      bulletPoints: [
        'Designed auto-rebalancing distributed key-value storage engine deployed across 8,000 bare-metal physical nodes.',
        'Eliminated catastrophic cascaded node failure conditions through dynamic backpressure and adaptive circuit breakers.',
        'Led internal post-mortem incident analyses, establishing blameless retrospectives and automated chaos engineering drills.',
      ],
    },
    {
      id: 'exp-l4',
      role: 'Distributed Systems Engineer',
      company: 'Veloce Telecom Technologies',
      location: 'Cambridge, MA',
      startDate: '2011',
      endDate: '2014',
      current: false,
      bulletPoints: [
        'Implemented distributed telemetry collection agents operating at sub-millisecond polling frequencies across 50,000 edge cellular routers.',
        'Wrote custom memory allocators in C++ and optimized lock-free ring buffers for multi-threaded packet inspection.',
      ],
    },
    {
      id: 'exp-l5',
      role: 'Research Assistant – Computer Systems Laboratory',
      company: 'MIT Laboratory for Information & Decision Systems',
      location: 'Cambridge, MA',
      startDate: '2008',
      endDate: '2011',
      current: false,
      bulletPoints: [
        'Researched Byzantine fault-tolerant state-machine replication under high network jitter conditions.',
        'Co-authored 3 IEEE and ACM conference papers on provably correct asynchronous consensus protocols.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-l1',
      degree: 'Ph.D. in Computer Science (Distributed Systems)',
      institution: 'Massachusetts Institute of Technology (MIT)',
      location: 'Cambridge, MA',
      graduationYear: '2011',
      gpa: '4.0 / 4.0',
    },
    {
      id: 'edu-l2',
      degree: 'M.S. in Electrical Engineering & Computer Science',
      institution: 'MIT',
      location: 'Cambridge, MA',
      graduationYear: '2008',
      gpa: '4.0 / 4.0',
    },
    {
      id: 'edu-l3',
      degree: 'B.S. in Computer Engineering (Honors)',
      institution: 'Carnegie Mellon University',
      location: 'Pittsburgh, PA',
      graduationYear: '2006',
      gpa: '3.98 / 4.0',
    },
  ],
  projects: [
    {
      id: 'proj-l1',
      title: 'ConsensusCore – High-Throughput Replicated State Machine',
      technologies: ['Rust', 'Raft', 'Tokio', 'RocksDB'],
      link: 'https://github.com/vance-distributed-systems/high-throughput-consensus-raft-engine-benchmarks/tree/main/crates/consensus-core',
      description: 'Production-grade asynchronous consensus library optimized for ultra-low latency flash storage and zero-copy NVMe drives.',
      bullets: [
        'Maintained linearizable read consistency through lease-based read indexes without requiring disk log write round-trips.',
        'Fuzzed with Jepsen test suites simulating network partitions, clock drift, and Byzantine message drops without data inconsistency.',
      ],
    },
    {
      id: 'proj-l2',
      title: 'NetTrace eBPF – Deep Packet Inspection at Line Rate',
      technologies: ['C', 'eBPF', 'Go', 'Prometheus'],
      link: 'https://github.com/vance-distributed-systems/nettrace-ebpf-kernel-profiling-tool-enterprise-edition',
      description: 'Zero-overhead observability daemon capturing TCP handshake metrics, retransmission spikes, and socket drops.',
      bullets: [
        'In-kernel ring buffers bypass user-space context switches for line-rate packet analysis on 100GbE network interfaces.',
      ],
    },
  ],
  certifications: [
    {
      id: 'cert-l1',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation (CNCF)',
      date: '2023',
    },
    {
      id: 'cert-l2',
      name: 'AWS Certified Solutions Architect – Professional (SAP-C02)',
      issuer: 'Amazon Web Services',
      date: '2022',
    },
    {
      id: 'cert-l3',
      name: 'Google Cloud Certified Fellow (Hybrid Cloud Architecture)',
      issuer: 'Google Cloud',
      date: '2021',
    },
  ],
};

const outputDir = path.resolve('artifacts/qa_visual_functional');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
const pdfDir = path.join(outputDir, 'pdfs');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

async function getUserCookie() {
  const testEmail = `qa_runner_${Date.now()}@example.com`;
  const res = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'QA User',
      email: testEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    })
  });
  const regCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie') || ''];
  for (const c of regCookies) {
    const match = c.match(/sra_user_session=([^;]+)/);
    if (match) return match[1];
  }
  throw new Error('Could not obtain session cookie');
}

async function runComprehensiveQA() {
  console.log('===============================================================');
  console.log('STARTING FINAL VISUAL AND FUNCTIONAL QA (CDP + PDF INSPECTION)');
  console.log('===============================================================');

  const sessionCookie = await getUserCookie();
  const edgeUserDataDir = path.resolve('C:/Users/kiran/.gemini/antigravity-ide/brain/8b0c1bfc-4324-4535-b7a7-8e8286467afa/.edge_qa_final');

  const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
    '--headless=new',
    '--remote-debugging-port=9224',
    `--user-data-dir=${edgeUserDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9224/json', (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });

  const page = list.find(p => p.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let id = 1;
  const send = (m, p = {}) => new Promise(res => {
    const cur = id++;
    const handler = (msg) => {
      const data = JSON.parse(msg);
      if (data.id === cur) {
        ws.off('message', handler);
        if (data.error) {
          console.error(`CDP Error in ${m}:`, data.error);
        }
        res(data.result || {});
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: cur, method: m, params: p }));
  });

  await send('Network.enable');
  await send('Page.enable');
  await send('DOM.enable');

  await send('Network.setCookie', {
    name: 'sra_user_session',
    value: sessionCookie,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
  });

  // Navigate to Builder
  await send('Page.navigate', { url: 'http://localhost:3000/builder' });
  await new Promise(r => setTimeout(r, 2500));

  const results = {
    templateSwitchingDataPreservation: null,
    all17TemplatesStandardAudit: [],
    sparseResumeAudit: [],
    longResumeAudit: [],
    defectsFound: []
  };

  // -------------------------------------------------------------
  // TEST 1: TEMPLATE SWITCHING DATA PRESERVATION
  // -------------------------------------------------------------
  console.log('\n--- 1. TESTING TEMPLATE SWITCHING DATA PRESERVATION ---');
  const customCandidateName = 'Dr. Alexandria Morgan-Smythe';
  const customBullet = 'Spearheaded quantum computing initiative with 99.98% reliability.';

  const testResume = JSON.parse(JSON.stringify(mediumResume));
  testResume.personalInfo.fullName = customCandidateName;
  testResume.experience[0].bulletPoints[0] = customBullet;

  // Store in localStorage & reload
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        localStorage.setItem('sra_resume_data', JSON.stringify(${JSON.stringify(testResume)}));
        window.location.reload();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 2500));

  const switchTemplatesList = ['ats-classic', 'nick-koe', 'olivia-wilson-grid', 'corporate-executive', 'modern-professional'];
  let switchingPassed = true;
  const switchLog = [];

  for (const tid of switchTemplatesList) {
    // Switch template via UI or Context state
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const raw = localStorage.getItem('sra_resume_data');
          const data = raw ? JSON.parse(raw) : {};
          data.templateId = '${tid}';
          localStorage.setItem('sra_resume_data', JSON.stringify(data));
          window.dispatchEvent(new Event('storage'));
        })()
      `
    });
    // Trigger preview step 9
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const step9 = btns.find(b => b.textContent && b.textContent.includes('09') && b.textContent.includes('Review'));
          if (step9) step9.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 500));

    // Verify DOM contains customCandidateName and customBullet
    const checkResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const doc = document.getElementById('resume-a4-document');
          if (!doc) return { foundDoc: false };
          const text = doc.innerText || '';
          return {
            foundDoc: true,
            hasName: text.includes('Alexandria Morgan-Smythe') || text.includes('ALEXANDRIA MORGAN-SMYTHE'),
            hasBullet: text.includes('quantum computing initiative with 99.98% reliability')
          };
        })()
      `,
      returnByValue: true
    });

    const status = checkResult.result?.value;
    const ok = status?.hasName && status?.hasBullet;
    if (!ok) switchingPassed = false;
    switchLog.push({ template: tid, ok, details: status });
    console.log(`  Switch to ${tid}: Name present? ${status?.hasName}, Bullet present? ${status?.hasBullet} -> ${ok ? 'PASS' : 'FAIL'}`);
  }

  results.templateSwitchingDataPreservation = {
    passed: switchingPassed,
    switchLog
  };

  // -------------------------------------------------------------
  // TEST 2: ALL 17 TEMPLATES PREVIEW & REAL PDF EXPORT (MEDIUM DATASET)
  // -------------------------------------------------------------
  console.log('\n--- 2. AUDITING ALL 17 TEMPLATES: PREVIEW & EXPORTED PDF ---');

  for (const tid of ALL_17_TEMPLATES) {
    const curData = { ...mediumResume, templateId: tid };
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('sra_resume_data', JSON.stringify(${JSON.stringify(curData)}));
          window.location.reload();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 2200));

    // Ensure Step 9 is active
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const s9 = btns.find(b => b.textContent && b.textContent.includes('09') && b.textContent.includes('Review'));
          if (s9) s9.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 500));

    // Check preview visual layout in live DOM
    const previewLayout = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const doc = document.getElementById('resume-a4-document');
          if (!doc) return { error: 'No resume document element' };
          
          // Check for horizontal overflow / text clipping
          const docRect = doc.getBoundingClientRect();
          const allEls = Array.from(doc.querySelectorAll('*'));
          let clippedCount = 0;
          let overlappingTextNodes = 0;
          
          // Find any text element clipped or overflowing horizontally
          for (const el of allEls) {
            if (el.children.length === 0 && el.textContent.trim()) {
              const r = el.getBoundingClientRect();
              if (r.width > docRect.width + 2) clippedCount++;
            }
          }
          
          return {
            previewHeight: Math.round(docRect.height),
            previewWidth: Math.round(docRect.width),
            clippedCount,
            textLength: (doc.innerText || '').length
          };
        })()
      `,
      returnByValue: true
    });

    // Emulate print media for exact print layout
    await send('Emulation.setEmulatedMedia', { media: 'print' });
    await new Promise(r => setTimeout(r, 400));

    const printDomHeight = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const doc = document.getElementById('resume-a4-document');
          return doc ? Math.round(doc.scrollHeight) : null;
        })()
      `,
      returnByValue: true
    });

    // Export REAL PDF via CDP printToPDF
    const pdfResponse = await send('Page.printToPDF', {
      paperWidth: 8.27,      // 210mm in inches
      paperHeight: 11.69,    // 297mm in inches
      printBackground: true,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      preferCSSPageSize: true
    });

    // Reset emulated media back to screen
    await send('Emulation.setEmulatedMedia', { media: '' });

    const pdfBuffer = Buffer.from(pdfResponse.data, 'base64');
    const pdfFilePath = path.join(pdfDir, `${tid}.pdf`);
    fs.writeFileSync(pdfFilePath, pdfBuffer);

    // Inspect the actual generated PDF using pdf-parse
    const parsedPdf = await pdfParse(pdfBuffer);
    const pdfPages = parsedPdf.numpages;
    const pdfText = parsedPdf.text || '';
    const nameInPdf = (pdfText.includes('Maya') || pdfText.includes('MAYA') || pdfText.includes('M AYA')) &&
                      (pdfText.includes('Chen') || pdfText.includes('CHEN') || pdfText.includes('C H E N'));
    const summaryInPdf = pdfText.includes('Computer Science graduate') || pdfText.includes('RESTful APIs');
    const experienceInPdf = pdfText.includes('Innovatech Solutions');
    const skillsInPdf = pdfText.includes('React') || pdfText.includes('TypeScript');

    const h = printDomHeight.result?.value;
    const isSinglePage = pdfPages === 1 && h <= 1123;
    const fillPercent = ((h / 1123) * 100).toFixed(1);

    const auditEntry = {
      templateId: tid,
      printHeightPx: h,
      fillPercent: `${fillPercent}%`,
      pdfPages,
      previewMetrics: previewLayout.result?.value,
      pdfInspection: {
        pdfBytes: pdfBuffer.length,
        nameFound: nameInPdf,
        summaryFound: summaryInPdf,
        experienceFound: experienceInPdf,
        skillsFound: skillsInPdf
      },
      status: isSinglePage && nameInPdf && experienceInPdf ? 'PASS' : 'WARN_OVERFLOW'
    };

    results.all17TemplatesStandardAudit.push(auditEntry);
    console.log(`  [${tid.padEnd(25)}] PrintHeight: ${String(h).padStart(4)}px (${fillPercent}%) | PDF Pages: ${pdfPages} | Content OK: ${nameInPdf && experienceInPdf} -> ${auditEntry.status}`);
  }

  // -------------------------------------------------------------
  // TEST 3: SPARSE / SHORT RESUME (3 TEMPLATES)
  // -------------------------------------------------------------
  console.log('\n--- 3. TESTING SPARSE RESUMES (MINIMALIST, COMPACT-ONE-PAGE, CREATIVE-PROFESSIONAL) ---');
  const sparseTemplates = ['minimalist', 'compact-one-page', 'creative-professional'];

  for (const tid of sparseTemplates) {
    const sData = { ...sparseResume, templateId: tid };
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('sra_resume_data', JSON.stringify(${JSON.stringify(sData)}));
          window.location.reload();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 2200));

    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const s9 = btns.find(b => b.textContent && b.textContent.includes('09') && b.textContent.includes('Review'));
          if (s9) s9.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 500));

    await send('Emulation.setEmulatedMedia', { media: 'print' });
    await new Promise(r => setTimeout(r, 400));

    const printH = await send('Runtime.evaluate', {
      expression: `document.getElementById('resume-a4-document') ? document.getElementById('resume-a4-document').scrollHeight : null`,
      returnByValue: true
    });

    const pdfResp = await send('Page.printToPDF', {
      paperWidth: 8.27,
      paperHeight: 11.69,
      printBackground: true,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      preferCSSPageSize: true
    });
    await send('Emulation.setEmulatedMedia', { media: '' });

    const pBuf = Buffer.from(pdfResp.data, 'base64');
    const pParsed = await pdfParse(pBuf);
    const h = printH.result?.value;

    const entry = {
      templateId: tid,
      printHeightPx: h,
      fillPercent: `${((h / 1123) * 100).toFixed(1)}%`,
      pdfPages: pParsed.numpages,
      nameFound: pParsed.text.includes('Elena Rostova') || pParsed.text.includes('ELENA ROSTOVA'),
      looksProfessional: h >= 500 && h <= 1123,
      status: pParsed.numpages === 1 && h <= 1123 ? 'PASS' : 'FAIL'
    };
    results.sparseResumeAudit.push(entry);
    console.log(`  Sparse [${tid.padEnd(22)}] PrintHeight: ${h}px | PDF Pages: ${pParsed.numpages} | Name Found: ${entry.nameFound} -> ${entry.status}`);
  }

  // -------------------------------------------------------------
  // TEST 4: LONG / MULTI-PAGE RESUME (3 TEMPLATES)
  // -------------------------------------------------------------
  console.log('\n--- 4. TESTING LONG MULTI-PAGE RESUMES (ATS-CLASSIC, MODERN-PROFESSIONAL, SOFTWARE-ENGINEER) ---');
  const longTemplates = ['ats-classic', 'modern-professional', 'software-engineer'];

  for (const tid of longTemplates) {
    const lData = { ...longResume, templateId: tid };
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('sra_resume_data', JSON.stringify(${JSON.stringify(lData)}));
          window.location.reload();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 2200));

    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const s9 = btns.find(b => b.textContent && b.textContent.includes('09') && b.textContent.includes('Review'));
          if (s9) s9.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 500));

    // Check long URL wrapping in preview
    const urlCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const doc = document.getElementById('resume-a4-document');
          const links = Array.from(doc.querySelectorAll('a'));
          const longLinks = links.filter(a => a.href && a.href.length > 50);
          const docWidth = doc.getBoundingClientRect().width;
          const overflows = longLinks.filter(a => a.getBoundingClientRect().width > docWidth);
          return {
            totalLinks: links.length,
            longLinksCount: longLinks.length,
            overflowingLinksCount: overflows.length
          };
        })()
      `,
      returnByValue: true
    });

    await send('Emulation.setEmulatedMedia', { media: 'print' });
    await new Promise(r => setTimeout(r, 400));

    const printH = await send('Runtime.evaluate', {
      expression: `document.getElementById('resume-a4-document') ? document.getElementById('resume-a4-document').scrollHeight : null`,
      returnByValue: true
    });

    const pdfResp = await send('Page.printToPDF', {
      paperWidth: 8.27,
      paperHeight: 11.69,
      printBackground: true,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      preferCSSPageSize: true
    });
    await send('Emulation.setEmulatedMedia', { media: '' });

    const pBuf = Buffer.from(pdfResp.data, 'base64');
    fs.writeFileSync(path.join(pdfDir, `long_${tid}.pdf`), pBuf);
    const pParsed = await pdfParse(pBuf);
    const h = printH.result?.value;

    const entry = {
      templateId: tid,
      printHeightPx: h,
      pdfPages: pParsed.numpages,
      nameFound: pParsed.text.includes('Marcus Vance') || pParsed.text.includes('MARCUS VANCE'),
      experience5Found: pParsed.text.includes('MIT Laboratory for Information'),
      linksChecked: urlCheck.result?.value,
      naturalPagination: pParsed.numpages >= 2 && pParsed.numpages <= 3,
      status: pParsed.numpages >= 2 && urlCheck.result?.value?.overflowingLinksCount === 0 ? 'PASS' : 'WARN'
    };
    results.longResumeAudit.push(entry);
    console.log(`  Long [${tid.padEnd(20)}] Height: ${h}px | PDF Pages: ${pParsed.numpages} | URL Overflows: ${urlCheck.result?.value?.overflowingLinksCount} | 5th Exp Found: ${entry.experience5Found} -> ${entry.status}`);
  }

  // Save report
  fs.writeFileSync(path.join(outputDir, 'final_qa_report.json'), JSON.stringify(results, null, 2), 'utf8');

  console.log('\n===============================================================');
  console.log('FINAL QA EXECUTION COMPLETED! Full report saved to:');
  console.log(path.join(outputDir, 'final_qa_report.json'));
  console.log('===============================================================\n');

  ws.close();
  edge.kill();
}

runComprehensiveQA().catch(err => {
  console.error('QA Runner encountered error:', err);
  process.exit(1);
});
