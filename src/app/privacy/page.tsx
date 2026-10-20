import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, Server, RefreshCw, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Smart Resume AI',
  description:
    'Learn how Smart Resume AI handles your personal resume data, local SQLite storage, session security, and AI integrations.',
};

export default function PrivacyPolicyPage() {
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
            <Shield className="w-3.5 h-3.5" />
            Legal Documentation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Core Principles Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
            <Database className="w-5 h-5 text-[var(--accent)] mb-2" />
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1">Local Storage</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Resumes and accounts are stored in your secure local SQLite database instance.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
            <Lock className="w-5 h-5 text-[var(--accent)] mb-2" />
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1">Zero AI Training</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              When Gemini API is called, resume data is used solely for analysis and is never used to train models.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
            <Eye className="w-5 h-5 text-[var(--accent)] mb-2" />
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1">Full Control</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Export or delete your resumes and account data at any time from your dashboard.
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="space-y-10 text-sm leading-relaxed text-[var(--text-secondary)]">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              1. Information We Collect
            </h2>
            <p>
              Smart Resume AI collects information necessary to evaluate resumes, verify candidate skills, and match job descriptions. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--text-primary)]">Account Information:</strong> Full name, email address, and securely hashed passwords (using bcrypt with 10 salt rounds).
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Resume and Profile Data:</strong> Contact details, work experience, education history, skills, certifications, and uploaded resume documents (PDF, DOCX, TXT).
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Skill Assessment Records:</strong> Assessment scores, completion timestamps, certificate verification hashes, and question responses.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Session and Telemetry Data:</strong> Browser user agent, IP address for authentication logging, and session cookies for access management.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              2. How Your Data Is Stored and Protected
            </h2>
            <p>
              Your personal information is stored locally within an encrypted or protected SQLite database file (<code className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] font-mono text-xs">smart_resume.db</code>) managed by the host server instance.
            </p>
            <p>
              We implement industry-standard security safeguards:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Passwords are one-way hashed using bcrypt before insertion into the database.</li>
              <li>Authentication tokens are signed using JSON Web Tokens (JWT) and stored in secure, <code className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] font-mono text-xs">HttpOnly</code> cookies to guard against cross-site scripting (XSS).</li>
              <li>Administrative endpoints are strictly gated by server-side role validation middleware.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              3. Artificial Intelligence and Third-Party Processing
            </h2>
            <p>
              When an AI analysis feature is triggered (such as ATS scoring, bullet point enhancement, or career path guidance), your resume text may be transmitted via HTTPS to Google Gemini API:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Data transmitted to the Gemini API is processed ephemerally and is not retained or used by Google to train foundation models, pursuant to Google Cloud Enterprise Terms.</li>
              <li>If no API key is configured or offline mode is chosen, analysis falls back to our deterministic rule-based algorithms completely on-device.</li>
              <li>We do not sell, rent, or trade your career or personal data to data brokers, advertising networks, or third-party recruiters.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              4. Cookies and Session Tokens
            </h2>
            <p>
              Smart Resume AI uses functional cookies strictly necessary for system authentication and layout preference retention:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[var(--border-color)] rounded-lg overflow-hidden">
                <thead className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                  <tr>
                    <th className="p-2.5 font-semibold">Cookie Name</th>
                    <th className="p-2.5 font-semibold">Purpose</th>
                    <th className="p-2.5 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  <tr>
                    <td className="p-2.5 font-mono text-[var(--accent)]">auth_token</td>
                    <td className="p-2.5">User authentication state and session validation</td>
                    <td className="p-2.5">7 days</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-[var(--accent)]">admin_token</td>
                    <td className="p-2.5">Administrative portal access authentication</td>
                    <td className="p-2.5">24 hours</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-[var(--accent)]">smart_resume_theme</td>
                    <td className="p-2.5">Local visual theme preference (light/dark)</td>
                    <td className="p-2.5">Persistent (localStorage)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              5. Your Rights and Data Portability
            </h2>
            <p>
              You maintain complete ownership of your career data. At any time, you may:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Request export of all resumes, assessments, and profile metrics in standard JSON or PDF format.</li>
              <li>Request full account deletion. Upon confirmation, your user records, uploaded files, and certificates are permanently purged from the database.</li>
              <li>Revoke active sessions by logging out across devices.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              6. Contact and Inquiries
            </h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy, your stored data, or security procedures, please contact our administrative team via the feedback portal or directly at:
            </p>
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
              <p className="text-xs font-semibold text-[var(--text-primary)]">Data Protection Officer</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Smart Resume AI Engineering Team</p>
              <a
                href="mailto:kiran81232@gmail.com"
                className="text-xs text-[var(--accent)] hover:underline inline-block mt-1"
              >
                kiran81232@gmail.com
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
