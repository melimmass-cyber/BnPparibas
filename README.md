# Wealth portal backend

The Node/Fastify backend replaces the demo Express server. It provides PostgreSQL persistence, provider-hosted OpenID Connect sign-in, server-side sessions, explicit user access grants, CSRF protection, shared rate limiting, audit events, and persistent language preferences.

**Status: tested backend foundation; not a connected banking service or a production deployment.** BNP Paribas/LuxTrust onboarding, the provider protocol and assurance requirements, financial API contracts, database provisioning, and deployment configuration are still required. The OIDC implementation is generic and has not been certified against either provider. It supports Authorization Code + PKCE with client_secret_basic and an exact required ACR claim. Providers requiring SAML, private_key_jwt, mTLS, PAR, JARM, or another profile need an adapter extension against their official specification.

## One-command local website

The local launcher needs no Docker, external PostgreSQL, `.env`, or provider credentials:

```powershell
cd C:\Users\rubby\bnp-wealth-portal
npm.cmd run dev
```

Open http://127.0.0.1:5180. myWealth is at `/mywealth.html`, the dashboard at `/dashboard.html`, and Banking at `/accounts.html`. Keep the terminal open; Ctrl+C stops both services. You can also double-click `start-local.cmd` in the project directory. Dependencies are already installed; after a fresh checkout, run `npm ci` once.

This command starts Vite on loopback port 5180 and the API on loopback port 3000. It automatically creates and migrates persistent PGlite storage in `.local-data/postgres` and generates `.local-data/session.key`. `.local-data` is excluded from Git, the Docker image, and Vite file access. A process lock prevents two local launchers from opening the same database. Other services already use port 5173 on this machine, so this launcher deliberately uses 5180.

The local demo restores the original sample names, balances, transactions, login layout and timed authentication screens. Every page carries a fixed DEMO banner. The login field is prefilled with the read-only sample identifier DEMO1234; Continue starts the visual authentication sequence. No identifier is submitted to the backend, no real session is created and no financial operation is executed. Production authentication remains protected.

`npm start` and `npm run dev:backend` remain the strict PostgreSQL/provider-backed server entrypoints described below. Embedded local storage is never selected by the production entrypoint, and the local launcher refuses `NODE_ENV=production`.

## Configure the provider-backed server

Requires Node 24+ (tested here on Node 25.1) and PostgreSQL. Docker is optional for the supplied local database configuration.

1. Run `npm ci`.
2. Copy `.env.example` to `.env`. Set your database connection and generate a unique encryption key with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Put it in `SESSION_ENCRYPTION_KEY`. Do not commit `.env`.
3. If using Docker, also add `POSTGRES_PASSWORD` to `.env`, use that same password (URL-encoded) in `DATABASE_URL`, and run `docker compose up -d database`. Alternatively, provision PostgreSQL yourself.
4. Run `npm run db:migrate` with the database owner/migration connection.
5. Run `npm run dev:backend` and open http://localhost:3000. Use `npm start` without the file watcher.

Without OIDC settings, development mode starts with sign-in explicitly unavailable. `/health/live` returns 200 and `/health/ready` returns 503. There are no demo users, accepted identifiers, default passwords, or reusable MFA codes. A PostgreSQL database is mandatory for this server entrypoint; it never falls back to local storage. The explicit local launcher above uses persistent PGlite for offline development.

## Connect identity

Obtain the issuer URL, client ID, client secret, and the exact ACR value that the provider guarantees for the required MFA assurance. Configure all four OIDC variables together. Register `APP_ORIGIN/auth/callback` as the exact redirect URI; the flow currently expects a query-mode callback. Provider credentials belong in your secrets manager or local `.env`, never in frontend code or chat.

The browser is redirected to the identity provider. This application does not collect bank passwords or verification codes. The backend verifies signed ID tokens, issuer, audience, expiry, nonce, state, PKCE, recent authentication, and the configured ACR. Authorization codes are exchanged only server-side. Provider tokens are discarded; bank data access requires a separate consent/token design based on the official financial API.

Grant a verified provider subject portal access through the operations CLI:

```powershell
npm run user:manage -- grant '<provider-subject>'
npm run user:manage -- disable '<provider-subject>'
```

