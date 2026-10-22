import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/smart_resume.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in database:');
console.log(tables.map(t => t.name));

for (const t of ['resumes', 'resume_analyses', 'job_applications', 'resume_improvements', 'users']) {
  try {
    const cols = db.prepare(`PRAGMA table_info(${t})`).all();
    console.log(`\nColumns in ${t}:`);
    console.log(cols.map(c => `${c.name} (${c.type})`));
  } catch (err) {
    console.log(`Table ${t} error:`, err.message);
  }
}
