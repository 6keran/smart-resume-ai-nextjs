'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wand2,
  Check,
  X,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  FileEdit,
  TrendingUp,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { GlassCard } from '@/components/ui/GlassCard';

export default function ResumeImproverPage() {
  const {
    resumeData,
    improvements,
    acceptImprovement,
    rejectImprovement,
    regenerateImprovement,
  } = useResume();

  const [activeTab, setActiveTab] = useState<'all' | 'summary' | 'experience' | 'projects' | 'skills' | 'education'>('all');
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const filtered =
    activeTab === 'all'
      ? improvements
      : improvements.filter((imp) => imp.section === activeTab);

  const handleRegenerate = async (id: string) => {
    setRegeneratingId(id);
    await regenerateImprovement(id);
    setRegeneratingId(null);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border-color)] mb-2">
            <Wand2 className="w-3.5 h-3.5" />
            Factual Impact Enhancer
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Resume Improver
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Compare original phrasing against AI-optimized alternatives side-by-side with zero factual invention.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 h-[42px] px-4 rounded-lg bg-[var(--accent)] text-white text-xs font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm"
          >
            <FileEdit className="w-4 h-4" />
            Apply to Resume Builder
          </Link>
        </div>
      </div>

      {/* Safety & Integrity Guarantee Banner */}
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="text-[var(--text-primary)] block font-semibold mb-0.5">
            Strict Factual Integrity Guaranteed
          </strong>
          <span className="text-[var(--text-secondary)]">
            Our AI model optimizes sentence structure, quantifiable impact metrics, and action verbs while preserving your true employment history, dates, company names, and technologies.
          </span>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border-color)]">
        {(['all', 'summary', 'experience', 'projects', 'skills', 'education'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Split Screen Cards List or Empty State */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] mx-auto flex items-center justify-center">
            <Wand2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Upload a resume to start improving it.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            Every improvement is generated from your actual uploaded resume text and real AI analysis. No fabricated examples.
          </p>
          <div className="pt-2">
            <Link
              href="/analyzer"
              className="inline-flex items-center gap-2 h-[42px] px-5 rounded-lg bg-[var(--accent)] text-white text-xs font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze Resume to Generate Improvements</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
        {filtered.map((item) => {
          const isPending = item.status === 'pending';
          const isAccepted = item.status === 'accepted';
          const isRejected = item.status === 'rejected';

          return (
            <GlassCard key={item.id} className="p-6 space-y-4">
              {/* Card Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-secondary)] text-[var(--accent)]">
                    {item.section}
                  </span>
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {item.field}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    {item.metricImpact}
                  </span>
                  {isAccepted && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                      Accepted
                    </span>
                  )}
                  {isRejected && (
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">
                      Dismissed
                    </span>
                  )}
                </div>
              </div>

              {/* Split Screen Comparison UI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Original Content */}
                <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Original Content
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                      Current
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--text-secondary)] font-medium">
                    {item.originalContent}
                  </p>
                </div>

                {/* Right: AI Improved Content */}
                <div className="p-4 rounded-lg bg-[var(--accent-subtle)] border border-[var(--border-color)] space-y-2 text-left relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Improved Content
                    </span>
                    <span className="text-[10px] text-[var(--color-success)] font-medium">
                      Enhanced ATS Impact
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--text-primary)] font-medium">
                    {item.improvedContent}
                  </p>
                </div>
              </div>

              {/* Reasoning Description */}
              <div className="p-3 rounded-lg bg-[var(--bg-elevated)] text-[11px] text-[var(--text-secondary)] text-left flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[var(--text-primary)]">Why this improves score: </strong>
                  {item.reasoning}
                </span>
              </div>

              {/* Action Buttons: Accept / Reject / Regenerate */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleRegenerate(item.id)}
                  disabled={regeneratingId === item.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all disabled:opacity-50"
                >
                  <RotateCcw
                    className={`w-3.5 h-3.5 ${regeneratingId === item.id ? 'animate-spin' : ''}`}
                  />
                  Regenerate
                </button>

                <button
                  onClick={() => rejectImprovement(item.id)}
                  disabled={isRejected}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    isRejected
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-rose-400 hover:border-rose-500/40'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  Dismiss
                </button>

                <button
                  onClick={() => acceptImprovement(item.id)}
                  disabled={isAccepted}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isAccepted
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  {isAccepted ? 'Applied' : 'Accept Improvement'}
                </button>
              </div>
            </GlassCard>
          );
        })}
        </div>
      )}
    </div>
  );
}
