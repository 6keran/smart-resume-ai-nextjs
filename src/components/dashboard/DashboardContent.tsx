import React from 'react';
import Link from 'next/link';
import {
  FileText,
  FileSearch,
  Sparkles,
  TrendingUp,
  Briefcase,
  Send,
  BadgeCheck,
  FileCheck2,
  Award,
  BookOpen,
  ArrowRight,
  ArrowUpRight,
  Plus,
} from 'lucide-react';

export interface DashboardMetrics {
  totalResumes: number;
  totalAnalyses: number;
  avgAtsScore: number;
  improvementsMade: number;
  totalApplications: number;
  jobsApplied: number;
  jobMatches: number;
  verifiedSkills: number;
  assessmentsCompleted: number;
  certificatesEarned: number;
  coursesCompleted: number;
}

export interface ResumeProgressItem {
  id: string;
  filename: string;
  fileType?: string;
  uploadedAt: string | Date;
  previousScore: number | null;
  latestScore: number | null;
  improvement: number | null;
  latestAnalysisId?: string | null;
}

export interface RecentApplicationItem {
  id: string;
  job_title: string;
  company: string;
  location?: string | null;
  status: string;
}

export interface RecentAssessmentItem {
  id: string;
  skill: string;
  score: number;
  total_questions: number;
  passed: boolean;
}

export interface RecentImprovementItem {
  id: string;
  title: string;
  category: string;
  before_text: string;
  after_text: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  resumeProgress: ResumeProgressItem[];
  recentApplications: RecentApplicationItem[];
  recentAssessments: RecentAssessmentItem[];
  recentImprovements: RecentImprovementItem[];
}

export interface DashboardContentProps {
  user: {
    id: string;
    name: string;
    email?: string | null;
  };
  data: DashboardData;
}

