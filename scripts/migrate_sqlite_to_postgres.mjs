import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';
import path from 'node:path';
import fs from 'node:fs';

const { Pool, types } = pg;
types.setTypeParser(20, (val) => parseInt(val, 10));

// Load environment variables if .env.local or .env exists
function loadEnv() {
  for (const file of ['.env.local', '.env.production', '.env']) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
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

const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!postgresUrl) {
  console.error('\n❌ ERROR: POSTGRES_URL or DATABASE_URL environment variable is required.');
  console.error('\nUsage:');
  console.error('  # Using inline environment variable:');
  console.error('  POSTGRES_URL="postgres://username:password@hostname:5432/dbname?sslmode=require" node scripts/migrate_sqlite_to_postgres.mjs\n');
  console.error('  # Or configure POSTGRES_URL in .env.local and run:');
  console.error('  npm run db:migrate:postgres\n');
  process.exit(1);
}

const sqliteDbPath = path.join(process.cwd(), 'data', 'smart_resume.db');
if (!fs.existsSync(sqliteDbPath)) {
  console.error(`\n❌ ERROR: Local SQLite database not found at ${sqliteDbPath}`);
  process.exit(1);
}

console.log('====================================================');
console.log('SMART RESUME AI: SQLITE -> POSTGRESQL DATA MIGRATION');
console.log('====================================================');
console.log(`Source SQLite:   ${sqliteDbPath}`);
console.log(`Target Postgres: ${postgresUrl.replace(/:[^:@]+@/, ':****@')}`);
console.log('====================================================\n');

const sqliteDb = new DatabaseSync(sqliteDbPath);
const pool = new Pool({
  connectionString: postgresUrl,
  ssl: postgresUrl.includes('localhost') || postgresUrl.includes('127.0.0.1')
    ? false
    : { rejectUnauthorized: false },
});

