'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  ExternalLink,
  MapPin,
  Building,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

interface JobApplication {
  id: string;
  user_id: string;
  job_id: string | null;
  job_title: string;
  company: string;
  location: string | null;
  source: string | null;
  job_url: string | null;
  applied_at: string;
  status: 'Saved' | 'Applied' | 'Interview' | 'Rejected' | 'Offer' | 'Withdrawn';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = [
  'All',
  'Saved',
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
] as const;

export default function UserApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formSource, setFormSource] = useState('Manual');
  const [formJobUrl, setFormJobUrl] = useState('');
  const [formAppliedAt, setFormAppliedAt] = useState('');
  const [formStatus, setFormStatus] = useState<'Saved' | 'Applied' | 'Interview' | 'Rejected' | 'Offer' | 'Withdrawn'>('Applied');
  const [formNotes, setFormNotes] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openCreateModal = () => {
    setEditingApp(null);
    setFormTitle('');
    setFormCompany('');
    setFormLocation('');
    setFormSource('Manual');
    setFormJobUrl('');
    setFormAppliedAt(new Date().toISOString().split('T')[0]);
    setFormStatus('Applied');
    setFormNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setFormTitle(app.job_title);
    setFormCompany(app.company);
    setFormLocation(app.location || '');
    setFormSource(app.source || 'Manual');
    setFormJobUrl(app.job_url || '');
    setFormAppliedAt(app.applied_at || '');
    setFormStatus(app.status);
    setFormNotes(app.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim() || !formCompany.trim()) {
      setFormError('Please enter both the Job Title and Company name.');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        id: editingApp?.id,
        jobTitle: formTitle.trim(),
        company: formCompany.trim(),
        location: formLocation.trim() || null,
        source: formSource.trim() || 'Manual',
        jobUrl: formJobUrl.trim() || null,
        appliedAt: formAppliedAt || new Date().toISOString().split('T')[0],
        status: formStatus,
        notes: formNotes.trim() || null,
      };

      const res = await fetch('/api/user/applications', {
        method: editingApp ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.message || 'Failed to save application.');
        setIsSaving(false);
        return;
      }

      setIsModalOpen(false);
      await fetchApplications();
    } catch {
      setFormError('Connection error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: JobApplication['status']) => {
    try {
      const res = await fetch('/api/user/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleDelete = async (appId: string) => {
    if (!confirm('Are you sure you want to remove this tracked application?')) return;
    try {
      const res = await fetch(`/api/user/applications?id=${encodeURIComponent(appId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== appId));
      }
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.location && app.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'Saved':
        return 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--border-color)]';
      case 'Applied':
        return 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)]';
      case 'Interview':
        return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20';
      case 'Offer':
        return 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20';
      case 'Rejected':
        return 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20';
      case 'Withdrawn':
        return 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]';
      default:
        return 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border-color)] gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Job Applications
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Track, update, and manage every stage of your job hunt in one private place.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[var(--bg-secondary)]/80 p-3.5 rounded-2xl border border-[var(--border-color)]">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search by job title, company, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--accent)] mb-3" />
          <p className="text-xs text-[var(--text-secondary)]">Loading your job applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-4 text-[var(--text-secondary)]">
            <Send className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            No applications match your criteria
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto mt-1 mb-6">
            Keep track of every role you apply for, from initial application to offer letter.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90 transition-all shadow-md shadow-[var(--accent)]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Application</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 hover:bg-[var(--bg-secondary)] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 hover:border-[var(--accent)]/30"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {app.job_title}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                  {app.source && (
                    <span className="text-[10px] font-medium text-[var(--text-secondary)] px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)]">
                      {app.source}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-[var(--accent)]" />
                    {app.company}
                  </span>
                  {app.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {app.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Applied: {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </div>

                {app.notes && (
                  <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-color)] mt-2 italic">
                    &ldquo;{app.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Status Select & Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                  title="Update Application Status"
                >
                  <option value="Saved">Saved</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>

                {app.job_url && (
                  <a
                    href={app.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all"
                    title="Open Job Listing"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => openEditModal(app)}
                  className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all cursor-pointer"
                  title="Edit details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(app.id)}
                  className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                  title="Delete Application"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-4">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {editingApp ? 'Edit Job Application' : 'Add New Job Application'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Stripe, Google, Acme Inc"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Remote, Bengaluru, New York"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Source / Platform
                  </label>
                  <input
                    type="text"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    placeholder="e.g. LinkedIn, Indeed, Company Site"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Applied Date
                  </label>
                  <input
                    type="date"
                    value={formAppliedAt}
                    onChange={(e) => setFormAppliedAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Current Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Withdrawn">Withdrawn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Job URL (Optional)
                </label>
                <input
                  type="url"
                  value={formJobUrl}
                  onChange={(e) => setFormJobUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Notes / Interview Details
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Notes about the recruiter contact, salary range, technical interview date..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingApp ? 'Save Changes' : 'Create Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
