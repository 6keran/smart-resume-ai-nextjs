'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  FileSearch,
  CheckCircle2,
  Cpu,
  BadgeCheck,
  FileEdit,
  Briefcase,
  LayoutDashboard,
  ShieldCheck,
  Target,
  Wand2,
  TrendingUp,
  FileText,
  Search,
  Zap,
  Award,
} from 'lucide-react';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { GlassCard } from '@/components/ui/GlassCard';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'improver' | 'builder' | 'skills' | 'match'>('analyzer');

  const steps = [
    {
      step: '01',
      title: 'Upload & Parse',
      desc: 'Drop your PDF or DOCX resume into our instant parsing engine to extract tokens, formatting, and sections.',
      icon: FileText,
      badge: 'Multi-Format',
    },
    {
      step: '02',
      title: 'ATS Audit',
      desc: 'Evaluate 45+ metrics including keyword density, section layout, contact parseability, and ATS compliance.',
      icon: FileSearch,
      badge: 'Instant Score',
    },
    {
      step: '03',
      title: 'Factual Improvement',
      desc: 'Refine bullets with quantified achievements and action verbs while preserving 100% factual truth.',
      icon: Wand2,
      badge: 'Side-by-Side',
    },
    {
      step: '04',
      title: 'A4 Resume Builder',
      desc: 'Generate pixel-perfect A4 resumes using 8 battle-tested recruitment templates ready for PDF export.',
      icon: FileEdit,
      badge: 'Standard A4',
    },
    {
      step: '05',
      title: 'Proctored Skill Verification',
      desc: 'Take webcam-monitored technical assessments to earn tamper-proof verifiable skill certificates.',
      icon: BadgeCheck,
      badge: 'Camera Proctoring',
    },
    {
      step: '06',
      title: 'Targeted Job Matching',
      desc: 'Compare your profile against open job descriptions to pinpoint missing requirements before applying.',
      icon: Target,
      badge: 'Gap Analysis',
    },
  ];

  const features = [
    {
      title: 'AI Resume Analyzer',
      desc: 'Comprehensive ATS parsing audits keyword distribution, section tokens, and layout readability across 45+ recruiter benchmarks.',
      href: '/analyzer',
      icon: FileSearch,
      badge: 'Core Engine',
    },
    {
      title: 'Resume Improver',
      desc: 'Side-by-side phrasing optimizer. Transform weak descriptions into high-converting quantified achievements with zero hallucinations.',
      href: '/improver',
      icon: Wand2,
      badge: 'Generative AI',
    },
    {
      title: 'Resume Builder',
      desc: 'Multi-step guided editor creating compliant A4 PDF resumes with zoomable preview and 8 recruiter-approved templates.',
      href: '/builder',
      icon: FileEdit,
      badge: 'A4 Export',
    },
    {
      title: 'Skill Verification',
      desc: 'Technical assessments with browser fullscreen proctoring, webcam readiness detection, and verifiable digital certificates.',
      href: '/skills',
      icon: BadgeCheck,
      badge: '11 Skills',
    },
    {
      title: 'Job Match Engine',
      desc: 'Deep comparative alignment between your resume and target job descriptions with exact keyword and qualification breakdown.',
      href: '/job-match',
      icon: Target,
      badge: 'Instant Match',
    },
    {
      title: 'Job Search Discovery',
      desc: 'Curated technical and product roles with salary transparency and one-click resume matching against your profile.',
      href: '/jobs',
      icon: Briefcase,
      badge: 'Live Postings',
    },
    {
      title: 'Career Dashboard',
      desc: 'Comprehensive intelligence hub tracking real ATS score evolution, applications, verified certificates, and career courses.',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: 'Analytics',
    },
    {
      title: 'Tamper-Proof Certificates',
      desc: 'Verifiable credentials for passed assessments with unique credential IDs and clean print/download formatting.',
      href: '/skills',
      icon: Award,
      badge: 'Verified',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Resume Intelligence Platform</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-[36px] font-bold tracking-tight text-[var(--text-primary)] max-w-3xl leading-tight mb-4">
          Professional Resume Analysis and A4 Builder
        </h1>

        {/* Supporting Message */}
        <p className="text-base text-[var(--text-secondary)] max-w-2xl font-normal leading-relaxed mb-8">
          Evaluate ATS compliance across 45+ recruitment benchmarks, improve bullet phrasing with factual impact, and generate standardized A4 PDF resumes.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-14 z-10 w-full sm:w-auto">
          <Link
            href="/analyzer"
            className="btn-primary w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Analyze Resume</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/builder"
            className="btn-secondary w-full sm:w-auto"
          >
            <FileEdit className="w-4 h-4 text-[var(--accent)]" />
            <span>Build A4 Resume</span>
          </Link>
          <Link
            href="/dashboard"
            className="btn-secondary w-full sm:w-auto"
          >
            <LayoutDashboard className="w-4 h-4 text-[var(--text-secondary)]" />
            <span>View Dashboard</span>
          </Link>
        </div>

        {/* Key Platform Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl w-full mb-14">
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-left shadow-sm">
            <span className="text-2xl font-bold text-[var(--text-primary)]">45+</span>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">ATS Checkpoints</p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-left shadow-sm">
            <span className="text-2xl font-bold text-[var(--text-primary)]">8</span>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">Recruiter Templates</p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-left shadow-sm">
            <span className="text-2xl font-bold text-[var(--text-primary)]">11</span>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">Proctored Skill Tests</p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-left shadow-sm">
            <span className="text-2xl font-bold text-[var(--color-success)]">100%</span>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">Factual Integrity</p>
          </div>
        </div>

        {/* Interactive Real Application Showcase */}
        <div className="w-full max-w-5xl rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm overflow-hidden text-left">
          {/* Showcase Tab Navigation */}
          <div className="flex items-center gap-1 p-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] overflow-x-auto">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'analyzer'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>ATS Analyzer</span>
            </button>
            <button
              onClick={() => setActiveTab('improver')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'improver'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Bullet Improver</span>
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>A4 Resume Builder</span>
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'skills'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Proctored Skills</span>
            </button>
            <button
              onClick={() => setActiveTab('match')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'match'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-rose-400" />
              <span>Job Match</span>
            </button>
          </div>

          {/* Showcase Panel Content */}
          <div className="p-6 sm:p-8">
            {activeTab === 'analyzer' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center text-2xl font-black text-emerald-500 mb-3">
                    88
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Overall ATS Score</span>
                  <span className="text-[11px] text-emerald-500 font-semibold mt-1">Recruiter Ready</span>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                    <span className="text-xs font-bold text-[var(--text-primary)]">Parsed Resume Sections</span>
                    <span className="text-[10px] font-semibold text-emerald-400">4 of 4 Verified</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">Experience Impact</span>
                      <span className="font-bold text-emerald-400">92%</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">Technical Keywords</span>
                      <span className="font-bold text-emerald-400">86%</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">ATS Formatting</span>
                      <span className="font-bold text-emerald-400">94%</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">Contact Verification</span>
                      <span className="font-bold text-emerald-400">100%</span>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Link
                      href="/analyzer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
                    >
                      Try Live Resume Analysis <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'improver' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <span className="text-xs font-bold text-[var(--text-primary)]">Side-by-Side Bullet Comparison</span>
                  <span className="text-[10px] font-semibold text-[var(--accent)]">Zero Hallucination Guaranteed</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1.5">Original Phrasing</span>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      &ldquo;Responsible for optimizing database queries and improving performance for the user search application.&rdquo;
                    </p>
                    <span className="text-[10px] text-red-400/80 font-medium mt-2 block">Lacks quantifiable impact and action verbs</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">AI-Enhanced Output</span>
                    <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                      &ldquo;Architected multi-column indexing strategy across PostgreSQL clusters, reducing search latency by 42% for 250K+ daily active users.&rdquo;
                    </p>
                    <span className="text-[10px] text-emerald-500 font-semibold mt-2 block">Quantified metric + action verb + tech stack highlighted</span>
                  </div>
                </div>
                <div className="pt-1 flex justify-end">
                  <Link
                    href="/improver"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    Open Resume Improver <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'builder' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Guided 6-Step Editor</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Build professional resumes with live real-time A4 preview, zoom controls, and instant PDF printing formatted specifically for applicant tracking systems.
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>8 Industry Templates (Tech, Minimal, Executive)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Strict A4 Standard Dimensions (210mm × 297mm)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zero Content Clipping in PDF Generation</span>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col items-center justify-center">
                  <div className="w-full max-w-sm bg-white text-slate-900 rounded-lg p-5 shadow-lg border border-slate-200 text-left scale-95">
                    <div className="border-b border-slate-200 pb-2 mb-3">
                      <h5 className="font-bold text-sm text-slate-900">ALEX JOHNSON</h5>
                      <p className="text-[10px] text-slate-600">Senior Full-Stack Engineer • San Francisco, CA • alex@example.com</p>
                    </div>
                    <div className="space-y-2 text-[10px]">
                      <div>
                        <span className="font-bold text-[var(--accent)] uppercase tracking-wider block text-[9px]">Professional Summary</span>
                        <p className="text-slate-600 line-clamp-2">Systems architect with 6+ years designing distributed TypeScript and Python cloud architectures.</p>
                      </div>
                      <div>
                        <span className="font-bold text-[var(--accent)] uppercase tracking-wider block text-[9px]">Technical Skills</span>
                        <p className="text-slate-600">React, Next.js, Node.js, Python, PostgreSQL, AWS, Docker</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end w-full">
                    <Link
                      href="/builder"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
                    >
                      Open Live Resume Builder <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <span className="text-xs font-bold text-[var(--text-primary)]">Live Proctoring & Digital Verification</span>
                  <span className="text-[10px] font-semibold text-emerald-400">Real Camera API</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-left">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mb-2.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs font-bold text-[var(--text-primary)] mb-1">Enforced Fullscreen</h5>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">Automatic violation logging upon tab-switching or leaving exam window.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-left">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5">
                      <BadgeCheck className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs font-bold text-[var(--text-primary)] mb-1">Webcam Readiness</h5>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">Browser-level camera permission check before timer begins.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-left">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mb-2.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs font-bold text-[var(--text-primary)] mb-1">Verifiable Credentials</h5>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">Earn tamper-proof certificates with unique verification codes.</p>
                  </div>
                </div>
                <div className="pt-1 flex justify-end">
                  <Link
                    href="/skills"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    Explore Technical Skill Assessments <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'match' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <span className="text-xs font-bold text-[var(--text-primary)]">Target Role Alignment Breakdown</span>
                  <span className="text-[10px] font-semibold text-rose-400">Senior Systems Architect</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center flex flex-col justify-center items-center">
                    <div className="w-16 h-16 rounded-full border-4 border-[var(--accent)]/20 border-t-[var(--accent)] flex items-center justify-center text-xl font-black text-[var(--accent)] mb-2">
                      85%
                    </div>
                    <span className="text-xs font-bold text-[var(--text-primary)]">Skill Alignment Match</span>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs">
                      <span className="font-bold text-emerald-400 block mb-0.5">Matched Qualifications (8)</span>
                      <span className="text-[var(--text-secondary)]">Python, TypeScript, PostgreSQL, AWS ECS, Docker, Distributed Systems, CI/CD, Microservices</span>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs">
                      <span className="font-bold text-amber-400 block mb-0.5">Missing High-Impact Terms (2)</span>
                      <span className="text-[var(--text-secondary)]">Kubernetes Operator development, Kafka partition rebalancing</span>
                    </div>
                  </div>
                </div>
                <div className="pt-1 flex justify-end">
                  <Link
                    href="/job-match"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    Open Job Match Engine <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works (6 Steps) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-color)]">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-[var(--accent)] tracking-wider uppercase mb-1.5 block">
            End-to-End Workflow
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            How Smart Resume AI Works
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto mt-2">
            Structured stages transforming career history into verified, market-ready intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-all duration-150 shadow-sm text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-[var(--accent)] tracking-tight">
                      {st.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{st.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {st.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                    {st.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-color)]">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-[var(--accent)] tracking-wider uppercase mb-1.5 block">
            Core Modules
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Platform Capabilities
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto mt-2">
            Engineered for high ATS compliance, accurate phrase improvements, and verifiable career milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <Link
                key={feat.title}
                href={feat.href}
                className="group flex flex-col justify-between p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--accent)] transition-all duration-150 text-left shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium tracking-wide px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent)] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                    {feat.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center border-t border-[var(--border-color)]">
        <div className="p-8 sm:p-10 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
              Start Optimizing Your Resume
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
              Run automated ATS checks, refine bullet points, and build recruitment-compliant A4 resumes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/analyzer"
                className="btn-primary w-full sm:w-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze Resume</span>
              </Link>
              <Link
                href="/builder"
                className="btn-secondary w-full sm:w-auto"
              >
                <span>Build A4 Resume</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-[var(--text-primary)]">
              SMART RESUME AI
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            © {new Date().getFullYear()} Smart Resume AI. Built for commercial career intelligence.
          </p>
          <div className="flex items-center gap-5 text-xs text-[var(--text-secondary)]">
            <Link href="/analyzer" className="hover:text-[var(--text-primary)] transition-colors">
              Analyzer
            </Link>
            <Link href="/builder" className="hover:text-[var(--text-primary)] transition-colors">
              Builder
            </Link>
            <Link href="/improver" className="hover:text-[var(--text-primary)] transition-colors">
              Improver
            </Link>
            <Link href="/skills" className="hover:text-[var(--text-primary)] transition-colors">
              Verification
            </Link>
            <Link href="/jobs" className="hover:text-[var(--text-primary)] transition-colors">
              Job Search
            </Link>
            <Link href="/feedback" className="hover:text-[var(--text-primary)] transition-colors">
              Feedback
            </Link>
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}