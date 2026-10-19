import 'server-only';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { SEED_SKILLS, INITIAL_ASSESSMENT_QUESTIONS } from './seedQuestions';

let dbInstance: DatabaseSync | null = null;

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'smart_resume.db');

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'smart_resume_ai_super_secret_admin_jwt_key_2026';

/**
 * Returns the singleton SQLite database instance, creating tables and indexes on first call.
 */
export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  dbInstance = new DatabaseSync(DB_PATH);

  // Enable WAL mode for high concurrency and performance
  dbInstance.exec('PRAGMA journal_mode = WAL;');
  dbInstance.exec('PRAGMA foreign_keys = ON;');

  // 1. Admin Users Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'ADMIN',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login_at TEXT,
      is_active INTEGER DEFAULT 1
    );
  `);

  // 1b. Real Users / Candidate Profiles Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      session_token TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_active_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_users_token ON users(session_token);
    CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
  `);

  // 2. Visitors / Sessions Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      anonymous_id TEXT UNIQUE NOT NULL,
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      total_sessions INTEGER DEFAULT 1,
      user_agent TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_visitors_anon ON visitors(anonymous_id);
  `);

  // 3. Resumes Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      filename TEXT NOT NULL,
      file_type TEXT NOT NULL,
      uploaded_at TEXT NOT NULL,
      parsed_successfully INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_resumes_visitor ON resumes(visitor_id);
  `);

  // 4. Resume Analyses Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS resume_analyses (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      resume_id TEXT,
      file_type TEXT NOT NULL,
      analyzed_at TEXT NOT NULL,
      ats_score REAL NOT NULL,
      keyword_score REAL NOT NULL,
      formatting_score REAL NOT NULL,
      section_score REAL NOT NULL,
      analysis_status TEXT NOT NULL,
      detected_keywords TEXT,
      missing_keywords TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_analyses_date ON resume_analyses(analyzed_at);
  `);

  // 5. Verified Skills Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS verified_skills (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      skill_name TEXT NOT NULL,
      status TEXT NOT NULL,
      assessment_id TEXT,
      verified_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_skills_name ON verified_skills(skill_name);
  `);

  // 6. Assessments Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      skill TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      status TEXT NOT NULL,
      duration_seconds INTEGER DEFAULT 0,
      started_at TEXT,
      completed_at TEXT,
      proctoring_violation_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_assessments_skill ON assessments(skill);
  `);

  // 7. Job Searches Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS job_searches (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      query TEXT NOT NULL,
      location TEXT,
      provider TEXT NOT NULL,
      results_count INTEGER NOT NULL,
      searched_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_job_searches_date ON job_searches(searched_at);
  `);

  // 8. Job Matches Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS job_matches (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      resume_id TEXT,
      job_id TEXT,
      job_title TEXT,
      company TEXT,
      match_score REAL NOT NULL,
      matched_skills TEXT,
      partial_skills TEXT,
      missing_skills TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 9. Feedback Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      rating INTEGER NOT NULL,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      suggestions TEXT,
      status TEXT DEFAULT 'new',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_feedback_date ON feedback(created_at);
  `);

  // 10. Skills Catalog Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS skills_catalog (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_skills_cat_slug ON skills_catalog(slug);
  `);

  // 11. Assessment Configuration Table (per-skill settings)
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS assessment_configs (
      id TEXT PRIMARY KEY,
      skill_slug TEXT UNIQUE NOT NULL,
      questions_count INTEGER DEFAULT 10,
      pass_percentage INTEGER DEFAULT 70,
      time_limit_minutes INTEGER DEFAULT 20,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 12. Assessment Questions Table (Question Bank)
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS assessment_questions (
      id TEXT PRIMARY KEY,
      skill_slug TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL DEFAULT 'MCQ',
      difficulty TEXT NOT NULL DEFAULT 'Medium',
      options_json TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      time_limit_seconds INTEGER DEFAULT 120,
      is_active INTEGER DEFAULT 1,
      is_deleted INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_aq_skill ON assessment_questions(skill_slug);
    CREATE INDEX IF NOT EXISTS idx_aq_status ON assessment_questions(is_active, is_deleted);
  `);

  // 13. Assessment Question Snapshots Table (preserves exact questions at assessment time for historical integrity)
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS assessment_question_snapshots (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      question_order INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      options_json TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      selected_answer TEXT,
      is_correct INTEGER,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_snap_assessment ON assessment_question_snapshots(assessment_id);
  `);

  // 14. Real Audit Events Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      actor_type TEXT NOT NULL,
      actor_id TEXT,
      description TEXT NOT NULL,
      metadata_json TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_events(created_at);
  `);

  // 15. Job Applications Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      job_id TEXT,
      job_title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      source TEXT,
      job_url TEXT,
      applied_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Applied',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_job_app_user ON job_applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_job_app_status ON job_applications(status);
  `);

  // 16. Resume Improvements Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS resume_improvements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      resume_id TEXT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      before_text TEXT NOT NULL,
      after_text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_improvements_user ON resume_improvements(user_id);
  `);

  // 17. Certificates Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_id TEXT NOT NULL,
      skill TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      certificate_code TEXT UNIQUE NOT NULL,
      issue_date TEXT NOT NULL,
      verification_status TEXT DEFAULT 'VERIFIED',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(certificate_code);
  `);

  // 18. Courses Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      total_lessons INTEGER NOT NULL,
      duration_minutes INTEGER NOT NULL,
      level TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
  `);

  // 19. Course Progress Table
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS course_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      lessons_completed INTEGER DEFAULT 0,
      total_lessons INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Not Started',
      completion_date TEXT,
      last_accessed_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_cp_user ON course_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_cp_course ON course_progress(course_id);
  `);

  // 20. Proctoring Events Table (Audit logs for camera & behavioral monitoring)
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS proctoring_events (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      details TEXT,
      timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_proctor_assessment ON proctoring_events(assessment_id);
    CREATE INDEX IF NOT EXISTS idx_proctor_type ON proctoring_events(event_type);
  `);

  // 21. User Skills Table (Profile skills claimed / tracked per user)
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS user_skills (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not-verified',
      score INTEGER,
      certificate_id TEXT,
      verified_date TEXT,
      claimed_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, skill_name)
    );
    CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_skills_name ON user_skills(skill_name);
  `);

  // Safe column migrations to associate activity with user_id and expand users table
  const migrateColumns = [
    'ALTER TABLE visitors ADD COLUMN user_id TEXT;',
    'ALTER TABLE resumes ADD COLUMN user_id TEXT;',
    'ALTER TABLE resume_analyses ADD COLUMN user_id TEXT;',
    'ALTER TABLE verified_skills ADD COLUMN user_id TEXT;',
    'ALTER TABLE assessments ADD COLUMN user_id TEXT;',
    'ALTER TABLE assessments ADD COLUMN termination_reason TEXT;',
    'ALTER TABLE assessments ADD COLUMN proctoring_events_json TEXT;',
    'ALTER TABLE job_searches ADD COLUMN user_id TEXT;',
    'ALTER TABLE job_matches ADD COLUMN user_id TEXT;',
    'ALTER TABLE feedback ADD COLUMN user_id TEXT;',
    'ALTER TABLE users ADD COLUMN password_hash TEXT;',
    "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'USER';",
    'ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;',
    'ALTER TABLE users ADD COLUMN last_login_at TEXT;',
  ];
  for (const sql of migrateColumns) {
    try {
      dbInstance.exec(sql);
    } catch {
      // Column already exists or table updated
    }
  }

  // Ensure default admin user is seeded securely
  ensureAdminUserExists(dbInstance);

  // Ensure seed skills and initial question bank are populated if empty
  ensureSeedQuestionsAndSkills(dbInstance);

  // Ensure career courses are seeded if empty
  ensureSeedCourses(dbInstance);

  return dbInstance;
}

