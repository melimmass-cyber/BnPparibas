import { randomUUID } from 'node:crypto';
import { loadConfig } from './config.js';
import { connectDatabase } from './database.js';

// Operations-only command: no public registration, passwords, or admin reset endpoint.
const [action, subject] = process.argv.slice(2);
if (!['grant', 'disable'].includes(action) || !subject || subject.length > 255) {
  console.error('Usage: npm run user:manage -- grant|disable <provider-subject>');
  process.exitCode = 1;
} else {
  let pool, connection;
  try {
    const config = loadConfig();
    if (!config.issuer) throw new Error('Configure OIDC first');
    pool = connectDatabase(config);
    connection = await pool.connect();
    await connection.query('BEGIN');
    let result;
    if (action === 'grant') {
      result = await connection.query(`INSERT INTO portal_users(id, issuer, subject) VALUES ($1, $2, $3)
        ON CONFLICT(issuer, subject) DO UPDATE SET status = 'active' RETURNING id`, [randomUUID(), config.issuer, subject]);
    } else {
      result = await connection.query("UPDATE portal_users SET status = 'disabled' WHERE issuer = $1 AND subject = $2 RETURNING id", [config.issuer, subject]);
      if (!result.rows[0]) throw new Error('No such user');
      await connection.query('DELETE FROM sessions WHERE user_id = $1', [result.rows[0].id]);
    }
    await connection.query('INSERT INTO audit_events(user_id, event, request_id) VALUES ($1, $2, $3)', [result.rows[0].id, `access.${action}`, `operator:${randomUUID()}`]);
    await connection.query('COMMIT');
    console.log(`Portal access ${action === 'grant' ? 'granted' : 'disabled'}.`);
  } catch {
    if (connection) await connection.query('ROLLBACK');
    console.error('User operation failed. Check OIDC configuration, subject, database access, and migrations.');
    process.exitCode = 1;
  } finally { connection?.release(); await pool?.end(); }
}
