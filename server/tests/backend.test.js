import { test, before, beforeEach, afterEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { buildApp } from '../app.js';
import { createStore } from '../store.js';
import { migrate } from '../database.js';
import { loadConfig } from '../config.js';
import { hash, token, seal, unseal } from '../crypto.js';

const config = loadConfig({ NODE_ENV: 'test', APP_ORIGIN: 'https://portal.example', DATABASE_URL: 'postgres://test:test@localhost/test', SESSION_ENCRYPTION_KEY: randomBytes(32).toString('hex') });
const db = new PGlite();
const adapter = {
  query: async (sql, params) => params ? db.query(sql, params) : (await db.exec(sql)).at(-1),
  connect: async () => ({ ...adapter, release() {} }),
};
const store = createStore(adapter, config);
const apps = [];
const issuer = 'https://id.example', subject = 'test-user';
const identity = {
  begin: async () => ({ url: `${issuer}/authorize`, transaction: { state: 'state', nonce: 'nonce', verifier: 'verifier' } }),
  complete: async (url, transaction) => {
    assert.equal(url.origin, config.origin);
    assert.equal(url.pathname, '/auth/callback');
    assert.equal(transaction.state, 'state');
    if (url.searchParams.get('state') !== 'state') throw new Error('Invalid state');
    return { issuer, subject };
  },
};
async function app(options = {}) {
  const instance = await buildApp({ config, store, identity, logger: false, ...options });
  apps.push(instance);
  return instance;
}
async function user(sub = subject) {
  const id = randomUUID();
  await db.query('INSERT INTO portal_users(id, issuer, subject) VALUES ($1, $2, $3)', [id, issuer, sub]);
  return id;
}
async function session(userId) {
  userId ??= await user();
  const id = token(), csrf = token();
  await store.createSession(id, userId, csrf, 'test', null);
  return { id, csrf, userId, cookie: `__Host-portal_session=${id}` };
}
function mutationHeaders(s) { return { cookie: s.cookie, origin: config.origin, 'x-csrf-token': s.csrf }; }
before(async () => { await migrate(adapter); });
beforeEach(async () => { await db.exec('TRUNCATE portal_users, sessions, login_transactions, user_preferences, audit_events, rate_limits RESTART IDENTITY CASCADE'); });
afterEach(async () => { for (const instance of apps.splice(0)) await instance.close(); });
after(async () => { await db.close(); });

test('migrations are repeatable and detect modified historical checksums', async () => {
  await migrate(adapter);
  assert.equal((await db.query('SELECT * FROM schema_migrations')).rows.length, 1);
  await db.query("UPDATE schema_migrations SET checksum = 'changed'");
  await assert.rejects(migrate(adapter), /Migration changed/);
  // Restore the original checksum without changing the migration under test.
  const { readFile } = await import('node:fs/promises');
  await db.query('UPDATE schema_migrations SET checksum = $1', [hash(await readFile(new URL('../migrations/001_core.sql', import.meta.url), 'utf8'))]);
});
test('configuration rejects unsafe production and incomplete provider settings', () => {
  const base = { DATABASE_URL: config.databaseUrl, SESSION_ENCRYPTION_KEY: config.encryptionKey.toString('hex') };
  assert.throws(() => loadConfig({ ...base, NODE_ENV: 'production' }), /HTTPS/);
  assert.throws(() => loadConfig({ ...base, OIDC_CLIENT_ID: 'partial' }), /all OIDC/);
  assert.throws(() => loadConfig({ ...base, DATABASE_URL: base.DATABASE_URL + '?sslmode=no-verify' }), /SSL/);
  assert.throws(() => loadConfig({ ...base, APP_ORIGIN: 'http://example.com' }), /loopback/);
});
test('authentication is unavailable without provider; demo endpoints cannot log in', async () => {
  const api = await app({ identity: null });
  assert.equal((await api.inject('/health/live')).statusCode, 200);
  assert.equal((await api.inject('/health/ready')).statusCode, 503);
  assert.equal((await api.inject('/auth/login')).statusCode, 503);
  for (const path of ['/api/access', '/api/login', '/api/verify-mfa', '/api/check-device', '/api/admin/reset-mfa']) {
    const response = await api.inject({ method: 'POST', url: path, payload: { rememberDevice: true, code: '246810' } });
    assert.equal(response.statusCode, 410);
    assert.equal(response.headers['set-cookie'], undefined);
  }
});
test('production static surface excludes source, demo pages, secrets and backups', async () => {
  const api = await app();
  for (const path of ['/server.js', '/server/config.js', '/.env', '/mfa_codes.json', '/backups/file', '/wealth-shell.js', '/dist/dashboard.html', '/package.json', '/%2e%2e/server.js']) assert.equal((await api.inject(path)).statusCode, 404, path);
  assert.equal((await api.inject('/authentication-success.html')).statusCode, 410);
  assert.equal((await api.inject('/portal')).headers.location, '/');
  const root = await api.inject('/');
  assert.match(root.body, /identity provider/);
  assert.doesNotMatch(root.body, /3,500,000|LuxTrust|BNP/);
  assert.match(root.headers['content-security-policy'], /frame-ancestors 'none'/);
  assert.equal(root.headers['cache-control'], 'no-store');
});
test('login transaction is encrypted, bound to cookie, one-use; session is hashed and persistent', async () => {
  await user();
  const api = await app();
  const start = await api.inject('/auth/login');
  const loginCookie = start.cookies.find(c => c.name === '__Host-portal_login');
  assert.equal(loginCookie.httpOnly, true);
  assert.equal(loginCookie.secure, true);
  const stored = (await db.query('SELECT * FROM login_transactions')).rows[0];
  assert.equal(stored.token_hash, hash(loginCookie.value));
  assert.doesNotMatch(stored.encrypted_payload, /verifier/);
  assert.equal(unseal(stored.encrypted_payload, config.encryptionKey).verifier, 'verifier');
  const callback = { url: '/auth/callback?code=test&state=state', headers: { cookie: `${loginCookie.name}=${loginCookie.value}`, host: 'attacker.example' } };
  const result = await api.inject(callback);
  assert.equal(result.statusCode, 302);
  const sessionCookie = result.cookies.find(c => c.name === '__Host-portal_session');
  assert.ok(sessionCookie);
  assert.equal((await db.query('SELECT token_hash FROM sessions')).rows[0].token_hash, hash(sessionCookie.value));
  assert.equal((await api.inject(callback)).statusCode, 401);
  const secondInstance = await app();
  const current = await secondInstance.inject({ url: '/api/session', headers: { cookie: `${sessionCookie.name}=${sessionCookie.value}` } });
  assert.equal(current.statusCode, 200);
  assert.equal(current.json().user.id, (await db.query('SELECT id FROM portal_users')).rows[0].id);
});
test('bad state, missing cookie, expired transaction and unknown user deny sign-in', async () => {
  const api = await app();
  assert.equal((await api.inject('/auth/callback?state=state')).statusCode, 401);
  for (const mode of ['state', 'expired', 'unknown']) {
    const start = await api.inject('/auth/login');
    const c = start.cookies.find(c => c.name === '__Host-portal_login');
    if (mode === 'expired') await db.query("UPDATE login_transactions SET expires_at = now() - interval '1 second'");
    const result = await api.inject({ url: `/auth/callback?state=${mode === 'state' ? 'bad' : 'state'}`, headers: { cookie: `${c.name}=${c.value}` } });
    assert.equal(result.statusCode, mode === 'unknown' ? 403 : 401);
    assert.ok(!result.cookies.find(x => x.name === '__Host-portal_session'));
  }
  assert.equal((await db.query('SELECT * FROM sessions')).rows.length, 0);
});
test('preferences require session, exact origin and CSRF token; reject injected fields', async () => {
  const api = await app(), s = await session();
  assert.equal((await api.inject('/api/preferences')).statusCode, 401);
  for (const headers of [{ cookie: s.cookie }, { ...mutationHeaders(s), origin: 'https://evil.example' }, { ...mutationHeaders(s), 'x-csrf-token': 'wrong' }]) {
    assert.equal((await api.inject({ method: 'PUT', url: '/api/preferences', headers, payload: { language: 'fr' } })).statusCode, 403);
  }
  for (const payload of [{ language: 'xx' }, { language: 'en', user_id: randomUUID() }]) assert.equal((await api.inject({ method: 'PUT', url: '/api/preferences', headers: mutationHeaders(s), payload })).statusCode, 400);
  assert.equal((await api.inject({ method: 'PUT', url: '/api/preferences', headers: mutationHeaders(s), payload: { language: 'fr' } })).statusCode, 204);
  assert.deepEqual((await api.inject({ url: '/api/preferences', headers: { cookie: s.cookie } })).json(), { language: 'fr' });
  const other = await session(await user('another-user'));
  assert.deepEqual((await api.inject({ url: '/api/preferences', headers: { cookie: other.cookie } })).json(), { language: 'en' });
});
test('expired, idle and disabled sessions are rejected; logout revokes across instances', async () => {
  const api = await app();
  for (const mode of ['expired', 'idle', 'disabled']) {
    const s = await session(await user(mode));
    if (mode === 'expired') await db.query("UPDATE sessions SET expires_at = now() - interval '1 second' WHERE token_hash = $1", [hash(s.id)]);
    if (mode === 'idle') await db.query("UPDATE sessions SET last_seen_at = now() - interval '1 day' WHERE token_hash = $1", [hash(s.id)]);
    if (mode === 'disabled') await db.query("UPDATE portal_users SET status = 'disabled' WHERE id = $1", [s.userId]);
    assert.equal((await api.inject({ url: '/api/session', headers: { cookie: s.cookie } })).statusCode, 401);
  }
  const s = await session();
  assert.equal((await api.inject({ method: 'POST', url: '/auth/logout', headers: mutationHeaders(s) })).statusCode, 204);
  const second = await app();
  assert.equal((await second.inject({ url: '/api/session', headers: { cookie: s.cookie } })).statusCode, 401);
  assert.ok((await db.query("SELECT * FROM audit_events WHERE event = 'logout.succeeded'")).rows.length);
});
test('financial services never return fake balances or accept payment execution', async () => {
  const api = await app(), s = await session();
  for (const path of ['/api/accounts', '/api/transactions', '/api/documents', '/api/transfers']) {
    assert.equal((await api.inject(path)).statusCode, 401);
    const result = await api.inject({ url: path, headers: { cookie: s.cookie } });
    assert.equal(result.statusCode, 503);
    assert.equal(result.json().error.code, 'FINANCIAL_PROVIDER_NOT_CONFIGURED');
  }
  assert.equal((await api.inject({ method: 'POST', url: '/api/transfers', headers: mutationHeaders(s), payload: { amount: '10' } })).statusCode, 503);
});
test('database-backed rate limit is shared and ignores spoofed forwarded addresses', async () => {
  const first = await app(), second = await app();
  await store.limit('all:127.0.0.1', 1, 60);
  await db.query('UPDATE rate_limits SET hits = 300');
  const result = await second.inject({ url: '/api/integration-status', headers: { 'x-forwarded-for': '8.8.8.8' } });
  assert.equal(result.statusCode, 429);
  assert.equal(result.headers['retry-after'], '60');
  assert.equal((await first.inject('/health/live')).statusCode, 200);
});
test('database outage fails closed without exposing SQL or internal error messages', async () => {
  const api = await app({ store: { ...store, limit: async () => { throw new Error('password=secret SELECT * FROM sessions'); } } });
  const result = await api.inject('/api/session');
  assert.equal(result.statusCode, 503);
  assert.doesNotMatch(result.body, /secret|SELECT|password/);
  assert.equal((await api.inject('/health/live')).statusCode, 200);
});
test('encryption rejects tampering', () => {
  const value = seal({ verifier: 'private' }, config.encryptionKey);
  const bytes = Buffer.from(value, 'base64'); bytes[15] ^= 1;
  assert.throws(() => unseal(bytes.toString('base64'), config.encryptionKey));
});

test('production requires HTTPS through an explicitly trusted proxy; internal liveness works', async () => {
  const direct = await app({ config: { ...config, production: true } });
  assert.equal((await direct.inject({ url: '/', headers: { 'x-forwarded-proto': 'https' } })).statusCode, 400);
  assert.equal((await direct.inject('/health/live')).statusCode, 200);
  const proxied = await app({ config: { ...config, production: true, trustedProxies: ['127.0.0.1'] } });
  assert.equal((await proxied.inject({ url: '/', headers: { 'x-forwarded-proto': 'https' } })).statusCode, 200);
  assert.equal((await proxied.inject({ url: '/', remoteAddress: '10.20.30.40', headers: { 'x-forwarded-proto': 'https' } })).statusCode, 400);
});

test('simultaneous login transaction consumption has one winner', async () => {
  const id = token();
  await store.saveLogin(id, seal({ verifier: 'test' }, config.encryptionKey));
  const results = await Promise.all(Array.from({ length: 8 }, () => store.consumeLogin(id)));
  assert.equal(results.filter(Boolean).length, 1);
});

test('re-authentication replaces the previous session', async () => {
  const s = await session();
  const replacement = token();
  await store.createSession(replacement, s.userId, token(), 'renewal', s.id);
  assert.equal(await store.session(s.id), undefined);
  assert.equal((await store.session(replacement)).user_id, s.userId);
});

