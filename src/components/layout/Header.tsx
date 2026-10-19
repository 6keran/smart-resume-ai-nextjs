'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Menu,
  X,
  FileSearch,
  BadgeCheck,
  FileEdit,
  Briefcase,
  LayoutDashboard,
  MessageSquare,
  Wand2,
  Target,
  Home,
  User,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/components/user/UserContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, openModal, logout } = useUserProfile();

  // If in full assessment screen, admin console, user dashboard, or auth pages, hide standard header
  if (
    pathname?.startsWith('/skills/assess/') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/dashboard') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return null;
  }

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'Home';
      case '/analyzer':
        return 'Resume Analyzer';
      case '/improver':
        return 'Resume Improver';
      case '/builder':
        return 'Resume Builder';
      case '/skills':
        return 'Skill Verification';
      case '/job-match':
        return 'Job Match Engine';
      case '/jobs':
        return 'Job Search';
      case '/guidance':
        return 'Career Guidance';
      case '/feedback':
        return 'Feedback';
      default:
        if (pathname?.startsWith('/skills/certificate/')) return 'Skill Certificate';
        return 'Smart Resume AI';
    }
  };

  const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Resume Analyzer', href: '/analyzer', icon: FileSearch },
    { label: 'Skill Verification', href: '/skills', icon: BadgeCheck },
    { label: 'Career Guidance', href: '/guidance', icon: Compass },
    { label: 'Resume Builder', href: '/builder', icon: FileEdit },
    { label: 'Job Search', href: '/jobs', icon: Briefcase },
    { label: 'Feedback', href: '/feedback', icon: MessageSquare },
  ];

  return (
    <>
      <header
        data-no-print="true"
        className="sticky top-0 z-20 h-16 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 no-print"
      >
        {/* Left: Mobile menu button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">
              {getPageTitle()}
            </span>
          </div>
        </div>

        {/* Right: ThemeToggle, Auth buttons / User Profile & Primary action */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {user?.name ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] text-xs text-[var(--text-primary)] transition-all cursor-pointer shadow-sm group"
              >
                <div className="w-5 h-5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] font-semibold text-[10px] flex items-center justify-center border border-[var(--accent)]/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-xs max-w-[120px] truncate text-[var(--text-primary)]">
                  {user.name}
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)]">
                  Dashboard
                </span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--color-error)] hover:border-[var(--color-error)]/30 transition-all cursor-pointer"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm active:scale-95"
              >
                Register
              </Link>
            </div>
          )}

          <Link
            href="/analyzer"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] text-xs font-medium text-[var(--text-primary)] transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            Analyze Resume
          </Link>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div data-no-print="true" className="no-print fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm animate-fade-in flex">
          <div className="w-72 max-w-[85vw] h-full bg-[var(--bg-secondary)] border-r border-[var(--border-color)] p-5 flex flex-col justify-between shadow-2xl">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-sm text-[var(--text-primary)]">
                    SMART RESUME AI
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="mt-5 space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-[var(--accent)] text-white shadow-md'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Extra Tools */}
              <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
                <p className="px-3 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  AI Tools
                </p>
                <div className="space-y-1">
                  <Link
                    href="/improver"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Resume Improver</span>
                  </Link>
                  <Link
                    href="/job-match"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                  >
                    <Target className="w-4 h-4" />
                    <span>Job Match Engine</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Theme Toggle */}
            <div className="py-2.5 px-3 mb-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Theme</span>
              <ThemeToggle />
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
              {user?.name ? (
                <div className="space-y-1.5">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold shadow-sm hover:border-[var(--accent)] transition-all"
                  >
                    <span>Dashboard ({user.name})</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-3 py-2 rounded-lg border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] transition-all text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-all text-center shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
              <Link
                href="/analyzer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold shadow-sm hover:bg-[var(--accent-hover)] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze My Resume</span>
              </Link>
            </div>
          </div>

          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
}
