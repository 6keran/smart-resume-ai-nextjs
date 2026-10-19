'use client';

import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Search,
  RefreshCw,
  MapPin,
  Globe,
  Clock,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/records?type=jobs');
      if (res.ok) {
        const json = await res.json();
        setJobs(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load job searches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filtered = jobs.filter((j) =>
    j.query.toLowerCase().includes(search.toLowerCase()) ||
    (j.user_name && j.user_name.toLowerCase().includes(search.toLowerCase())) ||
    (j.location && j.location.toLowerCase().includes(search.toLowerCase())) ||
    j.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 mb-2">
            <Briefcase className="w-3 h-3" />
            Job Discovery Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Job Search Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Real candidate queries, locations, provider telemetry, and listing counts.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)] transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Searches
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
            placeholder="Search by query, location, or provider..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
          {filtered.length} of {jobs.length} search logs
        </span>
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)]">
            Loading job search queries from database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-8 h-8 text-[var(--text-secondary)]/50 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No job searches logged yet.
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Live searches conducted through Job Search will be persisted and displayed here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[var(--bg-elevated)]/60 text-[10px] uppercase font-bold text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Search Query</th>
                  <th className="py-3 px-4">Target Location</th>
                  <th className="py-3 px-4">Data Provider</th>
                  <th className="py-3 px-4 text-center">Results Returned</th>
                  <th className="py-3 px-4 text-right">Searched At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filtered.map((j) => (
                  <tr key={j.id} className="hover:bg-[var(--bg-elevated)]/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      {j.user_name || 'Name not provided'}
                    </td>
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                      {j.query}
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[var(--accent)]" />
                        {j.location || 'India'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                        <Globe className="w-3 h-3" />
                        {j.provider}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-black text-xs text-emerald-400">
                      {j.results_count} listings
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-[var(--text-secondary)]">
                      {new Date(j.searched_at).toLocaleString()}
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
