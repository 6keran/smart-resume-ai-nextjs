'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  BadgeCheck,
  FileEdit,
  BriefcaseBusiness,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Target,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // If inside full assessment screen, admin console, user dashboard, or auth pages, hide public sidebar
  if (
    pathname?.startsWith('/skills/assess/') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/dashboard') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return null;
  }

  const primaryNavItems: { label: string; href: string; icon: any; badge?: string }[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Resume Analyzer', href: '/analyzer', icon: FileText },
    { label: 'Skill Assessments', href: '/skills', icon: BadgeCheck },
    { label: 'Career Guidance', href: '/guidance', icon: Compass },
    { label: 'Resume Builder', href: '/builder', icon: FileEdit },
    { label: 'Job Search', href: '/jobs', icon: BriefcaseBusiness },
    { label: 'Feedback', href: '/feedback', icon: MessageSquare },
  ];

  const secondaryTools = [
    { label: 'Resume Improver', href: '/improver', icon: Wand2 },
    { label: 'Job Match', href: '/job-match', icon: Target },
  ];

  return (
    <aside
      data-no-print="true"
      className={cn(
        'hidden md:flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-primary)] transition-[width] duration-200 cubic-bezier(0.16, 1, 0.3, 1) relative z-30 shrink-0 h-screen sticky top-0 no-print select-none',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header - Text-only branding */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)] shrink-0">
        <Link href="/" className="flex items-center overflow-hidden group min-w-0">
          {!collapsed ? (
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="font-bold tracking-tight text-[16.5px] text-[var(--text-primary)] leading-tight whitespace-nowrap">
                Smart Resume
              </span>
              <span className="text-[11.5px] tracking-wider font-medium text-[var(--text-secondary)] uppercase whitespace-nowrap">
                Career Platform
              </span>
            </div>
          ) : (
            <div className="w-8 flex items-center justify-center">
              <span className="font-bold text-[17px] text-[var(--accent)] tracking-tight">
                SR
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Collapse Toggle Button - Centered at the sidebar right border edge */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] flex items-center justify-center shadow-xs active:scale-95 transition-all duration-150 z-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Platform Section */}
        <div className="w-full">
          {!collapsed && (
            <p className="px-3.5 text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5 select-none">
              Platform
            </p>
          )}
          <nav className="w-full space-y-1.5">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'w-full h-[45px] flex items-center rounded-xl text-[15px] font-medium transition-all duration-150 group relative select-none',
                    collapsed ? 'justify-center px-0' : 'justify-start gap-3.5 px-3.5',
                    isActive
                      ? 'bg-[var(--accent)] text-white shadow-xs font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-[0.99]',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-primary)]'
                  )}
                >
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <Icon
                      className={cn(
                        'w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-105',
                        isActive ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                      )}
                    />
                  </div>
                  {!collapsed && (
                    <span className="truncate flex-1 text-left leading-normal">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={cn(
                        'text-[11px] px-2 py-0.5 rounded font-medium tracking-wide shrink-0',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Intelligence Tools Section */}
        <div className="w-full">
          {!collapsed && (
            <p className="px-3.5 text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5 select-none">
              Intelligence Tools
            </p>
          )}
          <nav className="w-full space-y-1.5">
            {secondaryTools.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'w-full h-[45px] flex items-center rounded-xl text-[15px] font-medium transition-all duration-150 group relative select-none',
                    collapsed ? 'justify-center px-0' : 'justify-start gap-3.5 px-3.5',
                    isActive
                      ? 'bg-[var(--accent)] text-white shadow-xs font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-[0.99]',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-primary)]'
                  )}
                >
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <Icon
                      className={cn(
                        'w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-105',
                        isActive ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                      )}
                    />
                  </div>
                  {!collapsed && (
                    <span className="truncate flex-1 text-left leading-normal">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer with Theme Toggle - Compact, fits within width without overflow */}
      <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/40 shrink-0">
        {collapsed ? (
          <div className="flex items-center justify-center">
            <ThemeToggle variant="icon" />
          </div>
        ) : (
          <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden">
            <span className="text-xs font-medium text-[var(--text-secondary)] shrink-0 select-none">
              Theme
            </span>
            <ThemeToggle className="shrink-0" />
          </div>
        )}
      </div>
    </aside>
  );
}
