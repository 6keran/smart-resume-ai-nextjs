import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, CheckCircle2, AlertTriangle, Scale, ShieldCheck, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Smart Resume AI',
  description:
    'Review the terms of service, platform usage guidelines, AI evaluation disclaimers, and skill certification rules for Smart Resume AI.',
};

export default function TermsPage() {
  const lastUpdated = 'October 14, 2026';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Navigation Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>

        {/* Page Header */}
        <div className="border-b border-[var(--border-color)] pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border-color)] mb-4">
            <FileText className="w-3.5 h-3.5" />
            Terms of Service
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-3">
            Terms & Conditions
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Core Notice Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1">Your Content Ownership</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              You retain all intellectual property rights to resumes, project descriptions, and personal profiles you create.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
            <AlertTriangle className="w-5 h-5 text-amber-500 mb-2" />
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1">Advisory Intelligence</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              ATS scores, keyword suggestions, and job matches are computational estimates and do not guarantee hiring outcomes.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
            <ShieldCheck className="w-5 h-5 text-[var(--accent)] mb-2" />
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1">Assessment Integrity</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Skill certificates are issued based on verified assessment sessions. Fraudulent test attempts will result in revocation.
            </p>
          </div>
        </div>

        {/* Terms Content */}
        <div className="space-y-10 text-sm leading-relaxed text-[var(--text-secondary)]">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, registering with, or utilizing any services provided by Smart Resume AI (the &ldquo;Platform&rdquo;), you agree to be legally bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue using the platform immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              2. Nature of Services and AI Disclaimer
            </h2>
            <p>
              Smart Resume AI provides automated resume analysis, document creation, skill evaluation, and job matching assistance. You acknowledge and understand that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--text-primary)]">Estimates and Guidance Only:</strong> ATS compatibility scores, improvement suggestions, bullet point rewrites, and job match percentages are calculated algorithmically and through large language models. They serve as guidance and do not guarantee employment, interview callbacks, or recruiter approval.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">User Review Responsibility:</strong> You are solely responsible for reviewing and verifying the factual accuracy of any resume content generated or edited with the assistance of AI tools prior to submitting to prospective employers.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">No False Representation:</strong> You agree not to use generated content to misrepresent your qualifications, work experience, education, or professional credentials.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              3. Skill Verification and Honor Code
            </h2>
            <p>
              Our skill assessment modules provide verifiable digital certificates with unique hash identifiers:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--text-primary)]">Independent Completion:</strong> You must complete assessments independently without unauthorized third-party intervention, script injection, or automated test takers.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Right of Revocation:</strong> Smart Resume AI administrators reserve the right to audit, flag, or revoke any certificate found to have been earned through timing exploits, tab switching violations, or dishonest means.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Non-Transferability:</strong> Issued certificates and skill badges are tied uniquely to the verified account and may not be transferred or resold.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              4. User Accounts and Security
            </h2>
            <p>
              When creating an account, you must provide truthful, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
            <p>
              Notify the administrative team immediately of any unauthorized account access. Smart Resume AI is not liable for any losses caused by unauthorized use of your credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              5. Acceptable Use Policy
            </h2>
            <p>
              You agree not to engage in any prohibited conduct, including but not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Uploading malicious files, viruses, corrupted documents, or code designed to disrupt database or server operation.</li>
              <li>Attempting to bypass authentication gateways, rate limiters, or administrative privilege boundaries.</li>
              <li>Reverse engineering or scraping assessment test questions or platform algorithms.</li>
              <li>Using the platform for any illegal, defamatory, harassing, or fraudulent activity.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              6. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, Smart Resume AI, its developers, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, employment opportunities, or goodwill, resulting from:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your access to or inability to access the platform.</li>
              <li>Any third-party hiring decisions, job application rejections, or interviews.</li>
              <li>Interruption of service, API downtime, or temporary data synchronization delays.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              7. Termination and Modifications
            </h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violation of these Terms. We may update these Terms periodically to reflect changes in legal requirements or platform features. Updated terms will take effect upon posting with a refreshed &ldquo;Last updated&rdquo; date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              8. Contact Information
            </h2>
            <p>
              For legal notices, compliance questions, or inquiries regarding these Terms and Conditions:
            </p>
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
              <p className="text-xs font-semibold text-[var(--text-primary)]">Legal Operations</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Smart Resume AI</p>
              <p className="text-xs text-[var(--accent)] mt-1">legal@smartresume.ai</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
