import pg from 'pg';
import { readFileSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
export function connectDatabase(config) {
  const pool = new pg.Pool({
    connectionString: config.databaseUrl, max: 10,
    connectionTimeoutMillis: 5000, idleTimeoutMillis: 30_000,
    statement_timeout: 10_000, query_timeout: 12_000,
    ssl: config.databaseSSL === 'verify-full' ? {
      rejectUnauthorized: true,
      ...(config.databaseCAFile ? { ca: readFileSync(config.databaseCAFile, 'utf8') } : {}),
    } : false,
  });
  pool.on('error', () => console.error('Database connection error'));
  return pool;
}
export async function migrate(pool) {
  const connection = await pool.connect();
  try {
    await connection.query('BEGIN');
    await connection.query('SELECT pg_advisory_xact_lock(71002451)');
    await connection.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    const directory = new URL('./migrations/', import.meta.url);
    for (const name of (await readdir(directory)).filter(n => n.endsWith('.sql')).sort()) {
      const sql = await readFile(new URL(name, directory), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const existing = await connection.query('SELECT checksum FROM schema_migrations WHERE name = $1', [name]);
      if (existing.rows[0]) {
        if (existing.rows[0].checksum !== checksum) throw new Error(`Migration changed: ${name}`);
        continue;
      }
      await connection.query(sql);
      await connection.query('INSERT INTO schema_migrations(name, checksum) VALUES ($1, $2)', [name, checksum]);
    }
    await connection.query('COMMIT');
  } catch (error) { await connection.query('ROLLBACK'); throw error; }
  finally { connection.release(); }
}
