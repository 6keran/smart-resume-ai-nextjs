'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Calendar,
  Clock,
  FileText,
  FileSearch,
  Award,
  BadgeCheck,
  Briefcase,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

interface UserListItem {
  id: string;
  name: string;
  email: string | null;
  created_at: string;
  last_active_at: string;
  resumes_count: number;
  analyses_count: number;
  searches_count: number;
  assessments_count: number;
  verified_skills_count: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/records?type=users');
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/25 mb-2">
            <Users className="w-3 h-3" />
            User Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Users
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Real registered candidate profiles, aggregated telemetry, and multi-feature activity records.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)] transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Users
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user name or email..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* Users Table */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)]">
            Loading real user profiles from database...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-8 h-8 text-[var(--text-secondary)]/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No user profiles found.
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Users who provide their Full Name when visiting Smart Resume AI will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[var(--bg-elevated)]/50 border-b border-[var(--border-color)] text-[var(--text-secondary)] text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Resumes</th>
                  <th className="py-3 px-4 text-center">Analyses</th>
                  <th className="py-3 px-4 text-center">Job Searches</th>
                  <th className="py-3 px-4 text-center">Assessments</th>
                  <th className="py-3 px-4 text-center">Verified Skills</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--bg-elevated)]/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-bold text-xs flex items-center justify-center border border-[var(--accent)]/25 shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {u.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs">
                      {u.email ? (
                        <span className="text-[var(--text-primary)] font-mono">{u.email}</span>
                      ) : (
                        <span className="text-[var(--text-secondary)]/60 italic">Not provided</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-[var(--text-primary)]">
                      {u.resumes_count || 0}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-[var(--text-primary)]">
                      {u.analyses_count || 0}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-[var(--text-primary)]">
                      {u.searches_count || 0}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-[var(--text-primary)]">
                      {u.assessments_count || 0}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-emerald-400">
                      {u.verified_skills_count || 0}
                    </td>

                    <td className="py-3 px-4 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                      {new Date(u.last_active_at).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--accent)] hover:text-white text-xs font-semibold text-[var(--text-primary)] transition-all border border-[var(--border-color)]"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
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
