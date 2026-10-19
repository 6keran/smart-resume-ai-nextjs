'use client';

import React from 'react';
import { SkillStatus, SupportedSkill } from '@/types/skills';
import { CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SkillBadge({
  skill,
  status,
  score,
  onClick,
  className = '',
}: {
  skill: SupportedSkill | string;
  status: SkillStatus;
  score?: number;
  onClick?: () => void;
  className?: string;
}) {
  const config = {
    verified: {
      label: 'Verified',
      icon: CheckCircle2,
      badgeClass:
        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
    },
    claimed: {
      label: 'Claimed',
      icon: Clock,
      badgeClass:
        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
      iconClass: 'text-amber-600 dark:text-amber-400',
    },
    'not-verified': {
      label: 'Not Verified',
      icon: HelpCircle,
      badgeClass:
        'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25 hover:border-slate-400/50',
      iconClass: 'text-slate-600 dark:text-slate-400',
    },
  }[status];

  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 select-none',
        config.badgeClass,
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
    >
      <Icon className={cn('w-3.5 h-3.5', config.iconClass)} />
      <span className="font-semibold text-[var(--text-primary)]">{skill}</span>
      <span className="opacity-80">·</span>
      <span className="text-[11px] uppercase tracking-wider">{config.label}</span>
      {score !== undefined && status === 'verified' && (
        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-[10px] font-bold">
          {score}/10
        </span>
      )}
    </div>
  );
}
