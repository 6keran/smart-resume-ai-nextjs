'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ResumeData,
  ResumeAnalysisResult,
  ImprovementItem,
  ResumeTemplateId,
} from '@/types/resume';
import { INITIAL_RESUME_DATA } from '@/lib/initialData';

interface ResumeContextType {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  updatePersonalInfo: (info: Partial<ResumeData['personalInfo']>) => void;
  updateSummary: (summary: string) => void;
  updateSkills: (skills: ResumeData['skills']) => void;
  updateExperience: (exp: ResumeData['experience']) => void;
  updateEducation: (edu: ResumeData['education']) => void;
  updateProjects: (proj: ResumeData['projects']) => void;
  updateCertifications: (certs: ResumeData['certifications']) => void;
  setTemplateId: (templateId: ResumeTemplateId) => void;
  setCandidateType: (type: 'experienced' | 'fresher') => void;
  // Analysis
  analysisResult: ResumeAnalysisResult | null;
  setAnalysisResult: (result: ResumeAnalysisResult | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  runAnalysis: (input?: string | File, jobDescription?: string) => Promise<ResumeAnalysisResult>;
  // Improvement
  improvements: ImprovementItem[];
  acceptImprovement: (id: string) => void;
  rejectImprovement: (id: string) => void;
  regenerateImprovement: (id: string) => Promise<void>;
  resetToSampleResume: () => void;
  loadFresherSample: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [improvements, setImprovements] = useState<ImprovementItem[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage if available on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sra_resume_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.personalInfo?.fullName === 'Candidate Profile' ||
          parsed.personalInfo?.fullName === 'Alex Morgan' ||
          parsed.personalInfo?.email === 'candidate@email.com'
        ) {
          localStorage.removeItem('sra_resume_data');
          setResumeData(INITIAL_RESUME_DATA);
        } else {
          setResumeData(parsed);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage on change (only after initial load has finished)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('sra_resume_data', JSON.stringify(resumeData));
    } catch {
      // ignore
    }
  }, [resumeData, isLoaded]);

  const updatePersonalInfo = (info: Partial<ResumeData['personalInfo']>) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateSummary = (summary: string) => {
    setResumeData((prev) => ({
      ...prev,
      summary,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateSkills = (skills: ResumeData['skills']) => {
    setResumeData((prev) => ({
      ...prev,
      skills,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateExperience = (experience: ResumeData['experience']) => {
    setResumeData((prev) => ({
      ...prev,
      experience,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateEducation = (education: ResumeData['education']) => {
    setResumeData((prev) => ({
      ...prev,
      education,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateProjects = (projects: ResumeData['projects']) => {
    setResumeData((prev) => ({
      ...prev,
      projects,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateCertifications = (certifications: ResumeData['certifications']) => {
    setResumeData((prev) => ({
      ...prev,
      certifications,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const setTemplateId = (templateId: ResumeTemplateId) => {
    setResumeData((prev) => ({
      ...prev,
      templateId,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const setCandidateType = (candidateType: 'experienced' | 'fresher') => {
    setResumeData((prev) => ({
      ...prev,
      candidateType,
    }));
  };

  const runAnalysis = async (
    input?: string | File,
    jobDescription?: string
  ): Promise<ResumeAnalysisResult> => {
    setIsAnalyzing(true);
    try {
      let res: Response;

      if (input instanceof File) {
        const formData = new FormData();
        formData.append('file', input);
        if (jobDescription && jobDescription.trim()) {
          formData.append('jobDescription', jobDescription.trim());
        }
        res = await fetch('/api/resume/analyze', {
          method: 'POST',
          body: formData,
        });
      } else {
        const textToAnalyze =
          typeof input === 'string' && input.trim()
            ? input
            : `${resumeData.personalInfo.fullName}\n${resumeData.personalInfo.headline}\n${resumeData.summary}\nSkills: ${resumeData.skills.technical.join(', ')}\nExperience:\n${resumeData.experience
                .map((e) => `${e.role} at ${e.company}: ${e.bulletPoints.join(' ')}`)
                .join('\n')}`;

        res = await fetch('/api/resume/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText: textToAnalyze,
            jobDescription: jobDescription && jobDescription.trim() ? jobDescription.trim() : undefined,
          }),
        });
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson.message || 'Unable to read this resume. Please upload a valid PDF or DOCX file.'
        );
      }

      const data: ResumeAnalysisResult = await res.json();
      setAnalysisResult(data);

      if (data.topSuggestions && Array.isArray(data.topSuggestions) && data.topSuggestions.length > 0) {
        const mappedImprovements: ImprovementItem[] = data.topSuggestions.map((sug, idx) => ({
          id: `imp_real_${Date.now()}_${idx}`,
          section: (sug.section?.toLowerCase().includes('experience')
            ? 'experience'
            : sug.section?.toLowerCase().includes('summary')
            ? 'summary'
            : sug.section?.toLowerCase().includes('project')
            ? 'projects'
            : 'skills') as any,
          field: sug.section || 'Resume Section',
          originalContent: sug.whatNeedsImprovement,
          improvedContent: sug.example || sug.howToImprove,
          reasoning: sug.whyItMatters,
          metricImpact: sug.priority === 'High' ? '+10 ATS Points' : sug.priority === 'Medium' ? '+6 ATS Points' : '+3 ATS Points',
          status: 'pending',
        }));
        setImprovements(mappedImprovements);
      } else if (data.recommendations && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        const mappedImprovements: ImprovementItem[] = data.recommendations.map((rec, idx) => ({
          id: `imp_real_${Date.now()}_${idx}`,
          section: (rec.category?.toLowerCase() || 'summary') as any,
          field: rec.title || 'Resume Section',
          originalContent: rec.originalText || rec.title,
          improvedContent: rec.improvedText || rec.actionText || rec.title,
          reasoning: rec.actionText || 'Optimized for high-impact ATS readability.',
          metricImpact: '+5 ATS Points',
          status: 'pending',
        }));
        setImprovements(mappedImprovements);
      }

      return data;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const acceptImprovement = (id: string) => {
    const item = improvements.find((imp) => imp.id === id);
    if (!item) return;

    if (item.section === 'summary') {
      updateSummary(item.improvedContent);
    } else if (item.section === 'experience' && resumeData.experience.length > 0) {
      const newExp = [...resumeData.experience];
      if (newExp[0].bulletPoints.length > 0) {
        newExp[0].bulletPoints[0] = item.improvedContent;
        updateExperience(newExp);
      }
    }

    setImprovements((prev) =>
      prev.map((imp) => (imp.id === id ? { ...imp, status: 'accepted' } : imp))
    );
  };

  const rejectImprovement = (id: string) => {
    setImprovements((prev) =>
      prev.map((imp) => (imp.id === id ? { ...imp, status: 'rejected' } : imp))
    );
  };

  const regenerateImprovement = async (id: string) => {
    const item = improvements.find((imp) => imp.id === id);
    if (!item) return;

    try {
      const res = await fetch('/api/resume/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: item.section,
          originalContent: item.originalContent,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setImprovements((prev) =>
          prev.map((imp) =>
            imp.id === id
              ? {
                  ...imp,
                  improvedContent: data.improvedContent,
                  reasoning: data.reasoning,
                  metricImpact: data.metricImpact,
                  status: 'pending',
                }
              : imp
          )
        );
      }
    } catch {
      // keep existing
    }
  };

  const resetToSampleResume = async () => {
    try {
      const { SAMPLE_EXPERIENCED_RESUME } = await import('@/lib/sampleResume');
      setResumeData(SAMPLE_EXPERIENCED_RESUME);
    } catch {
      setResumeData(INITIAL_RESUME_DATA);
    }
    setAnalysisResult(null);
    setImprovements([]);
  };

  const loadFresherSample = () => {
    const fresherData: ResumeData = {
      id: 'res_fresher_02',
      title: 'Junior Software & Data Engineer',
      candidateType: 'fresher',
      personalInfo: {
        fullName: 'Maya Chen',
        email: 'maya.chen@email.com',
        phone: '+1 (555) 789-0123',
        location: 'Austin, TX',
        headline: 'Computer Science Graduate & Junior Software Engineer',
        linkedin: 'linkedin.com/in/mayachen-cs',
        github: 'github.com/mayachen-dev',
        portfolio: 'mayachen.io',
      },
      summary:
        'Motivated Computer Science graduate with hands-on expertise in Python, SQL, React, and data analytics pipelines. Developed multiple end-to-end full stack web platforms and machine learning forecasting models during university capstones. Quick learner passionate about scalable distributed systems.',
      skills: {
        technical: ['Python', 'SQL', 'React', 'JavaScript', 'Git', 'Data Analysis', 'Docker'],
        soft: ['Rapid Prototyping', 'Problem Solving', 'Effective Communication', 'Agile Teamwork'],
        tools: ['VS Code', 'GitHub', 'Postman', 'Tableau', 'Jupyter Notebook'],
      },
      experience: [],
      education: [
        {
          id: 'edu_fresher',
          degree: 'B.S. in Computer Science & Applied Statistics',
          institution: 'University of Texas at Austin',
          location: 'Austin, TX',
          graduationYear: '2024',
          gpa: '3.91',
          honors: 'Dean’s Honor List, Outstanding Capstone Project Award',
        },
      ],
      projects: [
        {
          id: 'proj_f1',
          title: 'Algorithmic Trading & Portfolio Simulator',
          description:
            'Engineered event-driven backtesting platform in Python using Pandas and NumPy, simulating momentum strategies over 10 years of S&P 500 tick data.',
          technologies: ['Python', 'Pandas', 'NumPy', 'Flask', 'Chart.js'],
          link: 'github.com/mayachen-dev/algo-simulator',
          bullets: [
            'Implemented risk metrics calculation including Sharpe Ratio, Sortino Ratio, and Maximum Drawdown with sub-200ms compute time.',
            'Built responsive React dashboard displaying real-time simulation equity curves and portfolio rebalancing triggers.',
          ],
        },
        {
          id: 'proj_f2',
          title: 'Campus Resource Exchange Platform',
          description:
            'Full stack web application allowing 12,000+ university students to exchange textbooks, lab gear, and tutoring notes with verified student SSO.',
          technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
          link: 'github.com/mayachen-dev/campus-hub',
          bullets: [
            'Designed normalized relational schema in PostgreSQL supporting fast full-text search across 5,000+ item listings.',
            'Integrated JWT authentication and automated email notification queue using Redis.',
          ],
        },
      ],
      certifications: [
        {
          id: 'cert_f1',
          name: 'Meta Certified Front-End Developer',
          issuer: 'Meta',
          date: '2024',
          credentialId: 'META-FED-9921',
        },
      ],
      templateId: 'graduate-entry',
      lastUpdated: new Date().toISOString(),
    };
    setResumeData(fresherData);
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData,
        updatePersonalInfo,
        updateSummary,
        updateSkills,
        updateExperience,
        updateEducation,
        updateProjects,
        updateCertifications,
        setTemplateId,
        setCandidateType,
        analysisResult,
        setAnalysisResult,
        isAnalyzing,
        setIsAnalyzing,
        runAnalysis,
        improvements,
        acceptImprovement,
        rejectImprovement,
        regenerateImprovement,
        resetToSampleResume,
        loadFresherSample,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
