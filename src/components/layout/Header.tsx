'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  FileText,
  FileSearch,
  BadgeCheck,
  FileEdit,
  Briefcase,
  BriefcaseBusiness,
  LayoutDashboard,
  MessageSquare,
  Wand2,
  Target,
  Home,
  User,
  Compass,
  LogOut,
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
        return 'Skill Assessments';
      case '/job-match':
        return 'Job Match';
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
    { label: 'Resume Analyzer', href: '/analyzer', icon: FileText },
    { label: 'Skill Assessments', href: '/skills', icon: BadgeCheck },
    { label: 'Career Guidance', href: '/guidance', icon: Compass },
    { label: 'Resume Builder', href: '/builder', icon: FileEdit },
    { label: 'Job Search', href: '/jobs', icon: BriefcaseBusiness },
    { label: 'Feedback', href: '/feedback', icon: MessageSquare },
  ];

  return (
    <>
      <header
        data-no-print="true"
        className="sticky top-0 z-20 h-16 w-full max-w-full border-b border-[var(--border-color)] bg-[var(--bg-primary)]/90 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 no-print overflow-hidden"
      >
        {/* Left: Mobile menu button & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] active:scale-95 transition-all duration-150 shrink-0"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center min-w-0">
            <span className="font-semibold text-sm sm:text-base text-[var(--text-primary)] truncate max-w-[120px] xs:max-w-[170px] sm:max-w-none">
              {getPageTitle()}
            </span>
          </div>
        </div>

        {/* Right: ThemeToggle, Auth buttons / User Profile & Primary action */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Responsive ThemeToggle: icon button on mobile/tablet, segmented on desktop */}
          <div className="lg:hidden shrink-0">
            <ThemeToggle variant="icon" />
          </div>
          <div className="hidden lg:block shrink-0">
            <ThemeToggle variant="segmented" />
          </div>

          {user?.name ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/dashboard"
                title={`Dashboard (${user.name})`}
                aria-label={`Dashboard (${user.name})`}
                className="inline-flex items-center gap-1.5 p-1.5 sm:px-2.5 lg:px-3 sm:py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] text-xs text-[var(--text-primary)] transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-xs group shrink-0"
              >
                <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] font-semibold text-[11px] sm:text-[10px] flex items-center justify-center border border-[var(--accent)]/20 shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-xs max-w-[90px] lg:max-w-[120px] truncate text-[var(--text-primary)] hidden sm:inline">
                  {user.name}
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] hidden lg:inline">
                  Dashboard
                </span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--color-error)] hover:border-[var(--color-error)]/30 transition-all duration-150 active:scale-95 cursor-pointer shrink-0"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4 md:hidden text-[var(--text-secondary)]" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-[0.98] transition-all duration-150"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-medium hover:bg-[var(--accent-hover)] transition-all duration-150 shadow-xs active:scale-95"
              >
                Register
              </Link>
            </div>
          )}

          <Link
            href="/analyzer"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-hover)] text-xs font-medium text-[var(--text-primary)] transition-all duration-150 active:scale-[0.98] shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
            Analyze Resume
          </Link>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div data-no-print="true" className="no-print fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm animate-fade-in flex">
          <div className="w-72 max-w-[85vw] h-full bg-[var(--bg-secondary)] border-r border-[var(--border-color)] p-5 flex flex-col justify-between shadow-2xl animate-scale-in">
            <div>
              {/* Drawer Header - Text-only branding matching Sidebar */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                <div className="flex flex-col">
                  <span className="font-bold text-[16.5px] tracking-tight text-[var(--text-primary)] leading-tight">
                    Smart Resume
                  </span>
                  <span className="text-[11.5px] text-[var(--text-secondary)] font-medium tracking-wide uppercase">
                    Career Platform
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] active:scale-95 transition-all duration-150 cursor-pointer"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="mt-5 space-y-1.5">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'w-full h-[45px] flex items-center gap-3.5 px-3.5 rounded-xl text-[15px] font-medium transition-all duration-150 active:scale-[0.99]',
                        isActive
                          ? 'bg-[var(--accent)] text-white shadow-xs font-semibold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                      )}
                    >
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 shrink-0" />
                      </div>
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Extra Tools */}
              <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
                <p className="px-3.5 text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                  AI Tools
                </p>
                <div className="space-y-1.5">
                  <Link
                    href="/improver"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full h-[45px] flex items-center gap-3.5 px-3.5 rounded-xl text-[15px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all duration-150"
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <Wand2 className="w-5 h-5 shrink-0" />
                    </div>
                    <span className="truncate flex-1 text-left">Resume Improver</span>
                  </Link>
                  <Link
                    href="/job-match"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full h-[45px] flex items-center gap-3.5 px-3.5 rounded-xl text-[15px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all duration-150"
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 shrink-0" />
                    </div>
                    <span className="truncate flex-1 text-left">Job Match Engine</span>
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
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
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
