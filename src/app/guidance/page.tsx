'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Compass,
  Building2,
  Briefcase,
  GraduationCap,
  Award,
  BadgeCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Sparkles,
  ExternalLink,
  Target,
  Layers,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useCareer } from '@/context/CareerContext';
import { COMPANY_PROFILES, evaluateCandidateReadiness } from '@/lib/career/companyData';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { SkillBadge } from '@/components/ui/SkillBadge';

export default function CareerGuidancePage() {
  const { skills } = useCareer();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('tcs');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('tcs-digital-dev');

  const selectedCompany = useMemo(() => {
    return COMPANY_PROFILES.find((c) => c.id === selectedCompanyId) || COMPANY_PROFILES[0];
  }, [selectedCompanyId]);

  const selectedRole = useMemo(() => {
    const role = selectedCompany.roles.find((r) => r.id === selectedRoleId);
    return role || selectedCompany.roles[0];
  }, [selectedCompany, selectedRoleId]);

  // Handle switching company
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    const company = COMPANY_PROFILES.find((c) => c.id === companyId);
    if (company && company.roles.length > 0) {
      setSelectedRoleId(company.roles[0].id);
    }
  };

  // Evaluate candidate's real readiness against selected role
  const evaluation = useMemo(() => {
    return evaluateCandidateReadiness(selectedRole, skills);
  }, [selectedRole, skills]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b border-[var(--border-color)] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 mb-2">
            <Compass className="w-3.5 h-3.5" />
            Fresher & Campus Career Guidance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Target Company & Role Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-3xl">
            Evaluate your skill readiness against hiring patterns at top tech firms (TCS, Infosys, Google, Amazon, Microsoft, Wipro). Discover required skills, round-by-round interview structures, and take verified assessments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-semibold shadow-sm transition-all"
          >
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verify Skills</span>
          </Link>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tailor Resume</span>
          </Link>
        </div>
      </div>

      {/* COMPANY SELECTOR TABS */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Select Target Tech Employer
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {COMPANY_PROFILES.map((comp) => {
            const isSelected = comp.id === selectedCompanyId;
            return (
              <button
                key={comp.id}
                onClick={() => handleCompanyChange(comp.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-md ring-1 ring-[var(--accent)]/30'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                    }`}
                  >
                    {comp.name.charAt(0)}
                  </div>
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                      comp.tier === 'Top Tech / Product'
                        ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border-color)]'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                    }`}
                  >
                    {comp.tier === 'Top Tech / Product' ? 'Product' : 'Services'}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[var(--text-primary)] truncate">
                    {comp.name.split(' ')[0]}
                  </h3>
                  <p className="text-[10px] text-[var(--text-secondary)] truncate">
                    {comp.roles.length} tracks available
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ROLE SELECTOR & COMPANY OVERVIEW */}
      <GlassCard className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                {selectedCompany.name}
              </h2>
              <span className="text-xs text-[var(--text-secondary)]">• {selectedCompany.headquarters}</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-3xl leading-relaxed">
              {selectedCompany.overview}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Available Roles:</span>
            {selectedCompany.roles.map((role) => {
              const isSelected = role.id === selectedRole.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white shadow-sm'
                      : 'border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  {role.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROLE OVERVIEW & READINESS HERO BANNER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Readiness Score Card */}
          <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/60 flex flex-col items-center text-center justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Your Assessment Readiness
              </span>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                {selectedRole.title}
              </h3>
            </div>

            <div className="py-2">
              <ScoreRing score={evaluation.readinessScore} size={130} strokeWidth={10} />
            </div>

            <div className="space-y-1 w-full">
              <div
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 ${
                  evaluation.status === 'Interview Ready'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : evaluation.status === 'Needs Preparation'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Status: {evaluation.status}</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] pt-1">
                Verified: {evaluation.verifiedRequired}/{evaluation.totalRequired} required skills
              </p>
            </div>
          </div>

          {/* Role Specifications Strip */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/40 space-y-1 text-left">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                <Briefcase className="w-4 h-4" />
                <span>Package Band</span>
              </div>
              <p className="text-base font-extrabold text-[var(--text-primary)]">
                {selectedRole.packageRange}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {selectedRole.level} ({selectedRole.experienceRequired})
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/40 space-y-1 text-left">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <GraduationCap className="w-4 h-4" />
                <span>Academic Eligibility</span>
              </div>
              <p className="text-xs font-bold text-[var(--text-primary)] leading-snug">
                {selectedCompany.minAcademicPercentage}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {selectedRole.eligibility}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/40 space-y-1 text-left">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <Target className="w-4 h-4" />
                <span>DSA Problem Solving Weight</span>
              </div>
              <p className="text-base font-extrabold text-[var(--text-primary)]">
                {selectedRole.dsaWeight} Importance
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                System Design Weight: {selectedRole.systemDesignWeight}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/40 space-y-1 text-left">
              <div className="flex items-center gap-2 text-[var(--accent)] text-xs font-semibold">
                <Clock className="w-4 h-4" />
                <span>Hiring Window</span>
              </div>
              <p className="text-xs font-bold text-[var(--text-primary)]">
                {selectedCompany.hiringCycle}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {selectedCompany.selectionProcess.slice(0, 50)}...
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* SKILL GAP ANALYSIS */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Skill Alignment & Gap Analysis
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Real-time matching against your claimed and verified digital credentials.
            </p>
          </div>
          <span className="text-xs font-semibold text-[var(--text-secondary)]">
            Total Required: {selectedRole.requiredSkills.length} | Recommended: {selectedRole.recommendedSkills.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Required Skills Column */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Mandatory Core Skills
                </h3>
              </div>
              <span className="text-xs text-rose-400 font-semibold">Strict Hiring Filter</span>
            </div>

            <div className="space-y-3">
              {selectedRole.requiredSkills.map((skName) => {
                const match = evaluation.matchedSkills.find((m) => m.skill === skName);
                const isVerified = match?.status === 'verified';
                const isClaimed = match?.status === 'claimed';

                return (
                  <div
                    key={skName}
                    className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isVerified
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isClaimed
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isVerified ? '✓' : isClaimed ? '!' : '✕'}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[var(--text-primary)]">{skName}</h4>
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          {isVerified
                            ? `Verified Credential (Score: ${match?.score || 85}%)`
                            : isClaimed
                            ? 'Claimed in profile - Needs Proctored Assessment'
                            : 'Missing from profile'}
                        </p>
                      </div>
                    </div>

                    <div>
                      {isVerified && match?.certificateId ? (
                        <Link
                          href={`/skills/certificate/${match.certificateId}`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold inline-flex items-center gap-1 hover:bg-emerald-500/20 transition-all"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>View Cert</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/skills/assess/${encodeURIComponent(skName)}`}
                          className="px-3 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[11px] font-semibold inline-flex items-center gap-1 shadow-sm transition-all"
                        >
                          <span>Take Test</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Recommended Skills Column */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Advantage & Recommended Skills
                </h3>
              </div>
              <span className="text-xs text-indigo-400 font-semibold">Competitive Edge</span>
            </div>

            <div className="space-y-3">
              {selectedRole.recommendedSkills.map((skName) => {
                const match = evaluation.matchedSkills.find((m) => m.skill === skName);
                const isVerified = match?.status === 'verified';
                const isClaimed = match?.status === 'claimed';

                return (
                  <div
                    key={skName}
                    className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isVerified
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isClaimed
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        {isVerified ? '✓' : isClaimed ? '!' : '+'}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[var(--text-primary)]">{skName}</h4>
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          {isVerified
                            ? 'Verified credential bonus'
                            : isClaimed
                            ? 'Claimed in profile'
                            : 'Optional bonus skill'}
                        </p>
                      </div>
                    </div>

                    <div>
                      {isVerified ? (
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                          Added
                        </span>
                      ) : (
                        <Link
                          href={`/skills/assess/${encodeURIComponent(skName)}`}
                          className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--accent)] text-[var(--text-primary)] text-[11px] font-semibold inline-flex items-center gap-1 transition-all"
                        >
                          <span>Assess</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* INTERVIEW STAGES BLUEPRINT */}
      <div className="space-y-4 text-left">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Selection Process & Interview Stages
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Exact round format, time limits, and insider evaluation criteria for {selectedCompany.name}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedRole.interviewRounds.map((rnd) => (
            <GlassCard key={rnd.round} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] font-black text-xs flex items-center justify-center border border-[var(--accent)]/30">
                    0{rnd.round}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-secondary)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {rnd.duration}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  {rnd.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {rnd.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] text-[11px] bg-[var(--bg-secondary)]/50 p-3 rounded-xl">
                <strong className="text-[var(--text-primary)] block mb-0.5">Recruiter Pro-Tip:</strong>
                <span className="text-[var(--text-secondary)] italic leading-relaxed">
                  &quot;{rnd.tips}&quot;
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* RESUME KEYWORDS & ACTIONABLE NEXT STEPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* ATS Keywords */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              ATS Keywords For {selectedCompany.name.split(' ')[0]}
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Include these keywords in your resume summary, project bullets, and technical skills section to match screening algorithms:
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedRole.resumeKeywords.map((kw) => (
              <span
                key={kw}
                className="px-3 py-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold"
              >
                {kw}
              </span>
            ))}
          </div>
        </GlassCard>

        {/* Personalized Next Steps */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              Personalized Action Plan
            </h3>
          </div>
          <div className="space-y-2.5">
            {evaluation.nextSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
