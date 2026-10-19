'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useUserProfile } from './UserContext';

export function UserProfileModal() {
  const { user, isModalOpen, saveProfile } = useUserProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
      setEmail(user.email || '');
    }
  }, [user]);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setError('Please enter your real full name (at least 2 characters).');
      return;
    }
    if (trimmed.length > 60) {
      setError('Full name cannot exceed 60 characters.');
      return;
    }

    setIsSubmitting(true);
    const result = await saveProfile(trimmed, email);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Failed to save profile.');
    }
  };

  return (
    <AnimatePresence>
      <div data-no-print="true" className="no-print fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-2xl bg-[var(--bg-card)]/95 border border-[var(--border-color)]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-left"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--accent)] to-cyan-500 flex items-center justify-center shadow-lg shadow-[var(--accent)]/20 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Welcome to Smart Resume AI
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Let&apos;s get your profile set up
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
            Enter your display name to personalize your resume analyses, live job searches, and skill verification assessments.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                />
                <User className="w-4 h-4 text-[var(--text-secondary)]/50 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Email Address <span className="text-[10px] text-[var(--text-secondary)]/60 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-rose-400 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[var(--accent)] to-cyan-500 hover:opacity-95 active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Setting up your profile...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
