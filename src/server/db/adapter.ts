import 'server-only';
import path from 'node:path';
import fs from 'node:fs';
import dns from 'node:dns';
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';

try {
  dns.setDefaultResultOrder?.('ipv4first');
} catch {}

const { Pool, types } = pg;

// Parse int8 (bigint, e.g. COUNT(*)) as standard JS number to match SQLite behavior
types.setTypeParser(20, (val: string) => parseInt(val, 10));

export interface StatementClient {
  all(...params: any[]): any;
  get(...params: any[]): any;
  run(...params: any[]): any;
}

export interface DatabaseClient {
  isPostgres: boolean;
  exec(sql: string): Promise<void> | void;
  prepare(sql: string): StatementClient;
  close?(): Promise<void> | void;
}

let dbClientInstance: DatabaseClient | null = null;
let postgresPoolInstance: pg.Pool | null = null;

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'smart_resume.db');

/**
 * Converts SQLite SQL string to PostgreSQL syntax:
 * 1. Replaces unquoted '?' parameter placeholders with '$1', '$2', '$3'...
 * 2. Translates 'INSERT OR IGNORE INTO table' to 'INSERT INTO table ... ON CONFLICT DO NOTHING'
 */
export function toPostgresSql(sql: string): string {
  let i = 1;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let output = '';

  for (let idx = 0; idx < sql.length; idx++) {
    const char = sql[idx];

    if (char === "'" && !inDoubleQuote) {
      if (inSingleQuote && sql[idx + 1] === "'") {
        output += "''";
        idx++;
        continue;
      }
      inSingleQuote = !inSingleQuote;
      output += char;
    } else if (char === '"' && !inSingleQuote) {
      if (inDoubleQuote && sql[idx + 1] === '"') {
        output += '""';
        idx++;
        continue;
      }
      inDoubleQuote = !inDoubleQuote;
      output += char;
    } else if (char === '?' && !inSingleQuote && !inDoubleQuote) {
      output += `$${i++}`;
    } else {
      output += char;
    }
  }

  // Handle SQLite specific 'INSERT OR IGNORE INTO'
  if (/INSERT\s+OR\s+IGNORE\s+INTO/i.test(output)) {
    output = output.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
    if (!/ON\s+CONFLICT/i.test(output)) {
      output += ' ON CONFLICT DO NOTHING';
    }
  }

  // In PostgreSQL, ROUND(double precision, n) does not exist; AVG() returns double precision.
  // Cast AVG(...) to numeric so ROUND(numeric, n) executes cleanly.
  output = output.replace(/ROUND\(\s*AVG\(([^)]+)\)\s*,\s*(\d+)\s*\)/gi, 'ROUND(CAST(AVG($1) AS numeric), $2)');

  return output;
}

/**
 * Initializes and returns the active database client singleton.
 * - In Vercel / serverless: Uses PostgreSQL via POSTGRES_URL or DATABASE_URL.
 * - In local development: Uses node:sqlite with data/smart_resume.db.
 */
export function getDb(): DatabaseClient {
  if (dbClientInstance) {
    return dbClientInstance;
  }

  const postgresUrl = (process.env.POSTGRES_URL || process.env.DATABASE_URL || '').trim();
  const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (postgresUrl) {
    if (!postgresPoolInstance) {
      postgresPoolInstance = new Pool({
        connectionString: postgresUrl,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: postgresUrl.includes('localhost') || postgresUrl.includes('127.0.0.1')
          ? false
          : { rejectUnauthorized: false },
      });

      postgresPoolInstance.on('error', (err) => {
        console.error('[Smart Resume AI] PostgreSQL Pool error:', err.message);
      });
    }

    const pool = postgresPoolInstance;

    dbClientInstance = {
      isPostgres: true,
      async exec(sql: string) {
        if (/^\s*PRAGMA/i.test(sql)) {
          return; // Skip SQLite PRAGMAs in PostgreSQL
        }
        await pool.query(toPostgresSql(sql));
      },
      prepare(sql: string): StatementClient {
        if (/^\s*PRAGMA/i.test(sql)) {
          return {
            get: async () => undefined,
            all: async () => [],
            run: async () => ({ changes: 0 }),
          };
        }

        const pgSql = toPostgresSql(sql);

        return {
          async get(...params: any[]) {
            const res = await pool.query(pgSql, params);
            return res.rows[0] ?? undefined;
          },
          async all(...params: any[]) {
            const res = await pool.query(pgSql, params);
            return res.rows;
          },
          async run(...params: any[]) {
            const res = await pool.query(pgSql, params);
            return {
              changes: res.rowCount ?? 0,
              lastInsertRowid: 0,
            };
          },
        };
      },
      async close() {
        if (postgresPoolInstance) {
          await postgresPoolInstance.end();
          postgresPoolInstance = null;
        }
      },
    };

    return dbClientInstance;
  }

  // If in Vercel/serverless and no database URL is set:
  if (isVercel) {
    const errorMsg =
      '[Smart Resume AI] Production Database Error: Running in serverless/Vercel environment without a persistent database configured. Please configure POSTGRES_URL or DATABASE_URL in Vercel Project Environment Variables.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Local development fallback: SQLite
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  } catch (err: any) {
    console.warn('[Smart Resume AI] Could not create local data directory:', err?.message);
  }

  const sqliteDb = new DatabaseSync(DB_PATH);

  try {
    sqliteDb.exec('PRAGMA journal_mode = WAL;');
    sqliteDb.exec('PRAGMA foreign_keys = ON;');
  } catch (err: any) {
    console.warn('[Smart Resume AI] PRAGMA initialization notice:', err?.message);
  }

  dbClientInstance = {
    isPostgres: false,
    exec(sql: string) {
      sqliteDb.exec(sql);
    },
    prepare(sql: string): StatementClient {
      const stmt = sqliteDb.prepare(sql);
      return {
        get(...params: any[]) {
          return stmt.get(...params);
        },
        all(...params: any[]) {
          return stmt.all(...params);
        },
        run(...params: any[]) {
          return stmt.run(...params);
        },
      };
    },
    close() {
      try {
        sqliteDb.close();
      } catch {}
    },
  };

  return dbClientInstance;
}
