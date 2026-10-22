# ADR 003 — Neon vs Supabase for Doings Agent Hub

Date: 2026-10-22. Status: recommended direction, not provisioned.

## Context
The product requires owner/tenant isolated append-only run events, durable agent jobs, live activity updates, knowledge retrieval and future vector search, multi-user Entra login, delegated Microsoft 365/CRM/Slack permissions, attachments and clear independent deployments. The Vercel web target must not inherit credentials, identity headers, D1 bindings or database contents from Sites.

## Evidence from the owner's projects
- `sessions` explicitly uses separate Vercel deployment and a separately planned Neon database; attachment connectors need independent verification.
- `CRM` and other Lovable projects use Supabase, providing an established internal precedent for integrations and policies.
- An existing Neon organization contains `doings dev apps` and `Events`; neither is authorized as Agent Hub's database. Do not reuse either.
- Connected Supabase account lists `Office facility` and `Appar`, both inactive; neither is an Agent Hub database.
- `core/postgres-event-adapter.ts` targets ordinary PostgreSQL and can be driven by a server-only pooled SQL adapter on either provider. SQL migration is not yet deployed.

## Decision matrix

| Requirement | Neon | Supabase |
| --- | --- | --- |
| Ordinary transactional PostgreSQL | Strong | Strong |
| Isolated databases and development branching | Strong specialization | Supports development workflows; project and branching costs need confirmation |
| Vercel/Next.js integration | Strong | Strong |
| Real-time events and subscriptions | Build/operate a realtime layer separately | Built-in Realtime; still requires secure scoping and authorization |
| Durable work queues, scheduling and retries | Implement or use a separate queue/worker platform | Queues (pgmq), Cron and Edge Functions available; long-running jobs still require correct worker and lease design |
| Knowledge vectors/search | PostgreSQL extensions subject to plan/feature checks | Documented pgvector + embedding/queue pattern |
| Authentication | Use Entra provider separately | Supabase Auth possible, but Entra enterprise setup, tenant boundaries and delegated Graph tokens still need design |
| File/artifact storage | Add separate object storage | Supabase Storage integrated |
| Complexity/lock-in | Minimal DB primitive, more infrastructure pieces | More managed product primitives and platform coupling |

## Recommendation
**Use a new dedicated Supabase project as Agent Hub's likely default, conditional on a proof of concept.** The differentiators are queueing, realtime events, attachments and knowledge workflows—key product requirements beyond basic Postgres. Keep normal PostgreSQL schema/access behind the existing adapter contract. Continue to deploy a standards-based Next.js web application on Vercel, with durable background execution separately when required.

**Keep Neon as a legitimate fallback** if a small Vercel + PostgreSQL + independent worker architecture wins on measured simplicity, performance, security and total cost. A shared Neon org does not mean shared databases; the owner isolation standard remains.

## Mandatory proof of concept and decision gates
1. Create an isolated new project only with explicit infrastructure authorization. Never reuse `doings dev apps`, `Events`, `CRM`, `Sessions`, `Office facility` or `Appar`.
2. Verify server-only Postgres adapter schema/transactions and concurrency conflict behavior with two distinct tenant/user contexts. Test RLS and least-privilege service roles—tenant/owner predicates in source are not a replacement for DB defense in depth.
3. Publish/subscribe to authorized run events across two separate browser sessions with no unauthorized visibility, replay after disconnection, and no synthetic events.
4. Execute a queue worker with retry, backoff, crash recovery, duplicate delivery and idempotent external actions; verify that no provider call is incorrectly represented as successful.
5. Verify object storage permissions, retention/deletion, embedding updates and source ACL rechecks.
6. Test Entra sign-in and trusted tenant binding separately from DB auth; ensure Microsoft delegated permissions cannot be inferred from login.
7. Compare actual vendor plan/pricing, EU-region availability, backups, PITR, egress, concurrent compute, platform quotas and security audit features before accepting a production plan.
8. Preserve the ability to switch vendors through a standard PostgreSQL repository interface and provider-neutral event contract.

## Important constraints
- Supabase project list returned only two inactive projects in the connected account; verify organizational access before concluding no other projects exist.
- Neon project list returned two visible projects in one organization; this is not an inventory of every possible Neon organization.
- No new database, tokens or production settings have been created or changed by this decision.
- PR #6 added an unconnected SQL adapter and passed GitHub CI. It is not proof of actual database durability or security.
