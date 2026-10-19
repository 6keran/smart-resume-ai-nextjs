'use client';

import React from 'react';
import {
  Settings,
  ShieldCheck,
  Database,
  Lock,
  Server,
  HardDrive,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ThemeSelector } from '@/components/theme/ThemeSelector';

export default function AdminSettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/25 mb-2">
          <Settings className="w-3 h-3" />
          System Settings
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
          System Configuration & Security
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Server-side database parameters, security tokens, and administrative roles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Engine Status */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Database Engine Status
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Node.js Native SQLite Engine
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Database Driver</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">node:sqlite (DatabaseSync)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Storage Path</span>
              <span className="font-mono text-[var(--text-primary)]">data/smart_resume.db</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Journal Mode</span>
              <span className="font-bold text-emerald-400">WAL (Write-Ahead Logging)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Concurrency Level</span>
              <span className="font-bold text-emerald-400">High / Multi-reader Single-writer</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[var(--text-secondary)]">Schema Integrity</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                9 Tables Verified & Indexed
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Security & Authentication */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Authentication & Sessions
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Cryptographic session enforcement
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Password Hash Algorithm</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">crypto.scrypt (Salted 64-byte)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Session Token Scheme</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">HMAC-SHA256 Signed</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Cookie Security</span>
              <span className="font-bold text-emerald-400">HttpOnly · SameSite=Lax</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Session Duration</span>
              <span className="font-semibold text-[var(--text-primary)]">7 Days (Auto-refresh on login)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[var(--text-secondary)]">Edge Middleware</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active on /admin/* routes
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Appearance & Display Mode */}
        <GlassCard className="p-6 space-y-4 md:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Appearance & Display Mode
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Admin console visual theme configuration
                </p>
              </div>
            </div>
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Global Preference
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            Select the visual theme for administrative sessions. Settings synchronize immediately and persist across device sessions.
          </p>

          <ThemeSelector />
        </GlassCard>

        {/* Platform Telemetry Architecture */}
        <GlassCard className="p-6 space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Platform Telemetry & Privacy Pipeline
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Separation of public user flow from administrative intelligence
              </p>
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Public visitors use Smart Resume AI without mandatory account registration. Every resume scan, skill assessment, live job search, and candidate match is anonymously aggregated and timestamped in the persistent local SQLite database. Telemetry calculations (averages, counts, trends) are queried server-side using optimized SQL aggregations without exposing sensitive candidate records.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
