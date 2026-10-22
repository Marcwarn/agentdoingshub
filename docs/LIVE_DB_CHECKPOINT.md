# Live database checkpoint — 2026-10-22

Target: Supabase project `bfkhwvumtzjkesifwjuq` (`agent hub`), EU West (Ireland).
No other project was touched.

## Verified
- Migration `create_private_agent_hub_runs_and_events` applied; tables are `agent_hub.hub_runs` and `agent_hub.hub_run_events`.
- Both tables have forced row-level security. `anon` and `authenticated` roles have no direct table grants; no RLS policies exist yet (fail-closed).
- A transaction through the connected Supabase SQL tool inserted one test run and its event, set version 1, then queried the values successfully.
- The test transaction was ROLLBACKed. A separate query confirmed zero runs and zero events afterwards.
- GitHub PR #9 passed CI and was merged, qualifying adapter queries with `agent_hub`.

## Not yet proven
- Application server connectivity using least-privilege credentials; the SQL tool runs as a privileged management context, not the application identity.
- End-to-end identity from Entra, request-scoped authorization, concurrency with actual application adapter, frontend, job scheduling, agent execution and model access.
- Database backup, retention, cost and worker recovery policies.

## Safe next gates
1. Provision a *dedicated restricted server database role* with schema permissions and verified request identity, and configure its secret directly in the deployment environment (never in GitHub/chat).
2. Verify anonymous/forged identity refusal, cross-tenant denial, append/version conflict, replay and rollback using application connections.
3. Configure standard Next.js for Vercel independently of the old Vinext runtime, without weakening identity or sharing Sites bindings.
4. Only after passing hosted checks, enable queue workers and audited AI execution.

Do not declare Agent Hub finished or deployed based on this DB transaction test.
