# Tenant-owner RLS applied to Agent Hub

Applied to project `bfkhwvumtzjkesifwjuq` in migration `tenant_owner_rls_private_agent_hub`. Five policies verified in `pg_policies`.

## Required server transaction boundary

Never grant access to `anon` or `authenticated` for these private tables. Provision a distinct restricted PostgreSQL application role with no `BYPASSRLS`, no table ownership and no DDL privileges. Authenticate the user first using cryptographically verified Entra credentials. In each transaction, set `app.tenant_id` and `app.owner_id` using `set_config(..., true)` from the verified principal, not request JSON, headers or user-supplied SQL.

Avoid using the Supabase admin/management database role in the application. Custom GUCs are not secrets and are not an authentication mechanism: the DB connection must be server-only, protected, scoped, and incapable of running arbitrary user SQL. Run cross-tenant and unauthorized tests on the **actual restricted role** before enabling endpoints.

Current PostgresEventAdapter does not yet set transaction-local identity or use an authorized least-privilege connection, so it must not be enabled against these policies until updated and integrated.
