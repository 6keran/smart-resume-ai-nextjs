'use client';

import React from 'react';
import { LucideIcon, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionText,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-10 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)]/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 h-[42px] px-5 rounded-lg bg-[var(--accent)] text-white font-medium text-sm hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export function LoadingState({
  title = 'Processing Intelligence...',
  message = 'Analyzing structure and computing optimal recommendations.',
  className = '',
}: {
  title?: string;
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-12 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] ${className}`}
    >
      <div className="relative mb-5">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--accent)]/20 border-t-[var(--accent)] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[var(--accent)] animate-pulse" />
        </div>
      </div>
      <h4 className="text-base font-semibold text-[var(--text-primary)] mb-1">{title}</h4>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm">{message}</p>
    </div>
  );
}

export function ErrorState({
  title = 'Service Temporarily Unavailable',
  message = 'We encountered an unexpected condition while communicating with the service. Please try again shortly.',
  onRetry,
  className = '',
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-10 rounded-xl border border-rose-500/20 bg-rose-500/5 ${className}`}
    >
      <div className="w-12 h-12 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-[var(--text-primary)] mb-1">{title}</h4>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 h-[38px] px-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </button>
      )}
    </div>
  );
}
