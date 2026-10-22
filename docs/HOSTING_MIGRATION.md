# ADR 002 — Hosting migration gates and Vercel import failure

Date: 2026-10-22
Status: Proposed; no deployment or infrastructure change authorized by this document. Review against the user's existing project conventions before selecting a host.

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
3. Compare against the owner's existing project conventions before selecting a host. Do not privilege the source platform simply because the code originated there.\n4. Select one path deliberately:
   - **Cloudflare-compatible isolated host**: likely preserves Vinext/Workers/D1 with the fewest framework changes, but requires new Cloudflare ownership, auth and delegated connector configuration.
   - **Vercel target**: replace/adapt the Vinext build/runtime with a genuinely supported Vercel Next.js build, migrate D1 access to a compatible database, replace Sites identity/connector contracts, and verify runtime compatibility. This is a migration, not a framework-setting toggle.
5. Run an isolated, non-production preview without real customer data, using only reviewed environment settings. Verify static pages, API routes, authentication refusal when unauthenticated, tenant isolation, DB persistence, and server streaming.
6. Only then wire up provider access and model credentials in protected server environment settings. Use actual provider receipts and live eval runs before considering production.
7. Release to an explicit target only after reviewing the preview and documenting rollback.

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

## Cross-project review — Doings engineering conventions (2026-10-22)

Grounded examples inspected in Marcwarn GitHub repositories:

- `sessions/README.md`: separate Vercel project, explicit `apps/web` root directory, production branch `main`, separate Neon database; cloud integrations not considered configured until verified. Sessions and Doingsflow are intentionally isolated.
- `doingsflow/README.md`: exported Sites project is a portable source handoff, not a mandate to retain Sites hosting. Exported source excludes operational database contents, R2 files, credentials and external bot implementation.
- `doings-brief/package.json`: conventional Next.js runtime (`next build`), comprehensive regression checks and architecture/public-access checks. This is not the same deployment adapter as Vinext.
- `customer-intel-azure/package.json`: dedicated Microsoft Graph worker, separate from the frontend, with explicit typecheck/build commands; Azure integration is an independent component.
- `doings-evidence-mcp/package.json`: independently deployable Azure MCP component with health and remote smoke checks.
- Previous CRM implementation practice: deterministic intent handling and validation before LLM rendering; don't replace grounded computation with model guesses.

### Revised target direction

**Target architecture preference for the independent Agent Hub:** GitHub is source of truth; a dedicated Vercel project for a genuine Next.js web frontend; an isolated, user-scoped Neon/PostgreSQL database or justified Supabase alternative; independently deployed background workers where necessary; verified Entra/OIDC login and per-user delegated integrations; CI, staging, traceability and rollback. This is a **target**, not a claim that current Vinext code can run unmodified on Vercel. Do not share the Sessions, Doingsflow, CRM or Doings Brief databases or credentials.

**Cloudflare-compatible hosting remains a technical fallback or transitional preview option**, not the default simply because the original Sites prototype used Cloudflare D1. Preserve source, UI, agent identities, contracts and evals while migrating platform dependencies deliberately.

Before further platform work, trace the existing feature set and compare against these examples; write a migration map with per-route impacts, owner identity boundary, data model and rollout tests. Do not provision a new host or database or move customer data before confirming actual requirements and integration behavior.

## Route and data migration map — verified source audit

| Surface | Current trust/data dependency | Target implementation | Test before enabling |
| --- | --- | --- | --- |
| `GET /api/tasks` | `getChatGPTUser()` from platform headers; `core/store.list/auditList` via Cloudflare D1 | Verified Entra server session, tenant+owner-scoped repository | Anonymous 401, spoofed Sites headers 401, users A/B cannot enumerate each other's runs |
| `POST /api/tasks` | Same identity; `validOrigin`; `gather()` invokes request-scoped connectors; `save()` stores task metadata | Verified session and CSRF checks; typed runtime job enqueue and durable DB transaction; delegated integrations injected per request | Missing permission blocks safely, duplicate create is idempotent, no fabricated completion, persistence survives restart |
| `DELETE /api/task` | Identity + same-origin checks; `remove(owner,id)` | Tenant-scoped deletion and tombstone/audit retention consistent with policy | User B cannot delete user A; cross-site POST/DELETE rejected; retention policy honored |
| `POST /mcp` | JSON-RPC transport; Sites identity headers; metadata-only lookup; owner-scoped D1 | Protected MCP resource endpoint, verified OAuth audience/scopes and per-user identity; preserve read-only tool contracts until authorized | No anonymous tools/call; tools/list metadata does not leak secrets; owner-scoped get_task_status |
| `/api/source` | Per-request connector bindings, user identity, ephemeral source lookup | Per-user delegated adapter with scope and source ACL recheck at each read | Unauthorized source fails closed; private channels and other customers never surface |
| UI and voice | Vinext rendering and browser speech controls | Standard Next.js Vercel frontend using typed backend API; shared run IDs across text/voice | No header spoofing, route smoke test, voice and text reuse run state |
| `core/store.ts` | D1 `tasks`/`audit` SQLite schema; per-user 30-day metadata retention | Dedicated PostgreSQL repository and append-only events; tenant+owner in every query and index; background expiry | Migration applies cleanly, durable replay matches projection, data isolated, deletion and cleanup verified |
| `core/agents.ts` | SDK is present but gated and not invoked by UI | Worker-owned orchestrator; bounded capability registry, review and receipts; no external action by default | Failure, timeout, retries, and approvals represented as real events and audited |

### Sequencing and anti-derail guardrails

1. Preserve the existing UI and eleven named agent identities during hosting work; do not redesign the product as a side effect of deployment fixes.
2. Extract identity, persistence and provider access behind interfaces first, with tests; only then select their host-specific implementations.
3. Implement append-only event storage with durable transaction semantics and run ownership before implementing UI status streams. Client must render actual persisted events only.
4. Keep the original Sites deployment unmodified and never point a new preview to an existing CRM, Sessions or other project's database.
5. Treat the Vercel build failure as a separate adapter migration ticket, not a justification to switch the entire architecture back to Cloudflare.
6. Require a runnable staging smoke test (auth, database, routes, MCP, streaming) before enabling AI/provider credentials or making any production deployment.

### Explicitly not completed

No new PostgreSQL instance, Entra application, real provider OAuth connection, AI runtime or independent Vercel preview has been provisioned by this documentation work. Existing `core/agent-run-projection.ts` performs in-memory validated replay but does not yet persist events.