Use the immutable provider subject, not an email address or a client number. Users are identified by `(issuer, subject)`; successful provider authentication alone does not grant portal access. Disabling a user removes their sessions and denies future access. Run these commands using an operations database role, never expose them as public HTTP endpoints. Restrict and audit access to the operations shell.

## Frontend boundary

`npm start` serves only the integration workspace in `server/public`. `/portal` checks a server-side session. Legacy private-page URLs redirect to the backend workspace and simulated authentication URLs return 410. No root-directory static server exists. Source files, backups, the historical MFA JSON, and `dist` are not served.

Original design source files remain available for design work with `npm run dev:ui`; `npm run build` checks/builds that original frontend. This frontend build is a design artifact, not the production backend deployment. Do not publish `dist` as an authenticated banking site. Private-page navigation in Vite goes to the backend origin, so cookies and CSRF checks use the same origin. Public design work can continue independently. The original branded dashboard must be rebuilt to consume authorized financial APIs before it is admitted to the production static surface.

## API

Errors have the form `{ "error": { "code": "...", "requestId": "..." } }`.

| Method | Route | Behavior |
| --- | --- | --- |
| GET | `/health/live` | Process liveness; no database dependency |
| GET | `/health/ready` | Database schema accessible and identity client initialized; does not certify financial integration or continuously probe the provider |
| GET | `/api/integration-status` | Public capability status without secrets |
| GET | `/auth/login` | Begin provider-hosted login |
| GET | `/auth/callback` | Consume one-use login transaction; validate provider response; create session |
| GET | `/api/session` | Authenticated internal user ID, expiry and CSRF token |
| POST | `/auth/logout` | Revoke this portal session and pending login; provider SSO session is not terminated |
| GET | `/api/preferences` | Current user's persisted language, default `en` |
| PUT | `/api/preferences` | Persist `{ "language": "en" | "fr" | "de" }` |
| GET | `/api/accounts`, `/api/transactions`, `/api/documents`, `/api/transfers` | Require session; return 503 `FINANCIAL_PROVIDER_NOT_CONFIGURED` |
| POST | `/api/transfers` | Requires session and CSRF; returns 503 `PAYMENT_EXECUTION_NOT_CONFIGURED` |
| POST | Legacy login, access, MFA and reset routes | 410 `DEMO_AUTHENTICATION_REMOVED` |

For authenticated mutations, send the cookie, exact `Origin: APP_ORIGIN`, and `X-CSRF-Token` from `/api/session`. There is no cross-origin CORS access. Validation rejects unexpected fields. Identifiers in request bodies never select which user is affected.

Sessions use random 256-bit cookie tokens, store only their SHA-256 hashes, and expire after one hour absolutely or 15 minutes idle by default. HTTPS cookies use `__Host-`, Secure, HttpOnly, SameSite=Lax and Path=/ without Domain. Login transactions expire after five minutes and encrypt their PKCE/nonce/state with AES-256-GCM. One-use consumption is atomic. Sessions, limits, and login transactions work across backend instances using the same database and encryption key. Key rotation invalidates pending logins; revoke sessions separately during an incident.

## Deployment

1. Provision PostgreSQL with verified TLS and backups. Use a separate migration owner, runtime role and operations role. Apply migrations once with `npm run db:migrate`; migrations are transactional, checksummed, and protected by a PostgreSQL advisory lock. Never edit a migration after deployment; add a new numbered file.
2. Create the `portal_runtime` login securely, then apply `server/runtime-grants.sql` as the owner. Use that role's connection for the web process. It cannot modify user access, change schema, or update/delete audit events. Configure production schema ownership so PUBLIC cannot create objects in the application schema. Test backups and restore before handling real records.
3. Set `NODE_ENV=production`, HTTPS `APP_ORIGIN`, `DATABASE_SSL=verify-full`, all OIDC settings and the random encryption key. For a private database CA, set `DATABASE_CA_FILE` to its mounted certificate. SSL options in the database URL are rejected to prevent overriding certificate verification.
4. Build the supplied Dockerfile, or run `npm ci --omit=dev` and `npm start` on Node 24. The container runs as the non-root node user and does not copy demo pages or secrets. Inject secrets at runtime. Pin the base image to your approved digest in your deployment pipeline.
5. Terminate TLS at your reverse proxy. Configure `TRUSTED_PROXIES` with its exact IPs/CIDRs and ensure the proxy overwrites forwarded headers. Keep the backend port private. HTTP application requests are rejected in production; `/health/live` alone remains usable by an internal container probe. Serve this app at its origin root. A TLS proxy must forward `X-Forwarded-Proto: https`.
6. Use `/health/live` for liveness and `/health/ready` for readiness. Capture structured stdout logs and alert on 5xx, repeated login rejection and readiness failures. Logs use route templates and request IDs, excluding raw callback URLs, bodies, tokens and cookies. Configure the same redaction at the proxy; it must not log callback query strings.

