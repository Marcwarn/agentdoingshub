# Restricted application role checkpoint

Applied migration `restricted_agent_hub_nologin_role` to Supabase project `bfkhwvumtzjkesifwjuq`.

Verified: role `agent_hub_app` exists, `rolcanlogin=false`, `rolbypassrls=false`, `rolsuper=false`, and grants are limited to SELECT/INSERT/UPDATE on `agent_hub.hub_runs` and SELECT/INSERT on `agent_hub.hub_run_events`.

An attempted role-impersonated transactional RLS test using the Supabase management SQL connector was **blocked** with `permission denied to set role "agent_hub_app"`. This does not imply an RLS failure or success. No test records were created by that failed transaction.

Next required steps: provision a restricted server-only LOGIN identity through the supported secure operations path; grant membership in `agent_hub_app` without BYPASSRLS or table ownership; store credentials directly in Vercel encrypted environment settings; validate actual RLS denial/approval with that restricted connection and a valid verified Entra principal. Never commit or paste secrets.
