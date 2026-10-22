import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export type OidcStart = {
  state: string;
  nonce: string;
  verifier: string;
  url: string;
};
const guid = /^[a-f0-9-]{36}$/i;
const verifierPattern = /^[A-Za-z0-9_-]{43,128}$/;
const b64 = (bytes: Buffer) => bytes.toString("base64url");

export function beginEntraOidc(config: { tenantId: string; clientId: string; redirectUri: string }): OidcStart {
  if (!guid.test(config.tenantId) || !guid.test(config.clientId)) throw new Error("INVALID_OIDC_CONFIG");
  const redirect = new URL(config.redirectUri);
  if (redirect.protocol !== "https:" || redirect.username || redirect.password || redirect.hash) throw new Error("INVALID_REDIRECT");
  const state = b64(randomBytes(32));
  const nonce = b64(randomBytes(32));
  const verifier = b64(randomBytes(64));
  const challenge = b64(createHash("sha256").update(verifier).digest());
  const url = new URL(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize`);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirect.href);
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  return { state, nonce, verifier, url: url.toString() };
}
export function validateOidcCallback(expected: { state: string; verifier: string }, actualState: string | null): void {
  if (!verifierPattern.test(expected.verifier) || !verifierPattern.test(expected.state) || !actualState ||
      expected.state.length !== actualState.length ||
      !timingSafeEqual(Buffer.from(expected.state), Buffer.from(actualState))) {
    throw new Error("INVALID_OIDC_STATE");
  }
}
