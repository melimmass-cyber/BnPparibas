function integer(value, fallback, min, max, name) {
  const n = Number(value ?? fallback);

  if (!Number.isInteger(n) || n < min || n > max) {
    throw new Error(`Invalid ${name}`);
  }

  return n;
}

function validateOrigin(value, name, production) {
  const origin = new URL(value);

  if (
    origin.href !== origin.origin + '/' ||
    origin.username ||
    origin.password
  ) {
    throw new Error(`${name} must be an origin`);
  }

  if (production && origin.protocol !== 'https:') {
    throw new Error(`${name} requires HTTPS in production`);
  }

  if (
    origin.protocol !== 'https:' &&
    (
      origin.protocol !== 'http:' ||
      !['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname)
    )
  ) {
    throw new Error(
      `${name}: HTTP is allowed only on loopback`
    );
  }

  return origin.origin;
}

export function loadConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';

  if (
    !['development', 'test', 'production'].includes(
      env.NODE_ENV ?? 'development'
    )
  ) {
    throw new Error('Invalid NODE_ENV');
  }

  /*
   * APP_ORIGIN is retained temporarily as a backwards-compatible fallback.
   *
   * Split deployment:
   * FRONTEND_ORIGIN = where the browser UI is hosted
   * API_ORIGIN      = where this Fastify backend is hosted
   */
  const legacyOrigin =
    env.APP_ORIGIN || 'http://localhost:3000';

  const frontendOrigin = validateOrigin(
    env.FRONTEND_ORIGIN || legacyOrigin,
    'FRONTEND_ORIGIN',
    production
  );

  const apiOrigin = validateOrigin(
    env.API_ORIGIN || legacyOrigin,
    'API_ORIGIN',
    production
  );

  const databaseUrl = env.DATABASE_URL;

  if (
    !databaseUrl ||
    !['postgres:', 'postgresql:'].includes(
      new URL(databaseUrl).protocol
    )
  ) {
    throw new Error('DATABASE_URL is required');
  }

  for (const key of new URL(databaseUrl).searchParams.keys()) {
    if (key.toLowerCase().startsWith('ssl')) {
      throw new Error(
        'Use DATABASE_SSL and DATABASE_CA_FILE instead of URL SSL options'
      );
    }
  }

  if (
    env.DATABASE_SSL &&
    !['verify-full', 'disable'].includes(env.DATABASE_SSL)
  ) {
    throw new Error('Invalid DATABASE_SSL');
  }

  const databaseSSL =
    env.DATABASE_SSL ?? (production ? 'verify-full' : 'disable');

  if (production && databaseSSL !== 'verify-full') {
    throw new Error(
      'Production database requires verified TLS'
    );
  }

  const key = env.SESSION_ENCRYPTION_KEY;

  if (!key || !/^[a-fA-F0-9]{64}$/.test(key)) {
    throw new Error(
      'SESSION_ENCRYPTION_KEY must be 32 random bytes in hex'
    );
  }

  const oidcFields = [
    env.OIDC_ISSUER,
    env.OIDC_CLIENT_ID,
    env.OIDC_CLIENT_SECRET,
    env.OIDC_REQUIRED_ACR,
  ];

  if (oidcFields.some(Boolean) && !oidcFields.every(Boolean)) {
    throw new Error(
      'Set all OIDC settings including the provider MFA assurance value'
    );
  }

  if (env.OIDC_ISSUER) {
    const issuer = new URL(env.OIDC_ISSUER);

    if (
      issuer.protocol !== 'https:' ||
      issuer.username ||
      issuer.password ||
      issuer.hash ||
      issuer.search
    ) {
      throw new Error(
        'OIDC issuer must use HTTPS'
      );
    }
  }

  if (production && !oidcFields.every(Boolean)) {
    throw new Error(
      'Production requires an identity provider'
    );
  }

  return {
    production,

    // Keep this temporarily so existing code does not break
    origin: apiOrigin,

    frontendOrigin,
    apiOrigin,

    databaseUrl,
    databaseSSL,
    databaseCAFile: env.DATABASE_CA_FILE,

    encryptionKey: Buffer.from(key, 'hex'),

    host: env.HOST || '127.0.0.1',

    port: integer(
      env.PORT,
      3000,
      1,
      65535,
      'PORT'
    ),

    sessionSeconds: integer(
      env.SESSION_SECONDS,
      3600,
      300,
      28800,
      'SESSION_SECONDS'
    ),

    idleSeconds: integer(
      env.SESSION_IDLE_SECONDS,
      900,
      60,
      3600,
      'SESSION_IDLE_SECONDS'
    ),

    trustedProxies: env.TRUSTED_PROXIES
      ? env.TRUSTED_PROXIES
          .split(',')
          .map(x => x.trim())
      : false,

    issuer: env.OIDC_ISSUER,
    clientId: env.OIDC_CLIENT_ID,
    clientSecret: env.OIDC_CLIENT_SECRET,
    requiredAcr: env.OIDC_REQUIRED_ACR,
  };
}