# ADR 001 — Isolated Sites pilot, 2026-10-10

## Decision
New owner-private Sites application and source repository. Existing CRM, Flow and Sessions are unchanged. This repository is NOT yet on GitHub in Marcwarn. GitHub discovery is available but no repository-creation tool was exposed; do not repurpose another repository.

Sites provides Vinext (Next-compatible React), Cloudflare Workers, platform identity, MCP OAuth, request-scoped connected-app access and D1. This pilot differs from the target Next.js/Vercel/PostgreSQL/Entra stack and is not production acceptance.

## Structure
- app/page.tsx: task form, source viewer, history, directory, gaps, personal audit.
- app/api: protected task operations, source fetch and deletion.
- app/mcp: six high-level operations using the same core and storage as web.
- core/contracts.ts: bounded inputs, safe links, adapter envelope and guards.
- core/orchestrator.ts: concurrent CRM/Knowledge retrieval with independent errors.
- core/agents.ts: installed Agents SDK 0.18.0 manager with two specialist tools, bounded turns/calls/output/time; unexposed pending provider key and live evals.
- core/store.ts: user-owned metadata and audit; no document bodies or cached sources.
- db/schema.ts + drizzle: isolated pilot database.
- tests: fixtures only in tests; live harness uses native reads.

## Verified inventory
CRM and SharePoint allowed by workspace Sites policy. Native CRM OAuth search and SharePoint Graph-backed search successful. Core live relay: CRM 2 customer identities, Knowledge 6 document hits, needs_input correctly returned for Nordiska. These are authoring-session reads, not hosted visitor consent evidence. GitHub login Marcwarn verified and repositories discoverable; none changed. OpenAI key request rejected by provider (no reason supplied), deferred at user's request. Outlook/Teams not integrated/tested. Vercel/Entra/PostgreSQL not provisioned.

## Permission model
Owner-private Sites dispatch is the outer boundary. Data APIs require trusted request identity. Browser cannot choose another user, CRM link ID or arbitrary tool. Database queries constrain owner and TTL. Providers use current-request bindings, never shared tokens. Browser POSTs require same Origin. MCP permits server clients without Origin but requires authenticated identity for data operations and rejects foreign browser origins. Service access does not establish user identity.

Server-owned read actions only: CRM search_customers, SharePoint search/fetch. External writes absent. Future approvals must bind user/task/immutable action hash/expiry/one-time use, revalidate access immediately before writing and record provider receipt.

Search metadata is not content verification. CRM roles are registered facts. Document titles never prove methodology, approval status, relationships or reuse permission. Other-customer material remains discovery-only pending confidentiality review. Private conversations are not ingested/shared. No AI processing runs. Activation needs execution scopes and stronger grounding validation.

## Retention and escalation
Metadata/audit visible for 30 days; expired owner records purged when that user accesses history. User can delete a task and associated audit. No source bodies, contact results or model output persisted. Goal/query remain private but may contain sensitive data. A scheduled purge including inactive users and backup deletion policy is needed for strict physical-retention guarantees.

Knowledge gaps are grouped within one user's history. UI prepares questions only; no recipient resolution, sending, reply ingestion or organization-wide publication.

## Production gates
1. Dedicated GitHub repo, separate Vercel project and PostgreSQL database.
2. Entra tenant app, issuer/audience checks, delegated Graph consent and verified least-privilege scopes. Replace Sites identity with a trusted adapter; never trust client identity headers on Vercel.
3. Per-user CRM/Slack OAuth, vault and refresh lifecycle; native ChatGPT credentials are not exportable backend tokens.
4. Key/model access and spend limits; live grounding/injection evaluation and customer scopes. Current token/call limits are not a hard dollar cap.
5. Rate limiting, concurrency, idempotency, cancellation and queue where needed. Pilot timeout bounds waiting; provider calls may finish later.
6. PostgreSQL owner/tenant enforcement, scheduled deletion and admin roles. No cross-user admin view exists in pilot.
7. Hosted consent/refresh with two users, MCP connection, usefulness evaluation.

## Slack update
Public-channel message search is now included via the current visitor binding, in parallel with other sources. The public-only action is server-owned, limited to 8 results, context disabled. Private channels/DMs and all writes remain excluded. Messages stay in the current response, not durable history. Slack posts are attributed source statements, not independently verified facts. Native live search verified; hosted visitor path remains unverified.
