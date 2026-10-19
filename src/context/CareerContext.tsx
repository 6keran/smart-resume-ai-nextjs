'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  SupportedSkill,
  UserSkill,
  AssessmentAttempt,
  SkillCertificate,
} from '@/types/skills';
import { JobMatchResult } from '@/types/jobs';
import {
  DashboardMetrics,
  ActivityLogItem,
  UserFeedback,
} from '@/types/dashboard';
import {
  INITIAL_USER_SKILLS,
  INITIAL_METRICS,
  INITIAL_ACTIVITIES,
} from '@/lib/initialData';
import { generateId } from '@/lib/utils';

interface CareerContextType {
  skills: UserSkill[];
  addSkill: (name: SupportedSkill, category: UserSkill['category'], claimDirectly?: boolean) => void;
  removeSkill: (id: string) => Promise<{ success: boolean; error?: string; skillName?: string; wasVerified?: boolean }>;
  refreshSkills: () => Promise<void>;
  claimSkill: (name: SupportedSkill) => void;
  recordAssessmentResult: (attempt: AssessmentAttempt) => SkillCertificate | null;
  certificates: SkillCertificate[];
  getCertificateById: (id: string) => SkillCertificate | undefined;
  metrics: DashboardMetrics;
  activities: ActivityLogItem[];
  addActivity: (type: ActivityLogItem['type'], title: string, description: string, meta?: ActivityLogItem['meta']) => void;
  jobMatches: JobMatchResult[];
  saveJobMatch: (match: JobMatchResult) => void;
  submitFeedback: (feedback: Omit<UserFeedback, 'id' | 'submittedAt'>) => Promise<boolean>;
}

const CareerContext = createContext<CareerContextType | undefined>(undefined);

