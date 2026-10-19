import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'data', 'smart_resume.db');
const db = new DatabaseSync(dbPath);

console.log('=== SQLITE DATABASE INTEGRITY CHECK ===');
console.log('Database Path:', dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('Tables:', tables.map(t => t.name));

const userCount = db.prepare('SELECT count(*) as count FROM users').get();
console.log('Total Users:', userCount.count);

const adminCount = db.prepare('SELECT count(*) as count FROM admin_users').get();
console.log('Total Admin Users:', adminCount.count);

const sampleUsers = db.prepare('SELECT id, name, email, role, password_hash FROM users LIMIT 3').all();
console.log('Sample Users (password hashes preserved):');
for (const u of sampleUsers) {
  const hash = u.password_hash || '';
  console.log(`- ${u.email} (${u.name}): role=${u.role}, hash_algorithm=${hash ? (hash.startsWith('$2') ? 'bcrypt' : 'scrypt/pbkdf2/hash') : 'none'}, hash_length=${hash.length}`);
}

const sampleAdmins = db.prepare('SELECT id, email, role, password_hash FROM admin_users LIMIT 3').all();
console.log('Sample Admins (password hashes preserved):');
for (const a of sampleAdmins) {
  console.log(`- ${a.email}: role=${a.role}, hash_length=${a.password_hash.length}`);
}
