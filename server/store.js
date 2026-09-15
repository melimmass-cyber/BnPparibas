import { hash } from './crypto.js';
export function createStore(db, config) {
  return {
    async ready() {
      for (const table of ['sessions', 'login_transactions', 'rate_limits', 'audit_events', 'portal_users', 'user_preferences']) await db.query(`SELECT 1 FROM ${table} LIMIT 0`);
    },
    async limit(key, max, seconds) {
      const { rows } = await db.query(`INSERT INTO rate_limits(key_hash, hits, expires_at)
        VALUES ($1, 1, now() + $2 * interval '1 second')
        ON CONFLICT(key_hash) DO UPDATE SET
        hits = CASE WHEN rate_limits.expires_at <= now() THEN 1 ELSE LEAST(rate_limits.hits + 1, $3 + 1) END,
        expires_at = CASE WHEN rate_limits.expires_at <= now() THEN now() + $2 * interval '1 second' ELSE rate_limits.expires_at END
        RETURNING hits`, [hash(key), seconds, max]);
      return rows[0].hits <= max;
    },
    async saveLogin(id, payload) {
      await db.query("INSERT INTO login_transactions VALUES ($1, $2, now() + interval '5 minutes')", [hash(id), payload]);
    },
    async consumeLogin(id) {
      const { rows } = await db.query('DELETE FROM login_transactions WHERE token_hash = $1 AND expires_at > now() RETURNING encrypted_payload', [hash(id)]);
      return rows[0]?.encrypted_payload;
    },
    async findUser(issuer, subject) {
      return (await db.query("SELECT id FROM portal_users WHERE issuer = $1 AND subject = $2 AND status = 'active'", [issuer, subject])).rows[0];
    },
    async createSession(id, userId, csrf, requestId, previousId) {
      await db.query(`WITH removed AS (DELETE FROM sessions WHERE token_hash = $5),
        created AS (INSERT INTO sessions(token_hash, user_id, csrf_token, expires_at)
          VALUES ($1, $2, $3, now() + $4 * interval '1 second') RETURNING user_id)
        INSERT INTO audit_events(user_id, event, request_id) SELECT user_id, 'login.succeeded', $6 FROM created`,
      [hash(id), userId, csrf, config.sessionSeconds, previousId ? hash(previousId) : '', requestId]);
    },
    async session(id) {
      const { rows } = await db.query(`UPDATE sessions s SET last_seen_at = now()
        FROM portal_users u WHERE s.token_hash = $1 AND s.user_id = u.id AND u.status = 'active'
        AND s.expires_at > now() AND s.last_seen_at > now() - $2 * interval '1 second'
        RETURNING s.user_id, s.csrf_token, s.expires_at`, [hash(id), config.idleSeconds]);
      return rows[0];
    },
    async logout(id, requestId) {
      await db.query(`WITH removed AS (DELETE FROM sessions WHERE token_hash = $1 RETURNING user_id)
        INSERT INTO audit_events(user_id, event, request_id) SELECT user_id, 'logout.succeeded', $2 FROM removed`, [hash(id), requestId]);
    },
    async preferences(userId) {
      return (await db.query('SELECT language FROM user_preferences WHERE user_id = $1', [userId])).rows[0] || { language: 'en' };
    },
    async setPreferences(userId, language, requestId) {
      await db.query(`WITH changed AS (INSERT INTO user_preferences(user_id, language) VALUES ($1, $2)
        ON CONFLICT(user_id) DO UPDATE SET language = excluded.language, updated_at = now() RETURNING user_id)
        INSERT INTO audit_events(user_id, event, request_id) SELECT user_id, 'preferences.updated', $3 FROM changed`, [userId, language, requestId]);
    },
    async audit(event, requestId, userId = null) {
      await db.query('INSERT INTO audit_events(event, request_id, user_id) VALUES ($1, $2, $3)', [event, requestId, userId]);
    },
    async cleanup() {
      await db.query(`DELETE FROM sessions WHERE expires_at <= now() OR last_seen_at <= now() - $1 * interval '1 second'`, [config.idleSeconds]);
      await db.query('DELETE FROM login_transactions WHERE expires_at <= now()');
      await db.query('DELETE FROM rate_limits WHERE expires_at <= now()');
    },
  };
}
