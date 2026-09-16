import Fastify, { LogController } from 'fastify';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import cors from '@fastify/cors';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { token, validToken, seal, unseal, equal } from './crypto.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = join(__dirname, '..', 'dist');

export async function buildApp({ config, store, identity, logger = true }) {
  const app = Fastify({
    logger, logController: new LogController({ disableRequestLogging: true }), requestIdHeader: false, genReqId: randomUUID,
    trustProxy: config.trustedProxies, bodyLimit: 16_384,
    requestTimeout: 15_000, connectionTimeout: 20_000,
    ajv: { customOptions: { removeAdditional: false, coerceTypes: false } },
  });
  const secure = config.apiOrigin.startsWith('https:');
  const sessionCookie = secure ? '__Host-portal_session' : 'portal_session';
  const loginCookie = secure ? '__Host-portal_login' : 'portal_login';
  const cookieOptions = { path: '/', httpOnly: true, secure, sameSite: 'lax' };
  const fail = (reply, status, code) => reply.code(status).send({ error: { code, requestId: reply.request.id } });
  await app.register(cookie);
await app.register(cors, {
  origin: config.frontendOrigin,
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'X-CSRF-Token',
  ],
});
  await app.register(helmet, {
    contentSecurityPolicy: { directives: {
      defaultSrc: ["'none'"], scriptSrc: ["'self'"], styleSrc: ["'self'"],
      connectSrc: ["'self'"], imgSrc: ["'self'"], baseUri: ["'none'"],
      frameAncestors: ["'none'"], formAction: ["'self'"], upgradeInsecureRequests: secure ? [] : null,
    } },
    strictTransportSecurity: secure ? { maxAge: 31536000 } : false,
    referrerPolicy: { policy: 'no-referrer' },
  });