export function CareerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [skills, setSkills] = useState<UserSkill[]>(INITIAL_USER_SKILLS);
  const [certificates, setCertificates] = useState<SkillCertificate[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>(INITIAL_METRICS);
  const [activities, setActivities] = useState<ActivityLogItem[]>(INITIAL_ACTIVITIES);
  const [jobMatches, setJobMatches] = useState<JobMatchResult[]>([]);

  const isPublicOrAdmin =
    pathname === '/login' ||
    pathname === '/register' ||
    Boolean(pathname?.startsWith('/admin'));

  // Load skills from persistent API or local storage fallback
  const refreshSkills = useCallback(async () => {
    // If on public/admin route or browser has no session, skip network request
    if (
      typeof window !== 'undefined' &&
      (isPublicOrAdmin || !document.cookie.includes('sra_user_session='))
    ) {
      try {
        const savedSkills = localStorage.getItem('sra_skills');
        if (savedSkills) setSkills(JSON.parse(savedSkills));
      } catch {}
      return;
    }

    try {
      const res = await fetch('/api/user/skills', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
          setSkills(data.skills);
          return;
        }
      }
    } catch {
      // ignore
    }

    try {
      const savedSkills = localStorage.getItem('sra_skills');
      if (savedSkills) setSkills(JSON.parse(savedSkills));
    } catch {}
  }, [isPublicOrAdmin]);

  useEffect(() => {
    if (!isPublicOrAdmin) {
      refreshSkills();
    }

    try {
      const savedCerts = localStorage.getItem('sra_certs');
      if (savedCerts) setCertificates(JSON.parse(savedCerts));

      const savedMatches = localStorage.getItem('sra_matches');
      if (savedMatches) setJobMatches(JSON.parse(savedMatches));
    } catch {
      // ignore
    }
  }, [isPublicOrAdmin, refreshSkills]);

  useEffect(() => {
    try {
      localStorage.setItem('sra_skills', JSON.stringify(skills));
    } catch {
      // ignore
    }
  }, [skills]);

  useEffect(() => {
    try {
      localStorage.setItem('sra_certs', JSON.stringify(certificates));
    } catch {
      // ignore
    }
  }, [certificates]);

  const addSkill = async (
    name: SupportedSkill,
    category: UserSkill['category'],
    claimDirectly = true
  ) => {
    const existing = skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (claimDirectly && existing.status === 'not-verified') {
        claimSkill(name);
      }
      return;
    }

    try {
      const res = await fetch('/api/user/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, claimDirectly }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.skill) {
          setSkills((prev) => [...prev, data.skill]);
          addActivity('skill_claimed', `Skill Claimed: ${name}`, `Added under ${category} category.`);
          return;
        }
      }
    } catch {
      // fallback
    }

    const newSkill: UserSkill = {
      id: generateId('skill'),
      name,
      category,
      status: claimDirectly ? 'claimed' : 'not-verified',
      claimedDate: claimDirectly ? new Date().toISOString().split('T')[0] : undefined,
    };

    setSkills((prev) => [...prev, newSkill]);
    addActivity('skill_claimed', `Skill Claimed: ${name}`, `Added under ${category} category.`);
  };

  const removeSkill = async (
    id: string
  ): Promise<{ success: boolean; error?: string; skillName?: string; wasVerified?: boolean }> => {
    const target = skills.find((s) => s.id === id || s.name.toLowerCase() === id.toLowerCase());
    if (!target) {
      return { success: false, error: 'Skill not found.' };
    }

    try {
      const res = await fetch('/api/user/skills', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: target.id, name: target.name }),
      });

      // If user is guest/visitor (401), allow local removal
      if (res.status === 401) {
        setSkills((prev) => prev.filter((s) => s.id !== target.id));
        return { success: true, skillName: target.name, wasVerified: target.status === 'verified' };
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Server rejected skill removal.' };
      }

      // Confirmed server deletion: remove from client state
      setSkills((prev) => prev.filter((s) => s.id !== target.id));
      return { success: true, skillName: target.name, wasVerified: target.status === 'verified' };
    } catch (err: any) {
      console.error('Error removing skill:', err);
      return { success: false, error: 'Network error. Could not delete skill.' };
    }
  };

  const claimSkill = (name: SupportedSkill) => {
    setSkills((prev) =>
      prev.map((s) =>
        s.name === name
          ? {
              ...s,
              status: s.status === 'verified' ? 'verified' : 'claimed',
              claimedDate: s.claimedDate || new Date().toISOString().split('T')[0],
            }
          : s
      )
    );
    addActivity('skill_claimed', `Skill Claimed: ${name}`, 'Marked as claimed, ready for assessment.');
  };

  const recordAssessmentResult = (attempt: AssessmentAttempt): SkillCertificate | null => {
    let cert: SkillCertificate | null = null;

    if (attempt.passed) {
      const certId = `SRA-VER-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      cert = {
        id: certId,
        verificationCode: certId,
        userName: 'Candidate',
        skill: attempt.skill,
        score: attempt.score,
        passingScore: 7,
        issuedAt: new Date().toISOString().split('T')[0],
        verificationStatus: 'VERIFIED',
        issuer: 'Smart Resume AI Career Intelligence',
      };

      setCertificates((prev) => [cert!, ...prev]);

      // Update skill status to verified
      setSkills((prev) =>
        prev.map((s) =>
          s.name === attempt.skill
            ? {
                ...s,
                status: 'verified',
                verifiedDate: new Date().toISOString().split('T')[0],
                score: attempt.score,
                certificateId: certId,
              }
            : s
        )
      );

      // Increment metrics
      setMetrics((prev) => ({
        ...prev,
        skillsVerified: prev.skillsVerified + 1,
        assessmentsCompleted: prev.assessmentsCompleted + 1,
      }));

      addActivity(
        'skill_verified',
        `${attempt.skill} Skill Verified`,
        `Passed 10-question assessment with score ${attempt.score}/10. Issued Certificate ${certId}.`,
        { skillName: attempt.skill, score: attempt.score }
      );
    } else {
      setMetrics((prev) => ({
        ...prev,
        assessmentsCompleted: prev.assessmentsCompleted + 1,
      }));

      addActivity(
        'assessment_completed',
        `${attempt.skill} Assessment Completed`,
        `Completed assessment with score ${attempt.score}/10 (Passing is 7/10).`,
        { skillName: attempt.skill, score: attempt.score }
      );
    }

    return cert;
  };

  const getCertificateById = (id: string): SkillCertificate | undefined => {
    return certificates.find((c) => c.id === id || c.verificationCode === id);
  };

  const addActivity = (
    type: ActivityLogItem['type'],
    title: string,
    description: string,
    meta?: ActivityLogItem['meta']
  ) => {
    const item: ActivityLogItem = {
      id: generateId('act'),
      type,
      title,
      description,
      timestamp: 'Just now',
      meta,
    };
    setActivities((prev) => [item, ...prev]);
  };

  const saveJobMatch = (match: JobMatchResult) => {
    setJobMatches((prev) => [match, ...prev]);
    setMetrics((prev) => ({ ...prev, jobMatches: prev.jobMatches + 1 }));
    addActivity(
      'job_match_completed',
      `Job Match Evaluated: ${match.company}`,
      `${match.jobTitle} · ${match.overallMatchScore}% Match Score.`,
      { jobTitle: match.jobTitle, score: match.overallMatchScore }
    );
  };

  const submitFeedback = async (
    feedback: Omit<UserFeedback, 'id' | 'submittedAt'>
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
      return res.ok;
    } catch {
      return true; // graceful offline response
    }
  };

  return (
    <CareerContext.Provider
      value={{
        skills,
        addSkill,
        removeSkill,
        refreshSkills,
        claimSkill,
        recordAssessmentResult,
        certificates,
        getCertificateById,
        metrics,
        activities,
        addActivity,
        jobMatches,
        saveJobMatch,
        submitFeedback,
      }}
    >
      {children}
    </CareerContext.Provider>
  );
}

export function useCareer() {
  const context = useContext(CareerContext);
  if (!context) {
    throw new Error('useCareer must be used within a CareerProvider');
  }
  return context;
}