The application bounds request bodies and receive time, applies CSP/security headers, uses fixed redirect origins, and deletes expired session/transaction/rate-limit records every minute. Rate limits are shared in PostgreSQL (300 requests per minute per source IP, 30 auth requests per minute); size these for legitimate proxy/NAT traffic and complement them with edge connection/traffic limits. SQL and connection timeouts bound database stalls. SIGTERM/SIGINT drain the server and close database connections.

Audit events are appended for login success/rejection, access denial, logout, preference changes, and operations access changes. They do not contain credentials or submitted bank identifiers. Export events to your controlled audit sink and define retention; automatic deletion of audit events is intentionally not configured. Liveness alone does not prove a connected bank integration.

## What remains before financial production use

- Confirm the official identity protocol, authentication profile, issuer, client registration and assurance policy; test with the provider sandbox and production onboarding process.
- Implement official bank account ownership/consent mapping and financial data APIs. Do not seed balances or infer ownership from a submitted identifier. Use exact monetary types, provider references and reconciliation.
- Implement transfer authorization, step-up verification, idempotency, approved payment rails, signed/replay-protected webhooks and reconciliation only against the agreed provider contract. Current endpoints execute no payments.
- Implement document authorization, storage, scanning and retention against the actual document requirements. Current endpoints accept no uploads.
- Restore the desired production UI using verified backend data, connect deployment infrastructure and observability, test PostgreSQL TLS/roles/backup recovery and the reverse proxy, then complete provider acceptance and a security review for the actual deployment.

## Validation

`npm test` runs API/database tests on PGlite (embedded PostgreSQL for tests; also used by the separate local-development launcher), plus real openid-client validation against a locally stubbed HTTPS provider transport with signed RSA ID tokens. No authentication bypass or test identity provider is loaded by the server entrypoint. `npm run build` verifies the existing TypeScript/Vite design project. `npm audit` checks dependency advisories.

Tests cover migrations, encrypted one-use login transactions, provider-token validation, session persistence/expiry/revocation, CSRF, ownership isolation, shared limits, unavailable providers, no demo/static source exposure and database outage handling. These do not replace tests against your managed PostgreSQL, actual OIDC provider, TLS ingress, or payment provider. Docker/PostgreSQL services and official provider credentials were not present in the development session, so no live provider login, container deployment or real payment was performed.

Implementation references: [openid-client authorizationCodeGrant](https://github.com/panva/openid-client/blob/main/docs/functions/authorizationCodeGrant.md), [ID token signature checks](https://github.com/panva/openid-client/blob/main/docs/functions/enableNonRepudiationChecks.md), [Fastify server options](https://fastify.dev/docs/latest/Reference/Server/).



## Current demo workspace update

The shared demo model in `demo-data.js` now contains 50 kg of gold valued at USD 7,000,000, 60 kg of gemstones valued at USD 5,000,000, and approximately USD 2,200,000 in real estate. Total USD assets are USD 14,200,000. The existing EUR 3,500,000 deposit is kept separate without an assumed exchange rate.

The local portal has consistent overview, precious-assets, real-estate, banking, estate, document/report, local message/draft and settings views. Asset search/sort and detail dialogs work; CSV exports are explicitly marked DEMO. Transfer drafts and message notes persist only in browser local storage and are never sent. Display preferences include amount masking and compact spacing. Language preference is stored but full localization is not implemented.

The local-only `/demo-export/portfolio.csv` and `/demo-export/deposit.csv` routes return attachment downloads from the shared sample model. They are not financial-provider API endpoints. All demo labels and strict production authentication are retained.
