'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Laptop, CheckCircle2 } from 'lucide-react';

export function ThemeSelector() {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme();

  const currentPref = mounted ? theme : 'system';

  const options = [
    {
      id: 'light',
      label: 'Light Mode',
      desc: 'Clean white surfaces with high contrast dark typography and subtle borders.',
      icon: Sun,
      iconColor: 'text-amber-500',
      badgeBg: 'bg-amber-500/10 border-amber-500/20',
      previewBg: 'bg-[#F8FAFC] border-slate-200 text-slate-900',
      previewCard: 'bg-white border-slate-200 text-slate-800',
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      desc: 'Refined dark slate surfaces designed for low eye strain and high readability.',
      icon: Moon,
      iconColor: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10 border-indigo-500/20',
      previewBg: 'bg-[#0B0F17] border-[#232C3E] text-slate-100',
      previewCard: 'bg-[#161D2B] border-[#232C3E] text-slate-200',
    },
    {
      id: 'system',
      label: 'System Preference',
      desc: 'Automatically synchronizes with your operating system light/dark schedule.',
      icon: Laptop,
      iconColor: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 border-blue-500/20',
      previewBg: 'bg-gradient-to-r from-[#F8FAFC] to-[#0B0F17] border-slate-300 text-slate-800',
      previewCard: 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)]',
    },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = currentPref === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'border-[var(--accent)] bg-[var(--bg-card)] ring-2 ring-[var(--accent)]/30 shadow-md'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)]/60 hover:bg-[var(--bg-card)] hover:border-[var(--border-hover)]'
              }`}
            >
              {/* Header with Icon and Radio Check */}
              <div className="flex items-start justify-between mb-3 w-full">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${opt.badgeBg}`}
                >
                  <Icon className={`w-4 h-4 ${opt.iconColor}`} />
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm'
                      : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {opt.label}
                  </span>
                  {opt.id === 'system' && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                      Auto ({resolvedTheme})
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {opt.desc}
                </p>
              </div>

              {/* Mini Surface Visual Representation */}
              <div
                className={`w-full p-2.5 rounded-xl border text-[11px] font-medium flex items-center justify-between ${opt.previewBg}`}
              >
                <span className="truncate">Sample Surface</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${opt.previewCard}`}>
                  Card
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
