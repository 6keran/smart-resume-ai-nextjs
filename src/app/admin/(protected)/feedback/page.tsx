'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Star,
  CheckCircle,
  Filter,
  Check,
  Tag,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function AdminFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reviewed'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all'
        ? '/api/admin/records?type=feedback'
        : `/api/admin/records?type=feedback&filter=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setFeedbackList(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const markReviewed = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'reviewed' }),
      });
      if (res.ok) {
        setFeedbackList((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: 'reviewed' } : f))
        );
      }
    } catch (err) {
      console.error('Failed to update feedback:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = feedbackList.filter((f) =>
    (f.user_name && f.user_name.toLowerCase().includes(search.toLowerCase())) ||
    f.message.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase()) ||
    (f.suggestions && f.suggestions.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-pink-500/15 text-pink-400 border border-pink-500/25 mb-2">
            <MessageSquare className="w-3 h-3" />
            Candidate Voice
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            User Feedback & Reviews
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Real satisfaction ratings, usability reports, and feature recommendations from candidates.
          </p>
        </div>

        <button
          onClick={fetchFeedback}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)] transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feedback
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedback content..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          {(['all', 'new', 'reviewed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === s
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback List */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)]">
            Loading feedback records from database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-8 h-8 text-[var(--text-secondary)]/50 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No feedback records found.
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Feedback submitted through the public Feedback page will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {filtered.map((item) => (
              <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-[var(--bg-elevated)]/20 transition-colors">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                      {item.user_name || 'Name not provided'}
                    </span>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= item.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-zinc-600'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                      {item.category}
                    </span>

                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                      item.status === 'reviewed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                    &ldquo;{item.message}&rdquo;
                  </p>

                  {item.suggestions && (
                    <div className="text-xs text-[var(--text-secondary)] p-2.5 rounded-lg bg-[var(--bg-elevated)]/40 border border-[var(--border-color)]">
                      <span className="font-semibold text-[var(--text-primary)]">Suggestions: </span>
                      {item.suggestions}
                    </div>
                  )}

                  <div className="text-[10px] text-[var(--text-secondary)]">
                    Submitted: {new Date(item.created_at).toLocaleString()} · ID: {item.id}
                  </div>
                </div>

                {item.status !== 'reviewed' && (
                  <button
                    onClick={() => markReviewed(item.id)}
                    disabled={updatingId === item.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all shrink-0 active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {updatingId === item.id ? 'Updating...' : 'Mark as Reviewed'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
