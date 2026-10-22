import { AgentEventSchema, type AgentEvent } from "./agent-runtime-contracts";
import type { AppendResult, DurableEventAdapter, RunScope } from "./run-event-store";
import { validateRunScope } from "./run-event-store";

/** Minimal pg-compatible interfaces. Inject an authenticated, server-only pool. */
export interface SqlClient {
  query<T = Record<string, unknown>>(sql: string, params?: readonly unknown[]): Promise<{ rows: T[] }>;
  release(): void;
}
export interface SqlPool {
  connect(): Promise<SqlClient>;
  query<T = Record<string, unknown>>(sql: string, params?: readonly unknown[]): Promise<{ rows: T[] }>;
}

/**
 * PostgreSQL append-only event adapter. The database migration enforces scoped
 * uniqueness. Compare-and-append takes a row lock on the run to serialize writers.
 * Caller-provided tenant/owner identities must come from verified authentication,
 * never request JSON or untrusted forwarding headers.
 */
export class PostgresEventAdapter implements DurableEventAdapter {
  constructor(private readonly pool: SqlPool) {}

  async append(scope: RunScope, expectedVersion: number, event: AgentEvent): Promise<AppendResult> {
    validateRunScope(scope);
    if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0) throw new Error("INVALID_EXPECTED_VERSION");
    const parsed = AgentEventSchema.parse(event);
    if (parsed.runId !== scope.runId) throw new Error("CROSS_RUN_EVENT");
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT set_config('app.tenant_id', $1, true), set_config('app.owner_id', $2, true)", [scope.tenantId, scope.ownerId]);
      // A run is created only within an already verified caller scope.
      await client.query(
        "INSERT INTO agent_hub.hub_runs (tenant_id, owner_id, run_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING",
        [scope.tenantId, scope.ownerId, scope.runId],
      );
      const lock = await client.query<{ current_version: number | string }>(
        "SELECT current_version FROM agent_hub.hub_runs WHERE tenant_id=$1 AND owner_id=$2 AND run_id=$3 FOR UPDATE",
        [scope.tenantId, scope.ownerId, scope.runId],
      );
      if (lock.rows.length !== 1) throw new Error("RUN_SCOPE_CONFLICT");
      if (Number(lock.rows[0].current_version) !== expectedVersion) throw new Error("VERSION_CONFLICT");
      await client.query(
        "INSERT INTO agent_hub.hub_run_events (tenant_id, owner_id, run_id, version, event_id, event_json) VALUES ($1,$2,$3,$4,$5,$6::jsonb)",
        [scope.tenantId, scope.ownerId, scope.runId, expectedVersion + 1, parsed.eventId, JSON.stringify(parsed)],
      );
      await client.query(
        "UPDATE agent_hub.hub_runs SET current_version=$4 WHERE tenant_id=$1 AND owner_id=$2 AND run_id=$3",
        [scope.tenantId, scope.ownerId, scope.runId, expectedVersion + 1],
      );
      await client.query("COMMIT");
      return { version: expectedVersion + 1, eventId: parsed.eventId };
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch { /* preserve original failure */ }
      throw error;
    } finally {
      client.release();
    }
  }

  async read(scope: RunScope): Promise<readonly AgentEvent[]> {
    validateRunScope(scope);
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN READ ONLY");
      await client.query("SELECT set_config(\'app.tenant_id\', $1, true), set_config(\'app.owner_id\', $2, true)", [scope.tenantId, scope.ownerId]);
      const result = await client.query<{ event_json: unknown }>(
        "SELECT event_json FROM agent_hub.hub_run_events WHERE tenant_id=$1 AND owner_id=$2 AND run_id=$3 ORDER BY version ASC",
        [scope.tenantId, scope.ownerId, scope.runId],
      );
      const events = result.rows.map(row => AgentEventSchema.parse(row.event_json));
      await client.query("COMMIT");
      return events;
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch { /* preserve failure */ }
      throw error;
    } finally { client.release(); }
  }
}
