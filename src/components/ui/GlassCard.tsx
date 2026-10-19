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
      'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]',
    elevated:
      'bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-md text-[var(--text-primary)]',
    interactive:
      'bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer text-[var(--text-primary)]',
    accent:
      'bg-[var(--bg-card)] border border-[var(--accent)]/50 shadow-sm text-[var(--text-primary)]',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl p-6 transition-all duration-200',
        variantStyles[variant],
        glow && 'border-[var(--accent)]/60 shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
