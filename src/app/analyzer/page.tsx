'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Briefcase,
  Check,
  Edit2,
  RotateCcw,
  Building,
  ChevronDown,
  ChevronUp,
  FileEdit,
  TrendingUp,
  ShieldAlert,
  FileWarning,
  Info,
} from 'lucide-react';
import { useResume, isImprovementAppliedToResume } from '@/context/ResumeContext';
import { ResumeValidationResult } from '@/types/resume';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { GlassCard } from '@/components/ui/GlassCard';

export type AnalyzerState =
  | 'IDLE'
  | 'FILE_SELECTED'
  | 'UPLOADING'
  | 'EXTRACTING'
  | 'ANALYZING'
  | 'SUCCESS'
  | 'ERROR'
  | 'INVALID_DOCUMENT'
  | 'UNCERTAIN_DOCUMENT';

export default function ResumeAnalyzerPage() {
  const router = useRouter();
  const {
    resumeData,
    updateSkills,
    targetJob,
    updateTargetJob,
    clearTargetJob,
    analysisResult,
    setAnalysisResult,
    runAnalysis,
    improvements,
    setImprovements,
    acceptImprovement,
    editImprovement,
    rejectImprovement,
    applyAllApprovedImprovements,
    regenerateImprovement,
    resetToSampleResume,
    loadFresherSample,
  } = useResume();

  const [state, setState] = useState<AnalyzerState>(
    analysisResult ? 'SUCCESS' : 'IDLE'
  );

  useEffect(() => {
    if (analysisResult && state === 'IDLE') {
      setState('SUCCESS');
    }
  }, [analysisResult, state]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ResumeValidationResult | null>(null);
  const [stageDescription, setStageDescription] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [showJobDescriptionInput, setShowJobDescriptionInput] = useState<boolean>(
    Boolean(targetJob.description || targetJob.title)
  );

  // Local job inputs for quick editing
  const [jobTitleInput, setJobTitleInput] = useState(targetJob.title || '');
  const [companyInput, setCompanyInput] = useState(targetJob.company || '');
  const [jobDescInput, setJobDescInput] = useState(targetJob.description || '');

  // Inline editing state for suggestions
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
  const [editTextValue, setEditTextValue] = useState<string>('');
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [applyToast, setApplyToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBusy =
    state === 'UPLOADING' || state === 'EXTRACTING' || state === 'ANALYZING';

  useEffect(() => {
    if (targetJob.title) setJobTitleInput(targetJob.title);
    if (targetJob.company) setCompanyInput(targetJob.company);
    if (targetJob.description) setJobDescInput(targetJob.description);
  }, [targetJob]);

  // Temporary toast notification
  const triggerToast = (msg: string) => {
    setApplyToast(msg);
    setTimeout(() => {
      setApplyToast(null);
    }, 3200);
  };

  // Format file size
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

  // Trigger analysis on file
  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setErrorMessage(null);
    setState('UPLOADING');
    setStageDescription('Reading resume and initiating secure pipeline...');

    try {
      setTimeout(() => {
        setState((current) => {
          if (current === 'UPLOADING') {
            setStageDescription('Extracting resume structure and text content...');
            return 'EXTRACTING';
          }
          return current;
        });
      }, 500);

      setTimeout(() => {
        setState((current) => {
          if (current === 'EXTRACTING') {
            setStageDescription(
              jobDescInput.trim()
                ? `Evaluating resume against target role (${jobTitleInput || 'Target Position'})...`
                : 'Analyzing ATS compatibility, checking keywords & generating top suggestions...'
            );
            return 'ANALYZING';
          }
          return current;
        });
      }, 1200);

      const result = await runAnalysis(
        selectedFile,
        jobDescInput.trim(),
        jobTitleInput.trim(),
        companyInput.trim()
      );
      if (result) {
        setState('SUCCESS');
      } else {
        throw new Error('AI analysis is temporarily unavailable. Please try again in a moment.');
      }
    } catch (err: any) {
      if (err?.validation) {
        setValidationResult(err.validation);
        if (err.validation.status === 'invalid') {
          setErrorMessage(err.validation.message || 'This document does not appear to be a resume or CV.');
          setState('INVALID_DOCUMENT');
          return;
        }
        if (err.validation.status === 'uncertain') {
          setErrorMessage(err.validation.message || 'This document has limited resume structure or appears incomplete.');
          setState('UNCERTAIN_DOCUMENT');
          return;
        }
      }
      const msg =
        err instanceof Error
          ? err.message
          : 'AI analysis is temporarily unavailable. Please try again in a moment.';
      setErrorMessage(msg);
      setState('ERROR');
    }
  };

  // Handle direct text analysis (sample or active resume or pasted)
  const handleTextAnalysis = async (
    text: string,
    title: string,
    customJd?: string,
    customRole?: string,
    customCompany?: string
  ) => {
    if (!text || text.trim().length < 20) {
      setErrorMessage('Unable to read this resume. Text content is too short.');
      setState('ERROR');
      return;
    }

    setSelectedFile(null);
    setValidationResult(null);
    setErrorMessage(null);
    setState('ANALYZING');
    setStageDescription(`Evaluating ${title} against ATS intelligence models...`);

    try {
      const jdToUse = typeof customJd === 'string' ? customJd : jobDescInput;
      const roleToUse = typeof customRole === 'string' ? customRole : jobTitleInput;
      const compToUse = typeof customCompany === 'string' ? customCompany : companyInput;

      const result = await runAnalysis(text, jdToUse, roleToUse, compToUse);
      if (result) {
        setState('SUCCESS');
      } else {
        throw new Error('AI analysis is temporarily unavailable. Please try again in a moment.');
      }
    } catch (err: any) {
      if (err?.validation) {
        setValidationResult(err.validation);
        if (err.validation.status === 'invalid') {
          setErrorMessage(err.validation.message || 'This document does not appear to be a resume or CV.');
          setState('INVALID_DOCUMENT');
          return;
        }
        if (err.validation.status === 'uncertain') {
          setErrorMessage(err.validation.message || 'This document has limited resume structure or appears incomplete.');
          setState('UNCERTAIN_DOCUMENT');
          return;
        }
      }
      const msg =
        err instanceof Error
          ? err.message
          : 'AI analysis is temporarily unavailable. Please try again in a moment.';
      setErrorMessage(msg);
      setState('ERROR');
    }
  };

  // Proceed with analysis when document is flagged as uncertain
  const handleProceedWithUncertain = async () => {
    setErrorMessage(null);
    setState('ANALYZING');
    setStageDescription('Proceeding with best-effort ATS heuristic analysis...');

    try {
      const inputToUse = selectedFile || customText || undefined;
      const result = await runAnalysis(
        inputToUse,
        jobDescInput.trim(),
        jobTitleInput.trim(),
        companyInput.trim(),
        { allowUncertainOverride: true }
      );
      if (result) {
        setState('SUCCESS');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'AI analysis is temporarily unavailable.');
      setState('ERROR');
    }
  };

  // Analyze active builder resume in 1 click
  const handleAnalyzeBuilderResume = () => {
    const text = `${resumeData.personalInfo.fullName}\n${resumeData.personalInfo.headline || ''}\n${resumeData.summary}\nSkills: ${resumeData.skills.technical.join(', ')}\nExperience:\n${resumeData.experience
      .map((e) => `${e.role} at ${e.company}: ${e.bulletPoints.join(' ')}`)
      .join('\n')}`;

    handleTextAnalysis(text, `${resumeData.personalInfo.fullName}'s Resume`);
  };

  const handleResetToUpload = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setErrorMessage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setState('IDLE');
  };

  // Apply single improvement with feedback
  const handleApplySuggestion = async (id: string, label: string) => {
    const success = await acceptImprovement(id);
    if (success) {
      triggerToast(`Applied suggestion for "${label}" and saved to your resume.`);
    } else {
      triggerToast(`Could not save suggestion for "${label}". Please check your connection and retry.`);
    }
  };

  // Edit and apply suggestion
  const handleSaveEdit = async (id: string, applyImmediately: boolean = false) => {
    const trimmed = editTextValue.trim();
    if (!trimmed) return;
    editImprovement(id, trimmed);
    setEditingSuggestionId(null);
    if (applyImmediately) {
      const ok = await acceptImprovement(id);
      if (ok) {
        triggerToast('Updated phrasing and saved to your resume.');
      } else {
        triggerToast('Could not save to server. Click "Apply" to retry.');
      }
    } else {
      triggerToast('Updated suggestion wording.');
    }
  };

  // Apply all approved
  const handleApplyAll = async () => {
    const ok = await applyAllApprovedImprovements();
    if (ok) {
      triggerToast('All prioritized suggestions applied and saved to your active resume.');
    } else {
      triggerToast('Could not save all suggestions to server. Please retry.');
    }
  };

  // Add missing skill from analysis to resume
  const handleAddMissingSkill = (skill: string) => {
    const existing = new Set(resumeData.skills.technical.map((s) => s.toLowerCase()));
    if (!existing.has(skill.toLowerCase())) {
      updateSkills({
        ...resumeData.skills,
        technical: [...resumeData.skills.technical, skill],
      });
      triggerToast(`Added "${skill}" to your Technical Skills.`);
    }
  };

  // Re-run analysis on modified resume
  const handleReanalyze = () => {
    handleAnalyzeBuilderResume();
  };

  const isJobSpecificMode = Boolean(analysisResult?.isJobSpecific || targetJob.description || jobDescInput.trim());

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Toast Notification */}
      {applyToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[var(--border-color)] animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{applyToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border-color)] mb-2">
            <span>Resume Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Resume Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Evaluate your resume against target job requirements or general ATS standards. Review matched skills, recommended keywords, and actionable phrasing improvements.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={handleAnalyzeBuilderResume}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            Analyze Current Builder Resume
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              resetToSampleResume();
              handleTextAnalysis(
                'Candidate Profile\nSenior Full Stack & AI Systems Engineer\nSan Francisco, CA\nSummary: Staff Full Stack Engineer with 7+ years architecting enterprise distributed microservices, TypeScript/React applications, and LLM fine-tuning pipelines.\nSkills: Python, TypeScript, React, Next.js, Node.js, AWS, Docker, Kubernetes, PostgreSQL, GraphQL, Redis, CI/CD, System Design, Unit Testing, Jest\nExperience: Staff Software Engineer at CloudScale Technologies. Built multi-region data indexing pipelines processing 25M daily events.',
                'Senior Engineer Sample'
              );
            }}
            className="px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all disabled:opacity-50 cursor-pointer"
          >
            Senior Sample
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              loadFresherSample();
              handleTextAnalysis(
                'Maya Chen\nJunior Software & Data Engineer\nAustin, TX\nSummary: Motivated Computer Science graduate with hands-on expertise in Python, SQL, React, and data analytics pipelines.\nSkills: Python, SQL, React, JavaScript, Git, Data Analysis, Docker, REST API, PostgreSQL\nEducation: B.S. in Computer Science, University of Texas at Austin, GPA 3.91\nProjects: Algorithmic Trading Simulator in Python using Pandas; Campus Exchange Platform in React and PostgreSQL.',
                'Graduate Sample'
              );
            }}
            className="px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all disabled:opacity-50 cursor-pointer"
          >
            Graduate Sample
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => setShowPasteModal(true)}
            className="px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all disabled:opacity-50 cursor-pointer"
          >
            Paste Text
          </button>
        </div>
      </div>

      {/* Target Job Accordion & Mode Configuration */}
      {!isBusy && (
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Target Job Configuration
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isJobSpecificMode
                        ? 'bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                    }`}
                  >
                    {isJobSpecificMode ? 'Job-Specific Mode' : 'General ATS Mode'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isJobSpecificMode
                    ? `Tailoring against ${jobTitleInput || 'Role'} at ${companyInput || 'Company'}`
                    : 'Paste a target job description to evaluate keyword matches, missing skills, and role alignment.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {jobDescInput && (
                <button
                  type="button"
                  onClick={() => {
                    setJobTitleInput('');
                    setCompanyInput('');
                    setJobDescInput('');
                    clearTargetJob();
                    triggerToast('Target job cleared. Re-analyzing in general ATS mode.');
                  }}
                  className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Clear Job
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowJobDescriptionInput(!showJobDescriptionInput)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer"
              >
                {showJobDescriptionInput ? (
                  <>
                    <span>Hide Job Panel</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Configure Job Description</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {showJobDescriptionInput && (
            <div className="pt-3 border-t border-[var(--border-color)] space-y-3 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    Target Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      placeholder="e.g. Senior Full Stack Engineer"
                      value={jobTitleInput}
                      onChange={(e) => {
                        setJobTitleInput(e.target.value);
                        updateTargetJob({ title: e.target.value });
                      }}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    Target Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      placeholder="e.g. Stripe, Google, Acme Tech"
                      value={companyInput}
                      onChange={(e) => {
                        setCompanyInput(e.target.value);
                        updateTargetJob({ company: e.target.value });
                      }}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Target Job Description & Key Qualifications
                </label>
                <textarea
                  rows={4}
                  value={jobDescInput}
                  onChange={(e) => {
                    setJobDescInput(e.target.value);
                    updateTargetJob({ description: e.target.value });
                  }}
                  placeholder="Paste the target job requirements, qualifications, and role scope here..."
                  className="w-full p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] resize-y"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[var(--text-secondary)]">
                  {jobDescInput.trim()
                    ? `✓ ${jobDescInput.split(/\s+/).filter(Boolean).length} words parsed for skill extraction.`
                    : 'When provided, AI extracts exact matching skills vs missing keywords.'}
                </span>
                {state === 'SUCCESS' && (
                  <button
                    type="button"
                    onClick={handleReanalyze}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Re-analyze against this Job
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Upload / File Zone (when not in success view or when user wants to replace file) */}
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

          {(!selectedFile || state === 'IDLE' || state === 'ERROR') && (
            <div>
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] mx-auto flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-1">
                Drop your resume here
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-5">
                Supports PDF, DOCX, or TXT (up to 10MB) · Instant parsing with zero data retention
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <label
                  htmlFor="resume-file-input"
                  className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white text-xs sm:text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  Browse Files
                </label>
                <button
                  type="button"
                  onClick={handleAnalyzeBuilderResume}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs sm:text-sm font-medium transition-all"
                >
                  <FileEdit className="w-4 h-4 text-[var(--accent)]" />
                  Analyze Active Resume ({resumeData.personalInfo.fullName || 'Builder'})
                </button>
              </div>
            </div>
          )}

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

      {/* INVALID DOCUMENT Banner */}
      {state === 'INVALID_DOCUMENT' && (
        <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-left space-y-4 animate-fade-in shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Document Validation Failed
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">
                This document does not appear to be a resume or CV.
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {validationResult?.detectedType
                  ? `Identified content: ${validationResult.detectedType}. `
                  : ''}
                Smart Resume AI requires an authentic resume or CV with career sections (such as work experience, education, or skills) to perform ATS scoring and analysis. Invoices, homework assignments, certificates, and specifications cannot be analyzed.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Please upload a resume in PDF, DOCX, or TXT format.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-rose-500/20">
            <button
              type="button"
              onClick={handleResetToUpload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-all cursor-pointer shadow-lg shadow-rose-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Upload Another Document
            </button>
            <button
              type="button"
              onClick={() => {
                resetToSampleResume();
                handleAnalyzeBuilderResume();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs font-semibold hover:bg-[var(--bg-elevated)] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              Try with Sample Resume
            </button>
          </div>
        </div>
      )}

      {/* UNCERTAIN DOCUMENT Banner */}
      {state === 'UNCERTAIN_DOCUMENT' && (
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-left space-y-4 animate-fade-in shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
              <FileWarning className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Uncertain Document Structure
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">
                We couldn&apos;t clearly verify this document as a resume.
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                The uploaded document has limited standard resume sections (such as work experience, education, or skills) or is very brief. ATS systems often struggle to parse incomplete formats.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                For best results, upload a clearer or more complete resume. If this is an unusual format or early draft, you may still proceed with best-effort analysis.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-500/20">
            <button
              type="button"
              onClick={handleResetToUpload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-all cursor-pointer shadow-lg shadow-[var(--accent)]/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Upload a Clearer Resume
            </button>
            <button
              type="button"
              onClick={handleProceedWithUncertain}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-500/40 bg-amber-500/20 text-amber-200 text-xs font-semibold hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Proceed with Best-Effort Analysis
            </button>
          </div>
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Analysis
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleResetToUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs font-semibold hover:bg-[var(--bg-elevated)] transition-all cursor-pointer"
            >
              Upload Another File
            </button>
          </div>
        </div>
      )}

      {/* Multi-stage Animated Loading View */}
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
              {state === 'UPLOADING' && 'Step 1 of 3: Secure Upload'}
              {state === 'EXTRACTING' && 'Step 2 of 3: Structural Extraction'}
              {state === 'ANALYZING' && 'Step 3 of 3: ATS Heuristic Intelligence'}
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              {stageDescription || 'Evaluating resume architecture...'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Cross-referencing formatting, bullet strength, and keyword density against enterprise ATS standards.
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

      {/* SUCCESS: Comprehensive Analysis & Improvement View */}
      {state === 'SUCCESS' && analysisResult && !isBusy && (
        <div className="space-y-8 animate-fade-in">
          {/* Analysis Summary Header */}
          <div className="p-5 sm:p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  {selectedFile ? selectedFile.name : `${resumeData.personalInfo.fullName || 'Candidate'}'s Resume`}
                </h2>
                {analysisResult.isJobSpecific && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border-color)]">
                    Target: {analysisResult.jobTitle || 'Role'}{analysisResult.company ? ` at ${analysisResult.company}` : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {analysisResult.wordCount} words analyzed · Estimated ATS Match: <span className="font-semibold text-[var(--text-primary)]">{analysisResult.overallAtsScore}/100</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReanalyze}
                title="Re-run analysis to evaluate updated wording"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-score
              </button>
              <Link
                href="/builder?from=analyzer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
              >
                <FileEdit className="w-3.5 h-3.5" />
                Edit in Builder
              </Link>
              <button
                type="button"
                onClick={handleResetToUpload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-medium transition-colors cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload Another
              </button>
            </div>
          </div>

          {/* Area A & Area B: Matched Skills and Recommended Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Area A: Matched Skills */}
            <div className="p-5 sm:p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Matched Skills
                </h3>
                <span className="text-xs text-[var(--text-secondary)] font-medium">
                  {(analysisResult.matchedSkills?.length ?? analysisResult.detectedKeywords.length)} detected
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {analysisResult.isJobSpecific
                  ? 'Skills and competencies identified in your resume that align with the target job requirements:'
                  : 'Technical and domain skills detected in your resume:'}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(analysisResult.matchedSkills && analysisResult.matchedSkills.length > 0
                  ? analysisResult.matchedSkills.map((m) => m.skill)
                  : analysisResult.detectedKeywords
                ).length > 0 ? (
                  (analysisResult.matchedSkills && analysisResult.matchedSkills.length > 0
                    ? analysisResult.matchedSkills.map((m) => m.skill)
                    : analysisResult.detectedKeywords
                  ).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[var(--text-muted)] italic">
                    No standard technical skills were detected in the uploaded text.
                  </p>
                )}
              </div>
            </div>

            {/* Area B: Recommended Keywords */}
            <div className="p-5 sm:p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Recommended Keywords
                </h3>
                <span className="text-xs text-[var(--text-secondary)] font-medium">
                  {(analysisResult.missingSkills && analysisResult.missingSkills.length > 0
                    ? analysisResult.missingSkills
                    : analysisResult.missingKeywords
                  ).length} suggested
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {analysisResult.isJobSpecific
                  ? 'Keywords from the target job posting not detected in your resume. Click + to add skills you have working experience with:'
                  : 'Common industry keywords for your field. Click + to add skills you have working experience with:'}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(analysisResult.missingSkills && analysisResult.missingSkills.length > 0
                  ? analysisResult.missingSkills
                  : analysisResult.missingKeywords
                ).map((skill) => {
                  const alreadyInResume = resumeData.skills.technical.some(
                    (s) => s.toLowerCase() === skill.toLowerCase()
                  );
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddMissingSkill(skill)}
                      disabled={alreadyInResume}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
                        alreadyInResume
                          ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)] cursor-default'
                          : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {alreadyInResume ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>{skill} (Added)</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-[var(--accent)]">+</span>
                          <span>{skill}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[var(--text-muted)] pt-1">
                * Keyword suggestions are based on role requirements. Only add skills you have genuine experience with.
              </p>
            </div>
          </div>

          {/* Interactive In-Place Improvement Engine */}
          <div className="space-y-4 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-[var(--accent)]" />
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Resume Improvements ({improvements.length || (analysisResult.topSuggestions?.length || 0)})
                  </h2>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Review side-by-side phrasing optimizations, edit content inline, and apply directly to your active resume.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyAll}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply All Approved
                </button>
                <Link
                  href="/builder?from=analyzer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-semibold transition-all cursor-pointer"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  Go to Builder
                </Link>
              </div>
            </div>

            {/* List of Improvement Cards with Visual Diff & Action Controls */}
            <div className="space-y-5">
              {(improvements.length > 0
                ? improvements
                : (analysisResult.topSuggestions || []).map((sug, idx) => ({
                    id: `sug_${idx + 1}`,
                    section: (sug.section?.toLowerCase().includes('experience')
                      ? 'experience'
                      : sug.section?.toLowerCase().includes('summary')
                      ? 'summary'
                      : sug.section?.toLowerCase().includes('project')
                      ? 'projects'
                      : sug.section?.toLowerCase().includes('education')
                      ? 'education'
                      : 'skills') as any,
                    field: sug.section || 'Resume Section',
                    originalContent: sug.extractedText || (sug as any).originalText || sug.whatNeedsImprovement,
                    improvedContent: sug.example || sug.howToImprove,
                    reasoning: `${sug.whatNeedsImprovement} ${sug.whyItMatters}`.trim(),
                    metricImpact: sug.priority ? `${sug.priority} Priority` : 'Actionable Feedback',
                    status: 'pending' as const,
                    isJobTailored: Boolean(isJobSpecificMode),
                    diff: {
                      before: sug.extractedText || (sug as any).originalText || sug.whatNeedsImprovement,
                      after: sug.example || sug.howToImprove,
                    },
                  }))
              ).map((item, idx) => {
                const isAccepted = item.status === 'accepted';
                const isRejected = item.status === 'rejected';
                const isAppliedToResume = isImprovementAppliedToResume(item, resumeData);
                const isEditing = editingSuggestionId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-5 sm:p-6 transition-all space-y-4 bg-[var(--bg-card)] ${
                      isRejected
                        ? 'border-[var(--border-color)] opacity-60'
                        : isAppliedToResume
                        ? 'border-[var(--border-color)] shadow-sm'
                        : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                    }`}
                  >
                    {/* Header: Section, Field, Subtle Applied Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[var(--border-color)]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-5 h-5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                          {item.section}
                        </span>
                        <span className="text-xs font-semibold text-[var(--text-primary)]">
                          {item.field}
                        </span>
                        {item.isJobTailored && (
                          <span className="text-[10px] font-medium text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded border border-[var(--accent)]/20">
                            Role Alignment
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isAppliedToResume && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                            <Check className="w-3 h-3 text-[var(--accent)]" />
                            Applied
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                            <X className="w-3 h-3 text-[var(--text-muted)]" />
                            Dismissed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Visual Comparison: Current Phrasing vs Proposed AI Alternative */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left: Current Phrasing */}
                      <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between pb-1 border-b border-[var(--border-color)]/60">
                            <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                              Current Phrasing
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">
                              Extracted Text
                            </span>
                          </div>

                          <div className="text-xs text-[var(--text-primary)] font-mono leading-relaxed bg-[var(--bg-card)] p-3 rounded-md border border-[var(--border-color)]/70 whitespace-pre-wrap min-h-[68px]">
                            {item.originalContent || 'No existing text recorded for this section.'}
                          </div>
                        </div>

                        {/* Factual explanation of what is missing or could be improved */}
                        <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed pt-2 border-t border-[var(--border-color)]/50 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-[var(--text-primary)]">Observation: </span>
                            <span>{item.reasoning}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Proposed AI Alternative */}
                      <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between pb-1 border-b border-[var(--border-color)]/60">
                            <span className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                              Proposed AI Alternative
                            </span>
                            {!isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSuggestionId(item.id);
                                  setEditTextValue(item.improvedContent);
                                }}
                                className="text-[11px] font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                rows={3}
                                value={editTextValue}
                                onChange={(e) => setEditTextValue(e.target.value)}
                                className="w-full p-2.5 rounded-md bg-[var(--bg-card)] border border-[var(--accent)] text-xs text-[var(--text-primary)] focus:outline-none"
                                placeholder="Edit suggested wording..."
                              />
                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingSuggestionId(null)}
                                  className="px-2.5 py-1 rounded-md text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(item.id, false)}
                                  className="px-3 py-1 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-card)] p-3 rounded-md border border-[var(--border-color)]/70 whitespace-pre-wrap font-medium min-h-[68px]">
                              {item.improvedContent}
                            </div>
                          )}
                        </div>

                        {/* Evidence-based note */}
                        <div className="text-[11px] text-[var(--text-muted)] leading-relaxed pt-2 border-t border-[var(--border-color)]/50 flex items-start gap-1.5">
                          <span className="font-semibold text-[var(--text-secondary)]">Guideline: </span>
                          <span>Phrased with strong action verbs and relevant domain skills without inventing experience.</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls for this Suggestion */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setRegeneratingId(item.id);
                            const success = await regenerateImprovement(item.id);
                            if (success) {
                              triggerToast('Alternative phrasing generated.');
                            } else {
                              triggerToast('Unable to regenerate alternative at this time.');
                            }
                          } catch {
                            triggerToast('Unable to regenerate alternative at this time.');
                          } finally {
                            setRegeneratingId(null);
                          }
                        }}
                        disabled={regeneratingId === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <RotateCcw
                          className={`w-3.5 h-3.5 ${regeneratingId === item.id ? 'animate-spin' : ''}`}
                        />
                        Regenerate
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isRejected) {
                            setImprovements((prev) =>
                              prev.map((imp) => (imp.id === item.id ? { ...imp, status: 'pending' } : imp))
                            );
                            triggerToast('Suggestion restored.');
                          } else {
                            rejectImprovement(item.id);
                            triggerToast('Suggestion dismissed.');
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          isRejected
                            ? 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                            : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-800'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        {isRejected ? 'Restore' : 'Dismiss'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplySuggestion(item.id, item.field)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isAppliedToResume
                            ? 'border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                            : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {isAppliedToResume ? 'Re-Apply to Resume' : 'Apply to Resume'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resume Strengths Section */}
          {analysisResult.strengths && analysisResult.strengths.length > 0 && (
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[var(--accent)]" />
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Resume Strengths
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysisResult.strengths.map((st) => (
                  <div
                    key={st.id}
                    className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2"
                  >
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                      {st.section}
                    </span>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">{st.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {st.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
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
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] cursor-pointer"
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
