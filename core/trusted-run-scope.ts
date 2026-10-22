import type { RunScope } from "./run-event-store";

/** Authentication adapters must verify a session cryptographically before returning this value. */
export type VerifiedPrincipal = Readonly<{
  tenantId: string;
  userId: string;
  issuer: string;
  audience: string;
  expiresAt: number;
  verified: true;
}>;

export function scopeForAuthenticatedRun(principal: VerifiedPrincipal | null, runId: string, now = Date.now()): RunScope {
  if (!principal || principal.verified !== true) throw new Error("UNAUTHENTICATED");
  if (![principal.tenantId, principal.userId, principal.issuer, principal.audience, runId].every(
    value => typeof value === "string" && value.trim().length > 0
  )) throw new Error("INVALID_PRINCIPAL");
  if (!Number.isFinite(principal.expiresAt) || principal.expiresAt <= now) throw new Error("SESSION_EXPIRED");
  return { tenantId: principal.tenantId, ownerId: principal.userId, runId };
}

/** Never accept tenantId or ownerId from a web request payload as an authority. */
export function rejectClientScope(body: unknown): void {
  if (!body || typeof body !== "object" || Array.isArray(body)) return;
  for (const key of ["tenantId", "ownerId", "userId", "verified", "issuer", "audience"]) {
    if (Object.prototype.hasOwnProperty.call(body, key)) throw new Error("CLIENT_IDENTITY_NOT_ALLOWED");
  }
}
