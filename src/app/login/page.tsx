'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileSearch,
  Wand2,
  BadgeCheck,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  X,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { useUserProfile } from '@/components/user/UserContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const CAREER_JOURNEY = [
  {
    step: '01',
    title: 'ANALYZE',
    desc: 'Instant ATS parsing & semantic keyword benchmarking',
    icon: FileSearch,
  },
  {
    step: '02',
    title: 'IMPROVE',
    desc: 'Action-driven bullet rewrites & impact metrics',
    icon: Wand2,
  },
  {
    step: '03',
    title: 'VERIFY',
    desc: 'Timed skill evaluations & verifiable certificates',
    icon: BadgeCheck,
  },
  {
    step: '04',
    title: 'MATCH',
    desc: 'Live vacancies aligned to your verified skillset',
    icon: Briefcase,
  },
  {
    step: '05',
    title: 'GROW',
    desc: 'Structured interview prep & learning roadmaps',
    icon: TrendingUp,
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawFrom = searchParams.get('from');
  const safeFrom =
    rawFrom &&
    rawFrom.startsWith('/') &&
    !rawFrom.startsWith('//') &&
    rawFrom !== '/login' &&
    rawFrom !== '/register' &&
    !rawFrom.startsWith('/admin')
      ? rawFrom
      : '/dashboard';

  const { user, loading: userLoading, refreshUser } = useUserProfile();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If already authenticated, redirect immediately to dashboard
  useEffect(() => {
    if (!userLoading && user) {
      window.location.href = safeFrom;
    }
  }, [user, userLoading, safeFrom]);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault?.();
    if (isLoading) return;
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      if (data.user && refreshUser) {
        await refreshUser(data.user);
      }

      window.location.replace(safeFrom);
    } catch {
      setError('Unable to connect to the authentication server. Please check your connection and retry.');
      setIsLoading(false);
    }
  };

  // If user is already loaded, show a minimal loading spinner while redirecting
  if (!userLoading && user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)] mb-3" />
        <p className="text-xs text-[var(--text-secondary)] font-medium">
          Already signed in. Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10">
      {/* LEFT COLUMN: Premium Brand Experience & Product Visual (Desktop only ~58%) */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between space-y-7">
        {/* Brand Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-xl"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-[var(--text-primary)]">
                SMART RESUME
              </span>
              <span className="text-[10px] tracking-widest font-bold text-[var(--accent)] uppercase">
                CAREER AI
              </span>
            </div>
          </Link>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-semibold bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>CAREER INTELLIGENCE PLATFORM</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)] leading-[1.15]">
              Build a smarter career{' '}
              <span className="text-[var(--accent)]">
                with AI.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-3 leading-relaxed max-w-xl">
              Analyze your resume, optimize ATS match scores, verify technical skills, and unlock
              opportunities tailored to your verified strengths.
            </p>
          </div>
        </div>

        {/* Product Visual Mockup Card */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/70 backdrop-blur-md shadow-sm space-y-3.5 max-w-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center font-bold text-xs">
                92
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  Senior Full-Stack Engineer
                </p>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  ATS Match Score: High Compatibility
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Verified Skills Active
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {['TypeScript', 'Next.js', 'React 19', 'System Design', 'Cloud APIs', 'PostgreSQL'].map(
              (skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
                >
                  <CheckCircle2 className="w-3 h-3 text-[var(--accent)]" />
                  {skill}
                </span>
              )
            )}
          </div>
        </div>

        {/* Informational Visual Journey Steps */}
        <div className="space-y-2 pt-1 hidden sm:block">
          <span className="text-[10px] font-bold tracking-widest text-[var(--text-secondary)] uppercase">
            Platform Workflow
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl">
            {CAREER_JOURNEY.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--border-color)]/70 bg-[var(--bg-secondary)]/40 hover:border-[var(--accent)]/40 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold text-[var(--accent)]">
                        {item.step}
                      </span>
                      <span className="text-[11px] font-bold tracking-wider text-[var(--text-primary)]">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] truncate">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Elevated Login Card (~42%) */}
      <div className="lg:col-span-5 w-full max-w-md mx-auto">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-7 sm:p-9 shadow-sm relative overflow-hidden transition-colors duration-200">

          {/* Mobile brand header (shown only when left hero is stacked) */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-6 pb-4 border-b border-[var(--border-color)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="font-extrabold text-xs tracking-tight text-[var(--text-primary)]">
                SMART RESUME
              </span>
              <span className="text-[9px] font-bold text-[var(--accent)] tracking-widest uppercase">
                CAREER AI
              </span>
            </div>
          </div>

          {/* Card Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
              Sign in to continue your career journey.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 dark:text-red-400 text-xs flex items-start gap-2.5"
              role="alert"
              id="auth-error"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-secondary)]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  readOnly={!mounted}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="name@example.com"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'auth-error' : undefined}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-medium text-[var(--accent)] hover:underline focus:outline-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-secondary)]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  readOnly={!mounted}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••••••"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'auth-error' : undefined}
                  className="w-full pl-10 pr-11 py-2.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPassword((prev) => !prev);
                  }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded z-10"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 h-[44px] px-4 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-color)]" />
            </div>
            <span className="relative px-3 bg-[var(--bg-card)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-medium">
              New to Smart Resume AI?
            </span>
          </div>

          {/* Create Account Link */}
          <Link
            href={`/register${safeFrom !== '/dashboard' ? `?from=${encodeURIComponent(safeFrom)}` : ''}`}
            className="w-full py-2.5 px-4 rounded-lg border border-[var(--border-color)] hover:border-[var(--accent)] text-[var(--text-primary)] font-medium text-sm transition-all flex items-center justify-center gap-2 hover:bg-[var(--bg-secondary)] cursor-pointer"
          >
            <span>Create an account →</span>
          </Link>

          {/* Admin Footnote */}
          <div className="text-center mt-5 pt-4 border-t border-[var(--border-color)]/60">
            <p className="text-[11px] text-[var(--text-secondary)]">
              Need administrative access?{' '}
              <Link
                href="/admin/login"
                className="text-[var(--accent)] hover:underline font-semibold"
              >
                Admin Portal →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Information Modal */}
      {showForgotModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <HelpCircle className="w-5 h-5" />
                <h3 id="forgot-password-title" className="font-bold text-base text-[var(--text-primary)]">
                  Password Recovery Notice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-2.5 leading-relaxed">
              <p>
                Automated email delivery is not configured on this server environment.
              </p>
              <p>
                If you have forgotten your password, an administrator can update your account credentials from the Admin Users portal, or you can register with a new address.
              </p>
              <p className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)]">
                <strong>Tip:</strong> If you are already logged in on another device or remember your current password, you can change it anytime in your dashboard profile.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-all cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-2">
        <div className="sm:hidden">
          <ThemeToggle variant="icon" />
        </div>
        <div className="hidden sm:block">
          <ThemeToggle variant="segmented" />
        </div>
      </div>

      {/* Subtle Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
