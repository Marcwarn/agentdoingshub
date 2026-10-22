import { verifyEntraAccessToken } from "@/core/entra-token-verifier";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Temporary end-to-end authentication probe; not a login or session API. */
export async function GET(request: Request) {
  const tenantId = process.env.ENTRA_TENANT_ID;
  const audience = process.env.ENTRA_CLIENT_ID;
  if (!tenantId || !audience) {
    return Response.json({ error: "Identity provider not configured." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  const value = request.headers.get("authorization") ?? "";
  if (!/^Bearer [A-Za-z0-9_\-.]+$/.test(value) || value.length > 17000) {
    return Response.json({ error: "Verified Microsoft access token required." }, { status: 401, headers: { "Cache-Control": "no-store", "WWW-Authenticate": "Bearer" } });
  }
  try {
    const principal = await verifyEntraAccessToken(value.slice(7), { tenantId, audience });
    return Response.json({ authenticated: true, userId: principal.userId, tenantId: principal.tenantId, expiresAt: principal.expiresAt }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Token invalid or unverifiable." }, { status: 401, headers: { "Cache-Control": "no-store", "WWW-Authenticate": "Bearer" } });
  }
}
