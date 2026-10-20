'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive' | 'accent';
  glow?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  glow = false,
  ...props
}: GlassCardProps) {
  const variantStyles = {
    default:
      'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-xs',
    elevated:
      'bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-sm text-[var(--text-primary)]',
    interactive:
      'bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent)]/70 hover:shadow-sm active:scale-[0.995] transition-all duration-180 ease-out cursor-pointer text-[var(--text-primary)]',
    accent:
      'bg-[var(--bg-card)] border border-[var(--accent)]/40 shadow-xs text-[var(--text-primary)]',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl p-5 sm:p-6 transition-all duration-180',
        variantStyles[variant],
        glow && 'border-[var(--accent)]/50 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
