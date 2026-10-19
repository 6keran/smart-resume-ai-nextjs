'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  FileCheck2,
  Wand2,
  Briefcase,
  Send,
  BadgeCheck,
  Award,
  BookOpen,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/components/user/UserContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface UserDashboardSidebarProps {
  user: {
    id: string;
    name: string;
    email: string | null;
  };
}

export function UserDashboardSidebar({ user }: UserDashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useUserProfile();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Career Guidance', href: '/guidance', icon: Compass },
    { label: 'My Resumes', href: '/dashboard/resumes', icon: FileText },
    { label: 'My Improvements', href: '/dashboard/improvements', icon: Wand2 },
    { label: 'Job Matches', href: '/dashboard/jobs', icon: Briefcase },
    { label: 'My Applications', href: '/dashboard/applications', icon: Send },
    { label: 'My Skills', href: '/dashboard/skills', icon: BadgeCheck },
    { label: 'My Assessments', href: '/dashboard/assessments', icon: FileCheck2 },
    { label: 'My Certificates', href: '/dashboard/certificates', icon: Award },
    { label: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
    { label: 'My Profile', href: '/dashboard/profile', icon: User },
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
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">
                Smart Resume
              </span>
              <span className="text-[10px] tracking-wider font-semibold text-[var(--accent)] uppercase">
                Career Dashboard
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative',
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
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Public AI Tools Shortcut */}
        <div className="pt-4 mt-4 border-t border-[var(--border-color)]">
          {!collapsed && (
            <p className="px-3 text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Career Tools
            </p>
          )}
          <div className="space-y-1">
            <Link
              href="/analyzer"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all'
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              {!collapsed && <span>Resume Analyzer</span>}
            </Link>
            <Link
              href="/jobs"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all'
              )}
            >
              <Briefcase className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              {!collapsed && <span>Search Live Jobs</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* User Footer Profile, Theme Toggle & Collapse Toggle */}
      <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/40 space-y-2">
        {/* Theme Toggle Row */}
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between px-1 py-0.5')}>
          {!collapsed && (
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Appearance</span>
          )}
          <ThemeToggle variant={collapsed ? 'icon' : 'default'} />
        </div>

        <div className={cn('flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]')}>
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] font-bold text-xs flex items-center justify-center shrink-0 border border-[var(--accent)]/25">
            {user.name.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate">
                {user.email || 'Candidate Account'}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
