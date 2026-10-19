import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import WebSocket from 'ws';

const SAMPLE_DATA = {
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
    technical: ['Python', 'JavaScript', 'React', 'SQL', 'Machine Learning', 'Git', 'AWS', 'Docker', 'Kubernetes', 'FastAPI', 'PostgreSQL', 'Redis'],
    soft: ['Technical Leadership', 'System Architecture Design', 'Cross-functional Mentorship', 'Agile Sprint Planning'],
    tools: ['Visual Studio Code', 'GitLab CI/CD', 'Datadog', 'Terraform', 'Postman', 'Jira'],
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
        'Built full-stack React/Node.js web console utilized by 120,000+ DevOps engineers to configure infrastructure as code pipelines.',
        'Implemented Redis caching layer and optimized slow PostgreSQL queries, dropping p99 response times from 1.4s to 120ms.',
      ],
    },
  ],
  education: [
    {
      id: 'edu_01',
      degree: 'B.S. in Computer Science',
      institution: 'University of California, Berkeley',
      graduationYear: '2020',
      gpa: '3.85',
    },
  ],
  projects: [
    {
      id: 'proj_01',
      title: 'Distributed Vector Indexing Pipeline',
      description:
        'A high-throughput distributed vector indexing engine written in Rust and Python with sub-10ms nearest neighbor search across 50M embeddings.',
      technologies: ['Python', 'Rust', 'FAISS', 'Docker', 'FastAPI'],
      bullets: [
        'Achieved 10x throughput scaling compared to existing baseline solutions.',
        'Adopted by internal production machine learning teams for real-time recommendation retrieval.',
      ],
      link: 'github.com/rahulsharma-dev/vector-pipeline',
    },
  ],
  certifications: [
    {
      id: 'cert_01',
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
  ],
};

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
  const testEmail = `template_tester_${Date.now()}@example.com`;
  const regRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Template Tester',
      email: testEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }),
  });
  const cookies = regRes.headers.getSetCookie ? regRes.headers.getSetCookie() : [regRes.headers.get('set-cookie') || ''];
  for (const c of cookies) {
    const match = c.match(/sra_user_session=([^;]+)/);
    if (match) return match[1];
  }
  throw new Error('Could not get cookie');
}

async function run() {
  const artifactDir = 'C:\\Users\\SAI\\.gemini\\antigravity-ide\\brain\\d7ed037c-b860-4752-a04c-1413398dcc0e';
  const cookieValue = await getUserCookie();
  console.log('Obtained user session cookie!');

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = `d:\\projects\\builder\\scripts\\.edge_profile_${Date.now()}`;

  const proc = spawn(
    edgePath,
    [
      '--headless=new',
      `--remote-debugging-port=9222`,
      `--user-data-dir=${userDataDir}`,
      `--window-size=1440,950`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await wait(300);
      try {
        targets = await getJson('http://localhost:9222/json');
        if (targets && targets.length > 0) break;
      } catch {}
    }

    if (!targets || targets.length === 0) {
      throw new Error('Edge DevTools target not available on port 9222');
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

    await send('Page.enable');
    await send('Network.enable');

    await send('Network.setCookie', {
      name: 'sra_user_session',
      value: cookieValue,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    });

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 950,
      deviceScaleFactor: 1,
      mobile: false,
    });

    const templatesToTest = [
      'contemporary',
      'thomas-hamptone',
      'nick-koe',
      'richard-sanchez',
      'olivia-wilson-grid',
      'olivia-wilson-blush',
    ];

    for (const tId of templatesToTest) {
      console.log(`Setting template ${tId}...`);
      // First go to origin to set localStorage
      await send('Page.navigate', { url: 'http://localhost:3000/api/health' });
      await wait(1000);

      const resumePayload = {
        ...SAMPLE_DATA,
        templateId: tId,
      };

      await send('Runtime.evaluate', {
        expression: `
          localStorage.setItem('sra_resume_data', ${JSON.stringify(JSON.stringify(resumePayload))});
          localStorage.setItem('sra_builder_step', '8');
        `,
      });

      // Now navigate to builder
      await send('Page.navigate', { url: 'http://localhost:3000/builder' });
      await wait(3500);

      const outPath = `${artifactDir}\\template_${tId}_preseeded_verified.png`;
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
      console.log(`Saved screenshot for ${tId}: ${outPath}`);
    }

    ws.close();
  } finally {
    proc.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