await app.register(fastifyStatic, {
  root: frontendRoot,
  prefix: '/',
  index: ['index.html'],
  cacheControl: false,
});
  app.decorateRequest('portalSession', null);
  app.addHook('onRequest', async (request, reply) => {
    reply.header('Cache-Control', 'no-store').header('X-Request-Id', request.id);
    const path = request.url.split('?')[0];
    if (path === '/health/live') return;
    if (config.production && request.protocol !== 'https') return fail(reply, 400, 'HTTPS_REQUIRED');
    if (!(await store.limit(`all:${request.ip}`, 300, 60))) {
      reply.header('Retry-After', '60');
      return fail(reply, 429, 'RATE_LIMITED');
    }
    if (path.startsWith('/auth/')) {
      if (!(await store.limit(`auth:${request.ip}`, 30, 60))) {
        reply.header('Retry-After', '60');
        return fail(reply, 429, 'RATE_LIMITED');
      }
    }
  });
  // Log route templates, never raw URLs (which may include authorization codes), bodies or cookies.
  app.addHook('onResponse', async (request, reply) => {
    app.log.info({ requestId: request.id, method: request.method, route: request.routeOptions.url || 'unmatched', status: reply.statusCode }, 'request completed');
  });
  app.setErrorHandler((error, request, reply) => {
    if (error.validation) return fail(reply, 400, 'INVALID_REQUEST');
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) return fail(reply, error.statusCode, 'INVALID_REQUEST');
    app.log.error({ requestId: request.id }, 'Request dependency failed');
    return fail(reply, 503, 'SERVICE_UNAVAILABLE');
  });
  app.setNotFoundHandler((request, reply) => fail(reply, 404, 'NOT_FOUND'));
  const getSession = async request => {
    const id = request.cookies[sessionCookie];
    return validToken(id) ? store.session(id) : null;
  };
  const requireSession = async (request, reply) => {
    request.portalSession = await getSession(request);
    if (!request.portalSession) return fail(reply, 401, 'AUTHENTICATION_REQUIRED');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
      (request.headers.origin !== config.frontendOrigin || !equal(request.headers['x-csrf-token'], request.portalSession.csrf_token))) {
      return fail(reply, 403, 'CSRF_REJECTED');
    }
  };
  app.get('/health/live', async () => ({ status: 'ok' }));
  app.get('/health/ready', async (request, reply) => {
    await store.ready();
    if (!identity) return fail(reply, 503, 'IDENTITY_NOT_CONFIGURED');
    return { status: 'ready', financialIntegration: 'not_configured' };
  });
  app.get('/api/integration-status', async () => ({
    authentication: identity ? 'configured' : 'not_configured',
    accounts: 'not_configured', transfers: 'not_configured', documents: 'not_configured',
  }));
  app.get('/auth/login', async (request, reply) => {
    if (!identity) return fail(reply, 503, 'IDENTITY_NOT_CONFIGURED');
    if (request.headers['sec-fetch-site'] === 'cross-site') return fail(reply, 403, 'CROSS_SITE_LOGIN_REJECTED');
    const { url, transaction } = await identity.begin();
    if (new URL(url).protocol !== 'https:') return fail(reply, 503, 'IDENTITY_UNAVAILABLE');
    const id = token();
    const previous = request.cookies[loginCookie];
    if (validToken(previous)) await store.consumeLogin(previous);
    await store.saveLogin(id, seal(transaction, config.encryptionKey));
    reply.setCookie(loginCookie, id, { ...cookieOptions, maxAge: 300 });
    return reply.redirect(url);
  });
  app.get('/auth/callback', async (request, reply) => {
    reply.clearCookie(loginCookie, cookieOptions);
    if (!identity) return fail(reply, 503, 'IDENTITY_NOT_CONFIGURED');
    const id = request.cookies[loginCookie];
    if (!validToken(id)) return fail(reply, 401, 'LOGIN_FAILED');
    const encrypted = await store.consumeLogin(id);
    if (!encrypted) return fail(reply, 401, 'LOGIN_FAILED');
    let principal;
    try {
      // Fixed origin prevents Host/X-Forwarded-Host from changing the redirect URI.
      const callbackUrl = new URL('/auth/callback', config.apiOrigin);
      callbackUrl.search = new URL(request.url, config.apiOrigin).search;
      principal = await identity.complete(callbackUrl, unseal(encrypted, config.encryptionKey));
    } catch {
      await store.audit('login.rejected', request.id);
      return fail(reply, 401, 'LOGIN_FAILED');
    }
    const user = await store.findUser(principal.issuer, principal.subject);
    if (!user) {
      await store.audit('access.denied', request.id);
      return fail(reply, 403, 'PORTAL_ACCESS_NOT_GRANTED');
    }
    const sessionId = token();
    const oldId = request.cookies[sessionCookie];
    await store.createSession(sessionId, user.id, token(), request.id, validToken(oldId) ? oldId : null);
    reply.setCookie(sessionCookie, sessionId, { ...cookieOptions, maxAge: config.sessionSeconds });
    return reply.redirect('/portal');
  });
  app.get('/api/session', { onRequest: requireSession }, async request => ({
    user: { id: request.portalSession.user_id },
    csrfToken: request.portalSession.csrf_token, expiresAt: request.portalSession.expires_at,
  }));
  app.post('/auth/logout', { onRequest: requireSession }, async (request, reply) => {
    await store.logout(request.cookies[sessionCookie], request.id);
    const pending = request.cookies[loginCookie];
    if (validToken(pending)) await store.consumeLogin(pending);
    reply.clearCookie(sessionCookie, cookieOptions).clearCookie(loginCookie, cookieOptions);
    return reply.code(204).send();
  });
  app.get('/api/preferences', { onRequest: requireSession }, async request => store.preferences(request.portalSession.user_id));
  app.put('/api/preferences', {
    onRequest: requireSession,
    schema: { body: { type: 'object', additionalProperties: false, required: ['language'], properties: { language: { type: 'string', enum: ['en', 'fr', 'de'] } } } },
  }, async (request, reply) => {
    await store.setPreferences(request.portalSession.user_id, request.body.language, request.id);
    return reply.code(204).send();
  });
  for (const path of ['/api/accounts', '/api/transactions', '/api/documents', '/api/transfers']) {
    app.get(path, { onRequest: requireSession }, async (request, reply) => fail(reply, 503, 'FINANCIAL_PROVIDER_NOT_CONFIGURED'));
  }
  app.post('/api/transfers', { onRequest: requireSession }, async (request, reply) => fail(reply, 503, 'PAYMENT_EXECUTION_NOT_CONFIGURED'));
  for (const path of ['/api/login', '/api/access', '/api/verify-mfa', '/api/check-device', '/api/admin/reset-mfa']) {
    app.post(path, async (request, reply) => fail(reply, 410, 'DEMO_AUTHENTICATION_REMOVED'));
  }
  const portalPage = await readFile(new URL('./public/index.html', import.meta.url), 'utf8');

app.get('/portal', async (request, reply) => {
  if (!(await getSession(request))) return reply.redirect('/');
  return reply.type('text/html').send(portalPage);
});
  for (const [path, name, type] of [['/portal.js', 'portal.js', 'text/javascript'], ['/portal.css', 'portal.css', 'text/css']]) {
    const content = await readFile(new URL(`./public/${name}`, import.meta.url), 'utf8');
    app.get(path, async (request, reply) => reply.type(type).send(content));
  }
  app.get('/index.html', async (request, reply) => reply.redirect('/'));
  for (const path of ['/dashboard.html', '/accounts.html', '/estate-hub.html', '/documents.html', '/transfers.html', '/settings.html']) app.get(path, async (request, reply) => reply.redirect('/portal'));
  for (const path of ['/authentication.html', '/connecting.html', '/authentication-wait.html', '/authentication-success.html', '/mywealth-loading.html']) app.get(path, async (request, reply) => fail(reply, 410, 'DEMO_AUTHENTICATION_REMOVED'));
  return app;
}
