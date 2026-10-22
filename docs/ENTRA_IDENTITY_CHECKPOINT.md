# Entra identity integration checkpoint

The `GET /api/identity` endpoint accepts an Entra **access token** for this application's audience and verifies its RS256 signature against Microsoft's tenant JWKS, issuer, tenant, audience, object ID and expiry.

This endpoint is **not** an interactive browser login or an authenticated session. It is intentionally read-only and has no database or tool access.

Environment configuration (set directly in Vercel, not in GitHub or chat):
- `ENTRA_TENANT_ID`: Entra directory tenant GUID
- `ENTRA_CLIENT_ID`: the registered application's expected access-token audience GUID

The Entra app registration must expose an API scope such that Entra can issue access tokens with exactly the configured audience, and tenant-specific `v2.0` issuer. Don't use an ID token intended for a browser client as an API access token.

No fallback to `oai-authenticated-user-*` headers on Vercel: those headers can be forged without the old trusted Sites reverse proxy.

Before production use: implement OIDC authorization-code flow with PKCE, CSRF state and nonce; host-only HTTP-only secure same-site cookies; session rotation/signout; API authorization on every operation; enforce tenant and owner constraints under a least-privilege PostgreSQL role; test replay, concurrency and cross-tenant denial. The current D1-based task history is not connected to Supabase.
