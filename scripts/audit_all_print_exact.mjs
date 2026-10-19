import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

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

async function getUserCookie() {
  const testEmail = `measure_test_${Date.now()}@example.com`;
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

async function auditAllPrint() {
  const sessionCookie = await getUserCookie();
  const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--user-data-dir=C:/Users/kiran/.gemini/antigravity-ide/brain/8b0c1bfc-4324-4535-b7a7-8e8286467afa/.edge_audit_all',
    'about:blank'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const list = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9223/json', (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
  const page = list.find(p => p.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));
  let id = 1;
  const send = (m, p={}) => new Promise(res => {
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

  await send('Network.setCookie', {
    name: 'sra_user_session',
    value: sessionCookie,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
  });

  await send('Page.navigate', { url: 'http://localhost:3000/builder' });
  await new Promise(r => setTimeout(r, 2500));

  console.log('\n--- EXACT PRINT MEDIA AUDIT: ALL 17 TEMPLATES (MAYA CHEN) ---\n');

  for (const tid of ALL_17_TEMPLATES) {
    const data = { ...mediumResumeData, templateId: tid };
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          localStorage.setItem('sra_resume_data', JSON.stringify(${JSON.stringify(data)}));
          window.location.reload();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 2200));

    // Click step 9
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-step-9');
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 800));

    // Emulate print media
    await send('Emulation.setEmulatedMedia', { media: 'print' });
    await new Promise(r => setTimeout(r, 400));

    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const doc = document.getElementById('resume-a4-document');
          if (!doc) return { error: 'No doc' };
          const rect = doc.getBoundingClientRect();
          const elements = Array.from(doc.querySelectorAll('h1, h2, h3, h4, p, li, a, span'));
          let maxBottom = 0;
          elements.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.bottom > maxBottom) maxBottom = r.bottom;
          });

          return {
            docHeight: doc.offsetHeight,
            docScrollHeight: doc.scrollHeight,
            actualContentEnd: Math.round(maxBottom - rect.top),
          };
        })()
      `,
      returnByValue: true
    });

    const pdfData = await send('Page.printToPDF', {
      paperWidth: 8.27,
      paperHeight: 11.69,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      printBackground: true,
    });
    
    await send('Emulation.setEmulatedMedia', { media: '' });

    let pages = 1;
    if (pdfData.data) {
      const pdfBuffer = Buffer.from(pdfData.data, 'base64');
      const text = pdfBuffer.toString('latin1');
      const pageMatches = text.match(/\/Type\s*\/Page\b/g);
      pages = pageMatches ? pageMatches.length : 1;
    } else {
      console.log('No PDF data returned for', tid);
    }

    const val = evalRes.result?.value || {};
    const contentEnd = val.actualContentEnd || 0;
    const docH = val.docHeight || 0;
    const fillPercent = Math.round((contentEnd / 1123) * 100);

    console.log(
      `[${tid.padEnd(25)}] Content End: ${String(contentEnd).padStart(4)}px | Doc Height: ${String(docH).padStart(4)}px | Fill: ${String(fillPercent).padStart(3)}% | Pages: ${pages} ${pages > 1 ? '<< OVERFLOW' : 'OK'}`
    );
  }

  ws.close();
  edge.kill();
}
auditAllPrint();
