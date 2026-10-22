import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dns from 'node:dns';
import { createRequire } from 'node:module';

try {
  dns.setDefaultResultOrder?.('ipv4first');
} catch {}

const require = createRequire(path.join(process.cwd(), 'package.json'));
const pg = require('pg');
const { DatabaseSync } = require('node:sqlite');

function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const f of envFiles) {
    const full = path.join(process.cwd(), f);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const args = process.argv.slice(2);
const isConfirmed = args.includes('--confirm-reset');
const targetArg = args.find(a => a.startsWith('--target='))?.split('=')[1]?.toLowerCase() || 'all';

console.log('================================================================');
console.log('SMART RESUME AI: FRESH DATABASE INITIALIZATION & RESET MANAGER');
console.log('================================================================');
console.log(`Execution Mode: ${isConfirmed ? 'LIVE EXECUTION (DESTRUCTIVE - AUTHORIZED)' : 'DRY-RUN AUDIT (SAFE - NO WRITES)'}`);
console.log(`Target:         ${targetArg.toUpperCase()}`);
console.log('================================================================\n');

function sanitize(url) {
  if (!url) return 'Not Configured';
  return url.replace(/postgres(?:ql)?:\/\/[^@\s]+@/gi, 'postgresql://****:****@');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// 23 Canonical Tables in exact dependency order
const TABLE_DEFINITIONS = [
  {
    name: 'admin_users',
    sqlPg: `
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
    `,
    sqlSqlite: `
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
    `,
  },
  {
    name: 'skills_catalog',
    sqlPg: `
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
    `,
    sqlSqlite: `
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
    `,
  },
  {
    name: 'assessment_configs',
    sqlPg: `
      CREATE TABLE IF NOT EXISTS assessment_configs (
        id TEXT PRIMARY KEY,
        skill_slug TEXT UNIQUE NOT NULL,
        questions_count INTEGER DEFAULT 10,
        pass_percentage INTEGER DEFAULT 70,
        time_limit_minutes INTEGER DEFAULT 20,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `,
    sqlSqlite: `
      CREATE TABLE IF NOT EXISTS assessment_configs (
        id TEXT PRIMARY KEY,
        skill_slug TEXT UNIQUE NOT NULL,
        questions_count INTEGER DEFAULT 10,
        pass_percentage INTEGER DEFAULT 70,
        time_limit_minutes INTEGER DEFAULT 20,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `,
  },
  {
    name: 'courses',
    sqlPg: `
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
    `,
    sqlSqlite: `
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
    `,
  },
  {
    name: 'users',
    sqlPg: `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        session_token TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_active_at TEXT NOT NULL,
        password_hash TEXT,
        role TEXT DEFAULT 'USER',
        is_active INTEGER DEFAULT 1,
        last_login_at TEXT
      );
    `,
    sqlSqlite: `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        session_token TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_active_at TEXT NOT NULL,
        password_hash TEXT,
        role TEXT DEFAULT 'USER',
        is_active INTEGER DEFAULT 1,
        last_login_at TEXT
      );
    `,
  },
  {
    name: 'visitors',
    sqlPg: `
      CREATE TABLE IF NOT EXISTS visitors (
        id TEXT PRIMARY KEY,
        anonymous_id TEXT UNIQUE NOT NULL,
        first_seen_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        total_sessions INTEGER DEFAULT 1,
        user_agent TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        user_id TEXT
      );
    `,
    sqlSqlite: `
      CREATE TABLE IF NOT EXISTS visitors (
        id TEXT PRIMARY KEY,
        anonymous_id TEXT UNIQUE NOT NULL,
        first_seen_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        total_sessions INTEGER DEFAULT 1,
        user_agent TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        user_id TEXT
      );
    `,
  },
  {
    name: 'resumes',
    sqlPg: `
      CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        visitor_id TEXT,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        uploaded_at TEXT NOT NULL,
        parsed_successfully INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        user_id TEXT,
        resume_data TEXT
      );
    `,
    sqlSqlite: `
      CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        visitor_id TEXT,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        uploaded_at TEXT NOT NULL,
        parsed_successfully INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        user_id TEXT,
        resume_data TEXT
      );
    `,
  },
  {
    name: 'resume_analyses',
    sqlPg: `
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
        created_at TEXT NOT NULL,
        user_id TEXT
      );
    `,
    sqlSqlite: `
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
        created_at TEXT NOT NULL,
        user_id TEXT
      );
    `,
  },
  {
    name: 'resume_improvements',
    sqlPg: `
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
    `,
    sqlSqlite: `
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
    `,
  },
  {
    name: 'resume_versions',
    sqlPg: `
      CREATE TABLE IF NOT EXISTS resume_versions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        resume_id TEXT,
        version_number INTEGER NOT NULL DEFAULT 1,
        resume_data TEXT NOT NULL,
        change_summary TEXT,
        created_at TEXT NOT NULL
      );
    `,
    sqlSqlite: `
      CREATE TABLE IF NOT EXISTS resume_versions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        resume_id TEXT,
        version_number INTEGER NOT NULL DEFAULT 1,
        resume_data TEXT NOT NULL,
        change_summary TEXT,
        created_at TEXT NOT NULL
      );
    `,
  },
  {
    name: 'assessment_questions',
    sqlPg: `
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
    `,
    sqlSqlite: `
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
    `,
  },
  {
    name: 'assessments',
    sqlPg: `
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
        created_at TEXT NOT NULL,
        user_id TEXT,
        termination_reason TEXT,
        proctoring_events_json TEXT
      );
    `,
    sqlSqlite: `
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
        created_at TEXT NOT NULL,
        user_id TEXT,
        termination_reason TEXT,
        proctoring_events_json TEXT
      );
    `,
  },
  {
    name: 'assessment_question_snapshots',
    sqlPg: `
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
    `,
    sqlSqlite: `
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
    `,
  },
  {
    name: 'verified_skills',
    sqlPg: `
      CREATE TABLE IF NOT EXISTS verified_skills (
        id TEXT PRIMARY KEY,
        visitor_id TEXT,
        skill_name TEXT NOT NULL,
        status TEXT NOT NULL,
        assessment_id TEXT,
        verified_at TEXT,
        created_at TEXT NOT NULL,
        user_id TEXT
      );
    `,
    sqlSqlite: `
      CREATE TABLE IF NOT EXISTS verified_skills (
        id TEXT PRIMARY KEY,
        visitor_id TEXT,
        skill_name TEXT NOT NULL,
        status TEXT NOT NULL,
        assessment_id TEXT,
        verified_at TEXT,
        created_at TEXT NOT NULL,
        user_id TEXT
      );
    `,
  },
  {
    name: 'certificates',
    sqlPg: `
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
    `,
    sqlSqlite: `
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
    `,
  },
  {
    name: 'course_progress',
    sqlPg: `
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
    `,
    sqlSqlite: `
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
    `,
  },
  {
    name: 'user_skills',
    sqlPg: `
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
    `,
    sqlSqlite: `
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
    `,
  },
  {
    name: 'job_searches',
    sqlPg: `
      CREATE TABLE IF NOT EXISTS job_searches (
        id TEXT PRIMARY KEY,
        visitor_id TEXT,
        query TEXT NOT NULL,
        location TEXT,
        provider TEXT NOT NULL,
        results_count INTEGER NOT NULL,
        searched_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        user_id TEXT
      );
    `,
    sqlSqlite: `
      CREATE TABLE IF NOT EXISTS job_searches (
        id TEXT PRIMARY KEY,
        visitor_id TEXT,
        query TEXT NOT NULL,
        location TEXT,
        provider TEXT NOT NULL,
        results_count INTEGER NOT NULL,
        searched_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        user_id TEXT
      );
    `,
  },
  {
    name: 'job_matches',
    sqlPg: `
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
        created_at TEXT NOT NULL,
        user_id TEXT
      );
    `,
    sqlSqlite: `
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
        created_at TEXT NOT NULL,
        user_id TEXT
      );
    `,
  },
  {
    name: 'job_applications',
    sqlPg: `
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
        resume_id TEXT,
        applied_confirmed_at TEXT,
        description_snippet TEXT,
        salary TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `,
    sqlSqlite: `
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
        resume_id TEXT,
        applied_confirmed_at TEXT,
        description_snippet TEXT,
        salary TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `,
  },
  {
    name: 'feedback',
    sqlPg: `
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        visitor_id TEXT,
        rating INTEGER NOT NULL,
        category TEXT NOT NULL,
        message TEXT NOT NULL,
        suggestions TEXT,
        status TEXT DEFAULT 'new',
        created_at TEXT NOT NULL,
        user_id TEXT
      );
    `,
    sqlSqlite: `
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        visitor_id TEXT,
        rating INTEGER NOT NULL,
        category TEXT NOT NULL,
        message TEXT NOT NULL,
        suggestions TEXT,
        status TEXT DEFAULT 'new',
        created_at TEXT NOT NULL,
        user_id TEXT
      );
    `,
  },
  {
    name: 'proctoring_events',
    sqlPg: `
      CREATE TABLE IF NOT EXISTS proctoring_events (
        id TEXT PRIMARY KEY,
        assessment_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        details TEXT,
        timestamp TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `,
    sqlSqlite: `
      CREATE TABLE IF NOT EXISTS proctoring_events (
        id TEXT PRIMARY KEY,
        assessment_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        details TEXT,
        timestamp TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `,
  },
  {
    name: 'audit_events',
    sqlPg: `
      CREATE TABLE IF NOT EXISTS audit_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        actor_type TEXT NOT NULL,
        actor_id TEXT,
        description TEXT NOT NULL,
        metadata_json TEXT,
        created_at TEXT NOT NULL
      );
    `,
    sqlSqlite: `
      CREATE TABLE IF NOT EXISTS audit_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        actor_type TEXT NOT NULL,
        actor_id TEXT,
        description TEXT NOT NULL,
        metadata_json TEXT,
        created_at TEXT NOT NULL
      );
    `,
  },
];

const INDEX_STATEMENTS = [
  'CREATE INDEX IF NOT EXISTS idx_skills_cat_slug ON skills_catalog(slug);',
  'CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);',
  'CREATE INDEX IF NOT EXISTS idx_users_token ON users(session_token);',
  'CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);',
  'CREATE INDEX IF NOT EXISTS idx_users_lower_email ON users(LOWER(email));',
  'CREATE INDEX IF NOT EXISTS idx_visitors_anon ON visitors(anonymous_id);',
  'CREATE INDEX IF NOT EXISTS idx_resumes_visitor ON resumes(visitor_id);',
  'CREATE INDEX IF NOT EXISTS idx_analyses_date ON resume_analyses(analyzed_at);',
  'CREATE INDEX IF NOT EXISTS idx_improvements_user ON resume_improvements(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_resume_ver_user ON resume_versions(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_resume_ver_res ON resume_versions(resume_id);',
  'CREATE INDEX IF NOT EXISTS idx_resume_ver_order ON resume_versions(user_id, resume_id, version_number DESC);',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_resume_ver_unique ON resume_versions(user_id, resume_id, version_number);',
  'CREATE INDEX IF NOT EXISTS idx_aq_skill ON assessment_questions(skill_slug);',
  'CREATE INDEX IF NOT EXISTS idx_aq_status ON assessment_questions(is_active, is_deleted);',
  'CREATE INDEX IF NOT EXISTS idx_assessments_skill ON assessments(skill);',
  'CREATE INDEX IF NOT EXISTS idx_snap_assessment ON assessment_question_snapshots(assessment_id);',
  'CREATE INDEX IF NOT EXISTS idx_skills_name ON verified_skills(skill_name);',
  'CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(certificate_code);',
  'CREATE INDEX IF NOT EXISTS idx_cp_user ON course_progress(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_cp_course ON course_progress(course_id);',
  'CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_user_skills_name ON user_skills(skill_name);',
  'CREATE INDEX IF NOT EXISTS idx_job_searches_date ON job_searches(searched_at);',
  'CREATE INDEX IF NOT EXISTS idx_job_app_user ON job_applications(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_job_app_status ON job_applications(status);',
  'CREATE INDEX IF NOT EXISTS idx_feedback_date ON feedback(created_at);',
  'CREATE INDEX IF NOT EXISTS idx_proctor_assessment ON proctoring_events(assessment_id);',
  'CREATE INDEX IF NOT EXISTS idx_proctor_type ON proctoring_events(event_type);',
  'CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_events(created_at);',
];

const SEED_COURSES = [
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

const EXPECTED_PG_DB = 'neondb';
const CANONICAL_APP_TABLES = new Set(TABLE_DEFINITIONS.map(t => t.name));

const resetStatus = {
  sqlite: { attempted: false, completed: false, error: null },
  neon: { attempted: false, completed: false, error: null },
};

async function loadSeedQuestionsAndSkills() {
  const mod = await import(path.join(process.cwd(), 'src', 'server', 'db', 'seedQuestions.ts'));
  return {
    skills: mod.SEED_SKILLS,
    questions: mod.INITIAL_ASSESSMENT_QUESTIONS,
  };
}

async function dryRunReport() {
  console.log('[DRY-RUN AUDIT] Inspecting target environments without modifying data...\n');

  // 1. Local SQLite Status
  if (targetArg === 'sqlite' || targetArg === 'all') {
    const sqliteDbPath = path.join(process.cwd(), 'data', 'smart_resume.db');
    if (fs.existsSync(sqliteDbPath)) {
      const db = new DatabaseSync(sqliteDbPath);
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
      let rows = 0;
      for (const t of tables) {
        rows += db.prepare(`SELECT count(*) as c FROM "${t.name}"`).get().c;
      }
      db.close();
      console.log(`1. LOCAL SQLITE TARGET:`);
      console.log(`   - File:              data/smart_resume.db`);
      console.log(`   - Status:            Active (${tables.length} tables, ${rows} records)`);
      console.log(`   - Action on Reset:   Permanent deletion of data/smart_resume.db (discarding ${rows} records)`);
      console.log(`   - Recreation:        Full schema creation (23 tables, 30 indexes) + clean catalog seeding\n`);
    } else {
      console.log(`1. LOCAL SQLITE TARGET:`);
      console.log(`   - File:              data/smart_resume.db (Does not exist currently)`);
      console.log(`   - Action on Reset:   Fresh creation from schema + catalog seeding\n`);
    }
  } else {
    console.log(`1. LOCAL SQLITE TARGET:`);
    console.log(`   - Status:            SKIPPED (Target filtered to: ${targetArg.toUpperCase()})\n`);
  }

  // 2. Neon PostgreSQL Status
  if (targetArg === 'neon' || targetArg === 'all') {
    const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (postgresUrl) {
      try {
        const pool = new pg.Pool({
          connectionString: postgresUrl,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 10000,
        });

        let client;
        let lastErr;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            client = await pool.connect();
            break;
          } catch (e) {
            lastErr = e;
            if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
          }
        }
        if (!client) throw lastErr;

        const metaRes = await client.query('SELECT current_database(), current_user, version()');
        const connectedDb = metaRes.rows[0].current_database;

        // Target database safety check
        if (connectedDb.toLowerCase() !== EXPECTED_PG_DB.toLowerCase()) {
          throw new Error(`SAFETY BLOCK: Connected to database '${connectedDb}', but expected '${EXPECTED_PG_DB}'.`);
        }
        if (!postgresUrl.includes('.neon.tech') && !postgresUrl.includes('localhost') && !postgresUrl.includes('127.0.0.1')) {
          throw new Error(`SAFETY BLOCK: Target host is not a verified Neon endpoint (*.neon.tech).`);
        }

        const tablesRes = await client.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `);
        
        const allPublicTables = tablesRes.rows.map(r => r.table_name);
        const appTablesFound = allPublicTables.filter(t => CANONICAL_APP_TABLES.has(t));
        const nonAppTablesFound = allPublicTables.filter(t => !CANONICAL_APP_TABLES.has(t));

        let pgRows = 0;
        for (const t of appTablesFound) {
          try {
            const c = await client.query(`SELECT count(*) as c FROM "${t}"`);
            pgRows += parseInt(c.rows[0]?.c, 10);
          } catch {}
        }

        client.release();
        await pool.end();

        console.log(`2. NEON PRODUCTION TARGET:`);
        console.log(`   - Database:          ${connectedDb} (VERIFIED MATCH: ${EXPECTED_PG_DB})`);
        console.log(`   - Current User:      ${metaRes.rows[0].current_user}`);
        console.log(`   - Endpoint:          ${sanitize(postgresUrl)}`);
        console.log(`   - App Tables:        ${appTablesFound.length} / 23 canonical tables found (${pgRows} records)`);
        if (nonAppTablesFound.length > 0) {
          console.log(`   - Non-App Tables:    ${nonAppTablesFound.length} tables detected (WILL BE PRESERVED: ${nonAppTablesFound.join(', ')})`);
        }
        console.log(`   - Action on Reset:   Narrow DROP TABLE IF EXISTS for 23 canonical app tables only (discarding ${pgRows} records)`);
        console.log(`   - Recreation:        Full schema creation (23 tables, 30 indexes) + clean catalog seeding\n`);
      } catch (err) {
        console.log(`2. NEON PRODUCTION TARGET:`);
        console.log(`   - Endpoint:          ${sanitize(postgresUrl)}`);
        console.log(`   - Safety Check:      FAILED (${err.message})\n`);
      }
    } else {
      console.log(`2. NEON PRODUCTION TARGET:`);
      console.log(`   - Status:            No POSTGRES_URL configured in environment.\n`);
    }
  } else {
    console.log(`2. NEON PRODUCTION TARGET:`);
    console.log(`   - Status:            SKIPPED (Target filtered to: ${targetArg.toUpperCase()})\n`);
  }

  // 3. Admin Account Initialization Check
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const hasAdminPassword = Boolean(process.env.ADMIN_PASSWORD);
  console.log(`3. ADMIN INITIALIZATION PRE-CHECK:`);
  console.log(`   - ADMIN_EMAIL:       ${adminEmail || 'NOT SET (REQUIRED BEFORE LIVE RESET)'}`);
  console.log(`   - ADMIN_PASSWORD:    ${hasAdminPassword ? 'CONFIGURED IN ENVIRONMENT' : 'NOT SET (REQUIRED BEFORE LIVE RESET)'}`);
  if (!adminEmail || !hasAdminPassword) {
    console.log(`   - Warning:           Live execution will FAIL CLOSED if ADMIN_EMAIL or ADMIN_PASSWORD is missing.`);
  }

  // 4. Proposed Sequence of Operations
  console.log(`\n4. PROPOSED OPERATIONS THAT WOULD BE EXECUTED (IF APPROVED):`);
  let opIdx = 1;
  if (targetArg === 'neon' || targetArg === 'all') {
    console.log(`   [Op ${opIdx++}] Verify target database identity ('neondb') and host (*.neon.tech)`);
  }
  console.log(`   [Op ${opIdx++}] Verify ADMIN_EMAIL and ADMIN_PASSWORD are configured in environment`);
  if (targetArg === 'sqlite' || targetArg === 'all') {
    console.log(`   [Op ${opIdx++}] Remove local SQLite 'data/smart_resume.db' and any WAL/SHM files`);
    console.log(`   [Op ${opIdx++}] Create all 23 canonical tables in SQLite with complete constraints`);
    console.log(`   [Op ${opIdx++}] Create all 30 performance, composite, and unique indexes in SQLite`);
    console.log(`   [Op ${opIdx++}] Seed 12 skills, 12 assessment configs, 123 questions, and 6 courses in SQLite`);
    console.log(`   [Op ${opIdx++}] Seed initial admin user in SQLite with scrypt hash (role = 'ADMIN')`);
  }
  if (targetArg === 'neon' || targetArg === 'all') {
    console.log(`   [Op ${opIdx++}] Narrow drop ONLY canonical app tables in Neon (preserving any non-app tables)`);
    console.log(`   [Op ${opIdx++}] Recreate all 23 canonical tables and 30 indexes in Neon PostgreSQL`);
    console.log(`   [Op ${opIdx++}] Seed 12 skills, 12 configs, 123 questions, and 6 courses in Neon`);
    console.log(`   [Op ${opIdx++}] Seed initial admin user in Neon with scrypt hash (role = 'ADMIN')`);
  }
  console.log(`   [Op ${opIdx++}] Execute programmatic smoke test asserting 0 user rows and matching seed counts`);

  console.log('\n================================================================');
  console.log('DRY-RUN COMPLETE: NO CHANGES WERE MADE TO ANY DATABASE.');
  console.log(`To execute live reset, run with: node scripts/reset_fresh_database.mjs ${targetArg !== 'all' ? `--target=${targetArg} ` : ''}--confirm-reset`);
  console.log('================================================================');
}

// Destructive execution handler (ONLY called if --confirm-reset is explicitly passed)
async function liveExecuteReset() {
  console.log('⚠️  CAUTION: LIVE EXECUTION COMMENCING -- CONFIRMATION FLAG DETECTED\n');

  // Guard: Admin credentials must be configured
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPass) {
    throw new Error(
      'SAFETY BLOCK: ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment before running live reset. This guarantees an admin account is initialized so you are never locked out.'
    );
  }

  const { skills, questions } = await loadSeedQuestionsAndSkills();
  const adminHash = hashPassword(adminPass);
  const now = new Date().toISOString();

  // RESET SQLITE
  if (targetArg === 'sqlite' || targetArg === 'all') {
    resetStatus.sqlite.attempted = true;
    console.log('--- EXECUTING RESET: LOCAL SQLITE ---');
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const dbFile = path.join(dataDir, 'smart_resume.db');
      for (const f of [dbFile, `${dbFile}-wal`, `${dbFile}-shm`]) {
        if (fs.existsSync(f)) {
          fs.unlinkSync(f);
          console.log(`   [SQLite] Deleted: ${f}`);
        }
      }

      const sqlite = new DatabaseSync(dbFile);
      sqlite.exec('PRAGMA foreign_keys = ON;');

      console.log(`   [SQLite] Creating 23 tables...`);
      for (const t of TABLE_DEFINITIONS) {
        sqlite.exec(t.sqlSqlite);
      }

      console.log(`   [SQLite] Creating 30 indexes...`);
      for (const idxSql of INDEX_STATEMENTS) {
        try {
          sqlite.exec(idxSql);
        } catch (err) {
          console.warn(`   [SQLite Index Warning] ${err.message}`);
        }
      }

      console.log(`   [SQLite] Seeding ${skills.length} skills and configs...`);
      const insertSkill = sqlite.prepare(`
        INSERT INTO skills_catalog (id, name, slug, category, description, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?)
      `);
      const insertConfig = sqlite.prepare(`
        INSERT INTO assessment_configs (id, skill_slug, questions_count, pass_percentage, time_limit_minutes, created_at, updated_at)
        VALUES (?, ?, 10, 70, 20, ?, ?)
      `);
      for (const s of skills) {
        const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        insertSkill.run(`skl_${slug}`, s.name, slug, s.category, s.description, now, now);
        insertConfig.run(`cfg_${slug}`, slug, now, now);
      }

      console.log(`   [SQLite] Seeding ${questions.length} assessment questions...`);
      const insertQ = sqlite.prepare(`
        INSERT INTO assessment_questions (
          id, skill_slug, skill_name, question_text, question_type,
          difficulty, options_json, correct_answer, explanation,
          time_limit_seconds, is_active, is_deleted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 120, 1, 0, ?, ?)
      `);
      questions.forEach((q, idx) => {
        const slug = q.skill.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const correctLetter = `Option ${String.fromCharCode(65 + q.correct_answer_index)}`;
        insertQ.run(
          `qst_${slug}_${idx + 1}`,
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

      console.log(`   [SQLite] Seeding ${SEED_COURSES.length} career courses...`);
      const insertCourse = sqlite.prepare(`
        INSERT INTO courses (id, slug, title, category, description, total_lessons, duration_minutes, level, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const c of SEED_COURSES) {
        insertCourse.run(c.id, c.slug, c.title, c.category, c.description, c.totalLessons, c.durationMinutes, c.level, now);
      }

      console.log(`   [SQLite] Seeding initial admin user: ${adminEmail}`);
      sqlite.prepare(`
        INSERT INTO admin_users (id, email, password_hash, role, created_at, updated_at, is_active)
        VALUES (?, ?, ?, 'ADMIN', ?, ?, 1)
      `).run(`adm_${Date.now()}`, adminEmail, adminHash, now, now);

      sqlite.close();
      resetStatus.sqlite.completed = true;
      console.log('   ✅ SQLite reset and recreation completed successfully.\n');
    } catch (err) {
      resetStatus.sqlite.error = err.message;
      throw err;
    }
  }

  // RESET NEON POSTGRESQL
  if (targetArg === 'neon' || targetArg === 'all') {
    resetStatus.neon.attempted = true;
    console.log('--- EXECUTING RESET: NEON POSTGRESQL ---');
    const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!postgresUrl) {
      throw new Error('POSTGRES_URL or DATABASE_URL is not set.');
    }

    const pool = new pg.Pool({
      connectionString: postgresUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    const client = await pool.connect();

    try {
      const metaRes = await client.query('SELECT current_database(), current_user, version()');
      const connectedDb = metaRes.rows[0].current_database;
      
      // Strict Database Name & Host Assertion
      if (connectedDb.toLowerCase() !== EXPECTED_PG_DB.toLowerCase()) {
        throw new Error(`SAFETY BLOCK: Connected to database '${connectedDb}', but expected '${EXPECTED_PG_DB}'. Aborting.`);
      }
      if (!postgresUrl.includes('.neon.tech') && !postgresUrl.includes('localhost') && !postgresUrl.includes('127.0.0.1')) {
        throw new Error(`SAFETY BLOCK: Target host is not a verified Neon endpoint (*.neon.tech). Aborting.`);
      }

      console.log(`   [Neon] Connected to verified database: ${connectedDb} on Neon cloud`);
      
      // Step 1: Narrow drop of ONLY canonical application tables
      const existingTablesRes = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `);
      const existingTables = existingTablesRes.rows.map(r => r.table_name);
      const tablesToDrop = existingTables.filter(t => CANONICAL_APP_TABLES.has(t));
      const nonAppTables = existingTables.filter(t => !CANONICAL_APP_TABLES.has(t));

      if (nonAppTables.length > 0) {
        console.log(`   [Neon] Preserving ${nonAppTables.length} non-application tables: ${nonAppTables.join(', ')}`);
      }

      console.log(`   [Neon] Dropping ${tablesToDrop.length} canonical application tables via CASCADE...`);
      for (const t of tablesToDrop) {
        await client.query(`DROP TABLE IF EXISTS "${t}" CASCADE;`);
      }

      // Step 2: Create 23 tables
      console.log(`   [Neon] Recreating 23 canonical tables...`);
      for (const t of TABLE_DEFINITIONS) {
        await client.query(t.sqlPg);
      }

      // Step 3: Create 30 indexes
      console.log(`   [Neon] Recreating 30 indexes...`);
      for (const idxSql of INDEX_STATEMENTS) {
        try {
          await client.query(idxSql);
        } catch (err) {
          console.warn(`   [Neon Index Warning] ${err.message}`);
        }
      }

      // Step 4: Seed Skills & Configs
      console.log(`   [Neon] Seeding ${skills.length} skills and assessment configs...`);
      for (const s of skills) {
        const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await client.query(`
          INSERT INTO skills_catalog (id, name, slug, category, description, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, 1, $6, $7)
          ON CONFLICT (slug) DO NOTHING;
        `, [`skl_${slug}`, s.name, slug, s.category, s.description, now, now]);

        await client.query(`
          INSERT INTO assessment_configs (id, skill_slug, questions_count, pass_percentage, time_limit_minutes, created_at, updated_at)
          VALUES ($1, $2, 10, 70, 20, $3, $4)
          ON CONFLICT (skill_slug) DO NOTHING;
        `, [`cfg_${slug}`, slug, now, now]);
      }

      // Step 5: Seed Questions
      console.log(`   [Neon] Seeding ${questions.length} assessment questions...`);
      for (let idx = 0; idx < questions.length; idx++) {
        const q = questions[idx];
        const slug = q.skill.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const correctLetter = `Option ${String.fromCharCode(65 + q.correct_answer_index)}`;
        await client.query(`
          INSERT INTO assessment_questions (
            id, skill_slug, skill_name, question_text, question_type,
            difficulty, options_json, correct_answer, explanation,
            time_limit_seconds, is_active, is_deleted, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 120, 1, 0, $10, $11)
          ON CONFLICT (id) DO NOTHING;
        `, [
          `qst_${slug}_${idx + 1}`,
          slug,
          q.skill,
          q.question_text,
          q.question_type,
          q.difficulty,
          JSON.stringify(q.options),
          correctLetter,
          q.explanation,
          now,
          now,
        ]);
      }

      // Step 6: Seed Courses
      console.log(`   [Neon] Seeding ${SEED_COURSES.length} career courses...`);
      for (const c of SEED_COURSES) {
        await client.query(`
          INSERT INTO courses (id, slug, title, category, description, total_lessons, duration_minutes, level, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (slug) DO NOTHING;
        `, [c.id, c.slug, c.title, c.category, c.description, c.totalLessons, c.durationMinutes, c.level, now]);
      }

      // Step 7: Seed Admin User
      console.log(`   [Neon] Seeding initial admin user: ${adminEmail}`);
      await client.query(`
        INSERT INTO admin_users (id, email, password_hash, role, created_at, updated_at, is_active)
        VALUES ($1, $2, $3, 'ADMIN', $4, $5, 1)
        ON CONFLICT (email) DO UPDATE SET password_hash = $3, updated_at = $5;
      `, [`adm_${Date.now()}`, adminEmail, adminHash, now, now]);

      resetStatus.neon.completed = true;
      console.log('   ✅ Neon PostgreSQL reset and recreation completed successfully.\n');
    } catch (err) {
      resetStatus.neon.error = err.message;
      throw err;
    } finally {
      client.release();
      await pool.end();
    }
  }

  // POST-RESET SMOKE TEST & STRICT ASSERTIONS
  console.log('--- POST-RESET SMOKE TEST & STRICT VERIFICATION ---');
  if (targetArg === 'sqlite' || targetArg === 'all') {
    const sqlite = new DatabaseSync(path.join(process.cwd(), 'data', 'smart_resume.db'));
    const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    const userCount = sqlite.prepare("SELECT count(*) as c FROM users").get().c;
    const resumeCount = sqlite.prepare("SELECT count(*) as c FROM resumes").get().c;
    const appCount = sqlite.prepare("SELECT count(*) as c FROM job_applications").get().c;
    const skillCount = sqlite.prepare("SELECT count(*) as c FROM skills_catalog").get().c;
    const qCount = sqlite.prepare("SELECT count(*) as c FROM assessment_questions").get().c;
    const courseCount = sqlite.prepare("SELECT count(*) as c FROM courses").get().c;
    const adminCount = sqlite.prepare("SELECT count(*) as c FROM admin_users").get().c;
    sqlite.close();

    console.log(`[SQLite Verification]`);
    console.log(`   - Tables Present:     ${tables.length} / 23`);
    console.log(`   - User Records:       ${userCount} (Expect 0)`);
    console.log(`   - Resume Records:     ${resumeCount} (Expect 0)`);
    console.log(`   - Application Records:${appCount} (Expect 0)`);
    console.log(`   - Skills Catalog:     ${skillCount} skills`);
    console.log(`   - Question Bank:      ${qCount} questions`);
    console.log(`   - Courses:            ${courseCount} courses`);
    console.log(`   - Admin Accounts:     ${adminCount}`);

    if (tables.length !== 23) throw new Error(`Smoke Test Assertion Failed: Expected 23 tables in SQLite, found ${tables.length}`);
    if (userCount !== 0) throw new Error(`Smoke Test Assertion Failed: Expected 0 users in SQLite, found ${userCount}`);
    if (resumeCount !== 0) throw new Error(`Smoke Test Assertion Failed: Expected 0 resumes in SQLite, found ${resumeCount}`);
    if (appCount !== 0) throw new Error(`Smoke Test Assertion Failed: Expected 0 applications in SQLite, found ${appCount}`);
    if (skillCount !== skills.length) throw new Error(`Smoke Test Assertion Failed: Expected ${skills.length} skills in SQLite, found ${skillCount}`);
    if (qCount !== questions.length) throw new Error(`Smoke Test Assertion Failed: Expected ${questions.length} questions in SQLite, found ${qCount}`);
    if (courseCount !== SEED_COURSES.length) throw new Error(`Smoke Test Assertion Failed: Expected ${SEED_COURSES.length} courses in SQLite, found ${courseCount}`);
    if (adminCount !== 1) throw new Error(`Smoke Test Assertion Failed: Expected exactly 1 admin user in SQLite, found ${adminCount}`);
  }

  if (targetArg === 'neon' || targetArg === 'all') {
    const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    const pool = new pg.Pool({ connectionString: postgresUrl, ssl: { rejectUnauthorized: false } });
    const client = await pool.connect();
    const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
    const userCount = (await client.query("SELECT count(*) as c FROM users")).rows[0].c;
    const resumeCount = (await client.query("SELECT count(*) as c FROM resumes")).rows[0].c;
    const appCount = (await client.query("SELECT count(*) as c FROM job_applications")).rows[0].c;
    const skillCount = (await client.query("SELECT count(*) as c FROM skills_catalog")).rows[0].c;
    const qCount = (await client.query("SELECT count(*) as c FROM assessment_questions")).rows[0].c;
    const courseCount = (await client.query("SELECT count(*) as c FROM courses")).rows[0].c;
    const adminCount = (await client.query("SELECT count(*) as c FROM admin_users")).rows[0].c;
    client.release();
    await pool.end();

    console.log(`[Neon Verification]`);
    console.log(`   - Tables Present:     ${tablesRes.rows.length} / 23`);
    console.log(`   - User Records:       ${userCount} (Expect 0)`);
    console.log(`   - Resume Records:     ${resumeCount} (Expect 0)`);
    console.log(`   - Application Records:${appCount} (Expect 0)`);
    console.log(`   - Skills Catalog:     ${skillCount} skills`);
    console.log(`   - Question Bank:      ${qCount} questions`);
    console.log(`   - Courses:            ${courseCount} courses`);
    console.log(`   - Admin Accounts:     ${adminCount}`);

    if (userCount !== 0) throw new Error(`Smoke Test Assertion Failed: Expected 0 users in Neon, found ${userCount}`);
    if (resumeCount !== 0) throw new Error(`Smoke Test Assertion Failed: Expected 0 resumes in Neon, found ${resumeCount}`);
    if (appCount !== 0) throw new Error(`Smoke Test Assertion Failed: Expected 0 applications in Neon, found ${appCount}`);
    if (skillCount !== skills.length) throw new Error(`Smoke Test Assertion Failed: Expected ${skills.length} skills in Neon, found ${skillCount}`);
    if (qCount !== questions.length) throw new Error(`Smoke Test Assertion Failed: Expected ${questions.length} questions in Neon, found ${qCount}`);
    if (courseCount !== SEED_COURSES.length) throw new Error(`Smoke Test Assertion Failed: Expected ${SEED_COURSES.length} courses in Neon, found ${courseCount}`);
    if (adminCount !== 1) throw new Error(`Smoke Test Assertion Failed: Expected exactly 1 admin user in Neon, found ${adminCount}`);
  }

  console.log('\n================================================================');
  console.log('✅ FRESH DATABASE RESET COMPLETED AND VERIFIED SUCCESSFULLY!');
  console.log('================================================================');
}

// MAIN EXECUTION ROUTER
if (isConfirmed) {
  liveExecuteReset().catch(err => {
    console.error('\n❌ RESET EXECUTION FAILED');
    console.error('Target Summary:');
    console.error(`  - Local SQLite:     ${resetStatus.sqlite.completed ? 'SUCCESS' : (resetStatus.sqlite.attempted ? 'FAILED (' + resetStatus.sqlite.error + ')' : 'NOT ATTEMPTED')}`);
    console.error(`  - Neon PostgreSQL: ${resetStatus.neon.completed ? 'SUCCESS' : (resetStatus.neon.attempted ? 'FAILED (' + resetStatus.neon.error + ')' : 'NOT ATTEMPTED')}`);
    console.error(`\nError: ${err.message}`);
    process.exit(1);
  });
} else {
  dryRunReport().catch(err => {
    console.error('\n❌ Dry-Run Failed:', err);
    process.exit(1);
  });
}

