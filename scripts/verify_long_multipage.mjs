import { spawn } from 'child_process';
import http from 'http';
import WebSocket from 'ws';

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
    technical: ['Go', 'TypeScript', 'Node.js', 'Python', 'Rust', 'Kubernetes', 'PostgreSQL', 'GraphQL', 'Kafka', 'Redis'],
    tools: ['Docker', 'Terraform', 'AWS (EKS, RDS, S3)', 'GCP', 'GitHub Actions', 'Datadog', 'Prometheus', 'ArgoCD'],
    soft: ['Staff Engineering Leadership', 'System Architecture', 'Cross-team Alignment', 'Incident Management', 'Mentorship'],
  },
  experience: [
    {
      id: 'exp-1',
      role: 'Principal Systems Architect',
      company: 'Apex Cloud Solutions',
      location: 'Seattle, WA',
      startDate: '2021',
      endDate: 'Present',
      current: true,
      bulletPoints: [
        'Directed global technical architecture for multi-region microservices handling 120M+ requests/day across 14 zones.',
        'Engineered event-driven streaming pipeline with Apache Kafka and Go reducing message processing latencies by 42%.',
        'Spearheaded transition from monolith to containerized Kubernetes infrastructure saving $180,000 in monthly compute expenses.',
        'Mentored 16 senior engineers on design patterns, distributed consensus algorithms, and fault-tolerant service resilience.',
      ],
    },
    {
      id: 'exp-2',
      role: 'Staff Full Stack Engineer',
      company: 'DataFlow Enterprise Systems',
      location: 'San Francisco, CA',
      startDate: '2018',
      endDate: '2021',
      current: false,
      bulletPoints: [
        'Led team of 8 engineers building real-time data ingestion engine processing 4TB of analytics data daily.',
        'Standardized company-wide TypeScript/React design system adopted by 14 product engineering teams.',
        'Constructed high-throughput GraphQL federation layer serving 45+ consumer frontends with sub-50ms p95 latencies.',
      ],
    },
    {
      id: 'exp-3',
      role: 'Senior Backend Engineer',
      company: 'Vanguard Fintech Labs',
      location: 'Austin, TX',
      startDate: '2016',
      endDate: '2018',
      current: false,
      bulletPoints: [
        'Designed payment reconciliation engine reconciling $50M in daily transactions with zero ledger drift.',
        'Implemented PCI-DSS Level 1 compliant data encryption and tokenization vault with zero security incidents.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'M.S. in Computer Science (Distributed Systems)',
      institution: 'University of Washington',
      location: 'Seattle, WA',
      graduationYear: '2016',
      gpa: '3.94 / 4.0',
    },
    {
      id: 'edu-2',
      degree: 'B.S. in Software Engineering',
      institution: 'Purdue University',
      location: 'West Lafayette, IN',
      graduationYear: '2014',
      gpa: '3.88 / 4.0',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'DistriKV – Distributed Raft-Consensus Key-Value Store',
      technologies: ['Go', 'Raft', 'gRPC', 'Protobuf', 'Docker'],
      link: 'github.com/dkvance/distrikv',
      description: 'Engineered high-performance consistent key-value store implementing Raft leader election, log replication, and automated cluster membership changes.',
      bullets: [
        'Benchmarked linearizable reads reaching 85,000 ops/sec under 3-node chaos fault-injection tests.',
        'Integrated snapshotting and log compaction maintaining compact on-disk memory footprints.',
      ],
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Professional',
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

async function getUserCookie() {
  const testEmail = `long_test_${Date.now()}@example.com`;
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

async function verifyLong() {
  const sessionCookie = await getUserCookie();
  const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--user-data-dir=C:/Users/kiran/.gemini/antigravity-ide/brain/8b0c1bfc-4324-4535-b7a7-8e8286467afa/.edge_long_test',
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

  console.log('\n--- VERIFYING MULTI-PAGE FLOW FOR DENSE/LONG RESUME (DAVID VANCE) ---\n');

  const testTemplates = ['ats-classic', 'modern-professional', 'minimalist', 'corporate-executive', 'fresh-graduate', 'software-engineer'];

  for (const tid of testTemplates) {
    const data = { ...longResumeData, templateId: tid };
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
    }

    const val = evalRes.result?.value || {};
    const contentEnd = val.actualContentEnd || 0;
    const docH = val.docHeight || 0;

    console.log(
      `[${tid.padEnd(25)}] Content End: ${String(contentEnd).padStart(4)}px | Doc Height: ${String(docH).padStart(4)}px | Pages: ${pages} (Natural multi-page flow)`
    );
  }

  ws.close();
  edge.kill();
}
verifyLong();
