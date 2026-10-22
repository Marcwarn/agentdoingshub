import { createPublicKey, verify as verifySignature } from "node:crypto";
import type { VerifiedPrincipal } from "./trusted-run-scope";

function decode(part: string): unknown {
  if (!/^[A-Za-z0-9_-]+$/.test(part)) throw new Error("INVALID_TOKEN");
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
}
function record(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error("INVALID_TOKEN");
  return v as Record<string, unknown>;
}
export type OidcConfig = { tenantId: string; audience: string };
export async function verifyEntraAccessToken(
  raw: string,
  config: OidcConfig,
  getKeys: (url: string) => Promise<unknown> = async url => {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (!response.ok) throw new Error("KEY_FETCH_FAILED");
    return response.json();
  },
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<VerifiedPrincipal> {
  if (!/^[a-fA-F0-9-]{36}$/.test(config.tenantId) || !config.audience || raw.length > 16000) throw new Error("OIDC_CONFIG_INVALID");
  const parts = raw.split(".");
  if (parts.length !== 3) throw new Error("INVALID_TOKEN");
  const header = record(decode(parts[0]));
  const claims = record(decode(parts[1]));
  if (header.alg !== "RS256" || typeof header.kid !== "string" || !header.kid || header.kid.length > 256) throw new Error("INVALID_ALGORITHM");
  const issuer = `https://login.microsoftonline.com/${config.tenantId}/v2.0`;
  if (claims.iss !== issuer || claims.tid !== config.tenantId || claims.aud !== config.audience) throw new Error("INVALID_CLAIMS");
  if (typeof claims.oid !== "string" || !/^[a-fA-F0-9-]{36}$/.test(claims.oid)) throw new Error("INVALID_SUBJECT");
  if (typeof claims.exp !== "number" || !Number.isSafeInteger(claims.exp) || claims.exp <= nowSeconds ||
    typeof claims.nbf !== "number" || !Number.isSafeInteger(claims.nbf) || claims.nbf > nowSeconds + 60) throw new Error("TOKEN_EXPIRED_OR_PREMATURE");
  const jwks = record(await getKeys(`https://login.microsoftonline.com/${config.tenantId}/discovery/v2.0/keys`));
  if (!Array.isArray(jwks.keys)) throw new Error("INVALID_JWKS");
  const key = jwks.keys.map(record).find(k => k.kid === header.kid && k.kty === "RSA" &&
    (k.use === undefined || k.use === "sig") && (k.alg === undefined || k.alg === "RS256"));
  if (!key) throw new Error("UNKNOWN_SIGNING_KEY");
  const publicKey = createPublicKey({ key: key as JsonWebKey, format: "jwk" });
  if (!verifySignature("RSA-SHA256", Buffer.from(parts[0] + "." + parts[1]), publicKey, Buffer.from(parts[2], "base64url"))) throw new Error("INVALID_SIGNATURE");
  return { tenantId: config.tenantId, userId: claims.oid, issuer, audience: config.audience, expiresAt: claims.exp * 1000, verified: true };
}
