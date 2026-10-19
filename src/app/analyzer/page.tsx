'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Award,
  Wand2,
  Target,
  X,
  FileCheck,
  AlertCircle,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { GlassCard } from '@/components/ui/GlassCard';

export type AnalyzerState =
  | 'IDLE'
  | 'FILE_SELECTED'
  | 'UPLOADING'
  | 'EXTRACTING'
  | 'ANALYZING'
  | 'SUCCESS'
  | 'ERROR';

export default function ResumeAnalyzerPage() {
  const {
    analysisResult,
    setAnalysisResult,
    runAnalysis,
    resetToSampleResume,
    loadFresherSample,
  } = useResume();

  const [state, setState] = useState<AnalyzerState>(
    analysisResult ? 'SUCCESS' : 'IDLE'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stageDescription, setStageDescription] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [showJobDescriptionInput, setShowJobDescriptionInput] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBusy =
    state === 'UPLOADING' || state === 'EXTRACTING' || state === 'ANALYZING';

  // Format file size nicely
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Validate incoming file
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!hasValidExt) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload a PDF, DOCX, or TXT file.',
      };
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: 'File size exceeds the 10MB limit. Please upload a smaller file.',
      };
    }

    if (file.size === 0) {
      return {
        valid: false,
        error: 'Unable to read this resume. The file appears to be empty.',
      };
    }

    return { valid: true };
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (isBusy) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processSelectedFile(file);
    }
  };

  // Handle file picker selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file.');
      setState('ERROR');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setState('FILE_SELECTED');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setState(analysisResult ? 'SUCCESS' : 'IDLE');
  };

  // Trigger real analysis on the selected file
  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setErrorMessage(null);
    setState('UPLOADING');
    setStageDescription('Reading resume and initiating secure pipeline...');

    try {
      // Step: UPLOADING -> EXTRACTING
      setTimeout(() => {
        setState((current) => {
          if (current === 'UPLOADING') {
            setStageDescription('Extracting resume structure and text content...');
            return 'EXTRACTING';
          }
          return current;
        });
      }, 500);

      // Step: EXTRACTING -> ANALYZING
      setTimeout(() => {
        setState((current) => {
          if (current === 'EXTRACTING') {
            setStageDescription(
              'Analyzing ATS compatibility, checking keywords & generating top prioritized suggestions...'
            );
            return 'ANALYZING';
          }
          return current;
        });
      }, 1200);

      const result = await runAnalysis(selectedFile, jobDescription);
      if (result) {
        setState('SUCCESS');
      } else {
        throw new Error('AI analysis is temporarily unavailable. Please try again in a moment.');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'AI analysis is temporarily unavailable. Please try again in a moment.';
      setErrorMessage(msg);
      setState('ERROR');
    }
  };

  // Handle direct text analysis (sample or pasted)
  const handleTextAnalysis = async (text: string, title: string, customJd?: string) => {
    if (!text || text.trim().length < 20) {
      setErrorMessage('Unable to read this resume. Text content is too short.');
      setState('ERROR');
      return;
    }

    setSelectedFile(null);
    setErrorMessage(null);
    setState('ANALYZING');
    setStageDescription(`Analyzing ${title} ATS compatibility and top suggestions...`);

    try {
      const jdToUse = typeof customJd === 'string' ? customJd : jobDescription;
      const result = await runAnalysis(text, jdToUse);
      if (result) {
        setState('SUCCESS');
      } else {
        throw new Error('AI analysis is temporarily unavailable. Please try again in a moment.');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'AI analysis is temporarily unavailable. Please try again in a moment.';
      setErrorMessage(msg);
      setState('ERROR');
    }
  };

  const handleResetToUpload = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setState('IDLE');
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border-color)] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            ATS Compatibility Scanner
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            AI Resume Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Audit your resume with Gemini AI against 45+ enterprise ATS heuristics and keyword models.
          </p>
        </div>

        {/* Quick Sample Loaders */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              resetToSampleResume();
              handleTextAnalysis(
                'Candidate Profile\nSenior Full Stack & AI Systems Engineer\nSan Francisco, CA\nSummary: Staff Full Stack Engineer with 7+ years architecting enterprise distributed microservices, TypeScript/React applications, and LLM fine-tuning pipelines. Spearheaded microservice decoupling resulting in 40% reduction in API latencies.\nSkills: Python, TypeScript, React, Next.js, Node.js, AWS, Docker, Kubernetes, PostgreSQL, GraphQL, Redis, CI/CD, System Design, Unit Testing, Jest\nExperience: Staff Software Engineer at CloudScale Technologies. Built multi-region data indexing pipelines processing 25M daily events.',
                'Senior Engineer Sample'
              );
            }}
            className="px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Try Senior Resume
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              loadFresherSample();
              handleTextAnalysis(
                'Maya Chen\nJunior Software & Data Engineer\nAustin, TX\nSummary: Motivated Computer Science graduate with hands-on expertise in Python, SQL, React, and data analytics pipelines. Developed multiple end-to-end full stack web platforms during university capstones.\nSkills: Python, SQL, React, JavaScript, Git, Data Analysis, Docker, REST API, HTML5, CSS3, PostgreSQL\nEducation: B.S. in Computer Science, University of Texas at Austin, GPA 3.91\nProjects: Algorithmic Trading Simulator in Python using Pandas; Campus Exchange Platform in React and PostgreSQL.',
                'Graduate Sample'
              );
            }}
            className="px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Try Graduate Resume
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => setShowPasteModal(true)}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border-color)] hover:border-[var(--accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Paste Text
          </button>
        </div>
      </div>

      {/* Target Job Description (Optional Accordion) */}
      {!isBusy && state !== 'SUCCESS' && (
        <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-left space-y-2">
          <button
            type="button"
            onClick={() => setShowJobDescriptionInput(!showJobDescriptionInput)}
            className="w-full flex items-center justify-between text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--accent)]" />
              Target Job Description (Optional)
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] font-normal">
              {jobDescription
                ? `✓ Configured (${jobDescription.split(/\s+/).filter(Boolean).length} words)`
                : showJobDescriptionInput
                ? 'Collapse'
                : '+ Add to tailor top 3 improvements'}
            </span>
          </button>
          {showJobDescriptionInput && (
            <div className="pt-2 space-y-2 animate-fade-in">
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Paste a target job posting below to tailor the 3 suggestions specifically to the role&apos;s required skills, tech stack, and qualifications.
              </p>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste target job description, key requirements, or qualifications here..."
                rows={3}
                className="w-full p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] resize-y"
              />
              {jobDescription && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--accent)]">
                    Target job description will be applied to the next analysis.
                  </span>
                  <button
                    type="button"
                    onClick={() => setJobDescription('')}
                    className="text-rose-400 hover:underline"
                  >
                    Clear Job Description
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Upload / File Zone */}
      {!isBusy && state !== 'SUCCESS' && (
        <div
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`relative p-8 sm:p-10 rounded-2xl border-2 border-dashed transition-all duration-200 text-center ${
            dragActive
              ? 'border-[var(--accent)] bg-[var(--accent)]/10 scale-[1.01]'
              : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--accent)]/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="resume-file-input"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* IDLE state or ERROR state */}
          {(!selectedFile || state === 'IDLE' || state === 'ERROR') && (
            <div>
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] mx-auto flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-1">
                Drop your resume here
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-5">
                Supports PDF or DOCX (up to 10MB) · Instant parsing with zero data retention
              </p>

              <div className="flex items-center justify-center gap-3">
                <label
                  htmlFor="resume-file-input"
                  className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white text-xs sm:text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  Browse Files
                </label>
              </div>
            </div>
          )}

          {/* FILE_SELECTED state */}
          {selectedFile && state === 'FILE_SELECTED' && (
            <div className="space-y-5 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <FileCheck className="w-7 h-7" />
              </div>

              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] max-w-md mx-auto">
                <FileText className="w-5 h-5 text-[var(--accent)] shrink-0" />
                <div className="text-left min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {formatFileSize(selectedFile.size)} · Ready for extraction
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  title="Remove file"
                  className="p-1 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-rose-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs sm:text-sm font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-lg shadow-[var(--accent)]/25 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze Resume Now
                </button>
                <label
                  htmlFor="resume-file-input"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs sm:text-sm font-medium hover:bg-[var(--bg-elevated)] transition-all"
                >
                  Replace File
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ERROR View Banner */}
      {state === 'ERROR' && errorMessage && (
        <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-left space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-300">Analysis Error</h4>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-8">
            {selectedFile ? (
              <button
                type="button"
                onClick={handleStartAnalysis}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Analysis
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleResetToUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs font-semibold hover:bg-[var(--bg-elevated)] transition-all"
            >
              Upload Another File
            </button>
          </div>
        </div>
      )}

      {/* Multi-stage Animated Loading View (True UI State) */}
      {isBusy && (
        <GlassCard className="p-10 text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-full border-4 border-[var(--border-color)] border-t-[var(--accent)] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Cpu className="w-8 h-8 text-[var(--accent)]" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-[var(--accent)]/15 text-[var(--accent)] uppercase tracking-wider">
              {state === 'UPLOADING' && 'Step 1 of 3: Uploading File'}
              {state === 'EXTRACTING' && 'Step 2 of 3: Text Extraction'}
              {state === 'ANALYZING' && 'Step 3 of 3: AI ATS Intelligence'}
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              {stageDescription || 'Evaluating resume architecture...'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Cross-referencing formatting, keyword density, and quantified impact metrics.
            </p>
          </div>

          <div className="max-w-xs mx-auto w-full bg-[var(--bg-secondary)] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[var(--accent)] h-full transition-all duration-500 ease-out"
              style={{
                width:
                  state === 'UPLOADING'
                    ? '30%'
                    : state === 'EXTRACTING'
                    ? '65%'
                    : '92%',
              }}
            />
          </div>
        </GlassCard>
      )}

      {/* SUCCESS: Analysis Results View */}
      {state === 'SUCCESS' && analysisResult && !isBusy && (
        <div className="space-y-8 animate-fade-in">
          {/* Action bar above results */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  Analysis Complete
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {selectedFile ? selectedFile.name : 'Uploaded Resume Content'} · {analysisResult.wordCount} words analyzed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/jobs?from=analyzer&keywords=${encodeURIComponent(
                  (analysisResult.detectedKeywords || []).slice(0, 3).join(', ')
                )}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-sm"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Find Matching Jobs
              </Link>
              <button
                type="button"
                onClick={handleResetToUpload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-medium transition-all"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload New Resume
              </button>
            </div>
          </div>

          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Overall Score */}
            <GlassCard className="md:col-span-2 flex flex-col sm:flex-row items-center justify-between p-6 gap-6">
              <div className="text-left space-y-2">
                <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                  Overall ATS Compatibility
                </span>
                <h3 className="text-2xl font-black text-[var(--text-primary)]">
                  {analysisResult.overallAtsScore >= 80
                    ? 'Excellent ATS Grade'
                    : analysisResult.overallAtsScore >= 70
                    ? 'Competitive Foundation'
                    : 'Needs Optimization'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs">
                  {analysisResult.summaryFeedback ||
                    'Your resume demonstrates verified technical competencies. Aligning missing keywords will maximize search indexing.'}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <Link
                    href="/improver"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-all"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Open in Improver
                  </Link>
                  <Link
                    href="/job-match"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-semibold hover:bg-[var(--bg-secondary)] transition-all"
                  >
                    <Target className="w-3.5 h-3.5" />
                    Job Match
                  </Link>
                </div>
              </div>

              <ScoreRing
                score={analysisResult.overallAtsScore}
                size={130}
                strokeWidth={10}
                subLabel="ATS SCORE"
              />
            </GlassCard>

            {/* Keyword Match */}
            <GlassCard className="flex flex-col items-center justify-center p-5 text-center">
              <ScoreRing
                score={analysisResult.keywordMatchScore}
                size={90}
                strokeWidth={7}
                showPercentage
              />
              <span className="mt-2 text-xs font-bold text-[var(--text-primary)]">
                Keyword Match
              </span>
              <span className="text-[10px] text-[var(--text-secondary)]">Technical Terms</span>
            </GlassCard>

            {/* Formatting Score */}
            <GlassCard className="flex flex-col items-center justify-center p-5 text-center">
              <ScoreRing
                score={analysisResult.formattingScore}
                size={90}
                strokeWidth={7}
                showPercentage
              />
              <span className="mt-2 text-xs font-bold text-[var(--text-primary)]">
                Formatting Score
              </span>
              <span className="text-[10px] text-[var(--text-secondary)]">Structure & Layout</span>
            </GlassCard>

            {/* Content Score */}
            <GlassCard className="flex flex-col items-center justify-center p-5 text-center">
              <ScoreRing
                score={analysisResult.contentScore}
                size={90}
                strokeWidth={7}
                showPercentage
              />
              <span className="mt-2 text-xs font-bold text-[var(--text-primary)]">
                Content Score
              </span>
              <span className="text-[10px] text-[var(--text-secondary)]">Impact & Metrics</span>
            </GlassCard>
          </div>

          {/* Keywords Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Detected Keywords ({analysisResult.detectedKeywords.length})
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                These keywords were parsed and matched to industry engineering roles:
              </p>
              <div className="flex flex-wrap gap-2">
                {analysisResult.detectedKeywords.length > 0 ? (
                  analysisResult.detectedKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                    >
                      ✓ {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--text-secondary)]">
                    No technical keywords detected in standard taxonomy.
                  </span>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Missing Keywords ({analysisResult.missingKeywords.length})
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                Recommended terms to add based on senior level job postings:
              </p>
              <div className="flex flex-wrap gap-2">
                {analysisResult.missingKeywords.length > 0 ? (
                  analysisResult.missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/25"
                    >
                      + {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--text-secondary)]">
                    Comprehensive skill coverage detected.
                  </span>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Strengths Section */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Verified Resume Strengths
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysisResult.strengths.map((st) => (
                <div
                  key={st.id}
                  className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {st.section}
                  </span>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{st.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {st.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top 3 Prioritized Improvements Section */}
          <div className="space-y-4 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Top 3 Prioritized Improvements
                  </h2>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  The three most valuable actions to improve resume clarity, relevance, and ATS compatibility.
                </p>
              </div>
              <span className="self-start sm:self-auto px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border-color)]">
                {((analysisResult.topSuggestions && analysisResult.topSuggestions.length > 0)
                  ? analysisResult.topSuggestions.slice(0, 3)
                  : (analysisResult.weaknesses || []).slice(0, 3)).length} Prioritized Suggestion{((analysisResult.topSuggestions && analysisResult.topSuggestions.length > 0)
                  ? analysisResult.topSuggestions.slice(0, 3)
                  : (analysisResult.weaknesses || []).slice(0, 3)).length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="space-y-4">
              {((analysisResult.topSuggestions && analysisResult.topSuggestions.length > 0)
                ? analysisResult.topSuggestions.slice(0, 3)
                : (analysisResult.weaknesses || []).slice(0, 3).map((wk, idx) => ({
                    id: wk.id,
                    rank: idx + 1,
                    priority: (wk.severity === 'high' ? 'High' : wk.severity === 'low' ? 'Low' : 'Medium') as 'High' | 'Medium' | 'Low',
                    section: wk.section,
                    whatNeedsImprovement: wk.whatIsWrong,
                    whyItMatters: wk.whyItMatters,
                    howToImprove: wk.howToImprove,
                    example: undefined as string | undefined,
                  }))
              ).map((sug, idx) => {
                const rankNumber = sug.rank || idx + 1;
                const priority = sug.priority || 'Medium';

                return (
                  <GlassCard
                    key={sug.id || `sug_${rankNumber}`}
                    className="p-6 transition-all hover:border-[var(--accent)]/40"
                  >
                    {/* Header: Rank, Section, Priority */}
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                          #{rankNumber}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] px-2.5 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                          {sug.section || 'Resume Improvement'}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md border ${
                          priority === 'High'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : priority === 'Medium'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {priority} Priority
                      </span>
                    </div>

                    {/* 3 Core Blocks: What needs improvement, Why it matters, How to improve */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* 1. What needs improvement */}
                      <div className="p-4 rounded-xl bg-[var(--bg-secondary)] space-y-1.5 border border-rose-500/20">
                        <span className="font-bold text-rose-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          What needs improvement
                        </span>
                        <p className="text-[var(--text-primary)] font-medium leading-relaxed">
                          {sug.whatNeedsImprovement}
                        </p>
                      </div>

                      {/* 2. Why it matters */}
                      <div className="p-4 rounded-xl bg-[var(--bg-secondary)] space-y-1.5 border border-amber-500/20">
                        <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Why it matters
                        </span>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                          {sug.whyItMatters}
                        </p>
                      </div>

                      {/* 3. How to improve it */}
                      <div className="p-4 rounded-xl bg-[var(--bg-secondary)] space-y-1.5 border border-[var(--accent)]/30">
                        <span className="font-bold text-[var(--accent)] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                          <Wand2 className="w-3.5 h-3.5" />
                          How to improve it
                        </span>
                        <p className="text-[var(--text-primary)] font-medium leading-relaxed">
                          {sug.howToImprove}
                        </p>
                      </div>
                    </div>

                    {/* 4. Rewritten Example (when available) */}
                    {sug.example && (
                      <div className="mt-4 p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1.5">
                        <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider block">
                          Rewritten Example (Based on your resume)
                        </span>
                        <p className="text-xs font-mono text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                          &ldquo;{sug.example}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="mt-4 pt-3 border-t border-[var(--border-color)]/60 flex items-center justify-end gap-2">
                      <Link
                        href="/improver"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-all"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        Apply in Improver
                      </Link>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Paste Text Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Paste Resume Content Directly
            </h3>
            <textarea
              rows={8}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste raw text or markdown from your resume..."
              className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-mono focus:outline-none focus:border-[var(--accent)]"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasteModal(false);
                  if (customText.trim()) {
                    handleTextAnalysis(customText, 'Pasted Resume');
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
              >
                Run AI Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
