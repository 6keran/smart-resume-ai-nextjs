'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileSearch,
  BadgeCheck,
  FileEdit,
  Briefcase,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
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

  const primaryNavItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Resume Analyzer', href: '/analyzer', icon: FileSearch, badge: 'AI' },
    { label: 'Skill Verification', href: '/skills', icon: BadgeCheck },
    { label: 'Career Guidance', href: '/guidance', icon: Compass, badge: 'New' },
    { label: 'Resume Builder', href: '/builder', icon: FileEdit },
    { label: 'Job Search', href: '/jobs', icon: Briefcase },
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
        'hidden md:flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-primary)] transition-all duration-300 relative z-30 shrink-0 h-screen sticky top-0 no-print',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
        <Link href="/" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="font-bold tracking-tight text-sm text-[var(--text-primary)]">
                Smart Resume
              </span>
              <span className="text-[10px] tracking-wider font-medium text-[var(--text-secondary)]">
                Career Platform
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center shadow-md hover:scale-110 transition-transform z-40 focus:outline-none"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!collapsed && (
            <p className="px-3 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Platform
            </p>
          )}
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-transform group-hover:scale-105',
                      isActive ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded font-medium tracking-wide',
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

        {/* Intelligence Tools */}
        <div>
          {!collapsed && (
            <p className="px-3 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Intelligence Tools
            </p>
          )}
          <nav className="space-y-1">
            {secondaryTools.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0',
                      isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer with Theme Toggle */}
      <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/40 flex items-center justify-center">
        {collapsed ? (
          <ThemeToggle variant="icon" />
        ) : (
          <div className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Theme</span>
            <ThemeToggle />
          </div>
        )}
      </div>
    </aside>
  );
}
