'use client';

import React, { useEffect, useState } from 'react';
import {
  FileSearch,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function AdminResumesPage() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/records?type=analyses');
      if (res.ok) {
        const json = await res.json();
        setAnalyses(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load resume analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const filtered = analyses.filter((a) =>
    (a.filename && a.filename.toLowerCase().includes(search.toLowerCase())) ||
    (a.user_name && a.user_name.toLowerCase().includes(search.toLowerCase())) ||
    (a.file_type && a.file_type.toLowerCase().includes(search.toLowerCase())) ||
    a.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border-color)] mb-2">
            <FileSearch className="w-3 h-3" />
            Resume Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Resume Analyses & Uploads
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Real ATS scoring breakdown, keyword detection, and parsing logs from user uploads.
          </p>
        </div>

        <button
          onClick={fetchAnalyses}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)] transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Records
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename or ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
          {filtered.length} of {analyses.length} analyses
        </span>
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)]">
            Loading analysis records from database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-8 h-8 text-[var(--text-secondary)]/50 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No resume analyses found.
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              When users upload and analyze a resume, parsing and ATS scores will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[var(--bg-elevated)]/60 text-[10px] uppercase font-bold text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4 text-center">ATS Score</th>
                  <th className="py-3 px-4 text-center">Keywords</th>
                  <th className="py-3 px-4 text-center">Formatting</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Analyzed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-[var(--bg-elevated)]/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[var(--text-primary)] truncate max-w-xs">
                        {a.filename || 'Pasted-Resume.txt'}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-mono">
                        {a.id}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {a.user_name || 'Name not provided'}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase text-[11px] font-bold text-[var(--text-secondary)]">
                      {a.file_type}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-black ${
                        a.ats_score >= 80 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' :
                        a.ats_score >= 60 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' :
                        'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                      }`}>
                        {a.ats_score}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[var(--text-primary)]">
                      {a.keyword_score}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[var(--text-primary)]">
                      {a.formatting_score}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        {a.analysis_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-[var(--text-secondary)]">
                      {new Date(a.analyzed_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
