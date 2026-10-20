'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Star,
  Sparkles,
  CheckCircle2,
  Send,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { useCareer } from '@/context/CareerContext';
import { GlassCard } from '@/components/ui/GlassCard';

export default function FeedbackPage() {
  const { submitFeedback } = useCareer();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<'ATS Analyzer' | 'Resume Builder' | 'Skill Verification' | 'Job Matching' | 'General UX' | 'Other'>('ATS Analyzer');
  const [feedback, setFeedback] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    await submitFeedback({
      rating,
      category,
      feedback,
      suggestions,
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          Feedback
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Share your feedback, report issues, or suggest improvements for Smart Resume AI.
        </p>
      </div>

      {!isSubmitted ? (
        <GlassCard className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Rating Stars */}
            <div className="space-y-2">
              <label className="block font-semibold text-sm text-[var(--text-primary)]">
                How would you rate your overall experience with Smart Resume AI?
              </label>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                          (hoverRating !== null ? hoverRating >= star : rating >= star)
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)] shrink-0">
                  {rating === 5
                    ? 'Exceptional'
                    : rating === 4
                    ? 'Very Good'
                    : rating === 3
                    ? 'Satisfactory'
                    : 'Needs Improvement'}
                </span>
              </div>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-[var(--text-primary)]">
                Which feature area are you providing feedback on?
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="ATS Analyzer">AI Resume Analyzer & ATS Score</option>
                <option value="Resume Builder">Resume Builder & A4 Templates</option>
                <option value="Skill Verification">Skill Verification & Assessments</option>
                <option value="Job Matching">Job Match Engine & Search</option>
                <option value="General UX">Platform Speed & Visual Design</option>
                <option value="Other">Other / Feature Suggestion</option>
              </select>
            </div>

            {/* Feedback Message */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-[var(--text-primary)]">
                Detailed Feedback <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What did you love? Where did you encounter friction or unexpected results?"
                className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-xs leading-relaxed"
              />
            </div>

            {/* Suggestions for new features */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-[var(--text-primary)]">
                Suggestions for Future Features (Optional)
              </label>
              <input
                type="text"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder="e.g. LinkedIn sync, Cover Letter generator, GitHub project repo analyzer..."
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !feedback.trim()}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs sm:text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </GlassCard>
      ) : (
        /* Celebration / Success Card after submit */
        <GlassCard className="p-10 text-center space-y-5 animate-fade-in" glow>
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[var(--text-primary)]">
              Thank You for Your Feedback!
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              We have received your submission. Your suggestions help us refine our AI algorithms and
              empower technical professionals worldwide.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold shadow-md"
            >
              Go To Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setFeedback('');
                setSuggestions('');
                setIsSubmitted(false);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Submit Another Response
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