const TABLE_SCHEMAS = [
  {
    name: 'admin_users',
    conflictKey: 'id',
    sql: `
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
    conflictKey: 'id',
    sql: `
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
    `,
  },
  {
    name: 'assessment_configs',
    conflictKey: 'id',
    sql: `
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
    conflictKey: 'id',
    sql: `
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
    `,
  },
  {
    name: 'users',
    conflictKey: 'id',
    sql: `
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
      CREATE INDEX IF NOT EXISTS idx_users_token ON users(session_token);
      CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
    `,
  },
  {
    name: 'visitors',
    conflictKey: 'id',
    sql: `
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
      CREATE INDEX IF NOT EXISTS idx_visitors_anon ON visitors(anonymous_id);
    `,
  },
  {
    name: 'resumes',
    conflictKey: 'id',
    sql: `
      CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        visitor_id TEXT,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        uploaded_at TEXT NOT NULL,
        parsed_successfully INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        user_id TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_resumes_visitor ON resumes(visitor_id);
    `,
  },
  {
    name: 'resume_analyses',
    conflictKey: 'id',
    sql: `
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
      CREATE INDEX IF NOT EXISTS idx_analyses_date ON resume_analyses(analyzed_at);
    `,
  },
  {
    name: 'resume_improvements',
    conflictKey: 'id',
    sql: `
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
    `,
  },
  {
    name: 'assessment_questions',
    conflictKey: 'id',
    sql: `
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
    `,
  },
  {
    name: 'assessments',
    conflictKey: 'id',
    sql: `
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
      CREATE INDEX IF NOT EXISTS idx_assessments_skill ON assessments(skill);
    `,
  },
  {
    name: 'assessment_question_snapshots',
    conflictKey: 'id',
    sql: `
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
    `,
  },
  {
    name: 'verified_skills',
    conflictKey: 'id',
    sql: `
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
      CREATE INDEX IF NOT EXISTS idx_skills_name ON verified_skills(skill_name);
    `,
  },
  {
    name: 'certificates',
    conflictKey: 'id',
    sql: `
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
    `,
  },
  {
    name: 'course_progress',
    conflictKey: 'id',
    sql: `
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
    `,
  },
  {
    name: 'user_skills',
    conflictKey: 'id',
    sql: `
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
    `,
  },
  {
    name: 'job_searches',
    conflictKey: 'id',
    sql: `
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
      CREATE INDEX IF NOT EXISTS idx_job_searches_date ON job_searches(searched_at);
    `,
  },
  {
    name: 'job_matches',
    conflictKey: 'id',
    sql: `
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
    conflictKey: 'id',
    sql: `
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
    `,
  },
  {
    name: 'feedback',
    conflictKey: 'id',
    sql: `
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
      CREATE INDEX IF NOT EXISTS idx_feedback_date ON feedback(created_at);
    `,
  },
  {
    name: 'proctoring_events',
    conflictKey: 'id',
    sql: `
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
    `,
  },
  {
    name: 'audit_events',
    conflictKey: 'id',
    sql: `
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
    `,
  },
];

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('[Step 1/3] Creating PostgreSQL tables and indexes...');
    for (const t of TABLE_SCHEMAS) {
      await client.query(t.sql);
    }
    console.log('✓ All 22 tables and indexes created successfully in PostgreSQL.\n');

    console.log('[Step 2/3] Migrating data records table by table...');
    const results = [];

    for (const t of TABLE_SCHEMAS) {
      const sqliteRows = sqliteDb.prepare(`SELECT * FROM "${t.name}"`).all();
      const sqliteCount = sqliteRows.length;

      if (sqliteCount === 0) {
        results.push({ table: t.name, sqlite: 0, postgres: 0, status: 'MATCH (EMPTY)' });
        continue;
      }

      // Insert rows into PostgreSQL in chunks for high performance and resilience
      const columns = Object.keys(sqliteRows[0]);
      const colList = columns.map(c => `"${c}"`).join(', ');
      const conflictClause = `ON CONFLICT (${t.conflictKey}) DO NOTHING`;
      const chunkSize = 50;

      for (let i = 0; i < sqliteRows.length; i += chunkSize) {
        const chunk = sqliteRows.slice(i, i + chunkSize);
        const rowPlaceholders = [];
        const values = [];

        chunk.forEach((row, rowIdx) => {
          const rowParams = columns.map((_, colIdx) => `$${rowIdx * columns.length + colIdx + 1}`);
          rowPlaceholders.push(`(${rowParams.join(', ')})`);
          columns.forEach(c => values.push(row[c]));
        });

        const chunkSql = `INSERT INTO "${t.name}" (${colList}) VALUES ${rowPlaceholders.join(', ')} ${conflictClause}`;
        await client.query(chunkSql, values);
      }

      // Verify row count in target database
      const pgCountRes = await client.query(`SELECT count(*) as c FROM "${t.name}"`);
      const pgCount = parseInt(pgCountRes.rows[0].c, 10);

      const status = pgCount === sqliteCount ? 'MATCH' : `COUNT DIFF (${pgCount} vs ${sqliteCount})`;
      results.push({ table: t.name, sqlite: sqliteCount, postgres: pgCount, status });
    }

    console.log('\n[Step 3/3] Migration Summary & Integrity Verification:');
    console.log('--------------------------------------------------------------------------------');
    console.log(
      'Table Name'.padEnd(32) +
      'SQLite Count'.padEnd(16) +
      'Postgres Count'.padEnd(16) +
      'Status'
    );
    console.log('--------------------------------------------------------------------------------');

    let allMatched = true;
    for (const r of results) {
      const isOk = r.sqlite === r.postgres;
      if (!isOk) allMatched = false;
      const statusIcon = isOk ? '✓' : '✗';
      console.log(
        `${r.table.padEnd(32)}${String(r.sqlite).padEnd(16)}${String(r.postgres).padEnd(16)}${statusIcon} ${r.status}`
      );
    }
    console.log('--------------------------------------------------------------------------------');

    // Verify sample admin and user records
    console.log('\n--- VERIFYING SAMPLE CREDENTIALS & SESSIONS ---');
    const sampleAdmins = await client.query('SELECT id, email, role, length(password_hash) as hash_len FROM admin_users LIMIT 2');
    console.log('Admin accounts in Postgres:');
    for (const a of sampleAdmins.rows) {
      console.log(`  - ${a.email} (${a.role}) [hash length: ${a.hash_len}]`);
    }

    const sampleUsers = await client.query('SELECT id, name, email, role, length(coalesce(password_hash, \'\')) as hash_len FROM users LIMIT 3');
    console.log('Sample candidate accounts in Postgres:');
    for (const u of sampleUsers.rows) {
      console.log(`  - ${u.name} <${u.email}> (${u.role}) [hash length: ${u.hash_len}]`);
    }

    if (allMatched) {
      console.log('\n🎉 SUCCESS: All 22 tables migrated and verified with 100% integrity!');
    } else {
      console.log('\n⚠️ NOTICE: Some table counts differ (possibly due to pre-existing rows in Postgres). Please review above table.');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
