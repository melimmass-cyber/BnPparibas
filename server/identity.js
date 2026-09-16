import * as oidc from 'openid-client';
// Generic OIDC boundary, not a claim of BNP/LuxTrust API compatibility.
export async function createIdentityProvider(config, transport) {
  if (!config.issuer) return null;
  const client = await oidc.discovery(new URL(config.issuer), config.clientId,
    { client_secret: config.clientSecret }, oidc.ClientSecretBasic(config.clientSecret),
    { timeout: 10, ...(transport ? { [oidc.customFetch]: transport } : {}) });
  oidc.enableNonRepudiationChecks(client);
  const redirectUri = `${config.apiOrigin}/auth/callback`;
  return {
    async begin() {
      const verifier = oidc.randomPKCECodeVerifier();
      const state = oidc.randomState(), nonce = oidc.randomNonce();
      const url = oidc.buildAuthorizationUrl(client, {
        redirect_uri: redirectUri, scope: 'openid', response_type: 'code',
        code_challenge: await oidc.calculatePKCECodeChallenge(verifier), code_challenge_method: 'S256',
        state, nonce, acr_values: config.requiredAcr, max_age: '300',
      });
      return { url: url.href, transaction: { verifier, state, nonce } };
    },
    async complete(url, transaction) {
      const tokens = await oidc.authorizationCodeGrant(client, url, {
        pkceCodeVerifier: transaction.verifier, expectedState: transaction.state,
        expectedNonce: transaction.nonce, idTokenExpected: true, maxAge: 300,
      });
      const claims = tokens.claims(), now = Date.now() / 1000;
      if (!claims || typeof claims.sub !== 'string' || !claims.sub || claims.iss !== config.issuer ||
          claims.acr !== config.requiredAcr || typeof claims.auth_time !== 'number' ||
          claims.auth_time < now - 360 || claims.auth_time > now + 60) throw new Error('Identity assurance rejected');
      return { issuer: claims.iss, subject: claims.sub };
    },
  };
}
