'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  RefreshCw,
  ChevronRight,
  UserCheck,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
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
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string; email: string } | null>(null);

  // Deletion modal state
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCurrentAdmin = async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.admin) {
          setCurrentAdmin(json.admin);
        }
      }
    } catch {
      // ignore
    }
  };

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
    fetchCurrentAdmin();
  }, []);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete user.');
      }

      setFeedback({
        type: 'success',
        message: data.message || `User "${userToDelete.name}" was permanently removed.`,
      });
      setUserToDelete(null);
      await fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const isSelf = Boolean(
    userToDelete &&
      currentAdmin &&
      (currentAdmin.id === userToDelete.id ||
        (userToDelete.email && currentAdmin.email.toLowerCase() === userToDelete.email.toLowerCase()))
  );

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
            Registered candidate accounts, aggregated telemetry, and administrative actions ({users.length} total).
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

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
              Registered candidates will appear here as accounts are created.
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
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredUsers.map((u) => {
                  const isCurrentAdminRow = Boolean(
                    currentAdmin &&
                      (currentAdmin.id === u.id ||
                        (u.email && currentAdmin.email.toLowerCase() === u.email.toLowerCase()))
                  );

                  return (
                    <tr key={u.id} className="hover:bg-[var(--bg-elevated)]/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-bold text-xs flex items-center justify-center border border-[var(--accent)]/25 shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-[var(--text-primary)] block">
                              {u.name}
                            </span>
                            {isCurrentAdminRow && (
                              <span className="text-[10px] text-[var(--accent)] font-medium">
                                (Current Admin)
                              </span>
                            )}
                          </div>
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
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--accent)] hover:text-white text-xs font-semibold text-[var(--text-primary)] transition-all border border-[var(--border-color)]"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => {
                              setUserToDelete(u);
                              setDeleteError(null);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold transition-all border border-red-500/20"
                            title={`Remove user ${u.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl p-6 space-y-5 text-left">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Remove User Account
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Confirm deletion of candidate profile and associated records.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {deleteError && (
              <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Self Deletion Prohibition Notice */}
            {isSelf ? (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Self-Deletion Prohibited</p>
                  <p className="text-[11px] mt-1 text-amber-200/80 leading-relaxed">
                    You are currently authenticated as this administrator account. Administrators cannot delete their own account from the Admin Console.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Account Details Box */}
                <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">Candidate Name:</span>
                    <span className="font-bold text-[var(--text-primary)]">{userToDelete.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">Email Address:</span>
                    <span className="font-mono text-[var(--text-primary)]">{userToDelete.email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">User Identifier:</span>
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">{userToDelete.id}</span>
                  </div>
                </div>

                {/* Impact Summary */}
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <p className="font-semibold text-[var(--text-primary)]">
                    Associated candidate data that will be permanently purged:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-[var(--text-muted)]">
                    <li>{userToDelete.resumes_count || 0} uploaded resumes and version histories</li>
                    <li>{userToDelete.analyses_count || 0} ATS analyses and keyword score logs</li>
                    <li>{userToDelete.assessments_count || 0} assessment attempts and question snapshots</li>
                    <li>{userToDelete.verified_skills_count || 0} verified skills and issued certificates</li>
                    <li>All tracked job applications and tailored phrasing records</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15 text-[11px] text-red-400">
                  <span className="font-bold">Warning:</span> This action is permanent and cannot be undone.
                </div>
              </>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)] transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting || isSelf}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-red-600/20"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Remove User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