// ==========================================
// PASSWORD & AUTHENTICATION HELPERS
// ==========================================

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export function createSessionToken(admin: { id: string; email: string; role: string }): string {
  const payload = {
    sub: admin.id,
    email: admin.email,
    role: admin.role,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): { sub: string; email: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(data)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function verifyAdminToken(token: string | undefined | null): { sub: string; email: string; role: string } | null {
  if (!token) return null;
  const verified = verifySessionToken(token);
  if (!verified || verified.role !== 'ADMIN') return null;
  return verified;
}

function ensureAdminUserExists(db: DatabaseSync) {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPass) return;

  const existingStmt = db.prepare('SELECT id, password_hash FROM admin_users WHERE email = ?');
  const existing = existingStmt.get(adminEmail) as { id: string; password_hash: string } | undefined;

  const hash = hashPassword(adminPass);
  const now = new Date().toISOString();

  if (!existing) {
    const insertStmt = db.prepare(`
      INSERT INTO admin_users (id, email, password_hash, role, created_at, updated_at, is_active)
      VALUES (?, ?, ?, 'ADMIN', ?, ?, 1)
    `);

    insertStmt.run(`adm_${Date.now()}`, adminEmail, hash, now, now);
    console.info(`[Smart Resume AI] Initialized admin account from environment: ${adminEmail}`);
  } else {
    // If credentials were changed in environment, refresh password hash securely
    const isMatching = verifyPassword(adminPass, existing.password_hash);
    if (!isMatching) {
      db.prepare('UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE id = ?').run(hash, now, existing.id);
      console.info(`[Smart Resume AI] Refreshed password hash for admin: ${adminEmail}`);
    }
  }
}

function ensureSeedQuestionsAndSkills(db: DatabaseSync) {
  try {
    // 1. Check and seed skills_catalog & default configs
    const skillCount = (db.prepare('SELECT COUNT(*) as c FROM skills_catalog').get() as { c: number }).c;
    if (skillCount === 0) {
      const insertSkill = db.prepare(`
        INSERT INTO skills_catalog (id, name, slug, category, description, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?)
      `);
      const insertConfig = db.prepare(`
        INSERT INTO assessment_configs (id, skill_slug, questions_count, pass_percentage, time_limit_minutes, created_at, updated_at)
        VALUES (?, ?, 10, 70, 20, ?, ?)
      `);

      const now = new Date().toISOString();
      for (const s of SEED_SKILLS) {
        const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const skillId = `skl_${slug}`;
        insertSkill.run(skillId, s.name, slug, s.category, s.description, now, now);
        insertConfig.run(`cfg_${slug}`, slug, now, now);
      }
      console.info(`[Smart Resume AI] Initialized skills catalog with ${SEED_SKILLS.length} skills`);
    }

    // 2. Check and seed assessment_questions
    const qCount = (db.prepare('SELECT COUNT(*) as c FROM assessment_questions').get() as { c: number }).c;
    if (qCount === 0) {
      const insertQ = db.prepare(`
        INSERT INTO assessment_questions (
          id, skill_slug, skill_name, question_text, question_type,
          difficulty, options_json, correct_answer, explanation,
          time_limit_seconds, is_active, is_deleted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 120, 1, 0, ?, ?)
      `);

      const now = new Date().toISOString();
      INITIAL_ASSESSMENT_QUESTIONS.forEach((q, idx) => {
        const slug = q.skill.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const qId = `qst_${slug}_${idx + 1}`;
        const correctLetter = `Option ${String.fromCharCode(65 + q.correct_answer_index)}`;
        insertQ.run(
          qId,
          slug,
          q.skill,
          q.question_text,
          q.question_type,
          q.difficulty,
          JSON.stringify(q.options),
          correctLetter,
          q.explanation,
          now,
          now
        );
      });
      console.info(`[Smart Resume AI] Initialized assessment question bank with ${INITIAL_ASSESSMENT_QUESTIONS.length} questions`);
    }
  } catch (err) {
    console.error('[Smart Resume AI] Error initializing seed questions/skills:', err);
  }
}

export const SEED_COURSES = [
  {
    id: 'crs_full_stack_dev',
    slug: 'full-stack-web-dev',
    title: 'Full-Stack Web Development Career Path',
    category: 'Software Engineering',
    description: 'Master modern full-stack development with Next.js, Node.js, TypeScript, and cloud deployment pipelines.',
    totalLessons: 12,
    durationMinutes: 360,
    level: 'Intermediate',
  },
  {
    id: 'crs_react_ts_mastery',
    slug: 'modern-react-typescript',
    title: 'Modern React & TypeScript Mastery',
    category: 'Frontend Engineering',
    description: 'Deep dive into advanced React patterns, performance optimization, hooks architecture, and strict TypeScript.',
    totalLessons: 10,
    durationMinutes: 240,
    level: 'Advanced',
  },
  {
    id: 'crs_python_ai_systems',
    slug: 'python-data-science-ai',
    title: 'Python for Data Science & AI Systems',
    category: 'Data & AI',
    description: 'Build production AI applications, understand LLM engineering, data manipulation, and modern Python tooling.',
    totalLessons: 15,
    durationMinutes: 450,
    level: 'Intermediate',
  },
  {
    id: 'crs_system_design',
    slug: 'system-design-architecture',
    title: 'System Design & Scalable Architecture',
    category: 'Architecture',
    description: 'Learn distributed caching, microservices, load balancing, message queues, and high-concurrency architectures.',
    totalLessons: 8,
    durationMinutes: 300,
    level: 'Advanced',
  },
  {
    id: 'crs_tech_interview_ats',
    slug: 'tech-interview-ats-strategy',
    title: 'Technical Interview & ATS Optimization Strategy',
    category: 'Career Prep',
    description: 'Proven strategies for resume keyword optimization, behavioral interview storytelling, and technical rounds.',
    totalLessons: 6,
    durationMinutes: 180,
    level: 'All Levels',
  },
  {
    id: 'crs_sql_cloud_databases',
    slug: 'sql-cloud-databases',
    title: 'SQL & Cloud Database Management',
    category: 'Backend & Data',
    description: 'Write complex SQL queries, optimize indexes, manage relational schemas, and migrate to cloud database engines.',
    totalLessons: 8,
    durationMinutes: 220,
    level: 'Beginner',
  },
];

function ensureSeedCourses(db: DatabaseSync) {
  try {
    const count = (db.prepare('SELECT COUNT(*) as c FROM courses').get() as { c: number }).c;
    if (count === 0) {
      const stmt = db.prepare(`
        INSERT INTO courses (id, slug, title, category, description, total_lessons, duration_minutes, level, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const now = new Date().toISOString();
      for (const c of SEED_COURSES) {
        stmt.run(c.id, c.slug, c.title, c.category, c.description, c.totalLessons, c.durationMinutes, c.level, now);
      }
      console.info(`[Smart Resume AI] Initialized career courses catalog with ${SEED_COURSES.length} courses`);
    }
  } catch (err) {
    console.error('[Smart Resume AI] Error initializing seed courses:', err);
  }
}

// ==========================================
// REAL AUDIT LOG SYSTEM
// ==========================================

export function logAuditEvent(data: {
  eventType: string;
  actorType?: 'USER' | 'VISITOR' | 'ADMIN' | 'SYSTEM';
  actorId?: string;
  description: string;
  metadata?: Record<string, any>;
}): string {
  const db = getDb();
  const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO audit_events (id, event_type, actor_type, actor_id, description, metadata_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.eventType,
      data.actorType || 'SYSTEM',
      data.actorId || null,
      data.description,
      data.metadata ? JSON.stringify(data.metadata) : null,
      now
    );
  } catch (err) {
    console.error('[DB Audit Event Error] Failed to record audit event:', err);
  }

  return id;
}

export function formatAuditEventTitle(eventType: string): string {
  switch (eventType) {
    case 'RESUME_ANALYZED': return 'Resume Analyzed';
    case 'ASSESSMENT_STARTED': return 'Assessment Started';
    case 'ASSESSMENT_COMPLETED': return 'Assessment Completed';
    case 'SKILL_VERIFIED': return 'Skill Badge Verified';
    case 'JOB_SEARCHED': return 'Job Search Executed';
    case 'JOB_MATCHED': return 'Job Match Recorded';
    case 'FEEDBACK_SUBMITTED': return 'User Feedback Received';
    case 'ADMIN_LOGIN': return 'Admin Session Initialized';
    case 'QUESTION_CREATED': return 'Question Added to Bank';
    case 'QUESTION_UPDATED': return 'Question Updated';
    case 'QUESTION_STATUS_CHANGED': return 'Question Status Updated';
    case 'QUESTION_DELETED': return 'Question Soft-Deleted';
    case 'SKILL_STATUS_CHANGED': return 'Skill Status Updated';
    case 'ASSESSMENT_CONFIG_UPDATED': return 'Assessment Config Updated';
    default: return eventType.replace(/_/g, ' ');
  }
}

export function getRealAuditEvents(limit = 20) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, event_type, actor_type, actor_id, description, metadata_json, created_at
    FROM audit_events
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit) as Array<{
    id: string;
    event_type: string;
    actor_type: string;
    actor_id: string | null;
    description: string;
    metadata_json: string | null;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    eventType: r.event_type,
    actorType: r.actor_type,
    actorId: r.actor_id,
    description: r.description,
    metadata: r.metadata_json ? JSON.parse(r.metadata_json) : null,
    createdAt: r.created_at,
    timeAgo: formatTimeAgo(r.created_at),
  }));
}

// ==========================================
// USER PROFILE & SESSION MANAGEMENT
// ==========================================

export interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  lastActiveAt: string;
}

export function getUserNameById(userId: string | null | undefined): string | null {
  if (!userId) return null;
  const db = getDb();
  try {
    const row = db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as { name: string } | undefined;
    return row?.name || null;
  } catch {
    return null;
  }
}

export function registerUser(data: {
  name: string;
  email: string;
  password: string;
  visitorId?: string | null;
}): {
  user: UserProfile;
  sessionToken: string;
} {
  const db = getDb();
  const trimmedName = (data.name || '').trim();
  if (!trimmedName || trimmedName.length < 2) {
    throw new Error('Please enter a valid full name (at least 2 characters).');
  }
  if (trimmedName.length > 70) {
    throw new Error('Full name cannot exceed 70 characters.');
  }

  const trimmedEmail = (data.email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    throw new Error('Please provide a valid email address.');
  }

  if (!data.password || data.password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const existing = db.prepare('SELECT id, email, password_hash, role, is_active, created_at FROM users WHERE LOWER(email) = ?').get(trimmedEmail) as any;
  const now = new Date().toISOString();

  let userId: string;
  let createdAt = now;
  if (existing) {
    if (existing.password_hash) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }
    // Existing user record without password (e.g. from prior name-onboarding)
    userId = existing.id;
    createdAt = existing.created_at || now;
    const passwordHash = hashPassword(data.password);
    const sessionToken = createSessionToken({ id: userId, email: trimmedEmail, role: 'USER' });

    db.prepare(`
      UPDATE users
      SET name = ?, password_hash = ?, role = 'USER', is_active = 1,
          session_token = ?, updated_at = ?, last_login_at = ?, last_active_at = ?
      WHERE id = ?
    `).run(trimmedName, passwordHash, sessionToken, now, now, now, userId);

    logAuditEvent({
      eventType: 'USER_REGISTERED',
      actorType: 'USER',
      actorId: userId,
      description: `${trimmedName} registered an account`,
      metadata: { userId, email: trimmedEmail, name: trimmedName },
    });

    return {
      user: {
        id: userId,
        name: trimmedName,
        email: trimmedEmail,
        role: 'USER',
        isActive: true,
        createdAt,
        updatedAt: now,
        lastLoginAt: now,
        lastActiveAt: now,
      },
      sessionToken,
    };
  }

  userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const passwordHash = hashPassword(data.password);
  const sessionToken = createSessionToken({ id: userId, email: trimmedEmail, role: 'USER' });

  db.prepare(`
    INSERT INTO users (
      id, name, email, password_hash, role, is_active, session_token,
      created_at, updated_at, last_login_at, last_active_at
    ) VALUES (?, ?, ?, ?, 'USER', 1, ?, ?, ?, ?, ?)
  `).run(userId, trimmedName, trimmedEmail, passwordHash, sessionToken, now, now, now, now);

  // Link previous visitor activity if any
  if (data.visitorId) {
    try {
      db.prepare('UPDATE visitors SET user_id = ? WHERE id = ? OR anonymous_id = ?').run(userId, data.visitorId, data.visitorId);
    } catch (e: any) {
      console.log('[visitor migration error - visitors]:', e?.message);
    }
    try {
      db.prepare("UPDATE resumes SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(userId, data.visitorId);
    } catch (e: any) {
      console.log('[visitor migration error - resumes]:', e?.message);
    }
    try {
      db.prepare("UPDATE resume_analyses SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(userId, data.visitorId);
    } catch (e: any) {
      console.log('[visitor migration error - analyses]:', e?.message);
    }
    try {
      db.prepare("UPDATE verified_skills SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(userId, data.visitorId);
    } catch (e: any) {
      console.log('[visitor migration error - skills]:', e?.message);
    }
    try {
      db.prepare("UPDATE assessments SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(userId, data.visitorId);
    } catch (e: any) {
      console.log('[visitor migration error - assessments]:', e?.message);
    }
    try {
      db.prepare("UPDATE job_searches SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(userId, data.visitorId);
    } catch (e: any) {
      console.log('[visitor migration error - searches]:', e?.message);
    }
    try {
      db.prepare("UPDATE job_matches SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(userId, data.visitorId);
    } catch (e: any) {
      console.log('[visitor migration error - matches]:', e?.message);
    }
    try {
      db.prepare("UPDATE feedback SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(userId, data.visitorId);
    } catch (e: any) {
      console.log('[visitor migration error - feedback]:', e?.message);
    }
  }

  logAuditEvent({
    eventType: 'USER_REGISTERED',
    actorType: 'USER',
    actorId: userId,
    description: `${trimmedName} registered an account`,
    metadata: { userId, email: trimmedEmail, name: trimmedName },
  });

  return {
    user: {
      id: userId,
      name: trimmedName,
      email: trimmedEmail,
      role: 'USER',
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      lastActiveAt: now,
    },
    sessionToken,
  };
}

export function loginUser(data: {
  email: string;
  password: string;
}): {
  user: UserProfile;
  sessionToken: string;
} {
  const db = getDb();
  const trimmedEmail = (data.email || '').trim().toLowerCase();
  const trimmedPass = data.password || '';

  if (!trimmedEmail || !trimmedPass) {
    throw new Error('Please enter both email and password.');
  }

  const user = db.prepare(`
    SELECT id, name, email, password_hash, role, is_active, created_at, updated_at, last_login_at, last_active_at
    FROM users
    WHERE LOWER(email) = ?
  `).get(trimmedEmail) as any;

  if (!user || !user.password_hash) {
    throw new Error('Invalid email or password.');
  }

  if (user.is_active === 0) {
    throw new Error('This account has been deactivated. Please contact support.');
  }

  const isValid = verifyPassword(trimmedPass, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password.');
  }

  const now = new Date().toISOString();
  const sessionToken = createSessionToken({
    id: user.id,
    email: user.email,
    role: user.role || 'USER',
  });

  db.prepare(`
    UPDATE users
    SET session_token = ?, last_login_at = ?, last_active_at = ?, updated_at = ?
    WHERE id = ?
  `).run(sessionToken, now, now, now, user.id);
  console.log('[DEBUG loginUser] 9. updated session_token');

  logAuditEvent({
    eventType: 'USER_LOGGED_IN',
    actorType: 'USER',
    actorId: user.id,
    description: `${user.name} logged into their dashboard`,
    metadata: { userId: user.id, email: user.email },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'USER',
      isActive: true,
      createdAt: user.created_at,
      updatedAt: now,
      lastLoginAt: now,
      lastActiveAt: now,
    },
    sessionToken,
  };
}

export function getUserBySession(token: string): UserProfile | null {
  if (!token) return null;
  const verified = verifySessionToken(token);
  if (!verified || !verified.sub) return null;

  const db = getDb();
  try {
    const row = db.prepare(`
      SELECT id, name, email, role, is_active, session_token, created_at, updated_at, last_login_at, last_active_at
      FROM users
      WHERE id = ?
    `).get(verified.sub) as any;

    if (!row || row.is_active === 0) return null;
    // Verify that session_token matches current active session (invalidates logged out sessions)
    if (!row.session_token || row.session_token.startsWith('revoked_')) return null;
    if (row.session_token !== token) return null;

    const now = new Date().toISOString();
    try {
      db.prepare('UPDATE users SET last_active_at = ? WHERE id = ?').run(now, row.id);
    } catch { }

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role || 'USER',
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
      lastActiveAt: now,
    };
  } catch (err) {
    console.error('Error fetching user by session:', err);
    return null;
  }
}

export function logoutUser(token: string): void {
  if (!token) return;
  const db = getDb();
  const now = new Date().toISOString();
  try {
    const verified = verifySessionToken(token);
    const randSuffix = Math.random().toString(36).substring(2, 10);
    const revokedToken = `revoked_${verified?.sub || randSuffix}_${Date.now()}`;
    if (verified && verified.sub) {
      db.prepare(`
        UPDATE users
        SET session_token = ?, updated_at = ?
        WHERE id = ?
      `).run(revokedToken, now, verified.sub);
    } else {
      db.prepare(`
        UPDATE users
        SET session_token = ?, updated_at = ?
        WHERE session_token = ?
      `).run(revokedToken, now, token);
    }
  } catch (err: any) {
    console.log('[Auth logoutUser Error]:', err?.message || String(err));
  }
}

export function getUserBySessionToken(sessionToken: string): UserProfile | null {
  if (!sessionToken) return null;
  if (sessionToken.includes('.')) {
    return getUserBySession(sessionToken);
  }
  const db = getDb();
  try {
    const row = db.prepare('SELECT id, name, email, role, is_active, created_at, updated_at, last_login_at, last_active_at FROM users WHERE session_token = ?').get(sessionToken) as any;
    if (!row || row.is_active === 0) return null;

    const now = new Date().toISOString();
    try {
      db.prepare('UPDATE users SET last_active_at = ? WHERE id = ?').run(now, row.id);
    } catch { }

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role || 'USER',
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
      lastActiveAt: now,
    };
  } catch (err) {
    console.error('Error fetching user by session token:', err);
    return null;
  }
}

export function getUserById(id: string): UserProfile | null {
  if (!id) return null;
  const db = getDb();
  try {
    const row = db.prepare('SELECT id, name, email, role, is_active, created_at, updated_at, last_login_at, last_active_at FROM users WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role || 'USER',
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
      lastActiveAt: row.last_active_at,
    };
  } catch {
    return null;
  }
}

export function updateUserProfile(userId: string, data: { name: string; email?: string }): UserProfile {
  const db = getDb();
  const trimmedName = (data.name || '').trim();
  if (!trimmedName || trimmedName.length < 2) {
    throw new Error('Name must be at least 2 characters.');
  }
  if (trimmedName.length > 70) {
    throw new Error('Name cannot exceed 70 characters.');
  }

  const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!existingUser) {
    throw new Error('User not found.');
  }

  let finalEmail = existingUser.email;
  if (data.email) {
    const trimmedEmail = data.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('Please enter a valid email address.');
    }
    const emailCheck = db.prepare('SELECT id FROM users WHERE LOWER(email) = ? AND id != ?').get(trimmedEmail, userId) as any;
    if (emailCheck) {
      throw new Error('Email address is already in use by another account.');
    }
    finalEmail = trimmedEmail;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE users
    SET name = ?, email = ?, updated_at = ?, last_active_at = ?
    WHERE id = ?
  `).run(trimmedName, finalEmail, now, now, userId);

  return {
    id: userId,
    name: trimmedName,
    email: finalEmail,
    role: existingUser.role || 'USER',
    isActive: Boolean(existingUser.is_active),
    createdAt: existingUser.created_at,
    updatedAt: now,
    lastLoginAt: existingUser.last_login_at,
    lastActiveAt: now,
  };
}

export function changeUserPassword(userId: string, currentPass: string, newPass: string): boolean {
  const db = getDb();
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as any;
  if (!user || !user.password_hash) {
    throw new Error('User account not found.');
  }

  if (!verifyPassword(currentPass, user.password_hash)) {
    throw new Error('Current password does not match.');
  }

  if (!newPass || newPass.length < 6) {
    throw new Error('New password must be at least 6 characters.');
  }

  const newHash = hashPassword(newPass);
  const now = new Date().toISOString();
  db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(newHash, now, userId);
  return true;
}

export function createOrUpdateUserProfile(data: {
  name: string;
  email?: string | null;
  sessionToken?: string | null;
  visitorId?: string | null;
}): { id: string; name: string; email: string | null; sessionToken: string } {
  const db = getDb();
  const trimmedName = (data.name || '').trim();
  if (!trimmedName || trimmedName.length < 2) {
    throw new Error('Please enter a valid full name with at least 2 characters.');
  }
  if (trimmedName.length > 60) {
    throw new Error('Full name cannot exceed 60 characters.');
  }

  const trimmedEmail = data.email && typeof data.email === 'string' ? data.email.trim().toLowerCase() : null;
  const now = new Date().toISOString();

  if (data.sessionToken) {
    const existing = db.prepare('SELECT id, session_token FROM users WHERE session_token = ?').get(data.sessionToken) as
      | { id: string; session_token: string }
      | undefined;
    if (existing) {
      db.prepare(`
        UPDATE users
        SET name = ?, email = COALESCE(?, email), updated_at = ?, last_active_at = ?
        WHERE id = ?
      `).run(trimmedName, trimmedEmail, now, now, existing.id);

      return {
        id: existing.id,
        name: trimmedName,
        email: trimmedEmail,
        sessionToken: existing.session_token,
      };
    }
  }

  const id = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const sessionToken = crypto.randomBytes(24).toString('hex');

  db.prepare(`
    INSERT INTO users (id, name, email, session_token, created_at, updated_at, last_active_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, trimmedName, trimmedEmail, sessionToken, now, now, now);

  if (data.visitorId) {
    try {
      db.prepare('UPDATE visitors SET user_id = ? WHERE id = ? OR anonymous_id = ?').run(id, data.visitorId, data.visitorId);
      db.prepare("UPDATE resumes SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(id, data.visitorId);
      db.prepare("UPDATE resume_analyses SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(id, data.visitorId);
      db.prepare("UPDATE verified_skills SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(id, data.visitorId);
      db.prepare("UPDATE assessments SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(id, data.visitorId);
      db.prepare("UPDATE job_searches SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(id, data.visitorId);
      db.prepare("UPDATE job_matches SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(id, data.visitorId);
      db.prepare("UPDATE feedback SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(id, data.visitorId);
    } catch (e) {
      console.error('Error linking visitor activity to user:', e);
    }
  }

  return {
    id,
    name: trimmedName,
    email: trimmedEmail,
    sessionToken,
  };
}

// ==========================================
// WRITE TRACKING HELPERS (Called by Public APIs)
// ==========================================

export function trackVisitor(anonymousId: string, userAgent = ''): string {
  const db = getDb();
  const now = new Date().toISOString();

  const existing = db.prepare('SELECT id, total_sessions FROM visitors WHERE anonymous_id = ?').get(anonymousId) as
    | { id: string; total_sessions: number }
    | undefined;

  if (existing) {
    db.prepare('UPDATE visitors SET last_seen_at = ?, total_sessions = total_sessions + 1, updated_at = ? WHERE id = ?')
      .run(now, now, existing.id);
    return existing.id;
  }

  const id = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  db.prepare(`
    INSERT INTO visitors (id, anonymous_id, first_seen_at, last_seen_at, total_sessions, user_agent, created_at, updated_at)
    VALUES (?, ?, ?, ?, 1, ?, ?, ?)
  `).run(id, anonymousId, now, now, userAgent.slice(0, 255), now, now);

  return id;
}

export function recordResumeUpload(data: {
  visitorId?: string;
  userId?: string;
  filename: string;
  fileType: string;
  parsedSuccessfully?: boolean;
}): string {
  const db = getDb();
  const id = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const effectiveUserId = data.userId || (data.visitorId ? (db.prepare('SELECT user_id FROM visitors WHERE id = ? OR anonymous_id = ?').get(data.visitorId, data.visitorId) as any)?.user_id : null);

  db.prepare(`
    INSERT INTO resumes (id, visitor_id, user_id, filename, file_type, uploaded_at, parsed_successfully, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.visitorId || null,
    effectiveUserId || null,
    data.filename,
    data.fileType,
    now,
    data.parsedSuccessfully ? 1 : 0,
    now
  );

  return id;
}

export function recordResumeAnalysis(data: {
  visitorId?: string;
  userId?: string;
  resumeId?: string;
  fileType: string;
  atsScore: number;
  keywordScore: number;
  formattingScore: number;
  sectionScore: number;
  analysisStatus: string;
  detectedKeywords?: string[];
  missingKeywords?: string[];
  recommendations?: Array<{
    category?: string;
    title: string;
    actionText?: string;
    originalText?: string;
    improvedText?: string;
  }>;
}): string {
  const db = getDb();
  const id = `anl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const effectiveUserId = data.userId || (data.visitorId ? (db.prepare('SELECT user_id FROM visitors WHERE id = ? OR anonymous_id = ?').get(data.visitorId, data.visitorId) as any)?.user_id : null);
  const userName = getUserNameById(effectiveUserId);
  const actorName = userName || 'Name not provided';

  db.prepare(`
    INSERT INTO resume_analyses (
      id, visitor_id, user_id, resume_id, file_type, analyzed_at,
      ats_score, keyword_score, formatting_score, section_score,
      analysis_status, detected_keywords, missing_keywords, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.visitorId || null,
    effectiveUserId || null,
    data.resumeId || null,
    data.fileType,
    now,
    data.atsScore,
    data.keywordScore,
    data.formattingScore,
    data.sectionScore,
    data.analysisStatus,
    JSON.stringify(data.detectedKeywords || []),
    JSON.stringify(data.missingKeywords || []),
    now
  );

  // Auto-record specific improvements for user dashboard
  if (effectiveUserId && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
    try {
      const insertImp = db.prepare(`
        INSERT INTO resume_improvements (id, user_id, resume_id, category, title, before_text, after_text, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const rec of data.recommendations) {
        if (!rec.title) continue;
        const impId = `imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        insertImp.run(
          impId,
          effectiveUserId,
          data.resumeId || null,
          rec.category || 'ATS Optimization',
          rec.title,
          rec.originalText || 'Previous unoptimized phrasing or missing bullet points',
          rec.improvedText || rec.actionText || 'Optimized industry-standard action impact phrasing',
          now
        );
      }
    } catch (e) {
      console.error('Error inserting auto improvements:', e);
    }
  }

  // Genuine Audit Log with real user name
  logAuditEvent({
    eventType: 'RESUME_ANALYZED',
    actorType: effectiveUserId ? 'USER' : 'VISITOR',
    actorId: effectiveUserId || data.visitorId,
    description: `${actorName} analyzed resume (${data.fileType.toUpperCase()}) with ATS score ${data.atsScore}/100`,
    metadata: { analysisId: id, atsScore: data.atsScore, fileType: data.fileType, userId: effectiveUserId, userName },
  });

  return id;
}

export function recordAssessmentEvent(data: {
  visitorId?: string;
  userId?: string;
  skill: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  status: string;
  durationSeconds?: number;
  startedAt?: string;
  completedAt?: string;
  proctoringViolationCount?: number;
}): string {
  const db = getDb();
  const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const effectiveUserId = data.userId || (data.visitorId ? (db.prepare('SELECT user_id FROM visitors WHERE id = ? OR anonymous_id = ?').get(data.visitorId, data.visitorId) as any)?.user_id : null);
  const userName = getUserNameById(effectiveUserId);
  const actorName = userName || 'Name not provided';

  db.prepare(`
    INSERT INTO assessments (
      id, visitor_id, user_id, skill, score, total_questions,
      passed, status, duration_seconds, started_at, completed_at,
      proctoring_violation_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.visitorId || null,
    effectiveUserId || null,
    data.skill,
    data.score,
    data.totalQuestions,
    data.passed ? 1 : 0,
    data.status,
    data.durationSeconds || 0,
    data.startedAt || now,
    data.completedAt || now,
    data.proctoringViolationCount || 0,
    now
  );

  // If passed, record into verified_skills
  if (data.passed) {
    const vsId = `vsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO verified_skills (id, visitor_id, user_id, skill_name, status, assessment_id, verified_at, created_at)
      VALUES (?, ?, ?, ?, 'VERIFIED', ?, ?, ?)
    `).run(vsId, data.visitorId || null, effectiveUserId || null, data.skill, id, now, now);

    logAuditEvent({
      eventType: 'SKILL_VERIFIED',
      actorType: effectiveUserId ? 'USER' : 'VISITOR',
      actorId: effectiveUserId || data.visitorId,
      description: `${actorName} verified skill "${data.skill}" with score ${data.score}/${data.totalQuestions}`,
      metadata: { skill: data.skill, assessmentId: id, score: data.score, userId: effectiveUserId, userName },
    });
  }

  logAuditEvent({
    eventType: 'ASSESSMENT_COMPLETED',
    actorType: effectiveUserId ? 'USER' : 'VISITOR',
    actorId: effectiveUserId || data.visitorId,
    description: `${actorName} completed ${data.skill} assessment: ${data.score}/${data.totalQuestions} (${data.passed ? 'PASSED' : 'FAILED'})`,
    metadata: { assessmentId: id, skill: data.skill, score: data.score, passed: data.passed, userId: effectiveUserId, userName },
  });

  return id;
}

export function recordJobSearchEvent(data: {
  visitorId?: string;
  userId?: string;
  query: string;
  location?: string;
  provider: string;
  resultsCount: number;
}): string {
  const db = getDb();
  const id = `jsr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const effectiveUserId = data.userId || (data.visitorId ? (db.prepare('SELECT user_id FROM visitors WHERE id = ? OR anonymous_id = ?').get(data.visitorId, data.visitorId) as any)?.user_id : null);
  const userName = getUserNameById(effectiveUserId);
  const actorName = userName || 'Name not provided';

  db.prepare(`
    INSERT INTO job_searches (id, visitor_id, user_id, query, location, provider, results_count, searched_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.visitorId || null,
    effectiveUserId || null,
    data.query,
    data.location || 'India',
    data.provider,
    data.resultsCount,
    now,
    now
  );

  logAuditEvent({
    eventType: 'JOB_SEARCHED',
    actorType: effectiveUserId ? 'USER' : 'VISITOR',
    actorId: effectiveUserId || data.visitorId,
    description: `${actorName} searched jobs: "${data.query}" in ${data.location || 'India'} (${data.resultsCount} found on ${data.provider})`,
    metadata: { query: data.query, location: data.location, count: data.resultsCount, provider: data.provider, userId: effectiveUserId, userName },
  });

  return id;
}

export function recordJobMatchEvent(data: {
  visitorId?: string;
  userId?: string;
  resumeId?: string;
  jobId?: string;
  jobTitle?: string;
  company?: string;
  matchScore: number;
  matchedSkills?: string[];
  partialSkills?: string[];
  missingSkills?: string[];
}): string {
  const db = getDb();
  const id = `jmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const effectiveUserId = data.userId || (data.visitorId ? (db.prepare('SELECT user_id FROM visitors WHERE id = ? OR anonymous_id = ?').get(data.visitorId, data.visitorId) as any)?.user_id : null);
  const userName = getUserNameById(effectiveUserId);
  const actorName = userName || 'Name not provided';

  db.prepare(`
    INSERT INTO job_matches (
      id, visitor_id, user_id, resume_id, job_id, job_title, company,
      match_score, matched_skills, partial_skills, missing_skills, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.visitorId || null,
    effectiveUserId || null,
    data.resumeId || null,
    data.jobId || null,
    data.jobTitle || 'Role',
    data.company || 'Company',
    data.matchScore,
    JSON.stringify(data.matchedSkills || []),
    JSON.stringify(data.partialSkills || []),
    JSON.stringify(data.missingSkills || []),
    now
  );

  logAuditEvent({
    eventType: 'JOB_MATCHED',
    actorType: effectiveUserId ? 'USER' : 'VISITOR',
    actorId: effectiveUserId || data.visitorId,
    description: `${actorName} matched job "${data.jobTitle || 'Role'}" at ${data.company || 'Company'} with score ${Math.round(data.matchScore)}%`,
    metadata: { jobTitle: data.jobTitle, company: data.company, score: data.matchScore, userId: effectiveUserId, userName },
  });

  return id;
}

export function recordFeedbackEvent(data: {
  visitorId?: string;
  userId?: string;
  rating: number;
  category: string;
  message: string;
  suggestions?: string;
}): string {
  const db = getDb();
  const id = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const effectiveUserId = data.userId || (data.visitorId ? (db.prepare('SELECT user_id FROM visitors WHERE id = ? OR anonymous_id = ?').get(data.visitorId, data.visitorId) as any)?.user_id : null);
  const userName = getUserNameById(effectiveUserId);
  const actorName = userName || 'Name not provided';

  db.prepare(`
    INSERT INTO feedback (id, visitor_id, user_id, rating, category, message, suggestions, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)
  `).run(
    id,
    data.visitorId || null,
    effectiveUserId || null,
    data.rating,
    data.category,
    data.message,
    data.suggestions || null,
    now
  );

  logAuditEvent({
    eventType: 'FEEDBACK_SUBMITTED',
    actorType: effectiveUserId ? 'USER' : 'VISITOR',
    actorId: effectiveUserId || data.visitorId,
    description: `${actorName} submitted feedback (${data.rating}★, ${data.category}): "${data.message.slice(0, 50)}"`,
    metadata: { rating: data.rating, category: data.category, userId: effectiveUserId, userName },
  });

  return id;
}

// ==========================================
// REAL ADMIN ANALYTICS & AGGREGATION QUERIES
// ==========================================

export interface RealAdminStats {
  totalVisitors: number;
  totalResumesAnalyzed: number;
  averageAtsScore: number;
  verifiedSkillsCount: number;
  completedAssessmentsCount: number;
  totalJobSearches: number;
  totalJobMatches: number;
  totalFeedback: number;
  atsHistory: Array<{ date: string; avgScore: number; avgFormatting: number; avgKeywords: number }>;
  skillMastery: Array<{ skill: string; count: number; avgScore: number }>;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
  questionBankStats: {
    totalQuestions: number;
    activeQuestions: number;
    inactiveQuestions: number;
    skillsCovered: number;
  };
}

export function getRealAdminStats(): RealAdminStats {
  const db = getDb();

  const visitorsCount = (db.prepare('SELECT COUNT(*) as c FROM visitors').get() as { c: number }).c;
  const analysesCount = (db.prepare('SELECT COUNT(*) as c FROM resume_analyses').get() as { c: number }).c;
  const avgAts = (db.prepare('SELECT ROUND(AVG(ats_score), 1) as a FROM resume_analyses').get() as { a: number | null }).a || 0;
  const verifiedCount = (db.prepare("SELECT COUNT(*) as c FROM verified_skills WHERE status = 'VERIFIED'").get() as { c: number }).c;
  const assessmentsCount = (db.prepare("SELECT COUNT(*) as c FROM assessments WHERE status IN ('passed', 'completed')").get() as { c: number }).c;
  const jobSearchesCount = (db.prepare('SELECT COUNT(*) as c FROM job_searches').get() as { c: number }).c;
  const jobMatchesCount = (db.prepare('SELECT COUNT(*) as c FROM job_matches').get() as { c: number }).c;
  const feedbackCount = (db.prepare('SELECT COUNT(*) as c FROM feedback').get() as { c: number }).c;

  // Real ATS History: Group by Day (YYYY-MM-DD)
  const atsHistoryRows = db.prepare(`
    SELECT
      substr(analyzed_at, 1, 10) as date,
      ROUND(AVG(ats_score), 1) as avgScore,
      ROUND(AVG(formatting_score), 1) as avgFormatting,
      ROUND(AVG(keyword_score), 1) as avgKeywords
    FROM resume_analyses
    GROUP BY substr(analyzed_at, 1, 10)
    ORDER BY date ASC
    LIMIT 14
  `).all() as Array<{ date: string; avgScore: number; avgFormatting: number; avgKeywords: number }>;

  // Real Skill Mastery: Verified assessment scores
  const skillMasteryRows = db.prepare(`
    SELECT
      skill,
      COUNT(*) as count,
      ROUND(AVG(score * 10), 1) as avgScore
    FROM assessments
    WHERE passed = 1
    GROUP BY skill
    ORDER BY count DESC
    LIMIT 8
  `).all() as Array<{ skill: string; count: number; avgScore: number }>;

  // Real Audit Log: strictly from audit_events table. If table has no rows, activities is []
  const auditRows = db.prepare(`
    SELECT
      a.id,
      a.event_type,
      a.actor_type,
      a.actor_id,
      a.description,
      a.created_at,
      u.name as user_name
    FROM audit_events a
    LEFT JOIN users u ON a.actor_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 10
  `).all() as Array<{
    id: string;
    event_type: string;
    actor_type: string;
    actor_id: string | null;
    description: string;
    created_at: string;
    user_name: string | null;
  }>;

  const activities = auditRows.map((row) => ({
    id: row.id,
    type: row.event_type.toLowerCase(),
    title: formatAuditEventTitle(row.event_type),
    description: row.description,
    userName: row.user_name || 'Name not provided',
    timestamp: formatTimeAgo(row.created_at),
  }));

  // Assessment Question Bank Telemetry
  const qBankStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
      COUNT(DISTINCT skill_slug) as skillsCovered
    FROM assessment_questions
    WHERE is_deleted = 0
  `).get() as { total: number; active: number; inactive: number; skillsCovered: number };

  const usersCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;

  return {
    totalVisitors: usersCount > 0 ? usersCount : visitorsCount,
    totalResumesAnalyzed: analysesCount,
    averageAtsScore: avgAts,
    verifiedSkillsCount: verifiedCount,
    completedAssessmentsCount: assessmentsCount,
    totalJobSearches: jobSearchesCount,
    totalJobMatches: jobMatchesCount,
    totalFeedback: feedbackCount,
    atsHistory: atsHistoryRows,
    skillMastery: skillMasteryRows,
    recentActivities: activities,
    questionBankStats: {
      totalQuestions: qBankStats?.total || 0,
      activeQuestions: qBankStats?.active || 0,
      inactiveQuestions: qBankStats?.inactive || 0,
      skillsCovered: qBankStats?.skillsCovered || 0,
    },
  };
}

function formatTimeAgo(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

// ==========================================
// SUBPAGE ADMIN QUERIES & MANAGEMENT
// ==========================================

export function getAdminByEmail(email: string) {
  const db = getDb();
  return db
    .prepare('SELECT id, email, password_hash, role, is_active, last_login_at, created_at FROM admin_users WHERE email = ?')
    .get(email.trim().toLowerCase()) as
    | { id: string; email: string; password_hash: string; role: string; is_active: number; last_login_at: string | null; created_at: string }
    | undefined;
}

export function recordAdminLogin(id: string) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare('UPDATE admin_users SET last_login_at = ?, updated_at = ? WHERE id = ?').run(now, now, id);
}

export function getAdminUsers(limit = 100) {
  const db = getDb();
  return db.prepare(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.created_at,
      u.last_active_at,
      (SELECT COUNT(*) FROM resumes WHERE user_id = u.id) as resumes_count,
      (SELECT COUNT(*) FROM resume_analyses WHERE user_id = u.id) as analyses_count,
      (SELECT COUNT(*) FROM job_searches WHERE user_id = u.id) as searches_count,
      (SELECT COUNT(*) FROM assessments WHERE user_id = u.id) as assessments_count,
      (SELECT COUNT(*) FROM verified_skills WHERE user_id = u.id AND status = 'VERIFIED') as verified_skills_count
    FROM users u
    ORDER BY u.last_active_at DESC
    LIMIT ?
  `).all(limit) as Array<{
    id: string;
    name: string;
    email: string | null;
    created_at: string;
    last_active_at: string;
    resumes_count: number;
    analyses_count: number;
    searches_count: number;
    assessments_count: number;
    verified_skills_count: number;
  }>;
}

export function getAdminUserDetail(userId: string) {
  const db = getDb();
  const user = db.prepare('SELECT id, name, email, created_at, last_active_at FROM users WHERE id = ?').get(userId) as any;
  if (!user) return null;

  const resumes = db.prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC').all(userId);
  const analyses = db.prepare(`
    SELECT a.*, r.filename
    FROM resume_analyses a
    LEFT JOIN resumes r ON a.resume_id = r.id
    WHERE a.user_id = ?
    ORDER BY a.analyzed_at DESC
  `).all(userId);
  const assessments = db.prepare('SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  const verifiedSkills = db.prepare('SELECT * FROM verified_skills WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  const searches = db.prepare('SELECT * FROM job_searches WHERE user_id = ? ORDER BY searched_at DESC').all(userId);
  const matches = db.prepare('SELECT * FROM job_matches WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  const feedbackList = db.prepare('SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC').all(userId);

  return {
    user,
    resumes,
    analyses,
    assessments,
    verifiedSkills,
    searches,
    matches,
    feedback: feedbackList,
  };
}

export function getAdminVisitors(limit = 100) {
  const db = getDb();
  return db.prepare(`
    SELECT
      v.id,
      v.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      u.email as user_email,
      v.first_seen_at,
      v.last_seen_at,
      v.total_sessions,
      v.user_agent,
      (SELECT COUNT(*) FROM resume_analyses WHERE visitor_id = v.id OR user_id = v.user_id) as analyses_count,
      (SELECT COUNT(*) FROM assessments WHERE visitor_id = v.id OR user_id = v.user_id) as assessments_count,
      (SELECT COUNT(*) FROM job_searches WHERE visitor_id = v.id OR user_id = v.user_id) as searches_count,
      (SELECT COUNT(*) FROM feedback WHERE visitor_id = v.id OR user_id = v.user_id) as feedback_count
    FROM visitors v
    LEFT JOIN users u ON v.user_id = u.id
    ORDER BY v.last_seen_at DESC
    LIMIT ?
  `).all(limit) as Array<{
    id: string;
    user_id: string | null;
    user_name: string;
    user_email: string | null;
    first_seen_at: string;
    last_seen_at: string;
    total_sessions: number;
    user_agent: string | null;
    analyses_count: number;
    assessments_count: number;
    searches_count: number;
    feedback_count: number;
  }>;
}

export function getVisitorActivity(visitorId: string) {
  const db = getDb();
  const visitor = db.prepare('SELECT * FROM visitors WHERE id = ? OR anonymous_id = ? OR user_id = ?').get(visitorId, visitorId, visitorId) as any;
  if (!visitor) return null;

  const actualId = visitor.id;
  const userId = visitor.user_id;

  const resumes = db.prepare('SELECT * FROM resumes WHERE visitor_id = ? OR user_id = ? ORDER BY uploaded_at DESC').all(actualId, userId || actualId);
  const analyses = db.prepare('SELECT * FROM resume_analyses WHERE visitor_id = ? OR user_id = ? ORDER BY analyzed_at DESC').all(actualId, userId || actualId);
  const assessments = db.prepare('SELECT * FROM assessments WHERE visitor_id = ? OR user_id = ? ORDER BY completed_at DESC').all(actualId, userId || actualId);
  const searches = db.prepare('SELECT * FROM job_searches WHERE visitor_id = ? OR user_id = ? ORDER BY searched_at DESC').all(actualId, userId || actualId);
  const matches = db.prepare('SELECT * FROM job_matches WHERE visitor_id = ? OR user_id = ? ORDER BY created_at DESC').all(actualId, userId || actualId);
  const feedbackList = db.prepare('SELECT * FROM feedback WHERE visitor_id = ? OR user_id = ? ORDER BY created_at DESC').all(actualId, userId || actualId);

  return {
    visitor,
    resumes,
    analyses,
    assessments,
    searches,
    matches,
    feedback: feedbackList,
  };
}

export function getAdminResumeAnalyses(limit = 100) {
  const db = getDb();
  return db.prepare(`
    SELECT
      a.id,
      a.visitor_id,
      a.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      a.resume_id,
      r.filename,
      a.file_type,
      a.ats_score,
      a.keyword_score,
      a.formatting_score,
      a.section_score,
      a.analysis_status,
      a.detected_keywords,
      a.missing_keywords,
      a.analyzed_at
    FROM resume_analyses a
    LEFT JOIN resumes r ON a.resume_id = r.id
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.analyzed_at DESC
    LIMIT ?
  `).all(limit);
}

export function getAdminVerifiedSkills(limit = 100) {
  const db = getDb();
  return db.prepare(`
    SELECT
      s.id,
      s.visitor_id,
      s.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      s.skill_name,
      s.status,
      s.assessment_id,
      s.verified_at,
      s.created_at,
      a.score,
      a.total_questions
    FROM verified_skills s
    LEFT JOIN assessments a ON s.assessment_id = a.id
    LEFT JOIN users u ON s.user_id = u.id
    ORDER BY s.created_at DESC
    LIMIT ?
  `).all(limit);
}

export function getAdminAssessments(limit = 100) {
  const db = getDb();
  return db.prepare(`
    SELECT
      a.id,
      a.visitor_id,
      a.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      a.skill,
      a.score,
      a.total_questions,
      a.passed,
      a.status,
      a.duration_seconds,
      a.started_at,
      a.completed_at,
      a.proctoring_violation_count,
      a.created_at
    FROM assessments a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT ?
  `).all(limit);
}

export function getAdminJobSearches(limit = 100) {
  const db = getDb();
  return db.prepare(`
    SELECT
      j.id,
      j.visitor_id,
      j.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      j.query,
      j.location,
      j.provider,
      j.results_count,
      j.searched_at
    FROM job_searches j
    LEFT JOIN users u ON j.user_id = u.id
    ORDER BY j.searched_at DESC
    LIMIT ?
  `).all(limit);
}

export function getAdminJobMatches(limit = 100) {
  const db = getDb();
  return db.prepare(`
    SELECT
      m.id,
      m.visitor_id,
      m.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      m.resume_id,
      m.job_id,
      m.job_title,
      m.company,
      m.match_score,
      m.matched_skills,
      m.partial_skills,
      m.missing_skills,
      m.created_at
    FROM job_matches m
    LEFT JOIN users u ON m.user_id = u.id
    ORDER BY m.created_at DESC
    LIMIT ?
  `).all(limit);
}

export function getAdminFeedback(limit = 100, statusFilter?: string) {
  const db = getDb();
  if (statusFilter && statusFilter !== 'all') {
    return db.prepare(`
      SELECT
        f.id,
        f.visitor_id,
        f.user_id,
        COALESCE(u.name, 'Name not provided') as user_name,
        f.rating,
        f.category,
        f.message,
        f.suggestions,
        f.status,
        f.created_at
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.status = ?
      ORDER BY f.created_at DESC
      LIMIT ?
    `).all(statusFilter, limit);
  }

  return db.prepare(`
    SELECT
      f.id,
      f.visitor_id,
      f.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      f.rating,
      f.category,
      f.message,
      f.suggestions,
      f.status,
      f.created_at
    FROM feedback f
    LEFT JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
    LIMIT ?
  `).all(limit);
}

export function updateFeedbackStatus(id: string, status: string): boolean {
  const db = getDb();
  const res = db.prepare('UPDATE feedback SET status = ? WHERE id = ?').run(status, id);
  return res.changes > 0;
}

export function getDetailedAnalytics() {
  const db = getDb();

  // Resume Analytics
  const totalResumes = (db.prepare('SELECT COUNT(*) as c FROM resumes').get() as { c: number }).c;
  const pdfCount = (db.prepare("SELECT COUNT(*) as c FROM resumes WHERE LOWER(file_type) LIKE '%pdf%'").get() as { c: number }).c;
  const docxCount = (db.prepare("SELECT COUNT(*) as c FROM resumes WHERE LOWER(file_type) LIKE '%doc%'").get() as { c: number }).c;
  const successfulAnalyses = (db.prepare("SELECT COUNT(*) as c FROM resume_analyses WHERE analysis_status = 'COMPLETED'").get() as { c: number }).c;
  const failedAnalyses = (db.prepare("SELECT COUNT(*) as c FROM resume_analyses WHERE analysis_status != 'COMPLETED'").get() as { c: number }).c;

  const scoreStats = db.prepare(`
    SELECT
      ROUND(AVG(ats_score), 1) as avgAts,
      ROUND(AVG(keyword_score), 1) as avgKeywords,
      ROUND(AVG(formatting_score), 1) as avgFormatting,
      ROUND(AVG(section_score), 1) as avgSection
    FROM resume_analyses
  `).get() as { avgAts: number | null; avgKeywords: number | null; avgFormatting: number | null; avgSection: number | null };

  // Job Analytics
  const totalSearches = (db.prepare('SELECT COUNT(*) as c FROM job_searches').get() as { c: number }).c;

  // Searches today (UTC date substring)
  const todayStr = new Date().toISOString().slice(0, 10);
  const searchesToday = (db.prepare("SELECT COUNT(*) as c FROM job_searches WHERE substr(searched_at, 1, 10) = ?").get(todayStr) as { c: number }).c;

  // Searches this week (past 7 days)
  const pastWeekDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const searchesThisWeek = (db.prepare("SELECT COUNT(*) as c FROM job_searches WHERE substr(searched_at, 1, 10) >= ?").get(pastWeekDate) as { c: number }).c;

  const topJobTitles = db.prepare(`
    SELECT query as title, COUNT(*) as count
    FROM job_searches
    GROUP BY query
    ORDER BY count DESC
    LIMIT 5
  `).all() as Array<{ title: string; count: number }>;

  const topLocations = db.prepare(`
    SELECT location, COUNT(*) as count
    FROM job_searches
    WHERE location IS NOT NULL AND location != ''
    GROUP BY location
    ORDER BY count DESC
    LIMIT 5
  `).all() as Array<{ location: string; count: number }>;

  const providerCounts = db.prepare(`
    SELECT provider, COUNT(*) as count, SUM(results_count) as totalResults
    FROM job_searches
    GROUP BY provider
    ORDER BY count DESC
  `).all() as Array<{ provider: string; count: number; totalResults: number }>;

  const avgJobsReturned = (db.prepare('SELECT ROUND(AVG(results_count), 1) as avg FROM job_searches').get() as { avg: number | null }).avg || 0;

  // Assessment Analytics
  const totalAssessments = (db.prepare('SELECT COUNT(*) as c FROM assessments').get() as { c: number }).c;
  const completedAssessments = (db.prepare("SELECT COUNT(*) as c FROM assessments WHERE status IN ('passed', 'completed', 'failed')").get() as { c: number }).c;
  const passedAssessments = (db.prepare('SELECT COUNT(*) as c FROM assessments WHERE passed = 1').get() as { c: number }).c;
  const failedAssessments = (db.prepare('SELECT COUNT(*) as c FROM assessments WHERE passed = 0').get() as { c: number }).c;
  const passRate = completedAssessments > 0 ? Math.round((passedAssessments / completedAssessments) * 100) : 0;

  const assessmentScoreStats = db.prepare(`
    SELECT
      ROUND(AVG(score * 10), 1) as avgScore,
      ROUND(AVG(duration_seconds), 0) as avgDuration
    FROM assessments
  `).get() as { avgScore: number | null; avgDuration: number | null };

  const topVerifiedSkills = db.prepare(`
    SELECT skill_name as skill, COUNT(*) as count
    FROM verified_skills
    WHERE status = 'VERIFIED'
    GROUP BY skill_name
    ORDER BY count DESC
    LIMIT 6
  `).all() as Array<{ skill: string; count: number }>;

  return {
    resumeAnalytics: {
      totalResumes,
      pdfCount,
      docxCount,
      successfulAnalyses,
      failedAnalyses,
      avgAtsScore: scoreStats.avgAts || 0,
      avgKeywordScore: scoreStats.avgKeywords || 0,
      avgFormattingScore: scoreStats.avgFormatting || 0,
      avgSectionScore: scoreStats.avgSection || 0,
    },
    jobAnalytics: {
      totalSearches,
      searchesToday,
      searchesThisWeek,
      topJobTitles,
      topLocations,
      providerCounts,
      avgJobsReturned,
    },
    assessmentAnalytics: {
      totalAssessments,
      completedAssessments,
      passedAssessments,
      failedAssessments,
      passRate,
      avgScore: assessmentScoreStats.avgScore || 0,
      avgDurationSeconds: assessmentScoreStats.avgDuration || 0,
      topVerifiedSkills,
    },
  };
}

// ==========================================
// QUESTION BANK MANAGEMENT (CRUD)
// ==========================================

export interface AssessmentQuestionRecord {
  id: string;
  skill_slug: string;
  skill_name: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  time_limit_seconds: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export function getAdminQuestions(options: {
  skill?: string;
  difficulty?: string;
  questionType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): {
  questions: AssessmentQuestionRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const db = getDb();
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 15));
  const offset = (page - 1) * limit;

  const conditions: string[] = ['is_deleted = 0'];
  const params: any[] = [];

  if (options.skill && options.skill !== 'all') {
    conditions.push('(skill_slug = ? OR LOWER(skill_name) = ?)');
    params.push(options.skill.toLowerCase(), options.skill.toLowerCase());
  }

  if (options.difficulty && options.difficulty !== 'all') {
    conditions.push('LOWER(difficulty) = ?');
    params.push(options.difficulty.toLowerCase());
  }

  if (options.questionType && options.questionType !== 'all') {
    conditions.push('LOWER(question_type) = ?');
    params.push(options.questionType.toLowerCase());
  }

  if (options.status && options.status !== 'all') {
    if (options.status === 'active') {
      conditions.push('is_active = 1');
    } else if (options.status === 'inactive') {
      conditions.push('is_active = 0');
    }
  }

  if (options.search && options.search.trim()) {
    conditions.push('(question_text LIKE ? OR explanation LIKE ?)');
    const term = `%${options.search.trim()}%`;
    params.push(term, term);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRow = db.prepare(`SELECT COUNT(*) as c FROM assessment_questions ${whereClause}`).get(...params) as { c: number };
  const total = countRow.c;
  const totalPages = Math.ceil(total / limit) || 1;

  const rows = db.prepare(`
    SELECT * FROM assessment_questions
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as any[];

  const questions: AssessmentQuestionRecord[] = rows.map((r) => ({
    id: r.id,
    skill_slug: r.skill_slug,
    skill_name: r.skill_name,
    question_text: r.question_text,
    question_type: r.question_type,
    difficulty: r.difficulty,
    options: JSON.parse(r.options_json || '[]'),
    correct_answer: r.correct_answer,
    explanation: r.explanation,
    time_limit_seconds: r.time_limit_seconds,
    is_active: Boolean(r.is_active),
    is_deleted: Boolean(r.is_deleted),
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));

  return { questions, total, page, limit, totalPages };
}

export function getQuestionById(id: string): AssessmentQuestionRecord | null {
  const db = getDb();
  const r = db.prepare('SELECT * FROM assessment_questions WHERE id = ?').get(id) as any;
  if (!r) return null;

  return {
    id: r.id,
    skill_slug: r.skill_slug,
    skill_name: r.skill_name,
    question_text: r.question_text,
    question_type: r.question_type,
    difficulty: r.difficulty,
    options: JSON.parse(r.options_json || '[]'),
    correct_answer: r.correct_answer,
    explanation: r.explanation,
    time_limit_seconds: r.time_limit_seconds,
    is_active: Boolean(r.is_active),
    is_deleted: Boolean(r.is_deleted),
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export function createQuestion(data: {
  skill: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  time_limit_seconds?: number;
  is_active?: boolean;
}): string {
  const db = getDb();
  const slug = data.skill.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const id = `qst_${slug}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO assessment_questions (
      id, skill_slug, skill_name, question_text, question_type,
      difficulty, options_json, correct_answer, explanation,
      time_limit_seconds, is_active, is_deleted, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).run(
    id,
    slug,
    data.skill,
    data.question_text,
    data.question_type || 'MCQ',
    data.difficulty || 'Medium',
    JSON.stringify(data.options),
    data.correct_answer,
    data.explanation || null,
    data.time_limit_seconds || 120,
    data.is_active !== false ? 1 : 0,
    now,
    now
  );

  logAuditEvent({
    eventType: 'QUESTION_CREATED',
    actorType: 'ADMIN',
    description: `Added new question for ${data.skill}: "${data.question_text.slice(0, 50)}..."`,
    metadata: { questionId: id, skill: data.skill, difficulty: data.difficulty },
  });

  return id;
}

export function updateQuestion(
  id: string,
  data: {
    skill?: string;
    question_text?: string;
    question_type?: string;
    difficulty?: string;
    options?: string[];
    correct_answer?: string;
    explanation?: string;
    time_limit_seconds?: number;
    is_active?: boolean;
  }
): boolean {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM assessment_questions WHERE id = ?').get(id) as any;
  if (!existing) return false;

  const now = new Date().toISOString();
  const skill = data.skill || existing.skill_name;
  const slug = skill.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const questionText = data.question_text !== undefined ? data.question_text : existing.question_text;
  const questionType = data.question_type !== undefined ? data.question_type : existing.question_type;
  const difficulty = data.difficulty !== undefined ? data.difficulty : existing.difficulty;
  const optionsJson = data.options ? JSON.stringify(data.options) : existing.options_json;
  const correctAnswer = data.correct_answer !== undefined ? data.correct_answer : existing.correct_answer;
  const explanation = data.explanation !== undefined ? data.explanation : existing.explanation;
  const timeLimitSeconds = data.time_limit_seconds !== undefined ? data.time_limit_seconds : existing.time_limit_seconds;
  const isActive = data.is_active !== undefined ? (data.is_active ? 1 : 0) : existing.is_active;

  const res = db.prepare(`
    UPDATE assessment_questions
    SET skill_slug = ?, skill_name = ?, question_text = ?, question_type = ?,
        difficulty = ?, options_json = ?, correct_answer = ?, explanation = ?,
        time_limit_seconds = ?, is_active = ?, updated_at = ?
    WHERE id = ?
  `).run(
    slug,
    skill,
    questionText,
    questionType,
    difficulty,
    optionsJson,
    correctAnswer,
    explanation,
    timeLimitSeconds,
    isActive,
    now,
    id
  );

  logAuditEvent({
    eventType: 'QUESTION_UPDATED',
    actorType: 'ADMIN',
    description: `Updated question ${id} (${skill})`,
    metadata: { questionId: id, skill },
  });

  return res.changes > 0;
}

export function toggleQuestionStatus(id: string, isActive: boolean): boolean {
  const db = getDb();
  const now = new Date().toISOString();
  const res = db.prepare('UPDATE assessment_questions SET is_active = ?, updated_at = ? WHERE id = ?').run(isActive ? 1 : 0, now, id);
  if (res.changes > 0) {
    logAuditEvent({
      eventType: 'QUESTION_STATUS_CHANGED',
      actorType: 'ADMIN',
      description: `Set question ${id} status to ${isActive ? 'ACTIVE' : 'INACTIVE'}`,
      metadata: { questionId: id, isActive },
    });
    return true;
  }
  return false;
}

export function softDeleteQuestion(id: string): boolean {
  const db = getDb();
  const now = new Date().toISOString();
  // Soft delete preserves historical assessment integrity
  const res = db.prepare('UPDATE assessment_questions SET is_deleted = 1, is_active = 0, updated_at = ? WHERE id = ?').run(now, id);
  if (res.changes > 0) {
    logAuditEvent({
      eventType: 'QUESTION_DELETED',
      actorType: 'ADMIN',
      description: `Soft-deleted question ${id} from question bank`,
      metadata: { questionId: id },
    });
    return true;
  }
  return false;
}

// ==========================================
// SKILLS CATALOG & CONFIGURATION
// ==========================================

export function getSkillsCatalogWithMetrics() {
  const db = getDb();
  const skills = db.prepare('SELECT * FROM skills_catalog ORDER BY name ASC').all() as any[];

  return skills.map((s) => {
    const slug = s.slug;
    const qStats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN LOWER(difficulty) = 'easy' THEN 1 ELSE 0 END) as easy,
        SUM(CASE WHEN LOWER(difficulty) = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN LOWER(difficulty) = 'hard' THEN 1 ELSE 0 END) as hard
      FROM assessment_questions
      WHERE skill_slug = ? AND is_deleted = 0
    `).get(slug) as any;

    const attemptsCount = (db.prepare('SELECT COUNT(*) as c FROM assessments WHERE LOWER(skill) = LOWER(?)').get(s.name) as { c: number }).c;
    const verifiedCount = (db.prepare("SELECT COUNT(*) as c FROM verified_skills WHERE LOWER(skill_name) = LOWER(?) AND status = 'VERIFIED'").get(s.name) as { c: number }).c;

    const config = db.prepare('SELECT * FROM assessment_configs WHERE skill_slug = ?').get(slug) as any;

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
      description: s.description,
      is_active: Boolean(s.is_active),
      totalQuestions: qStats?.total || 0,
      activeQuestions: qStats?.active || 0,
      inactiveQuestions: qStats?.inactive || 0,
      easyQuestions: qStats?.easy || 0,
      mediumQuestions: qStats?.medium || 0,
      hardQuestions: qStats?.hard || 0,
      assessmentCount: attemptsCount,
      verifiedCount: verifiedCount,
      config: config ? {
        questionsCount: config.questions_count,
        passPercentage: config.pass_percentage,
        timeLimitMinutes: config.time_limit_minutes,
      } : {
        questionsCount: 10,
        passPercentage: 70,
        timeLimitMinutes: 20,
      },
    };
  });
}

export function toggleSkillStatus(id: string, isActive: boolean): boolean {
  const db = getDb();
  const now = new Date().toISOString();
  const res = db.prepare('UPDATE skills_catalog SET is_active = ?, updated_at = ? WHERE id = ?').run(isActive ? 1 : 0, now, id);
  if (res.changes > 0) {
    logAuditEvent({
      eventType: 'SKILL_STATUS_CHANGED',
      actorType: 'ADMIN',
      description: `Set skill ${id} status to ${isActive ? 'ACTIVE' : 'INACTIVE'}`,
      metadata: { skillId: id, isActive },
    });
    return true;
  }
  return false;
}

export function updateSkill(id: string, data: { name?: string; category?: string; description?: string }): boolean {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM skills_catalog WHERE id = ?').get(id) as any;
  if (!existing) return false;

  const now = new Date().toISOString();
  const name = data.name || existing.name;
  const category = data.category || existing.category;
  const description = data.description !== undefined ? data.description : existing.description;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const res = db.prepare(`
    UPDATE skills_catalog
    SET name = ?, slug = ?, category = ?, description = ?, updated_at = ?
    WHERE id = ?
  `).run(name, slug, category, description, now, id);

  return res.changes > 0;
}

export function getAssessmentConfigs() {
  const db = getDb();
  return db.prepare(`
    SELECT
      c.*,
      s.name as skill_name,
      s.category as skill_category
    FROM assessment_configs c
    LEFT JOIN skills_catalog s ON c.skill_slug = s.slug
    ORDER BY s.name ASC
  `).all();
}

export function updateAssessmentConfig(skillSlug: string, data: { questionsCount?: number; passPercentage?: number; timeLimitMinutes?: number }): boolean {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT * FROM assessment_configs WHERE skill_slug = ?').get(skillSlug) as any;

  if (existing) {
    const qCount = data.questionsCount !== undefined ? data.questionsCount : existing.questions_count;
    const pPerc = data.passPercentage !== undefined ? data.passPercentage : existing.pass_percentage;
    const tLim = data.timeLimitMinutes !== undefined ? data.timeLimitMinutes : existing.time_limit_minutes;

    db.prepare(`
      UPDATE assessment_configs
      SET questions_count = ?, pass_percentage = ?, time_limit_minutes = ?, updated_at = ?
      WHERE skill_slug = ?
    `).run(qCount, pPerc, tLim, now, skillSlug);
  } else {
    db.prepare(`
      INSERT INTO assessment_configs (id, skill_slug, questions_count, pass_percentage, time_limit_minutes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(`cfg_${skillSlug}`, skillSlug, data.questionsCount || 10, data.passPercentage || 70, data.timeLimitMinutes || 20, now, now);
  }

  logAuditEvent({
    eventType: 'ASSESSMENT_CONFIG_UPDATED',
    actorType: 'ADMIN',
    description: `Updated assessment config for ${skillSlug}`,
    metadata: { skillSlug, ...data },
  });

  return true;
}

// ==========================================
// CANDIDATE EXAM RUNTIME & SNAPSHOT ENGINE
// ==========================================

export function startAssessmentAttempt(skillName: string, visitorId?: string, userId?: string): {
  success: boolean;
  error?: string;
  message?: string;
  attemptId?: string;
  skill?: string;
  durationSeconds?: number;
  passingScore?: number;
  totalQuestions?: number;
  passPercentage?: number;
  questions?: Array<{
    id: string;
    question_text: string;
    question_type: string;
    difficulty: string;
    options: string[];
    time_limit_seconds: number;
  }>;
  startedAt?: string;
} {
  const db = getDb();
  const slug = skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Verify skill exists and is active
  const skillRow = db.prepare('SELECT * FROM skills_catalog WHERE slug = ? OR LOWER(name) = ?').get(slug, skillName.toLowerCase()) as any;
  if (skillRow && !skillRow.is_active) {
    return {
      success: false,
      error: 'skill_inactive',
      message: `${skillName} assessment is currently disabled by the administrator.`,
    };
  }

  // Get config
  const config = db.prepare('SELECT * FROM assessment_configs WHERE skill_slug = ?').get(slug) as any;
  const requiredCount = config?.questions_count || 10;
  const passPercentage = config?.pass_percentage || 70;
  const timeLimitMinutes = config?.time_limit_minutes || 20;

  // Retrieve active, non-deleted questions
  const activeQuestions = db.prepare(`
    SELECT * FROM assessment_questions
    WHERE skill_slug = ? AND is_active = 1 AND is_deleted = 0
    ORDER BY RANDOM()
  `).all(slug) as any[];

  if (activeQuestions.length < requiredCount) {
    return {
      success: false,
      error: 'insufficient_questions',
      message: `${skillName} assessment is currently unavailable because only ${activeQuestions.length} active questions are available. Please contact the administrator.`,
    };
  }

  const selectedQuestions = activeQuestions.slice(0, requiredCount);
  const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const effectiveUserId = userId || (visitorId ? (db.prepare('SELECT user_id FROM visitors WHERE id = ? OR anonymous_id = ?').get(visitorId, visitorId) as any)?.user_id : null);
  const userName = getUserNameById(effectiveUserId);
  const actorName = userName || 'Name not provided';

  // Create assessment attempt record
  db.prepare(`
    INSERT INTO assessments (
      id, visitor_id, user_id, skill, score, total_questions,
      passed, status, duration_seconds, started_at, completed_at,
      proctoring_violation_count, created_at
    ) VALUES (?, ?, ?, ?, 0, ?, 0, 'in_progress', ?, ?, NULL, 0, ?)
  `).run(
    attemptId,
    visitorId || null,
    effectiveUserId || null,
    skillRow?.name || skillName,
    requiredCount,
    timeLimitMinutes * 60,
    now,
    now
  );

  // Store snapshots of questions at assessment time to preserve historical correctness!
  const insertSnap = db.prepare(`
    INSERT INTO assessment_question_snapshots (
      id, assessment_id, question_id, question_order, question_text,
      question_type, difficulty, options_json, correct_answer, explanation,
      selected_answer, is_correct, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)
  `);

  selectedQuestions.forEach((q, idx) => {
    insertSnap.run(
      `snp_${attemptId}_${idx + 1}`,
      attemptId,
      q.id,
      idx + 1,
      q.question_text,
      q.question_type,
      q.difficulty,
      q.options_json,
      q.correct_answer,
      q.explanation || null,
      now
    );
  });

  logAuditEvent({
    eventType: 'ASSESSMENT_STARTED',
    actorType: effectiveUserId ? 'USER' : 'VISITOR',
    actorId: effectiveUserId || visitorId,
    description: `${actorName} started ${skillRow?.name || skillName} assessment (Attempt ${attemptId})`,
    metadata: { attemptId, skill: skillRow?.name || skillName, questionsCount: requiredCount, userId: effectiveUserId, userName },
  });

  const passingScore = Math.ceil(requiredCount * (passPercentage / 100));

  return {
    success: true,
    attemptId,
    skill: skillRow?.name || skillName,
    durationSeconds: timeLimitMinutes * 60,
    passingScore,
    totalQuestions: requiredCount,
    passPercentage,
    questions: selectedQuestions.map((q, idx) => ({
      id: `snp_${attemptId}_${idx + 1}`, // use snapshot ID for secure answer submission
      question_text: q.question_text,
      question_type: q.question_type,
      difficulty: q.difficulty,
      options: JSON.parse(q.options_json || '[]'),
      time_limit_seconds: q.time_limit_seconds || 120,
    })),
    startedAt: now,
  };
}

export function submitAssessmentAttempt(data: {
  attemptId: string;
  userAnswers: Record<string, string | number>;
  proctoringEvents?: any[];
  durationSeconds?: number;
  terminationReason?: string;
  requesterUserId?: string;
  requesterVisitorId?: string;
}): {
  id: string;
  skill: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  isTerminated: boolean;
  status: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  violationCount: number;
  terminationReason?: string;
  certificateId?: string;
} {
  const db = getDb();
  const attempt = db.prepare('SELECT * FROM assessments WHERE id = ?').get(data.attemptId) as any;
  if (!attempt) {
    return {
      error: 'attempt_not_found',
      message: 'Assessment attempt not found.',
    } as any;
  }

  // Prevent double submission and repeated answer changes after termination or completion
  if (attempt.status !== 'in_progress' && attempt.status !== 'in-progress') {
    const certRow = db.prepare('SELECT certificate_code FROM certificates WHERE assessment_id = ?').get(attempt.id) as any;
    const isTerm = attempt.status === 'INCOMPLETE';
    return {
      id: attempt.id,
      skill: attempt.skill,
      score: isTerm ? 0 : attempt.score,
      totalQuestions: attempt.total_questions,
      percentage: isTerm ? 0 : (attempt.total_questions > 0 ? Math.round((attempt.score / attempt.total_questions) * 100) : 0),
      passed: Boolean(attempt.passed),
      isTerminated: isTerm,
      status: attempt.status,
      startedAt: attempt.started_at,
      completedAt: attempt.completed_at || attempt.created_at,
      durationSeconds: attempt.duration_seconds,
      violationCount: attempt.proctoring_violation_count,
      terminationReason: attempt.termination_reason || undefined,
      certificateId: isTerm ? undefined : (certRow?.certificate_code || undefined),
    };
  }

  // Validate attempt ownership
  if (data.requesterUserId && attempt.user_id && attempt.user_id !== data.requesterUserId) {
    return {
      error: 'unauthorized_candidate',
      message: 'Unauthorized: assessment attempt belongs to a different candidate.',
    } as any;
  }
  if (data.requesterVisitorId && attempt.visitor_id && attempt.visitor_id !== data.requesterVisitorId && !attempt.user_id) {
    return {
      error: 'unauthorized_visitor',
      message: 'Unauthorized: assessment attempt belongs to a different visitor.',
    } as any;
  }

  const snapshots = db.prepare(`
    SELECT * FROM assessment_question_snapshots
    WHERE assessment_id = ?
    ORDER BY question_order ASC
  `).all(data.attemptId) as any[];

  let score = 0;
  const updateSnap = db.prepare(`
    UPDATE assessment_question_snapshots
    SET selected_answer = ?, is_correct = ?
    WHERE id = ?
  `);

  const answersMap = data.userAnswers || (data as any).answers || {};
  snapshots.forEach((snap) => {
    // User answer might be keyed by snapshot ID or original question ID
    const rawAnswer = answersMap[snap.id] ?? answersMap[snap.question_id];
    let selectedStr = '';
    let isCorrect = false;

    const options: string[] = JSON.parse(snap.options_json || '[]');

    if (typeof rawAnswer === 'number') {
      selectedStr = `Option ${String.fromCharCode(65 + rawAnswer)}`;
      const letter = String.fromCharCode(65 + rawAnswer);
      isCorrect = snap.correct_answer === selectedStr ||
        snap.correct_answer === letter ||
        snap.correct_answer === options[rawAnswer];
    } else if (typeof rawAnswer === 'string') {
      selectedStr = rawAnswer.trim();
      isCorrect = selectedStr.toLowerCase() === snap.correct_answer.trim().toLowerCase() ||
        selectedStr.toLowerCase() === snap.correct_answer.replace('Option ', '').trim().toLowerCase();
    }

    if (isCorrect) {
      score += 1;
    }

    updateSnap.run(selectedStr || 'Unanswered', isCorrect ? 1 : 0, snap.id);
  });

  const violations = (data.proctoringEvents || []).filter(
    (e: any) => e.severity === 'violation' || e.type === 'TAB_SWITCH' || e.type === 'FULLSCREEN_EXIT'
  );
  const isTerminated = violations.length >= 3 || Boolean(data.terminationReason);
  if (isTerminated) {
    score = 0;
  }

  const totalQuestions = snapshots.length || attempt.total_questions || 10;
  const slug = attempt.skill.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const config = db.prepare('SELECT * FROM assessment_configs WHERE skill_slug = ?').get(slug) as any;
  const passPercentage = config?.pass_percentage || 70;
  const passingScore = Math.ceil(totalQuestions * (passPercentage / 100));

  const passed = !isTerminated && score >= passingScore;
  const status = isTerminated ? 'INCOMPLETE' : passed ? 'passed' : 'failed';
  const now = new Date().toISOString();
  
  // Enforce server-side time bounds
  const maxAllowedDuration = (config?.time_limit_minutes || 20) * 60 + 180;
  const duration = Math.min(data.durationSeconds || attempt.duration_seconds || 0, maxAllowedDuration);
  const terminationReason = isTerminated
    ? (data.terminationReason || `Assessment terminated due to exceeding maximum allowed proctoring violations (${violations.length}/3).`)
    : null;

  // Insert individual events into proctoring_events table
  if (Array.isArray(data.proctoringEvents) && data.proctoringEvents.length > 0) {
    const insertEvent = db.prepare(`
      INSERT OR IGNORE INTO proctoring_events (id, assessment_id, event_type, severity, details, timestamp, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const evt of data.proctoringEvents) {
      insertEvent.run(
        evt.id || `pevt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        data.attemptId,
        evt.type || 'UNKNOWN',
        evt.severity || 'info',
        evt.details || '',
        evt.timestamp || now,
        now
      );
    }
  }

  const proctoringEventsJson = JSON.stringify(data.proctoringEvents || []);

  db.prepare(`
    UPDATE assessments
    SET score = ?, passed = ?, status = ?, duration_seconds = ?,
        completed_at = ?, proctoring_violation_count = ?,
        termination_reason = ?, proctoring_events_json = ?
    WHERE id = ?
  `).run(
    score,
    passed ? 1 : 0,
    status,
    duration,
    now,
    violations.length,
    terminationReason,
    proctoringEventsJson,
    data.attemptId
  );

  const userName = getUserNameById(attempt.user_id);
  const actorName = userName || 'Name not provided';

  let certificateCode: string | undefined;
  if (passed) {
    const vsId = `vsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO verified_skills (id, visitor_id, user_id, skill_name, status, assessment_id, verified_at, created_at)
      VALUES (?, ?, ?, ?, 'VERIFIED', ?, ?, ?)
    `).run(vsId, attempt.visitor_id || null, attempt.user_id || null, attempt.skill, data.attemptId, now, now);

    if (attempt.user_id) {
      certificateCode = `CERT-${new Date().getFullYear()}-${attempt.skill.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Math.floor(100000 + Math.random() * 900000)}`;
      const certId = `crt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      db.prepare(`
        INSERT INTO certificates (id, user_id, assessment_id, skill, score, total_questions, certificate_code, issue_date, verification_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'VERIFIED', ?)
      `).run(certId, attempt.user_id, data.attemptId, attempt.skill, score, totalQuestions, certificateCode, now, now);

      syncUserSkillVerification(attempt.user_id, attempt.skill, score, certificateCode, now.split('T')[0]);
    }

    logAuditEvent({
      eventType: 'SKILL_VERIFIED',
      actorType: attempt.user_id ? 'USER' : 'VISITOR',
      actorId: attempt.user_id || attempt.visitor_id,
      description: `${actorName} verified skill "${attempt.skill}" with score ${score}/${totalQuestions}${certificateCode ? ` (Certificate: ${certificateCode})` : ''}`,
      metadata: { skill: attempt.skill, assessmentId: data.attemptId, score, certificateCode, userId: attempt.user_id, userName },
    });
  }

  logAuditEvent({
    eventType: isTerminated ? 'ASSESSMENT_TERMINATED' : 'ASSESSMENT_COMPLETED',
    actorType: attempt.user_id ? 'USER' : 'VISITOR',
    actorId: attempt.user_id || attempt.visitor_id,
    description: isTerminated
      ? `${actorName}'s ${attempt.skill} assessment was TERMINATED: ${terminationReason}`
      : `${actorName} completed ${attempt.skill} assessment: ${score}/${totalQuestions} (${passed ? 'PASSED' : 'FAILED'})`,
    metadata: {
      attemptId: data.attemptId,
      skill: attempt.skill,
      score,
      passed,
      violations: violations.length,
      terminationReason,
      userId: attempt.user_id,
      userName,
    },
  });

  return {
    id: data.attemptId,
    skill: attempt.skill,
    score,
    totalQuestions,
    percentage: isTerminated ? 0 : Math.round((score / totalQuestions) * 100),
    passed,
    isTerminated,
    status,
    startedAt: attempt.started_at,
    completedAt: now,
    durationSeconds: duration,
    violationCount: violations.length,
    terminationReason: terminationReason || undefined,
    certificateId: isTerminated ? undefined : (certificateCode || (passed ? `SRA-VER-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : undefined)),
  };
}

export function getAdminAssessmentAttempts(limit = 100, page = 1) {
  const db = getDb();
  const offset = (Math.max(1, page) - 1) * limit;

  const total = (db.prepare('SELECT COUNT(*) as c FROM assessments').get() as { c: number }).c;
  const rows = db.prepare(`
    SELECT
      a.id,
      a.visitor_id,
      a.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      a.skill,
      a.score,
      a.total_questions,
      a.passed,
      a.status,
      a.duration_seconds,
      a.started_at,
      a.completed_at,
      a.proctoring_violation_count,
      a.termination_reason,
      a.created_at
    FROM assessments a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset) as any[];

  return {
    attempts: rows.map((r) => ({
      ...r,
      passed: Boolean(r.passed),
      percentage: r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0,
      termination_reason: r.termination_reason || null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export function getAssessmentAttemptDetail(attemptId: string) {
  const db = getDb();
  const attempt = db.prepare(`
    SELECT
      a.*,
      COALESCE(u.name, 'Name not provided') as user_name,
      u.email as user_email
    FROM assessments a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.id = ?
  `).get(attemptId) as any;

  if (!attempt) return null;

  const snapshots = db.prepare(`
    SELECT * FROM assessment_question_snapshots
    WHERE assessment_id = ?
    ORDER BY question_order ASC
  `).all(attemptId) as any[];

  let proctoringEvents = db.prepare(`
    SELECT * FROM proctoring_events
    WHERE assessment_id = ?
    ORDER BY datetime(timestamp) ASC, id ASC
  `).all(attemptId) as any[];

  if (proctoringEvents.length === 0 && attempt.proctoring_events_json) {
    try {
      proctoringEvents = JSON.parse(attempt.proctoring_events_json);
    } catch {}
  }

  return {
    attempt: {
      ...attempt,
      passed: Boolean(attempt.passed),
      percentage: attempt.total_questions > 0 ? Math.round((attempt.score / attempt.total_questions) * 100) : 0,
      termination_reason: attempt.termination_reason || null,
      proctoring_violation_count: attempt.proctoring_violation_count || 0,
    },
    snapshots: snapshots.map((s) => ({
      id: s.id,
      questionId: s.question_id,
      questionOrder: s.question_order,
      questionText: s.question_text,
      questionType: s.question_type,
      difficulty: s.difficulty,
      options: JSON.parse(s.options_json || '[]'),
      correctAnswer: s.correct_answer,
      explanation: s.explanation,
      selectedAnswer: s.selected_answer,
      isCorrect: s.is_correct === 1,
    })),
    proctoringEvents: proctoringEvents.map((pe: any) => ({
      id: pe.id,
      type: pe.event_type || pe.type,
      severity: pe.severity,
      details: pe.details,
      timestamp: pe.timestamp,
    })),
  };
}

// ==========================================
// USER DASHBOARD QUERIES (Strict User Isolation)
// ==========================================

export function getUserDashboardData(userId: string) {
  const db = getDb();

  // 1. Resumes count
  const resumesCount = (db.prepare('SELECT COUNT(*) as c FROM resumes WHERE user_id = ?').get(userId) as any)?.c || 0;

  // 2. Analyses count
  const analysesCount = (db.prepare('SELECT COUNT(*) as c FROM resume_analyses WHERE user_id = ?').get(userId) as any)?.c || 0;

  // 3. Average ATS score
  const avgAtsRow = db.prepare('SELECT AVG(ats_score) as avg_score FROM resume_analyses WHERE user_id = ?').get(userId) as any;
  const avgAtsScore = avgAtsRow?.avg_score ? Math.round(avgAtsRow.avg_score * 10) / 10 : 0;

  // 4. Improvements count
  const improvementsCount = (db.prepare('SELECT COUNT(*) as c FROM resume_improvements WHERE user_id = ?').get(userId) as any)?.c || 0;

  // 5. Jobs Applied
  const jobsAppliedCount = (db.prepare("SELECT COUNT(*) as c FROM job_applications WHERE user_id = ? AND status = 'Applied'").get(userId) as any)?.c || 0;
  const totalApplications = (db.prepare('SELECT COUNT(*) as c FROM job_applications WHERE user_id = ?').get(userId) as any)?.c || 0;

  // 6. Job Matches
  const jobMatchesCount = (db.prepare('SELECT COUNT(*) as c FROM job_matches WHERE user_id = ?').get(userId) as any)?.c || 0;

  // 7. Verified Skills
  const verifiedSkillsCount = (db.prepare("SELECT COUNT(*) as c FROM verified_skills WHERE user_id = ? AND status = 'VERIFIED'").get(userId) as any)?.c || 0;

  // 8. Assessments Completed
  const assessmentsCount = (db.prepare("SELECT COUNT(*) as c FROM assessments WHERE user_id = ? AND status = 'COMPLETED'").get(userId) as any)?.c || 0;

  // 9. Certificates Earned
  const certificatesCount = (db.prepare('SELECT COUNT(*) as c FROM certificates WHERE user_id = ?').get(userId) as any)?.c || 0;

  // 10. Courses Completed
  const coursesCompletedCount = (db.prepare("SELECT COUNT(*) as c FROM course_progress WHERE user_id = ? AND status = 'Completed'").get(userId) as any)?.c || 0;

  // Resume Progress Section (per resume: latest score, previous score, improvement)
  const resumes = db.prepare(`
    SELECT id, filename, file_type, uploaded_at, created_at
    FROM resumes
    WHERE user_id = ?
    ORDER BY uploaded_at DESC
  `).all(userId) as any[];

  const resumeProgress = resumes.map((r) => {
    const analyses = db.prepare(`
      SELECT id, ats_score, analyzed_at
      FROM resume_analyses
      WHERE resume_id = ? AND user_id = ?
      ORDER BY analyzed_at DESC
      LIMIT 2
    `).all(r.id, userId) as any[];

    const latest = analyses[0] || null;
    const previous = analyses[1] || null;

    const latestScore = latest ? Math.round(latest.ats_score) : null;
    const previousScore = previous ? Math.round(previous.ats_score) : null;
    const improvement = (latestScore !== null && previousScore !== null) ? (latestScore - previousScore) : null;

    return {
      id: r.id,
      filename: r.filename,
      fileType: r.file_type,
      uploadedAt: r.uploaded_at,
      latestScore,
      previousScore,
      improvement,
      latestAnalysisDate: latest?.analyzed_at || null,
      latestAnalysisId: latest?.id || null,
    };
  });

  // Recent job applications
  const recentApplications = db.prepare(`
    SELECT id, job_title, company, location, status, applied_at
    FROM job_applications
    WHERE user_id = ?
    ORDER BY applied_at DESC, created_at DESC
    LIMIT 4
  `).all(userId) as any[];

  // Recent assessments
  const recentAssessments = db.prepare(`
    SELECT id, skill, score, total_questions, passed, status, completed_at
    FROM assessments
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 4
  `).all(userId) as any[];

  // Recent improvements
  const recentImprovements = db.prepare(`
    SELECT id, category, title, before_text, after_text, created_at
    FROM resume_improvements
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 4
  `).all(userId) as any[];

  return {
    metrics: {
      totalResumes: resumesCount,
      totalAnalyses: analysesCount,
      avgAtsScore,
      improvementsMade: improvementsCount,
      jobsApplied: jobsAppliedCount,
      totalApplications,
      jobMatches: jobMatchesCount,
      verifiedSkills: verifiedSkillsCount,
      assessmentsCompleted: assessmentsCount,
      certificatesEarned: certificatesCount,
      coursesCompleted: coursesCompletedCount,
    },
    resumeProgress,
    recentApplications,
    recentAssessments,
    recentImprovements,
  };
}

export function getUserResumes(userId: string) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      r.id,
      r.filename,
      r.file_type,
      r.uploaded_at,
      r.parsed_successfully,
      (SELECT COUNT(*) FROM resume_analyses WHERE resume_id = r.id AND user_id = r.user_id) as analyses_count,
      (SELECT ats_score FROM resume_analyses WHERE resume_id = r.id AND user_id = r.user_id ORDER BY analyzed_at DESC LIMIT 1) as latest_ats_score,
      (SELECT id FROM resume_analyses WHERE resume_id = r.id AND user_id = r.user_id ORDER BY analyzed_at DESC LIMIT 1) as latest_analysis_id
    FROM resumes r
    WHERE r.user_id = ?
    ORDER BY r.uploaded_at DESC
  `).all(userId) as any[];

  return rows.map((r) => ({
    ...r,
    parsedSuccessfully: Boolean(r.parsed_successfully),
    latestAtsScore: r.latest_ats_score !== null ? Math.round(r.latest_ats_score) : null,
  }));
}

export function getUserAnalyses(userId: string) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      a.*,
      COALESCE(r.filename, 'Resume Document') as resume_filename
    FROM resume_analyses a
    LEFT JOIN resumes r ON a.resume_id = r.id
    WHERE a.user_id = ?
    ORDER BY a.analyzed_at DESC
  `).all(userId) as any[];

  return rows.map((r) => ({
    id: r.id,
    resumeId: r.resume_id,
    resumeFilename: r.resume_filename,
    fileType: r.file_type,
    analyzedAt: r.analyzed_at,
    atsScore: Math.round(r.ats_score),
    keywordScore: Math.round(r.keyword_score),
    formattingScore: Math.round(r.formatting_score),
    sectionScore: Math.round(r.section_score),
    analysisStatus: r.analysis_status,
    detectedKeywords: JSON.parse(r.detected_keywords || '[]'),
    missingKeywords: JSON.parse(r.missing_keywords || '[]'),
  }));
}

export function getUserSingleAnalysis(userId: string, analysisId: string) {
  const db = getDb();
  const row = db.prepare(`
    SELECT
      a.*,
      COALESCE(r.filename, 'Resume Document') as resume_filename
    FROM resume_analyses a
    LEFT JOIN resumes r ON a.resume_id = r.id
    WHERE a.id = ? AND a.user_id = ?
  `).get(analysisId, userId) as any;

  if (!row) return null;

  return {
    id: row.id,
    resumeId: row.resume_id,
    resumeFilename: row.resume_filename,
    fileType: row.file_type,
    analyzedAt: row.analyzed_at,
    atsScore: Math.round(row.ats_score),
    keywordScore: Math.round(row.keyword_score),
    formattingScore: Math.round(row.formatting_score),
    sectionScore: Math.round(row.section_score),
    analysisStatus: row.analysis_status,
    detectedKeywords: JSON.parse(row.detected_keywords || '[]'),
    missingKeywords: JSON.parse(row.missing_keywords || '[]'),
  };
}

export function getUserImprovements(userId: string) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      i.*,
      COALESCE(r.filename, 'Active Resume') as resume_filename
    FROM resume_improvements i
    LEFT JOIN resumes r ON i.resume_id = r.id
    WHERE i.user_id = ?
    ORDER BY i.created_at DESC
  `).all(userId) as any[];

  return rows.map((r) => ({
    id: r.id,
    resumeId: r.resume_id,
    resumeFilename: r.resume_filename,
    category: r.category,
    title: r.title,
    beforeText: r.before_text,
    afterText: r.after_text,
    createdAt: r.created_at,
  }));
}

export function getUserJobApplications(userId: string) {
  const db = getDb();
  return db.prepare(`
    SELECT *
    FROM job_applications
    WHERE user_id = ?
    ORDER BY applied_at DESC, created_at DESC
  `).all(userId) as any[];
}

export function createJobApplication(userId: string, data: {
  jobId?: string;
  jobTitle: string;
  company: string;
  location?: string;
  source?: string;
  jobUrl?: string;
  appliedAt?: string;
  status?: string;
  notes?: string;
}) {
  const db = getDb();
  const id = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const appliedAt = data.appliedAt || now.split('T')[0];
  const status = data.status || 'Applied';

  db.prepare(`
    INSERT INTO job_applications (
      id, user_id, job_id, job_title, company, location, source,
      job_url, applied_at, status, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    data.jobId || null,
    data.jobTitle.trim(),
    data.company.trim(),
    data.location?.trim() || null,
    data.source?.trim() || 'Manual',
    data.jobUrl?.trim() || null,
    appliedAt,
    status,
    data.notes?.trim() || null,
    now,
    now
  );

  return {
    id,
    userId,
    jobId: data.jobId || null,
    jobTitle: data.jobTitle.trim(),
    company: data.company.trim(),
    location: data.location || null,
    source: data.source || 'Manual',
    jobUrl: data.jobUrl || null,
    appliedAt,
    status,
    notes: data.notes || null,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateJobApplication(userId: string, applicationId: string, data: {
  jobTitle?: string;
  company?: string;
  location?: string;
  source?: string;
  jobUrl?: string;
  appliedAt?: string;
  status?: string;
  notes?: string;
}) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM job_applications WHERE id = ? AND user_id = ?').get(applicationId, userId) as any;
  if (!existing) {
    throw new Error('Job application not found or unauthorized.');
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE job_applications
    SET job_title = COALESCE(?, job_title),
        company = COALESCE(?, company),
        location = COALESCE(?, location),
        source = COALESCE(?, source),
        job_url = COALESCE(?, job_url),
        applied_at = COALESCE(?, applied_at),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(
    data.jobTitle !== undefined ? data.jobTitle.trim() : null,
    data.company !== undefined ? data.company.trim() : null,
    data.location !== undefined ? data.location.trim() : null,
    data.source !== undefined ? data.source.trim() : null,
    data.jobUrl !== undefined ? data.jobUrl.trim() : null,
    data.appliedAt !== undefined ? data.appliedAt : null,
    data.status !== undefined ? data.status : null,
    data.notes !== undefined ? data.notes.trim() : null,
    now,
    applicationId,
    userId
  );

  return db.prepare('SELECT * FROM job_applications WHERE id = ? AND user_id = ?').get(applicationId, userId);
}

export function deleteJobApplication(userId: string, applicationId: string): boolean {
  const db = getDb();
  const res = db.prepare('DELETE FROM job_applications WHERE id = ? AND user_id = ?').run(applicationId, userId);
  return res.changes > 0;
}

export function getUserJobMatches(userId: string) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT jm.*, r.filename as resume_filename
    FROM job_matches jm
    LEFT JOIN resumes r ON jm.resume_id = r.id
    WHERE jm.user_id = ?
    ORDER BY jm.created_at DESC
  `).all(userId) as any[];

  return rows.map((r) => ({
    id: r.id,
    jobId: r.job_id,
    jobTitle: r.job_title,
    company: r.company,
    matchScore: Math.round(r.match_score),
    matchedSkills: JSON.parse(r.matched_skills || '[]'),
    partialSkills: JSON.parse(r.partial_skills || '[]'),
    missingSkills: JSON.parse(r.missing_skills || '[]'),
    resumeFilename: r.resume_filename,
    createdAt: r.created_at,
  }));
}

export function getUserSkillsStatus(userId: string) {
  const db = getDb();
  const catalog = db.prepare('SELECT * FROM skills_catalog WHERE is_active = 1 ORDER BY category, name').all() as any[];

  return catalog.map((skill) => {
    const verified = db.prepare(`
      SELECT vs.*, a.score, a.total_questions, c.certificate_code
      FROM verified_skills vs
      LEFT JOIN assessments a ON vs.assessment_id = a.id
      LEFT JOIN certificates c ON vs.assessment_id = c.assessment_id
      WHERE vs.user_id = ? AND LOWER(vs.skill_name) = LOWER(?) AND vs.status = 'VERIFIED'
      ORDER BY vs.verified_at DESC
      LIMIT 1
    `).get(userId, skill.name) as any;

    if (verified) {
      return {
        skillId: skill.id,
        skillName: skill.name,
        category: skill.category,
        description: skill.description,
        status: 'VERIFIED',
        score: verified.score ? `${verified.score}/${verified.total_questions}` : null,
        percentage: verified.score ? Math.round((verified.score / verified.total_questions) * 100) : null,
        verifiedAt: verified.verified_at,
        certificateCode: verified.certificate_code || null,
      };
    }

    const latestAttempt = db.prepare(`
      SELECT * FROM assessments
      WHERE user_id = ? AND LOWER(skill) = LOWER(?)
      ORDER BY created_at DESC
      LIMIT 1
    `).get(userId, skill.name) as any;

    if (latestAttempt) {
      return {
        skillId: skill.id,
        skillName: skill.name,
        category: skill.category,
        description: skill.description,
        status: latestAttempt.passed ? 'VERIFIED' : 'NOT VERIFIED',
        score: `${latestAttempt.score}/${latestAttempt.total_questions}`,
        percentage: Math.round((latestAttempt.score / latestAttempt.total_questions) * 100),
        attemptDate: latestAttempt.completed_at || latestAttempt.created_at,
        certificateCode: null,
      };
    }

    return {
      skillId: skill.id,
      skillName: skill.name,
      category: skill.category,
      description: skill.description,
      status: 'NOT VERIFIED',
      score: null,
      percentage: null,
      verifiedAt: null,
      certificateCode: null,
    };
  });
}

export function getUserAssessments(userId: string) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT a.*, c.certificate_code
    FROM assessments a
    LEFT JOIN certificates c ON a.id = c.assessment_id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `).all(userId) as any[];

  return rows.map((r) => ({
    id: r.id,
    skill: r.skill,
    score: r.score,
    totalQuestions: r.total_questions,
    passed: Boolean(r.passed),
    status: r.status,
    durationSeconds: r.duration_seconds,
    violationCount: r.proctoring_violation_count || 0,
    terminationReason: r.termination_reason || null,
    startedAt: r.started_at,
    completedAt: r.completed_at || r.created_at,
    certificateCode: r.certificate_code || null,
    percentage: r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0,
  }));
}

export function getUserCertificates(userId: string) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT *
    FROM certificates
    WHERE user_id = ?
    ORDER BY issue_date DESC, created_at DESC
  `).all(userId) as any[];

  return rows.map((r) => ({
    id: r.id,
    certificateCode: r.certificate_code,
    skill: r.skill,
    score: r.score,
    totalQuestions: r.total_questions,
    percentage: r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0,
    issueDate: r.issue_date,
    verificationStatus: r.verification_status,
  }));
}

export function getCertificateByCode(code: string) {
  const db = getDb();
  const row = db.prepare(`
    SELECT c.*, u.name as user_name
    FROM certificates c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.certificate_code = ?
  `).get(code) as any;

  if (!row) return null;

  return {
    id: row.id,
    certificateCode: row.certificate_code,
    userName: row.user_name || 'Verified Professional',
    skill: row.skill,
    score: row.score,
    totalQuestions: row.total_questions,
    percentage: row.total_questions > 0 ? Math.round((row.score / row.total_questions) * 100) : 0,
    issueDate: row.issue_date,
    verificationStatus: row.verification_status,
  };
}

export function getUserCourses(userId: string) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      c.*,
      COALESCE(cp.lessons_completed, 0) as lessons_completed,
      COALESCE(cp.status, 'Not Started') as status,
      cp.completion_date,
      cp.last_accessed_at
    FROM courses c
    LEFT JOIN course_progress cp ON c.id = cp.course_id AND cp.user_id = ?
    ORDER BY c.created_at ASC
  `).all(userId) as any[];

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    description: r.description,
    totalLessons: r.total_lessons,
    durationMinutes: r.duration_minutes,
    level: r.level,
    lessonsCompleted: r.lessons_completed,
    status: r.status,
    completionDate: r.completion_date,
    lastAccessedAt: r.last_accessed_at,
    progressPercentage: r.total_lessons > 0 ? Math.min(100, Math.round((r.lessons_completed / r.total_lessons) * 100)) : 0,
  }));
}

export function updateUserCourseProgress(userId: string, courseId: string, lessonsCompleted: number) {
  const db = getDb();
  const course = db.prepare('SELECT id, total_lessons FROM courses WHERE id = ? OR slug = ?').get(courseId, courseId) as any;
  if (!course) {
    throw new Error('Course not found.');
  }

  const resolvedCourseId = course.id;
  const totalLessons = course.total_lessons;
  const clampedCompleted = Math.max(0, Math.min(totalLessons, lessonsCompleted));
  const isCompleted = clampedCompleted >= totalLessons;
  const status = isCompleted ? 'Completed' : clampedCompleted > 0 ? 'In Progress' : 'Not Started';
  const now = new Date().toISOString();
  const completionDate = isCompleted ? now : null;

  const existing = db.prepare('SELECT id FROM course_progress WHERE user_id = ? AND course_id = ?').get(userId, resolvedCourseId) as any;

  if (existing) {
    db.prepare(`
      UPDATE course_progress
      SET lessons_completed = ?, status = ?, completion_date = COALESCE(?, completion_date),
          last_accessed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(clampedCompleted, status, completionDate, now, now, existing.id);
  } else {
    const id = `cp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    db.prepare(`
      INSERT INTO course_progress (
        id, user_id, course_id, lessons_completed, total_lessons,
        status, completion_date, last_accessed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, resolvedCourseId, clampedCompleted, totalLessons, status, completionDate, now, now, now);
  }

  return {
    courseId: resolvedCourseId,
    lessonsCompleted: clampedCompleted,
    totalLessons,
    status,
    completionDate,
  };
}

/**
 * Retrieves a user's active profile skills.
 * If the user has no skills tracked yet, seeds initial profile skills.
 */
export function getUserSkills(userId: string) {
  const db = getDb();
  let rows = db.prepare('SELECT * FROM user_skills WHERE user_id = ? ORDER BY created_at ASC').all(userId) as any[];

  // If user has no skills tracked yet, seed their initial skills and check against verified_skills
  if (rows.length === 0) {
    const initialSkills: { name: string; category: string }[] = [
      { name: 'Python', category: 'Programming' },
      { name: 'SQL', category: 'Database' },
      { name: 'React', category: 'Frontend' },
      { name: 'AWS', category: 'Cloud & DevOps' },
      { name: 'Machine Learning', category: 'AI / Data' },
      { name: 'JavaScript', category: 'Programming' },
      { name: 'Git', category: 'Cloud & DevOps' },
    ];

    const now = new Date().toISOString();
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO user_skills (
        id, user_id, skill_name, category, status, score, certificate_id,
        verified_date, claimed_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < initialSkills.length; i++) {
      const s = initialSkills[i];
      const id = `usk_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;

      // Check if this user has already verified this skill in verified_skills table
      const verified = db.prepare(`
        SELECT vs.*, a.score as att_score, a.total_questions, c.certificate_code
        FROM verified_skills vs
        LEFT JOIN assessments a ON vs.assessment_id = a.id
        LEFT JOIN certificates c ON vs.assessment_id = c.assessment_id
        WHERE vs.user_id = ? AND LOWER(vs.skill_name) = LOWER(?) AND vs.status = 'VERIFIED'
        ORDER BY vs.verified_at DESC LIMIT 1
      `).get(userId, s.name) as any;

      if (verified) {
        insertStmt.run(
          id,
          userId,
          s.name,
          s.category,
          'verified',
          verified.att_score || 8,
          verified.certificate_code || null,
          verified.verified_at || now.split('T')[0],
          null,
          now,
          now
        );
      } else {
        insertStmt.run(
          id,
          userId,
          s.name,
          s.category,
          'not-verified',
          null,
          null,
          null,
          null,
          now,
          now
        );
      }
    }

    rows = db.prepare('SELECT * FROM user_skills WHERE user_id = ? ORDER BY created_at ASC').all(userId) as any[];
  }

  // Sync any newly verified skills from verified_skills/certificates
  return rows.map((r) => {
    let status = r.status;
    let score = r.score;
    let certificateId = r.certificate_id;
    let verifiedDate = r.verified_date;

    if (status !== 'verified') {
      const verified = db.prepare(`
        SELECT vs.*, a.score as att_score, c.certificate_code
        FROM verified_skills vs
        LEFT JOIN assessments a ON vs.assessment_id = a.id
        LEFT JOIN certificates c ON vs.assessment_id = c.assessment_id
        WHERE vs.user_id = ? AND LOWER(vs.skill_name) = LOWER(?) AND vs.status = 'VERIFIED'
        ORDER BY vs.verified_at DESC LIMIT 1
      `).get(userId, r.skill_name) as any;

      if (verified) {
        status = 'verified';
        score = verified.att_score;
        certificateId = verified.certificate_code;
        verifiedDate = verified.verified_at;
        db.prepare(`
          UPDATE user_skills
          SET status = 'verified', score = ?, certificate_id = ?, verified_date = ?, updated_at = ?
          WHERE id = ?
        `).run(score, certificateId, verifiedDate, new Date().toISOString(), r.id);
      }
    }

    return {
      id: r.id,
      name: r.skill_name,
      category: r.category,
      status: status,
      score: score || undefined,
      certificateId: certificateId || undefined,
      verifiedDate: verifiedDate || undefined,
      claimedDate: r.claimed_date || undefined,
    };
  });
}

/**
 * Adds or claims a skill for an authenticated user.
 */
export function addUserSkill(
  userId: string,
  skillName: string,
  category: string,
  claimDirectly = true
) {
  const db = getDb();
  const now = new Date().toISOString();

  // Check if skill already exists for this user
  const existing = db.prepare(
    'SELECT * FROM user_skills WHERE user_id = ? AND LOWER(skill_name) = LOWER(?)'
  ).get(userId, skillName) as any;

  if (existing) {
    if (claimDirectly && existing.status === 'not-verified') {
      db.prepare(`
        UPDATE user_skills
        SET status = 'claimed', claimed_date = ?, updated_at = ?
        WHERE id = ?
      `).run(now.split('T')[0], now, existing.id);
      existing.status = 'claimed';
      existing.claimed_date = now.split('T')[0];
    }
    return {
      id: existing.id,
      name: existing.skill_name,
      category: existing.category,
      status: existing.status,
      score: existing.score || undefined,
      certificateId: existing.certificate_id || undefined,
      verifiedDate: existing.verified_date || undefined,
      claimedDate: existing.claimed_date || undefined,
    };
  }

  // Check if already verified in verified_skills
  const verified = db.prepare(`
    SELECT vs.*, a.score as att_score, c.certificate_code
    FROM verified_skills vs
    LEFT JOIN assessments a ON vs.assessment_id = a.id
    LEFT JOIN certificates c ON vs.assessment_id = c.assessment_id
    WHERE vs.user_id = ? AND LOWER(vs.skill_name) = LOWER(?) AND vs.status = 'VERIFIED'
    ORDER BY vs.verified_at DESC LIMIT 1
  `).get(userId, skillName) as any;

  const id = `usk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const status = verified ? 'verified' : claimDirectly ? 'claimed' : 'not-verified';
  const score = verified ? verified.att_score : null;
  const certificateId = verified ? verified.certificate_code : null;
  const verifiedDate = verified ? verified.verified_at : null;
  const claimedDate = claimDirectly ? now.split('T')[0] : null;

  db.prepare(`
    INSERT INTO user_skills (
      id, user_id, skill_name, category, status, score, certificate_id,
      verified_date, claimed_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    skillName,
    category,
    status,
    score,
    certificateId,
    verifiedDate,
    claimedDate,
    now,
    now
  );

  return {
    id,
    name: skillName,
    category,
    status,
    score: score || undefined,
    certificateId: certificateId || undefined,
    verifiedDate: verifiedDate || undefined,
    claimedDate: claimedDate || undefined,
  };
}

/**
 * Removes a skill from a user's active profile.
 * PRESERVES historical assessment attempts and certificates in the database archive.
 */
export function deleteUserSkill(
  userId: string,
  skillIdOrName: string
): { success: boolean; error?: string; deletedSkill?: { id: string; name: string; status: string; certificateId?: string } } {
  const db = getDb();

  // Strict ownership check: must match userId AND (id OR skill_name)
  const target = db.prepare(`
    SELECT * FROM user_skills
    WHERE user_id = ? AND (id = ? OR LOWER(skill_name) = LOWER(?))
  `).get(userId, skillIdOrName, skillIdOrName) as any;

  if (!target) {
    return { success: false, error: 'Skill not found in user profile or unauthorized.' };
  }

  // Delete from user_skills table
  db.prepare('DELETE FROM user_skills WHERE id = ? AND user_id = ?').run(target.id, userId);

  // NOTE: Assessments and certificates tables are explicitly preserved.
  // We do NOT delete historical attempts or verified credentials.

  const userName = getUserNameById(userId);
  logAuditEvent({
    eventType: 'SKILL_REMOVED',
    actorType: 'USER',
    actorId: userId,
    description: `${userName || 'Candidate'} removed skill "${target.skill_name}" from active profile`,
    metadata: {
      skillId: target.id,
      skillName: target.skill_name,
      wasVerified: target.status === 'verified',
      certificateId: target.certificate_id || null,
      userId,
    },
  });

  return {
    success: true,
    deletedSkill: {
      id: target.id,
      name: target.skill_name,
      status: target.status,
      certificateId: target.certificate_id || undefined,
    },
  };
}

/**
 * Synchronizes verified skill status when an assessment is passed.
 */
export function syncUserSkillVerification(
  userId: string,
  skillName: string,
  score: number,
  certificateCode: string,
  verifiedAt: string
) {
  const db = getDb();
  const now = new Date().toISOString();

  const existing = db.prepare(
    'SELECT * FROM user_skills WHERE user_id = ? AND LOWER(skill_name) = LOWER(?)'
  ).get(userId, skillName) as any;

  if (existing) {
    db.prepare(`
      UPDATE user_skills
      SET status = 'verified', score = ?, certificate_id = ?, verified_date = ?, updated_at = ?
      WHERE id = ?
    `).run(score, certificateCode, verifiedAt, now, existing.id);
  } else {
    const catalogItem = db.prepare('SELECT category FROM skills_catalog WHERE LOWER(name) = LOWER(?)').get(skillName) as any;
    const category = catalogItem?.category || 'Technical';
    const id = `usk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    db.prepare(`
      INSERT INTO user_skills (
        id, user_id, skill_name, category, status, score, certificate_id,
        verified_date, claimed_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'verified', ?, ?, ?, NULL, ?, ?)
    `).run(id, userId, skillName, category, score, certificateCode, verifiedAt, now, now);
  }
}

/**
 * Records a camera / fullscreen / behavioral proctoring event into SQLite database.
 */
export function recordProctoringEvent(
  assessmentId: string,
  eventType: string,
  severity: 'info' | 'warning' | 'violation',
  details?: string
) {
  const db = getDb();
  const id = `pevt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO proctoring_events (id, assessment_id, event_type, severity, details, timestamp, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, assessmentId, eventType, severity, details || null, now, now);

    if (severity === 'violation') {
      db.prepare(`
        UPDATE assessments
        SET proctoring_violation_count = COALESCE(proctoring_violation_count, 0) + 1
        WHERE id = ?
      `).run(assessmentId);
    }
  } catch (err) {
    console.warn('Failed to record proctoring event:', err);
  }

  return { id, assessmentId, eventType, severity, details, timestamp: now };
}

/**
 * Retrieves proctoring event logs for admin monitoring.
 */
export function getProctoringEvents(limit = 50, assessmentId?: string) {
  const db = getDb();
  try {
    if (assessmentId) {
      return db.prepare(`
        SELECT pe.*, a.skill, a.visitor_id, u.name as user_name, u.email as user_email
        FROM proctoring_events pe
        LEFT JOIN assessments a ON pe.assessment_id = a.id
        LEFT JOIN users u ON a.visitor_id = u.id
        WHERE pe.assessment_id = ?
        ORDER BY pe.created_at DESC
        LIMIT ?
      `).all(assessmentId, limit);
    }

    return db.prepare(`
      SELECT pe.*, a.skill, a.visitor_id, u.name as user_name, u.email as user_email
      FROM proctoring_events pe
      LEFT JOIN assessments a ON pe.assessment_id = a.id
      LEFT JOIN users u ON a.visitor_id = u.id
      ORDER BY pe.created_at DESC
      LIMIT ?
    `).all(limit);
  } catch (err) {
    console.warn('Failed to query proctoring events:', err);
    return [];
  }
}

/**
 * Returns aggregated proctoring telemetry for admin center.
 */
export function getProctoringSummary() {
  const db = getDb();
  try {
    const totalEvents = (db.prepare('SELECT COUNT(*) as count FROM proctoring_events').get() as any)?.count || 0;
    const totalViolations = (db.prepare("SELECT COUNT(*) as count FROM proctoring_events WHERE severity = 'violation'").get() as any)?.count || 0;
    const totalWarnings = (db.prepare("SELECT COUNT(*) as count FROM proctoring_events WHERE severity = 'warning'").get() as any)?.count || 0;

    const violationBreakdown = db.prepare(`
      SELECT event_type, COUNT(*) as count
      FROM proctoring_events
      WHERE severity = 'violation'
      GROUP BY event_type
      ORDER BY count DESC
    `).all();

    const activeOrRecentSessions = db.prepare(`
      SELECT a.id, a.skill, a.score, a.passed, a.status, a.duration_seconds, a.proctoring_violation_count, a.created_at,
             u.name as user_name, u.email as user_email
      FROM assessments a
      LEFT JOIN users u ON a.visitor_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `).all();

    const recentEvents = getProctoringEvents(30);

    return {
      totalEvents,
      totalViolations,
      totalWarnings,
      violationBreakdown,
      activeOrRecentSessions,
      recentEvents,
    };
  } catch (err) {
    console.warn('Failed to get proctoring summary:', err);
    return {
      totalEvents: 0,
      totalViolations: 0,
      totalWarnings: 0,
      violationBreakdown: [],
      activeOrRecentSessions: [],
      recentEvents: [],
    };
  }
}



