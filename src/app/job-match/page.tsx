'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Briefcase,
  Building,
  Link2,
  TrendingUp,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { useCareer } from '@/context/CareerContext';
import { JobMatchResult } from '@/types/jobs';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingState } from '@/components/ui/StateViews';

export default function JobMatchPage() {
  const { resumeData } = useResume();
  const { saveJobMatch } = useCareer();

  const [jobTitle, setJobTitle] = useState('Staff AI & Platform Engineer');
  const [company, setCompany] = useState('Nexus AI Labs');
  const [jobUrl, setJobUrl] = useState('https://nexusai.io/careers/staff-ai-engineer');
  const [jobDescription, setJobDescription] = useState(`We are seeking a Staff AI & Platform Engineer to architect high-throughput distributed LLM pipelines and retrieval systems.
Responsibilities:
- Build and scale semantic retrieval search with sub-80ms p95 latency.
- Containerize Go and Python microservices on AWS EKS and Kubernetes.
- Drive cross-functional mentorship and architectural review standards.

Requirements:
- 5+ years building distributed cloud applications.
- Strong proficiency in Python, React, SQL, and Docker.
- Experience with AWS, Vector Search, and CI/CD pipelines.
- B.S. in Computer Science or equivalent practical tenure.`);

  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);

  const handlePreFill = (sample: 'ai' | 'fullstack' | 'data') => {
    if (sample === 'ai') {
      setJobTitle('Senior AI / Machine Learning Engineer');
      setCompany('Anthropic');
      setJobUrl('https://anthropic.com/careers');
      setJobDescription(`Looking for a Senior AI Engineer to scale model evaluation pipelines and high-performance vector retrieval architectures.
Requirements:
- Deep expertise in Python, Machine Learning, and SQL.
- Experience deploying Docker containers on AWS.
- Strong grounding in data structures, RAG, and distributed systems.`);
    } else if (sample === 'fullstack') {
      setJobTitle('Staff Platform & Full Stack Engineer');
      setCompany('Stripe');
      setJobUrl('https://stripe.com/jobs');
      setJobDescription(`Join our Core Platform group building ultra-reliable payment processing systems.
Requirements:
- Deep experience in React, TypeScript, Python, and PostgreSQL.
- Experience with Kubernetes, Docker, and AWS multi-region infrastructure.
- 6+ years designing resilient distributed microservices.`);
    } else {
      setJobTitle('Lead Data Engineer');
      setCompany('Snowflake');
      setJobUrl('https://snowflake.com/careers');
      setJobDescription(`Design and optimize high-throughput telemetry pipelines processing petabytes of real-time streaming data.
Requirements:
- Mastery of SQL, Python, and Data Analysis.
- Familiarity with AWS data services and Git workflows.
- Experience optimizing query execution plans.`);
    }
  };

  const handleRunMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const resumeText = `${resumeData.personalInfo.fullName}\n${resumeData.personalInfo.headline}\n${resumeData.summary}\nSkills: ${resumeData.skills.technical.join(', ')}\nExperience:\n${resumeData.experience
        .map((e) => `${e.role} at ${e.company}: ${e.bulletPoints.join(' ')}`)
        .join('\n')}`;

      const res = await fetch('/api/job/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobTitle,
          company,
          jobDescription,
        }),
      });

      if (res.ok) {
        const data: JobMatchResult = await res.json();
        setMatchResult(data);
        saveJobMatch(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Job Match Analysis
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Compare your active resume against job descriptions to identify matching qualifications and keyword gaps.
          </p>
        </div>

        {/* Quick Pre-fill samples */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-secondary)] font-medium">Quick Test:</span>
          <button
            onClick={() => handlePreFill('ai')}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-medium"
          >
            Anthropic (AI)
          </button>
          <button
            onClick={() => handlePreFill('fullstack')}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-medium"
          >
            Stripe (Platform)
          </button>
          <button
            onClick={() => handlePreFill('data')}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-medium"
          >
            Snowflake (Data)
          </button>
        </div>
      </div>

      {/* Input Form Card */}
      <GlassCard className="p-6 text-left space-y-4">
        <form onSubmit={handleRunMatch} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 absolute left-3 top-3 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Machine Learning Engineer"
                  className="w-full pl-9 p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. OpenAI"
                  className="w-full pl-9 p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[var(--text-secondary)] mb-1">
                Job Posting URL (Optional)
              </label>
              <div className="relative">
                <Link2 className="w-3.5 h-3.5 absolute left-3 top-3 text-[var(--text-secondary)]" />
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-9 p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">
              Job Description / Requirements <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={6}
              required
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description or key requirements here..."
              className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono text-[11px] leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[var(--text-secondary)]">
              Matching with active profile: <strong className="text-[var(--text-primary)]">{resumeData.personalInfo.fullName}</strong>
            </span>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs sm:text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Analyzing Match...' : 'Compare Against My Resume'}
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Loading state */}
      {isLoading && (
        <LoadingState
          title="Evaluating Career Fit..."
          message="Computing vector similarity between resume bullet points and job requirements."
        />
      )}

      {/* Match Results View */}
      {matchResult && !isLoading && (
        <div className="space-y-8 text-left animate-fade-in">
          {/* Top Score Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <GlassCard className="md:col-span-2 flex flex-col sm:flex-row items-center justify-between p-6 gap-6" glow>
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">
                  Overall Candidate Fit
                </span>
                <h3 className="text-2xl font-black text-[var(--text-primary)]">
                  {matchResult.overallMatchScore >= 80 ? 'High Fit Match' : 'Moderate Fit'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs">
                  {matchResult.jobTitle} at {matchResult.company}.
                </p>
                <div className="pt-2">
                  <Link
                    href="/improver"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)]"
                  >
                    Optimize For This Role
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <ScoreRing
                score={matchResult.overallMatchScore}
                size={130}
                strokeWidth={10}
                subLabel="MATCH"
              />
            </GlassCard>

            <GlassCard className="flex flex-col items-center justify-center p-5 text-center">
              <ScoreRing score={matchResult.skillsMatchScore} size={90} strokeWidth={7} showPercentage />
              <span className="mt-2 text-xs font-bold text-[var(--text-primary)]">Skills Match</span>
              <span className="text-[10px] text-[var(--text-secondary)]">Required Technologies</span>
            </GlassCard>

            <GlassCard className="flex flex-col items-center justify-center p-5 text-center">
              <ScoreRing score={matchResult.experienceMatchScore} size={90} strokeWidth={7} showPercentage />
              <span className="mt-2 text-xs font-bold text-[var(--text-primary)]">Experience Match</span>
              <span className="text-[10px] text-[var(--text-secondary)]">Seniority & Tenure</span>
            </GlassCard>

            <GlassCard className="flex flex-col items-center justify-center p-5 text-center">
              <ScoreRing score={matchResult.keywordMatchScore} size={90} strokeWidth={7} showPercentage />
              <span className="mt-2 text-xs font-bold text-[var(--text-primary)]">Keyword Density</span>
              <span className="text-[10px] text-[var(--text-secondary)]">ATS Filter Match</span>
            </GlassCard>
          </div>

          {/* Detailed Skill Classification (Matched, Partial, Missing) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Matched */}
            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Matched Skills ({matchResult.matchedSkills.length})
                </h4>
              </div>
              <div className="space-y-2 text-xs">
                {matchResult.matchedSkills.map((sk, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="font-bold text-[var(--text-primary)] block">{sk.skill}</span>
                    <span className="text-[11px] text-[var(--text-secondary)]">{sk.context}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Partial */}
            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Partial Alignment ({matchResult.partialSkills.length})
                </h4>
              </div>
              <div className="space-y-2 text-xs">
                {matchResult.partialSkills.length === 0 ? (
                  <p className="text-[11px] text-[var(--text-secondary)] italic">
                    No ambiguous or partial competencies detected.
                  </p>
                ) : (
                  matchResult.partialSkills.map((sk, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="font-bold text-[var(--text-primary)] block">{sk.skill}</span>
                      <span className="text-[11px] text-[var(--text-secondary)]">{sk.context}</span>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

            {/* Missing */}
            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Missing Skills ({matchResult.missingSkills.length})
                </h4>
              </div>
              <div className="space-y-2 text-xs">
                {matchResult.missingSkills.map((sk, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <span className="font-bold text-[var(--text-primary)] block">{sk.skill}</span>
                    <span className="text-[11px] text-[var(--text-secondary)]">{sk.context}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Key Strengths & Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-3">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Key Profile Strengths
              </h4>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                {matchResult.keyStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-6 space-y-3">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Actionable Gap Recommendations
              </h4>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                {matchResult.gapsToAddress.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
