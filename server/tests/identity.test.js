import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createIdentityProvider } from '../identity.js';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', alg: 'RS256', use: 'sig' };
const issuer = 'https://identity.example';
const config = { issuer, clientId: 'portal-client', clientSecret: 'test-secret', origin: 'https://portal.example', requiredAcr: 'urn:test:mfa' };
const json = value => new Response(JSON.stringify(value), { status: 200, headers: { 'content-type': 'application/json' } });
function jwt(payload, corrupt) {
  const input = `${Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-key' })).toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}`;
  const signature = sign('RSA-SHA256', Buffer.from(input), privateKey);
  if (corrupt) signature[0] ^= 1;
  return `${input}.${signature.toString('base64url')}`;
}
async function setup(overrides = {}, corrupt = false) {
  let transaction, tokenRequests = 0, jwksRequests = 0;
  const transport = async (url, options) => {
    const path = new URL(url).pathname;
    if (path === '/.well-known/openid-configuration') return json({
      issuer, authorization_endpoint: `${issuer}/authorize`, token_endpoint: `${issuer}/token`, jwks_uri: `${issuer}/jwks`,
      response_types_supported: ['code'], subject_types_supported: ['public'], id_token_signing_alg_values_supported: ['RS256'],
      token_endpoint_auth_methods_supported: ['client_secret_basic'], code_challenge_methods_supported: ['S256'],
    });
    if (path === '/jwks') { jwksRequests++; return json({ keys: [jwk] }); }
    if (path === '/token') {
      tokenRequests++;
      const body = new URLSearchParams(options.body);
      assert.equal(body.get('code_verifier'), transaction.verifier);
      assert.equal(body.get('redirect_uri'), `${config.origin}/auth/callback`);
      const now = Math.floor(Date.now() / 1000);
      return json({ access_token: 'never-persist-this', token_type: 'Bearer', expires_in: 600,
        id_token: jwt({ iss: issuer, sub: 'subject-123', aud: config.clientId, iat: now, exp: now + 600, nonce: transaction.nonce, acr: config.requiredAcr, auth_time: now, ...overrides }, corrupt),
      });
    }
    throw new Error(`Unexpected provider request: ${path}`);
  };
  const provider = await createIdentityProvider(config, transport);
  const start = await provider.begin(); transaction = start.transaction;
  return { provider, start, transaction, calls: () => ({ tokenRequests, jwksRequests }) };
}
test('real OIDC library validates signed ID token, PKCE, nonce and required MFA assurance', async () => {
  const { provider, start, transaction, calls } = await setup();
  const authorization = new URL(start.url);
  assert.equal(authorization.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(authorization.searchParams.get('acr_values'), config.requiredAcr);
  assert.equal(authorization.searchParams.get('scope'), 'openid');
  const result = await provider.complete(new URL(`${config.origin}/auth/callback?code=test&state=${transaction.state}`), transaction);
  assert.deepEqual(result, { issuer, subject: 'subject-123' });
  assert.equal(calls().tokenRequests, 1);
  assert.equal(calls().jwksRequests, 1);
});
test('OIDC rejects invalid signatures, nonce, issuer, audience, expiry, auth age and MFA assurance', async t => {
  const cases = [
    ['signature', {}, true], ['nonce', { nonce: 'wrong' }], ['issuer', { iss: 'https://evil.example' }],
    ['audience', { aud: 'another-client' }], ['expiry', { exp: 1 }], ['MFA', { acr: 'password-only' }],
    ['old authentication', { auth_time: 1 }], ['future authentication', { auth_time: 9999999999 }],
  ];
  for (const [name, overrides, corrupt] of cases) await t.test(name, async () => {
    const { provider, transaction } = await setup(overrides, corrupt);
    await assert.rejects(provider.complete(new URL(`${config.origin}/auth/callback?code=test&state=${transaction.state}`), transaction));
  });
});
test('OIDC rejects wrong state before exchanging authorization code', async () => {
  const { provider, transaction, calls } = await setup();
  await assert.rejects(provider.complete(new URL(`${config.origin}/auth/callback?code=test&state=wrong`), transaction));
  assert.equal(calls().tokenRequests, 0);
});