export function DashboardContent({ user, data }: DashboardContentProps) {
  const { metrics, resumeProgress, recentApplications, recentAssessments, recentImprovements } = data;

  const statCards = [
    {
      title: 'Resumes',
      value: metrics.totalResumes,
      label: 'Uploaded Documents',
      icon: FileText,
      color: 'text-[var(--accent)]',
      bg: 'bg-[var(--accent-subtle)]',
      border: 'border-[var(--border-color)]',
      href: '/dashboard/resumes',
    },
    {
      title: 'Resume Analyses',
      value: metrics.totalAnalyses,
      label: 'AI ATS Scans',
      icon: FileSearch,
      color: 'text-[var(--accent)]',
      bg: 'bg-[var(--accent-subtle)]',
      border: 'border-[var(--border-color)]',
      href: '/dashboard/analyses',
    },
    {
      title: 'Average ATS Score',
      value: metrics.avgAtsScore > 0 ? `${metrics.avgAtsScore}` : '0',
      suffix: metrics.avgAtsScore > 0 ? '/100' : '',
      label: 'Overall ATS Quality',
      icon: TrendingUp,
      color: metrics.avgAtsScore >= 75 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]',
      bg: metrics.avgAtsScore >= 75 ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-warning)]/10',
      border: metrics.avgAtsScore >= 75 ? 'border-[var(--color-success)]/20' : 'border-[var(--color-warning)]/20',
      href: '/dashboard/analyses',
    },
    {
      title: 'Improvements Made',
      value: metrics.improvementsMade,
      label: 'Phrasing Updates',
      icon: Sparkles,
      color: 'text-[var(--color-success)]',
      bg: 'bg-[var(--color-success)]/10',
      border: 'border-[var(--color-success)]/20',
      href: '/dashboard/improvements',
    },
    {
      title: 'Jobs Applied',
      value: metrics.jobsApplied,
      label: `${metrics.totalApplications} Total Tracked`,
      icon: Send,
      color: 'text-[var(--accent)]',
      bg: 'bg-[var(--accent-subtle)]',
      border: 'border-[var(--border-color)]',
      href: '/dashboard/applications',
    },
    {
      title: 'Job Matches',
      value: metrics.jobMatches,
      label: 'Matched Roles',
      icon: Briefcase,
      color: 'text-[var(--accent)]',
      bg: 'bg-[var(--accent-subtle)]',
      border: 'border-[var(--border-color)]',
      href: '/dashboard/jobs',
    },
    {
      title: 'Verified Skills',
      value: metrics.verifiedSkills,
      label: 'Badges Earned',
      icon: BadgeCheck,
      color: 'text-[var(--color-success)]',
      bg: 'bg-[var(--color-success)]/10',
      border: 'border-[var(--color-success)]/20',
      href: '/dashboard/skills',
    },
    {
      title: 'Assessments Done',
      value: metrics.assessmentsCompleted,
      label: 'Skill Quizzes Completed',
      icon: FileCheck2,
      color: 'text-[var(--color-warning)]',
      bg: 'bg-[var(--color-warning)]/10',
      border: 'border-[var(--color-warning)]/20',
      href: '/dashboard/assessments',
    },
    {
      title: 'Certificates Earned',
      value: metrics.certificatesEarned,
      label: 'Badges Earned',
      icon: Award,
      color: 'text-[var(--color-warning)]',
      bg: 'bg-[var(--color-warning)]/10',
      border: 'border-[var(--color-warning)]/20',
      href: '/dashboard/certificates',
    },
    {
      title: 'Courses Completed',
      value: metrics.coursesCompleted,
      label: 'Learning Milestones',
      icon: BookOpen,
      color: 'text-[var(--accent)]',
      bg: 'bg-[var(--accent-subtle)]',
      border: 'border-[var(--border-color)]',
      href: '/dashboard/courses',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Welcome back, {user.name}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Overview of your resumes, analyses, job applications, and skill assessments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/analyzer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold transition-all shadow-xs"
            >
              <FileSearch className="w-4 h-4" />
              <span>Analyze Resume</span>
            </Link>
            <Link
              href="/dashboard/applications"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent)] text-[var(--text-primary)] text-xs font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Track Application</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Database KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Overview
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group relative rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] p-4 transition-all duration-200 hover:shadow-sm hover:border-[var(--accent)]/40 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} ${card.border} border flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                    {card.value}
                  </span>
                  {card.suffix && (
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">
                      {card.suffix}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)] mt-1 truncate">
                  {card.title}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">
                  {card.label}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Resume Progress Section */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[var(--border-color)] gap-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
              <span>Resume Progress</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Score trends and updates across your resumes.
            </p>
          </div>
          <Link
            href="/dashboard/resumes"
            className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
          >
            <span>View All Resumes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {resumeProgress.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-3 text-[var(--text-secondary)]">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              No resumes uploaded yet
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto mt-1 mb-4">
              Upload your first resume to unlock comprehensive ATS scoring, keyword gap detection, and automated wording improvements.
            </p>
            <Link
              href="/analyzer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90 transition-all"
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Scan Your Resume Now</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {resumeProgress.map((r) => {
              const hasImprovement = r.improvement !== null;
              const isPositive = r.improvement && r.improvement > 0;
              const isNeutral = r.improvement === 0;

              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[var(--accent)]/40 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {r.filename}
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-2 mt-0.5">
                        <span>Uploaded {new Date(r.uploadedAt).toLocaleDateString()}</span>
                        {r.fileType && (
                          <span className="uppercase px-1.5 py-0.2 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[9px] font-bold">
                            {r.fileType}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Benchmark Scores */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="flex items-center gap-4 text-center">
                      <div>
                        <span className="text-[10px] font-semibold uppercase text-[var(--text-secondary)] block">
                          Before
                        </span>
                        <span className="text-sm font-bold text-[var(--text-secondary)]">
                          {r.previousScore !== null ? `${r.previousScore}` : '-'}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-[var(--text-secondary)]">→</div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase text-[var(--text-secondary)] block">
                          Latest ATS
                        </span>
                        <span className="text-base font-extrabold text-[var(--text-primary)]">
                          {r.latestScore !== null ? `${r.latestScore}` : 'Not Scored'}
                        </span>
                      </div>
                    </div>

                    {/* Improvement Delta Badge */}
                    {hasImprovement && (
                      <div
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
                          isPositive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                            : isNeutral
                            ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border-color)]'
                            : 'bg-red-500/10 text-red-400 border border-red-500/25'
                        }`}
                      >
                        <span>{isPositive ? `+${r.improvement}` : `${r.improvement}`}</span>
                        <span className="text-[10px] font-medium">pts</span>
                      </div>
                    )}

                    {r.latestAnalysisId ? (
                      <Link
                        href={`/dashboard/analyses`}
                        className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] hover:border-[var(--accent)] text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] hover:bg-[var(--bg-secondary)] transition-all shrink-0"
                      >
                        View Analysis
                      </Link>
                    ) : (
                      <Link
                        href="/analyzer"
                        className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90 transition-all shrink-0"
                      >
                        Analyze Now
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Section: Recent Applications & Recent Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Job Applications
                </h3>
              </div>
              <Link
                href="/dashboard/applications"
                className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
              >
                <span>Tracker</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-[var(--text-secondary)] mb-3">
                  No job applications recorded yet.
                </p>
                <Link
                  href="/dashboard/applications"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent)] text-xs font-semibold text-[var(--text-primary)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Application</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--text-primary)] truncate">
                        {app.job_title}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate">
                        {app.company} {app.location ? `· ${app.location}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] font-semibold text-[10px] text-[var(--text-primary)]">
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Skill Assessments */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Skill Assessments
                </h3>
              </div>
              <Link
                href="/dashboard/assessments"
                className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
              >
                <span>All Tests</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentAssessments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-[var(--text-secondary)] mb-3">
                  No skill assessments attempted yet.
                </p>
                <Link
                  href="/skills"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90"
                >
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>Take Assessment</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentAssessments.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--text-primary)] truncate">
                        {a.skill} Assessment
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate">
                        Score: {a.score}/{a.total_questions} ({Math.round((a.score / a.total_questions) * 100)}%)
                      </p>
                    </div>
                    <div>
                      {a.passed ? (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                          PASSED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-[10px]">
                          FAILED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume Improvements Section */}
      {recentImprovements.length > 0 && (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Latest ATS Improvements Made
              </h3>
            </div>
            <Link
              href="/dashboard/improvements"
              className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              <span>View All Improvements</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recentImprovements.map((imp) => (
              <div
                key={imp.id}
                className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)]">{imp.title}</span>
                  <span className="text-[10px] uppercase font-bold text-[var(--accent)] px-1.5 py-0.5 rounded bg-[var(--accent)]/10">
                    {imp.category}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-mono text-[11px] line-through opacity-75">
                    {imp.before_text}
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono text-[11px]">
                    {imp.after_text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
