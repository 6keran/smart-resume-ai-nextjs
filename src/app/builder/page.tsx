'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileEdit,
  Check,
  ChevronRight,
  ChevronLeft,
  Printer,
  Download,
  Eye,
  ZoomIn,
  ZoomOut,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  Layout,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  User,
  Wand2,
  RotateCcw,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import { RESUME_TEMPLATES, MINI_SAMPLE_RESUME_DATA, normalizeTemplateId } from '@/lib/templates';
import { ResumeData } from '@/types/resume';
import { GlassCard } from '@/components/ui/GlassCard';
import { A4ResumeDocument } from '@/components/builder/A4ResumeDocument';
import { TemplateCard } from '@/components/builder/TemplateCard';

export default function ResumeBuilderPage() {
  const {
    resumeData,
    updatePersonalInfo,
    updateSummary,
    updateSkills,
    updateExperience,
    updateEducation,
    updateProjects,
    updateCertifications,
    setTemplateId,
    setCandidateType,
    resetToSampleResume,
    loadFresherSample,
  } = useResume();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(0.75);
  const [defaultFitZoom, setDefaultFitZoom] = useState<number>(0.75);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalBanner, setGlobalBanner] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const previewViewportRef = useRef<HTMLDivElement>(null);

  const isFresher = resumeData.candidateType === 'fresher';

  const steps = [
    { number: 1, label: 'Personal Information', icon: User },
    {
      number: 2,
      label: isFresher ? 'Career Objective' : 'Summary',
      icon: Wand2,
    },
    { number: 3, label: 'Skills', icon: Sparkles },
    {
      number: 4,
      label: isFresher ? 'Education & Degree' : 'Education',
      icon: GraduationCap,
    },
    {
      number: 5,
      label: isFresher ? 'Internships (Optional)' : 'Experience',
      icon: Briefcase,
    },
    {
      number: 6,
      label: isFresher ? 'Academic Projects *' : 'Projects',
      icon: FolderGit2,
    },
    { number: 7, label: 'Certifications', icon: Award },
    { number: 8, label: 'Template', icon: Layout },
    { number: 9, label: 'Preview', icon: Eye },
    { number: 10, label: 'Generate', icon: Download },
  ];

  // Calculate container fit zoom
  const calculateFitZoom = useCallback(() => {
    if (!previewViewportRef.current) return 0.75;
    const availableWidth = previewViewportRef.current.clientWidth - 32;
    if (availableWidth <= 0) return 0.75;
    // A4 base document width is 794px
    const widthFit = availableWidth / 794;
    const availableHeight = previewViewportRef.current.clientHeight - 32;
    let target = widthFit;
    if (availableHeight > 300) {
      const heightFit = availableHeight / 1123;
      // Balance width and height fit so document displays comfortably
      target = Math.min(widthFit, heightFit * 1.05);
    }
    // Clamp between 0.50 and 1.00 for initial fit
    return Math.max(0.50, Math.min(1.00, Math.round(target * 100) / 100));
  }, []);

  // Set initial zoom on mount and recalculate on resize
  useEffect(() => {
    const timer = setTimeout(() => {
      const fit = calculateFitZoom();
      setDefaultFitZoom(fit);
      setZoom(fit);
    }, 100);

    const handleResize = () => {
      const fit = calculateFitZoom();
      setDefaultFitZoom(fit);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateFitZoom]);

  const [isStepLoaded, setIsStepLoaded] = useState(false);

  // Restore saved step on initial mount if valid
  useEffect(() => {
    try {
      const savedStep = localStorage.getItem('sra_builder_step');
      if (savedStep) {
        const stepNum = parseInt(savedStep, 10);
        if (stepNum >= 1 && stepNum <= 10) {
          setCurrentStep(stepNum);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsStepLoaded(true);
    }
  }, []);

  // Persist current step on change (only after initial restoration has completed)
  useEffect(() => {
    if (!isStepLoaded) return;
    try {
      localStorage.setItem('sra_builder_step', String(currentStep));
    } catch {
      // ignore
    }
  }, [currentStep, isStepLoaded]);

  // Clear specific field error on change
  const clearError = (fieldKey: string) => {
    if (fieldErrors[fieldKey]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    }
    if (globalBanner) {
      setGlobalBanner(null);
    }
  };

  // Step-by-step validation engine
  const validateStep = (
    step: number,
    data: ResumeData
  ): { isValid: boolean; errors: Record<string, string>; firstErrorField: string | null } => {
    const errors: Record<string, string> = {};
    let firstErrorField: string | null = null;

    const addError = (fieldKey: string, message: string, elementId: string) => {
      errors[fieldKey] = message;
      if (!firstErrorField) {
        firstErrorField = elementId;
      }
    };

    if (step === 1) {
      if (!data.personalInfo.fullName?.trim()) {
        addError('personalInfo.fullName', 'Please enter your full name.', 'input-fullName');
      }
      if (!data.personalInfo.email?.trim()) {
        addError('personalInfo.email', 'Please enter your email address.', 'input-email');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personalInfo.email.trim())) {
        addError(
          'personalInfo.email',
          'Please enter a valid email address (e.g. name@example.com).',
          'input-email'
        );
      }
      if (!data.personalInfo.phone?.trim()) {
        addError('personalInfo.phone', 'Please enter your phone number.', 'input-phone');
      }
      if (!data.personalInfo.location?.trim()) {
        addError(
          'personalInfo.location',
          'Please enter your location (city, state/country).',
          'input-location'
        );
      }
    } else if (step === 2) {
      if (!data.summary?.trim()) {
        addError('summary', 'Please enter your professional summary.', 'input-summary');
      } else if (data.summary.trim().length < 20) {
        addError(
          'summary',
          'Professional summary must be at least 20 characters.',
          'input-summary'
        );
      }
    } else if (step === 3) {
      if (!data.skills.technical || data.skills.technical.length === 0) {
        addError(
          'skills.technical',
          'Please enter at least one technical skill.',
          'input-skills-technical'
        );
      }
    } else if (step === 4) {
      if (!data.education || data.education.length === 0) {
        addError('education', 'Please add at least one education credential.', 'add-education-btn');
      } else {
        if (!data.education[0].degree?.trim()) {
          addError(
            'education.0.degree',
            'Please enter your degree or program of study.',
            'input-edu-degree-0'
          );
        }
        if (!data.education[0].institution?.trim()) {
          addError(
            'education.0.institution',
            'Please enter the institution or university name.',
            'input-edu-institution-0'
          );
        }
      }
    } else if (step === 5) {
      if (data.candidateType === 'experienced') {
        if (!data.experience || data.experience.length === 0) {
          addError(
            'experience',
            'Please add at least one professional work experience.',
            'add-experience-btn'
          );
        } else {
          if (!data.experience[0].role?.trim()) {
            addError('experience.0.role', 'Please enter your role title.', 'input-exp-role-0');
          }
          if (!data.experience[0].company?.trim()) {
            addError('experience.0.company', 'Please enter the company name.', 'input-exp-company-0');
          }
        }
      }
    } else if (step === 6) {
      if (data.candidateType === 'fresher') {
        if (!data.projects || data.projects.length === 0) {
          addError(
            'projects',
            'Please add at least one project (required for entry-level candidates).',
            'add-project-btn'
          );
        } else {
          if (!data.projects[0].title?.trim()) {
            addError('projects.0.title', 'Please enter the project name.', 'input-proj-title-0');
          }
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      firstErrorField,
    };
  };

  // Validate all steps up to target step
  const validateUpToStep = (targetStep: number, data: ResumeData) => {
    for (let s = 1; s < targetStep; s++) {
      const res = validateStep(s, data);
      if (!res.isValid) {
        return {
          isValid: false,
          invalidStep: s,
          errors: res.errors,
          firstErrorField: res.firstErrorField,
        };
      }
    }
    return { isValid: true, invalidStep: null, errors: {}, firstErrorField: null };
  };

  // Focus helper
  const focusElement = (elementId: string | null) => {
    if (!elementId) return;
    setTimeout(() => {
      const el = document.getElementById(elementId);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  // Next step handler with validation
  const handleNextStep = () => {
    const result = validateStep(currentStep, resumeData);
    if (!result.isValid) {
      setFieldErrors(result.errors);
      setGlobalBanner('Please complete all required fields (*) before moving to the next step.');
      focusElement(result.firstErrorField);
      return;
    }

    setFieldErrors({});
    setGlobalBanner(null);
    setCurrentStep((prev) => Math.min(prev + 1, 10));
  };

  // Previous step handler (always allowed without validation blocking)
  const handlePrevStep = () => {
    setFieldErrors({});
    setGlobalBanner(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Stepper tab click handler
  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;

    // Moving backward is always permitted
    if (targetStep < currentStep) {
      setFieldErrors({});
      setGlobalBanner(null);
      setCurrentStep(targetStep);
      return;
    }

    // Moving forward requires validating all steps up to target
    const validation = validateUpToStep(targetStep, resumeData);
    if (!validation.isValid && validation.invalidStep) {
      setCurrentStep(validation.invalidStep);
      setFieldErrors(validation.errors);
      setGlobalBanner(
        `Please complete the required fields in Step 0${validation.invalidStep} before proceeding.`
      );
      focusElement(validation.firstErrorField);
      return;
    }

    setFieldErrors({});
    setGlobalBanner(null);
    setCurrentStep(targetStep);
  };

  // Final Generate / Print validation
  const handleGenerateOrPrint = () => {
    // Validate all steps from 1 through 6
    const validation = validateUpToStep(7, resumeData);
    if (!validation.isValid && validation.invalidStep) {
      setCurrentStep(validation.invalidStep);
      setFieldErrors(validation.errors);
      setGlobalBanner(
        `Please complete the required fields in Step 0${validation.invalidStep} before generating your resume.`
      );
      focusElement(validation.firstErrorField);
      return;
    }

    // All required fields valid! Set document title and trigger browser print/PDF
    setFieldErrors({});
    setGlobalBanner(null);
    setIsExporting(true);
    document.body.classList.add('resume-exporting');

    const candidateName = (resumeData.personalInfo.fullName || 'Candidate')
      .trim()
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .replace(/\s+/g, '_');
    const originalTitle = document.title;
    document.title = `${candidateName}_Resume.pdf`;

    let cleanedUp = false;
    const cleanupExportState = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      document.body.classList.remove('resume-exporting');
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => {
        document.title = originalTitle;
        setExportSuccess(false);
      }, 4000);
      window.removeEventListener('afterprint', cleanupExportState);
    };

    window.addEventListener('afterprint', cleanupExportState);

    setTimeout(() => {
      window.print();
      // Fallback cleanup in case afterprint does not fire
      setTimeout(cleanupExportState, 1000);
    }, 250);
  };

  // Candidate type toggle (preserves user entered data)
  const handleCandidateTypeChange = (type: 'experienced' | 'fresher') => {
    setCandidateType(type);
    // Clear validation errors that no longer apply
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (type === 'fresher') {
        delete next['experience'];
        delete next['experience.0.role'];
        delete next['experience.0.company'];
      } else {
        delete next['projects'];
        delete next['projects.0.title'];
      }
      return next;
    });
  };

  // Zoom control helpers (min 50%, max 125%)
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(1.25, Math.round((prev + 0.05) * 100) / 100));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.50, Math.round((prev - 0.05) * 100) / 100));
  };

  const handleResetZoom = () => {
    setZoom(defaultFitZoom);
  };

  // Input styling helper
  const getInputClassName = (fieldKey: string, extraClasses = '') => {
    const hasError = Boolean(fieldErrors[fieldKey]);
    return `w-full p-2.5 rounded-lg border text-[var(--text-primary)] text-xs transition-colors focus:outline-none ${
      hasError
        ? 'border-[var(--color-error)] bg-[var(--color-error)]/5 focus:border-[var(--color-error)] focus:ring-1 focus:ring-[var(--color-error)]'
        : 'border-[var(--border-color)] bg-[var(--input-bg)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]'
    } ${extraClasses}`;
  };

  return (
    <div className="resume-builder-page-container min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6 no-print">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 mb-2">
            <FileEdit className="w-3.5 h-3.5" />
            Standard A4 Multi-Step Builder
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Professional Resume Builder
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Build, format, and generate print-ready A4 resumes with 8 ATS-validated layouts.
          </p>
        </div>

        {/* Candidate Type Toggle (Preserves user data) */}
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center gap-1 shadow-sm">
            <button
              id="btn-candidate-experienced"
              type="button"
              onClick={() => handleCandidateTypeChange('experienced')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                resumeData.candidateType === 'experienced'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Experienced</span>
            </button>
            <button
              id="btn-candidate-fresher"
              type="button"
              onClick={() => handleCandidateTypeChange('fresher')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                resumeData.candidateType === 'fresher'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Fresher / Graduate</span>
            </button>
          </div>
          <button
            id="btn-load-sample-data"
            type="button"
            onClick={() => {
              if (resumeData.candidateType === 'fresher') {
                loadFresherSample();
              } else {
                resetToSampleResume();
              }
            }}
            className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer text-[var(--accent)] hover:bg-[var(--accent-subtle)] border border-[var(--border-color)] hover:border-[var(--accent)] bg-[var(--bg-card)] shadow-sm"
            title="Fill in rich sample resume data to preview templates immediately"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Data</span>
          </button>
        </div>
      </div>

      {/* Stepper Bar (1 to 10) */}
      <div className="no-print overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-[700px] border-b border-[var(--border-color)] pb-4">
          {steps.map((st) => {
            const isCompleted = st.number < currentStep;
            const isCurrent = st.number === currentStep;

            return (
              <button
                id={`btn-step-${st.number}`}
                data-step={st.number}
                key={st.number}
                type="button"
                onClick={() => handleStepClick(st.number)}
                className={`flex flex-col items-center gap-1.5 transition-all group ${
                  isCurrent
                    ? 'text-[var(--accent)] font-bold'
                    : isCompleted
                    ? 'text-emerald-500 font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] opacity-70'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-[var(--accent)] text-white shadow-sm scale-105'
                      : isCompleted
                      ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/30'
                      : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : st.number}
                </div>
                <span className="text-[10px] whitespace-nowrap">{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="resume-builder-main-grid grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Step Form Content */}
        <div className={`no-print ${currentStep >= 9 ? 'lg:col-span-4' : 'lg:col-span-6'} min-w-0`}>
          <GlassCard className="p-6 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <div>
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">
                  Step 0{currentStep} / 10
                </span>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  {steps[currentStep - 1].label}
                </h2>
              </div>
              {Object.keys(fieldErrors).length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Required fields (*) missing
                </span>
              )}
            </div>

            {/* Global Validation Banner */}
            {globalBanner && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-400 font-medium animate-fadeIn"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{globalBanner}</span>
              </div>
            )}

            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label htmlFor="input-fullName" className="block font-semibold text-[var(--text-primary)] mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-fullName"
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => {
                      updatePersonalInfo({ fullName: e.target.value });
                      clearError('personalInfo.fullName');
                    }}
                    placeholder="e.g. Rahul Sharma"
                    aria-invalid={Boolean(fieldErrors['personalInfo.fullName'])}
                    aria-describedby={
                      fieldErrors['personalInfo.fullName'] ? 'fullName-error' : undefined
                    }
                    className={getInputClassName('personalInfo.fullName')}
                  />
                  {fieldErrors['personalInfo.fullName'] && (
                    <p
                      id="fullName-error"
                      role="alert"
                      className="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors['personalInfo.fullName']}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="input-email" className="block font-semibold text-[var(--text-primary)] mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-email"
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => {
                        updatePersonalInfo({ email: e.target.value });
                        clearError('personalInfo.email');
                      }}
                      placeholder="rahul.sharma@email.com"
                      aria-invalid={Boolean(fieldErrors['personalInfo.email'])}
                      aria-describedby={
                        fieldErrors['personalInfo.email'] ? 'email-error' : undefined
                      }
                      className={getInputClassName('personalInfo.email')}
                    />
                    {fieldErrors['personalInfo.email'] && (
                      <p
                        id="email-error"
                        role="alert"
                        className="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {fieldErrors['personalInfo.email']}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="input-phone" className="block font-semibold text-[var(--text-primary)] mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-phone"
                      type="text"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => {
                        updatePersonalInfo({ phone: e.target.value });
                        clearError('personalInfo.phone');
                      }}
                      placeholder="+1 (555) 234-5678"
                      aria-invalid={Boolean(fieldErrors['personalInfo.phone'])}
                      aria-describedby={
                        fieldErrors['personalInfo.phone'] ? 'phone-error' : undefined
                      }
                      className={getInputClassName('personalInfo.phone')}
                    />
                    {fieldErrors['personalInfo.phone'] && (
                      <p
                        id="phone-error"
                        role="alert"
                        className="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {fieldErrors['personalInfo.phone']}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="input-location" className="block font-semibold text-[var(--text-primary)] mb-1">
                      Location <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-location"
                      type="text"
                      value={resumeData.personalInfo.location}
                      onChange={(e) => {
                        updatePersonalInfo({ location: e.target.value });
                        clearError('personalInfo.location');
                      }}
                      placeholder="San Francisco, CA"
                      aria-invalid={Boolean(fieldErrors['personalInfo.location'])}
                      aria-describedby={
                        fieldErrors['personalInfo.location'] ? 'location-error' : undefined
                      }
                      className={getInputClassName('personalInfo.location')}
                    />
                    {fieldErrors['personalInfo.location'] && (
                      <p
                        id="location-error"
                        role="alert"
                        className="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {fieldErrors['personalInfo.location']}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="input-headline" className="block font-semibold text-[var(--text-primary)] mb-1">
                      Professional Headline
                    </label>
                    <input
                      id="input-headline"
                      type="text"
                      value={resumeData.personalInfo.headline || resumeData.personalInfo.title || ''}
                      onChange={(e) =>
                        updatePersonalInfo({
                          headline: e.target.value,
                          title: e.target.value,
                        })
                      }
                      placeholder="Senior Full Stack & AI Engineer"
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="input-linkedin" className="block font-medium text-[var(--text-secondary)] mb-1">
                      LinkedIn
                    </label>
                    <input
                      id="input-linkedin"
                      type="text"
                      value={resumeData.personalInfo.linkedin || ''}
                      onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
                      placeholder="linkedin.com/in/..."
                      className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[11px]"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-github" className="block font-medium text-[var(--text-secondary)] mb-1">
                      GitHub
                    </label>
                    <input
                      id="input-github"
                      type="text"
                      value={resumeData.personalInfo.github || ''}
                      onChange={(e) => updatePersonalInfo({ github: e.target.value })}
                      placeholder="github.com/..."
                      className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[11px]"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-portfolio" className="block font-medium text-[var(--text-secondary)] mb-1">
                      Portfolio
                    </label>
                    <input
                      id="input-portfolio"
                      type="text"
                      value={resumeData.personalInfo.portfolio || ''}
                      onChange={(e) => updatePersonalInfo({ portfolio: e.target.value })}
                      placeholder="portfolio.dev"
                      className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[11px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Summary */}
            {currentStep === 2 && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="input-summary" className="font-semibold text-[var(--text-primary)]">
                      {isFresher ? 'Career Objective & Summary' : 'Professional Summary'}{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        resumeData.summary.trim().length >= 20 ? 'text-emerald-400' : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {resumeData.summary.trim().length} / 20 characters min
                    </span>
                  </div>
                  <textarea
                    id="input-summary"
                    rows={7}
                    value={resumeData.summary}
                    onChange={(e) => {
                      updateSummary(e.target.value);
                      clearError('summary');
                    }}
                    placeholder={
                      isFresher
                        ? 'Motivated Computer Science graduate with solid foundational skills in modern web development, data structures, and databases. Eager to contribute scalable code and learn rapidly within an innovative engineering team...'
                        : 'Provide a high-impact overview of your engineering domain, years of tenure, and major accomplishments...'
                    }
                    aria-invalid={Boolean(fieldErrors['summary'])}
                    aria-describedby={fieldErrors['summary'] ? 'summary-error' : undefined}
                    className={`w-full p-3 rounded-xl border leading-relaxed text-xs transition-colors focus:outline-none ${
                      fieldErrors['summary']
                        ? 'border-rose-500 bg-rose-500/5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 text-[var(--text-primary)]'
                        : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--accent)]'
                    }`}
                  />
                  {fieldErrors['summary'] && (
                    <p
                      id="summary-error"
                      role="alert"
                      className="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors['summary']}
                    </p>
                  )}

                  {/* AI Quick Starters */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-[var(--text-secondary)] font-medium">Quick Starters:</span>
                    {isFresher ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            updateSummary(
                              'Enthusiastic and results-driven Computer Science graduate with a strong foundation in data structures, algorithms, and full-stack development using React, TypeScript, and Node.js. Eager to leverage hands-on academic project experience and rapid learning aptitude to contribute effectively to scalable software solutions.'
                            );
                            clearError('summary');
                          }}
                          className="px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"
                        >
                          + Software Engineer Graduate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateSummary(
                              'Detail-oriented graduate specializing in Data Analytics and Python engineering. Proficient in SQL querying, data cleaning, statistical modeling, and interactive dashboard creation. Seeking an entry-level analyst or junior developer role to turn data into actionable intelligence.'
                            );
                            clearError('summary');
                          }}
                          className="px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"
                        >
                          + Data & Analytics Graduate
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          updateSummary(
                            'High-impact Senior Full-Stack Engineer with 5+ years of experience architecting resilient distributed systems, modern web platforms, and automated CI/CD pipelines. Proven track record of improving system uptime to 99.99% and accelerating feature delivery across cross-functional product teams.'
                          );
                          clearError('summary');
                        }}
                        className="px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"
                      >
                        + Senior Full-Stack Engineer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Skills */}
            {currentStep === 3 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label htmlFor="input-skills-technical" className="block font-semibold text-[var(--text-primary)] mb-1">
                    Technical Skills (comma separated) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-skills-technical"
                    type="text"
                    value={resumeData.skills.technical.join(', ')}
                    onChange={(e) => {
                      updateSkills({
                        ...resumeData.skills,
                        technical: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      });
                      clearError('skills.technical');
                    }}
                    placeholder="Python, React, TypeScript, SQL, Docker, AWS..."
                    aria-invalid={Boolean(fieldErrors['skills.technical'])}
                    aria-describedby={fieldErrors['skills.technical'] ? 'skills-technical-error' : undefined}
                    className={getInputClassName('skills.technical')}
                  />
                  {fieldErrors['skills.technical'] && (
                    <p
                      id="skills-technical-error"
                      role="alert"
                      className="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {fieldErrors['skills.technical']}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {resumeData.skills.technical.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] font-medium text-[11px]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="input-skills-tools" className="block font-semibold text-[var(--text-primary)] mb-1">
                    Tools & Frameworks (optional)
                  </label>
                  <input
                    id="input-skills-tools"
                    type="text"
                    value={resumeData.skills.tools.join(', ')}
                    onChange={(e) =>
                      updateSkills({
                        ...resumeData.skills,
                        tools: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="VS Code, GitLab CI, Terraform, Datadog..."
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label htmlFor="input-skills-soft" className="block font-semibold text-[var(--text-primary)] mb-1">
                    Soft / Leadership Skills (optional)
                  </label>
                  <input
                    id="input-skills-soft"
                    type="text"
                    value={resumeData.skills.soft.join(', ')}
                    onChange={(e) =>
                      updateSkills({
                        ...resumeData.skills,
                        soft: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="System Architecture, Cross-functional Leadership, Mentorship..."
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Education */}
            {currentStep === 4 && (
              <div className="space-y-4 text-xs">
                {fieldErrors['education'] && (
                  <div
                    role="alert"
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-500 font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{fieldErrors['education']}</span>
                  </div>
                )}

                {resumeData.education.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] text-center space-y-3">
                    <GraduationCap className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-50" />
                    <p className="text-xs text-[var(--text-secondary)]">
                      No education degree listed yet. At least one education degree is required.
                    </p>
                    <button
                      id="add-education-btn"
                      type="button"
                      onClick={() => {
                        updateEducation([
                          {
                            id: `edu_${Date.now()}`,
                            degree: '',
                            institution: '',
                            graduationYear: '2024',
                            gpa: '',
                          },
                        ]);
                        clearError('education');
                      }}
                      className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Degree / School
                    </button>
                  </div>
                ) : (
                  resumeData.education.map((edu, idx) => (
                    <div
                      key={edu.id}
                      className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[var(--text-primary)]">Degree #{idx + 1}</span>
                        {resumeData.education.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = resumeData.education.filter((_, i) => i !== idx);
                              updateEducation(updated);
                            }}
                            className="text-rose-400 hover:text-rose-500 transition-colors"
                            title="Remove degree"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor={`input-edu-degree-${idx}`}
                            className="block font-medium text-[var(--text-primary)] mb-1"
                          >
                            Degree / Program {idx === 0 && <span className="text-rose-500">*</span>}
                          </label>
                          <input
                            id={`input-edu-degree-${idx}`}
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = [...resumeData.education];
                              updated[idx].degree = e.target.value;
                              updateEducation(updated);
                              if (idx === 0) clearError('education.0.degree');
                            }}
                            placeholder="B.S. in Computer Science"
                            aria-invalid={idx === 0 && Boolean(fieldErrors['education.0.degree'])}
                            aria-describedby={
                              idx === 0 && fieldErrors['education.0.degree']
                                ? 'edu-degree-0-error'
                                : undefined
                            }
                            className={getInputClassName(
                              idx === 0 ? 'education.0.degree' : '',
                              'bg-[var(--bg-card)]'
                            )}
                          />
                          {idx === 0 && fieldErrors['education.0.degree'] && (
                            <p
                              id="edu-degree-0-error"
                              role="alert"
                              className="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1"
                            >
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              {fieldErrors['education.0.degree']}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor={`input-edu-institution-${idx}`}
                            className="block font-medium text-[var(--text-primary)] mb-1"
                          >
                            University / Institution {idx === 0 && <span className="text-rose-500">*</span>}
                          </label>
                          <input
                            id={`input-edu-institution-${idx}`}
                            type="text"
                            value={edu.institution}
                            onChange={(e) => {
                              const updated = [...resumeData.education];
                              updated[idx].institution = e.target.value;
                              updateEducation(updated);
                              if (idx === 0) clearError('education.0.institution');
                            }}
                            placeholder="UC Berkeley"
                            aria-invalid={
                              idx === 0 && Boolean(fieldErrors['education.0.institution'])
                            }
                            aria-describedby={
                              idx === 0 && fieldErrors['education.0.institution']
                                ? 'edu-inst-0-error'
                                : undefined
                            }
                            className={getInputClassName(
                              idx === 0 ? 'education.0.institution' : '',
                              'bg-[var(--bg-card)]'
                            )}
                          />
                          {idx === 0 && fieldErrors['education.0.institution'] && (
                            <p
                              id="edu-inst-0-error"
                              role="alert"
                              className="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1"
                            >
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              {fieldErrors['education.0.institution']}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-[var(--text-secondary)] mb-1">
                            Graduation Year
                          </label>
                          <input
                            type="text"
                            value={edu.graduationYear}
                            onChange={(e) => {
                              const updated = [...resumeData.education];
                              updated[idx].graduationYear = e.target.value;
                              updateEducation(updated);
                            }}
                            placeholder="2024"
                            className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-[var(--text-secondary)] mb-1">GPA</label>
                          <input
                            type="text"
                            value={edu.gpa || ''}
                            onChange={(e) => {
                              const updated = [...resumeData.education];
                              updated[idx].gpa = e.target.value;
                              updateEducation(updated);
                            }}
                            placeholder="3.85"
                            className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {resumeData.education.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      updateEducation([
                        ...resumeData.education,
                        {
                          id: `edu_${Date.now()}`,
                          degree: '',
                          institution: '',
                          graduationYear: '2024',
                          gpa: '',
                        },
                      ])
                    }
                    className="w-full py-2.5 rounded-xl border border-dashed border-[var(--border-color)] text-[var(--accent)] font-semibold flex items-center justify-center gap-1.5 hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Another Degree
                  </button>
                )}
              </div>
            )}

            {/* STEP 5: Experience */}
            {currentStep === 5 && (
              <div className="space-y-4 text-xs">
                {resumeData.candidateType === 'experienced' ? (
                  <div className="text-[11px] text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>
                      Required for experienced candidates. Include at least 1 verified professional role.
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                    Optional for freshers and recent graduates. You can include internships, part-time roles, or skip to Projects.
                  </div>
                )}

                {fieldErrors['experience'] && (
                  <div
                    role="alert"
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-500 font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{fieldErrors['experience']}</span>
                  </div>
                )}

                {resumeData.experience.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] text-center space-y-3">
                    <Briefcase className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-50" />
                    <p className="text-xs text-[var(--text-secondary)]">
                      {resumeData.candidateType === 'experienced'
                        ? 'No work experience added yet. At least one professional role is required.'
                        : 'No work experience added yet. Click below if you wish to add internships or jobs.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        id="add-experience-btn"
                        type="button"
                        onClick={() => {
                          updateExperience([
                            {
                              id: `exp_${Date.now()}`,
                              company: '',
                              role: '',
                              startDate: '2023-01',
                              endDate: '',
                              current: true,
                              bulletPoints: [
                                isFresher
                                  ? 'Contributed to front-end development, bug resolution, and unit testing as part of agile team.'
                                  : 'Spearheaded engineering deliverables with high performance.',
                              ],
                            },
                          ]);
                          clearError('experience');
                        }}
                        className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Plus className="w-4 h-4" />{' '}
                        {isFresher ? 'Add Internship / Role' : 'Add Work Experience'}
                      </button>
                      {isFresher && (
                        <button
                          type="button"
                          onClick={() => setCurrentStep(6)}
                          className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                        >
                          <span>Skip to Projects</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  resumeData.experience.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[var(--text-primary)]">Role #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = resumeData.experience.filter((_, i) => i !== idx);
                            updateExperience(updated);
                          }}
                          className="text-rose-400 hover:text-rose-500 transition-colors"
                          title="Remove role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor={`input-exp-role-${idx}`}
                            className="block font-medium text-[var(--text-primary)] mb-1"
                          >
                            Role Title{' '}
                            {resumeData.candidateType === 'experienced' && idx === 0 && (
                              <span className="text-rose-500">*</span>
                            )}
                          </label>
                          <input
                            id={`input-exp-role-${idx}`}
                            type="text"
                            value={exp.role}
                            onChange={(e) => {
                              const updated = [...resumeData.experience];
                              updated[idx].role = e.target.value;
                              updateExperience(updated);
                              if (idx === 0) clearError('experience.0.role');
                            }}
                            placeholder="Senior Software Engineer"
                            aria-invalid={
                              resumeData.candidateType === 'experienced' &&
                              idx === 0 &&
                              Boolean(fieldErrors['experience.0.role'])
                            }
                            aria-describedby={
                              idx === 0 && fieldErrors['experience.0.role']
                                ? 'exp-role-0-error'
                                : undefined
                            }
                            className={getInputClassName(
                              resumeData.candidateType === 'experienced' && idx === 0
                                ? 'experience.0.role'
                                : '',
                              'bg-[var(--bg-card)]'
                            )}
                          />
                          {resumeData.candidateType === 'experienced' &&
                            idx === 0 &&
                            fieldErrors['experience.0.role'] && (
                              <p
                                id="exp-role-0-error"
                                role="alert"
                                className="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1"
                              >
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                {fieldErrors['experience.0.role']}
                              </p>
                            )}
                        </div>

                        <div>
                          <label
                            htmlFor={`input-exp-company-${idx}`}
                            className="block font-medium text-[var(--text-primary)] mb-1"
                          >
                            Company{' '}
                            {resumeData.candidateType === 'experienced' && idx === 0 && (
                              <span className="text-rose-500">*</span>
                            )}
                          </label>
                          <input
                            id={`input-exp-company-${idx}`}
                            type="text"
                            value={exp.company}
                            onChange={(e) => {
                              const updated = [...resumeData.experience];
                              updated[idx].company = e.target.value;
                              updateExperience(updated);
                              if (idx === 0) clearError('experience.0.company');
                            }}
                            placeholder="Nexus Technologies"
                            aria-invalid={
                              resumeData.candidateType === 'experienced' &&
                              idx === 0 &&
                              Boolean(fieldErrors['experience.0.company'])
                            }
                            aria-describedby={
                              idx === 0 && fieldErrors['experience.0.company']
                                ? 'exp-comp-0-error'
                                : undefined
                            }
                            className={getInputClassName(
                              resumeData.candidateType === 'experienced' && idx === 0
                                ? 'experience.0.company'
                                : '',
                              'bg-[var(--bg-card)]'
                            )}
                          />
                          {resumeData.candidateType === 'experienced' &&
                            idx === 0 &&
                            fieldErrors['experience.0.company'] && (
                              <p
                                id="exp-comp-0-error"
                                role="alert"
                                className="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1"
                              >
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                {fieldErrors['experience.0.company']}
                              </p>
                            )}
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium text-[var(--text-primary)] mb-1">
                          Accomplishment Bullets (one per line)
                        </label>
                        <textarea
                          rows={3}
                          value={exp.bulletPoints.join('\n')}
                          onChange={(e) => {
                            const updated = [...resumeData.experience];
                            updated[idx].bulletPoints = e.target.value.split('\n').filter(Boolean);
                            updateExperience(updated);
                          }}
                          placeholder="Architected distributed microservices reducing query latency by 40%."
                          className="w-full p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    </div>
                  ))
                )}

                <button
                  type="button"
                  onClick={() =>
                    updateExperience([
                      ...resumeData.experience,
                      {
                        id: `exp_${Date.now()}`,
                        company: '',
                        role: '',
                        startDate: '2023-01',
                        endDate: '',
                        current: true,
                        bulletPoints: ['Spearheaded engineering deliverables with high performance.'],
                      },
                    ])
                  }
                  className="w-full py-2.5 rounded-xl border border-dashed border-[var(--border-color)] text-[var(--accent)] font-semibold flex items-center justify-center gap-1.5 hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Experience Position
                </button>
              </div>
            )}

            {/* STEP 6: Projects */}
            {currentStep === 6 && (
              <div className="space-y-4 text-xs">
                {resumeData.candidateType === 'fresher' ? (
                  <div className="text-[11px] text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>
                      Required for freshers and entry-level candidates. Add at least 1 highlighted project.
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                    Optional for experienced candidates. Include projects if you want to highlight open source or flagship systems.
                  </div>
                )}

                {fieldErrors['projects'] && (
                  <div
                    role="alert"
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-500 font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{fieldErrors['projects']}</span>
                  </div>
                )}

                {resumeData.projects.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] text-center space-y-3">
                    <FolderGit2 className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-50" />
                    <p className="text-xs text-[var(--text-secondary)]">
                      {resumeData.candidateType === 'fresher'
                        ? 'No projects added yet. Freshers must add at least one project.'
                        : 'No projects added yet. Click below if you wish to add personal or open source projects.'}
                    </p>
                    <button
                      id="add-project-btn"
                      type="button"
                      onClick={() => {
                        updateProjects([
                          {
                            id: `proj_${Date.now()}`,
                            title: '',
                            description: '',
                            technologies: ['Python'],
                          },
                        ]);
                        clearError('projects');
                      }}
                      className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Project
                    </button>
                  </div>
                ) : (
                  resumeData.projects.map((proj, idx) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[var(--text-primary)]">Project #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = resumeData.projects.filter((_, i) => i !== idx);
                            updateProjects(updated);
                          }}
                          className="text-rose-400 hover:text-rose-500 transition-colors"
                          title="Remove project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label
                          htmlFor={`input-proj-title-${idx}`}
                          className="block font-medium text-[var(--text-primary)] mb-1"
                        >
                          Project Name{' '}
                          {resumeData.candidateType === 'fresher' && idx === 0 && (
                            <span className="text-rose-500">*</span>
                          )}
                        </label>
                        <input
                          id={`input-proj-title-${idx}`}
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const updated = [...resumeData.projects];
                            updated[idx].title = e.target.value;
                            updateProjects(updated);
                            if (idx === 0) clearError('projects.0.title');
                          }}
                          placeholder="NeuralFlow Vector Search"
                          aria-invalid={
                            resumeData.candidateType === 'fresher' &&
                            idx === 0 &&
                            Boolean(fieldErrors['projects.0.title'])
                          }
                          aria-describedby={
                            idx === 0 && fieldErrors['projects.0.title']
                              ? 'proj-title-0-error'
                              : undefined
                          }
                          className={getInputClassName(
                            resumeData.candidateType === 'fresher' && idx === 0
                              ? 'projects.0.title'
                              : '',
                            'bg-[var(--bg-card)]'
                          )}
                        />
                        {resumeData.candidateType === 'fresher' &&
                          idx === 0 &&
                          fieldErrors['projects.0.title'] && (
                            <p
                              id="proj-title-0-error"
                              role="alert"
                              className="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1"
                            >
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              {fieldErrors['projects.0.title']}
                            </p>
                          )}
                      </div>

                      <div>
                        <label className="block font-medium text-[var(--text-primary)] mb-1">
                          Technologies (comma separated)
                        </label>
                        <input
                          type="text"
                          value={proj.technologies.join(', ')}
                          onChange={(e) => {
                            const updated = [...resumeData.projects];
                            updated[idx].technologies = e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean);
                            updateProjects(updated);
                          }}
                          placeholder="Python, C++, Docker"
                          className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[var(--text-primary)] mb-1">
                          Description & Impact
                        </label>
                        <textarea
                          rows={2}
                          value={proj.description}
                          onChange={(e) => {
                            const updated = [...resumeData.projects];
                            updated[idx].description = e.target.value;
                            updateProjects(updated);
                          }}
                          placeholder="Designed and deployed high-performance vector search engine with millisecond latency."
                          className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs"
                        />
                      </div>
                    </div>
                  ))
                )}

                <button
                  type="button"
                  onClick={() =>
                    updateProjects([
                      ...resumeData.projects,
                      {
                        id: `proj_${Date.now()}`,
                        title: '',
                        description: '',
                        technologies: ['Python'],
                      },
                    ])
                  }
                  className="w-full py-2.5 rounded-xl border border-dashed border-[var(--border-color)] text-[var(--accent)] font-semibold flex items-center justify-center gap-1.5 hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Project
                </button>
              </div>
            )}

            {/* STEP 7: Certifications */}
            {currentStep === 7 && (
              <div className="space-y-4 text-xs">
                <p className="text-xs text-[var(--text-secondary)]">
                  Certifications are optional. Add credentials, professional licenses, or cloud badges.
                </p>

                {resumeData.certifications.map((cert, idx) => (
                  <div
                    key={cert.id}
                    className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[var(--text-primary)]">Certification #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = resumeData.certifications.filter((_, i) => i !== idx);
                          updateCertifications(updated);
                        }}
                        className="text-rose-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => {
                          const updated = [...resumeData.certifications];
                          updated[idx].name = e.target.value;
                          updateCertifications(updated);
                        }}
                        placeholder="AWS Solutions Architect"
                        className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs"
                      />
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => {
                          const updated = [...resumeData.certifications];
                          updated[idx].issuer = e.target.value;
                          updateCertifications(updated);
                        }}
                        placeholder="Amazon Web Services"
                        className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    updateCertifications([
                      ...resumeData.certifications,
                      {
                        id: `cert_${Date.now()}`,
                        name: '',
                        issuer: '',
                        date: '2024',
                      },
                    ])
                  }
                  className="w-full py-2.5 rounded-xl border border-dashed border-[var(--border-color)] text-[var(--accent)] font-semibold flex items-center justify-center gap-1.5 hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Certification
                </button>
              </div>
            )}

            {/* STEP 8: Template Library */}
            {currentStep === 8 && (
              <div className="space-y-4 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-xs text-[var(--text-secondary)]">
                    Choose from 12 distinct, professionally designed resume templates:
                  </p>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    12 Designs Available
                  </span>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {[
                    'All',
                    'ATS-Friendly',
                    'Professional',
                    'Tech',
                    'Executive',
                    'Entry Level',
                    'Creative',
                    'Minimalist',
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[var(--accent)] text-white shadow-sm'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Template Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
                  {RESUME_TEMPLATES.filter((tmpl) => {
                    if (selectedCategory === 'All') return true;
                    if (selectedCategory === 'ATS-Friendly') return tmpl.isAtsFriendly;
                    return (
                      tmpl.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                      tmpl.tags?.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase()))
                    );
                  }).map((tmpl) => {
                    const isSelected =
                      normalizeTemplateId(resumeData.templateId) === tmpl.id;
                    const hasEnteredInfo = Boolean(
                      resumeData.personalInfo?.fullName?.trim() || resumeData.summary?.trim()
                    );
                    return (
                      <TemplateCard
                        key={tmpl.id}
                        template={tmpl}
                        isSelected={isSelected}
                        onSelect={(id) => setTemplateId(id)}
                        onPreview={(id) => {
                          setTemplateId(id);
                          setCurrentStep(9);
                        }}
                        previewData={hasEnteredInfo ? resumeData : MINI_SAMPLE_RESUME_DATA}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 9: Preview Instructions & Verification */}
            {currentStep === 9 && (
              <div className="space-y-4 text-left text-xs">
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text-primary)] text-xs block">
                      Active Template
                    </span>
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                      {RESUME_TEMPLATES.find(
                        (t) => t.id === normalizeTemplateId(resumeData.templateId)
                      )?.name || 'ATS Classic'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Inspect your live A4 document layout on the right. You can zoom in/out, fit to screen, and verify line wrapping, typography, and section order before downloading.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-500/5 border border-[var(--border-color)] space-y-2">
                  <span className="font-bold text-[var(--text-primary)] text-xs block flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    A4 Geometry & Margin Verification
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Standard A4 portrait dimensions: 210mm × 297mm (1 : 1.414 aspect ratio). Multi-page resumes automatically display dashed page-break boundaries.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(8)}
                    className="flex-1 py-2 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    ← Select Different Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(10)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    Proceed to Download →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 10: Generate & Download PDF */}
            {currentStep === 10 && (
              <div className="space-y-4 text-left text-xs">
                {exportSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    Print dialog opened. Select &quot;Save as PDF&quot; to download your resume.
                  </div>
                )}

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-400 text-sm">Resume Ready For Download</h4>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Formatted using the{' '}
                      <strong>
                        {RESUME_TEMPLATES.find(
                          (t) => t.id === normalizeTemplateId(resumeData.templateId)
                        )?.name || 'ATS Classic'}
                      </strong>{' '}
                      layout. Standard A4 portrait document (210mm × 297mm) with selectable vector text and clickable links.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Candidate Name:</span>
                    <strong className="text-[var(--text-primary)]">
                      {resumeData.personalInfo.fullName || 'Not specified'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Export Filename:</span>
                    <span className="font-mono text-indigo-400">
                      {(resumeData.personalInfo.fullName || 'Candidate')
                        .trim()
                        .replace(/[^a-zA-Z0-9_\-\s]/g, '')
                        .replace(/\s+/g, '_')}
                      _Resume.pdf
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <button
                    id="btn-download-pdf"
                    type="button"
                    onClick={handleGenerateOrPrint}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-2 h-[44px] rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    {isExporting ? 'Preparing PDF...' : 'Download A4 PDF / Save PDF'}
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateOrPrint}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-2 h-[40px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-medium text-xs hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Printer className="w-4 h-4" />
                    Open System Print Dialog
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[10.5px] text-[var(--text-secondary)] space-y-1">
                  <strong className="text-[var(--text-primary)] block text-[11px]">
                    PDF Export Instructions:
                  </strong>
                  <p>1. In the browser print dialog, choose Destination: <strong>Save as PDF</strong>.</p>
                  <p>2. Select Paper Size: <strong>A4</strong> with <strong>Portrait</strong> orientation.</p>
                  <p>3. Under More Settings, set Margins to <strong>Default</strong> or <strong>None</strong> and check <strong>Background graphics</strong>.</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons (Previous / Next) */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="inline-flex items-center gap-1.5 h-[40px] px-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] text-xs font-medium disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </button>

              {currentStep < 10 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-1.5 h-[40px] px-5 rounded-lg text-xs font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm transition-colors cursor-pointer"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateOrPrint}
                  className="inline-flex items-center gap-1.5 h-[40px] px-5 rounded-lg text-xs font-medium bg-[var(--color-success)] hover:opacity-90 text-white shadow-sm transition-all cursor-pointer"
                >
                  Generate Resume
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right: Live A4 Document Preview */}
        <div
          className={`resume-preview-column ${
            currentStep >= 9 ? 'lg:col-span-8' : 'lg:col-span-6'
          } flex flex-col items-center min-w-0 w-full max-w-full`}
        >
          {/* Zoom & Document Viewer Controls */}
          <div className="no-print w-full flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[var(--accent)]" />
              Live A4 Preview (210 × 297 mm)
            </span>
            <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-1 text-xs shadow-sm">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 0.50}
                className="p-1 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
                title="Zoom Out (min 50%)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-semibold text-[var(--text-primary)] min-w-[42px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 1.25}
                className="p-1 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
                title="Zoom In (max 125%)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-0.5 rounded text-[10px] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors cursor-pointer"
                title="Fit to Container"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Scrollable A4 Viewport Container */}
          <div
            ref={previewViewportRef}
            id="resume-print-viewport"
            className="resume-preview-viewport w-full max-w-full overflow-auto max-h-[820px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 flex justify-center shadow-sm focus:outline-none"
            tabIndex={0}
            role="region"
            aria-label="A4 Resume Preview Viewport"
          >
            <A4ResumeDocument
              data={resumeData}
              templateId={resumeData.templateId}
              zoom={zoom}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
