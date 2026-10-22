# ADR 002 — Hosting migration gates and Vercel import failure

Date: 2026-10-22
Status: Proposed; no deployment or infrastructure change authorized by this document.

## Verified failure

Vercel team `marcwarns-projects`, project `agentdoingshub`, deployment `dpl_AUBWmUHw4mdfXeTRBWdK4wqP2jtD` failed with `NEXT_NO_ROUTES_MANIFEST` at commit `c01e849`. The build log says `Build complete` from Vinext, followed by Vercel expecting `.next/routes-manifest.json`. Project framework was `nextjs` with Node 24.x. This is a builder/output mismatch, not evidence of invalid application TypeScript. Do not create a dummy routes manifest or assume changing the framework dropdown alone makes the app deployable.

The GitHub Actions portable baseline runs `pnpm build`, which uses `scripts/run-framework.mjs` and the Vinext CLI in the portable profile. Passing that build does not establish that Vercel's Next.js builder, user authentication, Cloudflare bindings or connected app permissions work.

## Actual platform dependencies

| Area | Existing source | Migration gate |
| --- | --- | --- |
| Auth | `app/chatgpt-auth.ts` trusts Sites-injected identity headers | Replace with independently verified Entra/OIDC session validation, server-side issuer/audience checks and tenant membership; do not accept client-controlled identity headers |
| Data | `db/index.ts` imports `cloudflare:workers` and `drizzle-orm/d1` | Choose and provision separate persistent storage, migrate schema and enforce tenant/user ownership; never connect the existing Sites database by accident |
| Connectors | `lib/connector-context.ts` and platform binding contracts | Implement and test delegated per-user CRM, SharePoint and Slack provider adapters; connection within ChatGPT does not confer credentials on Vercel |
| Runtime | `core/agents.ts` guarded by configuration and OPENAI_API_KEY | Secure server-side model provisioning, bounded actions, evaluations, receipts and durable execution before enabling |
| Voice | Browser speech controls | True conversation must share the same persisted run, not separate transcripts |
| Hosting | Vinext/Cloudflare build outputs | Validate the selected host's adapter, function runtime, static assets, routes and streaming with a real isolated preview deployment |

## Decision path

1. Keep the original private Sites pilot untouched and preserve its source/history.
2. Keep the existing CI baseline and core behavior tests as required checks.
3. Select one path deliberately:
   - **Cloudflare-compatible isolated host**: likely preserves Vinext/Workers/D1 with the fewest framework changes, but requires new Cloudflare ownership, auth and delegated connector configuration.
   - **Vercel target**: replace/adapt the Vinext build/runtime with a genuinely supported Vercel Next.js build, migrate D1 access to a compatible database, replace Sites identity/connector contracts, and verify runtime compatibility. This is a migration, not a framework-setting toggle.
4. Run an isolated, non-production preview without real customer data, using only reviewed environment settings. Verify static pages, API routes, authentication refusal when unauthenticated, tenant isolation, DB persistence, and server streaming.
5. Only then wire up provider access and model credentials in protected server environment settings. Use actual provider receipts and live eval runs before considering production.
6. Release to an explicit target only after reviewing the preview and documenting rollback.

## Acceptance criteria

- The deployment's actual framework/runtime produces the output its host expects, and preview routing works.
- Anonymous and spoofed-header requests cannot acquire identity or customer data.
- Storage is separate from Sites, owner-scoped and tested with two identities.
- No connector tokens or model keys enter Git, CI logs, browser payloads or public artifacts.
- Failed/blocked work has persisted events; completed work has artifacts or verified action receipts.
- CI typecheck, regression tests, build and hosted smoke tests all pass.

## Immediate next implementation slice

Build an adapter-independent, tenant-aware append-only event repository and tests, then a host-specific persistent adapter. Keep external writes disabled and avoid claiming that the event projection alone makes runs durable.

## Source of verification

- Vercel deployment and build logs for `dpl_AUBWmUHw4mdfXeTRBWdK4wqP2jtD`, inspected 2026-10-22.
- Repository `package.json`, `scripts/run-framework.mjs`, `db/index.ts`, `app/chatgpt-auth.ts`, `lib/connector-context.ts`, `docs/CODEX_HANDOFF.md`.
- GitHub Actions Portable baseline in `.github/workflows/portable-baseline.yml`.
