import test from "node:test";
import assert from "node:assert/strict";
import { PostgresEventAdapter, type SqlClient, type SqlPool } from "../core/postgres-event-adapter";

const scope = { tenantId: "doings", ownerId: "alice", runId: "run1" };
const event = { type: "message" as const, runId: "run1", eventId: "e1", threadId: "t1", agentId: "chief", occurredAt: "2026-10-22T20:00:00.000Z", text: "Started", visibility: "internal" as const };

test("transactional append uses scope, version and committed receipt", async () => {
  const statements: Array<{ sql: string; params: readonly unknown[] }> = [];
  const client: SqlClient = {
    async query(sql, params = []) {
      statements.push({ sql, params });
      return { rows: sql.startsWith("SELECT current_version") ? [{ current_version: 0 }] : [] } as any;
    },
    release() { statements.push({ sql: "RELEASE", params: [] }); },
  };
  const pool: SqlPool = { async connect() { return client; }, async query() { return { rows: [] }; } };
  const receipt = await new PostgresEventAdapter(pool).append(scope, 0, event);
  assert.deepEqual(receipt, { version: 1, eventId: "e1" });
  assert.ok(statements.some(x => x.sql === "COMMIT"));
  assert.deepEqual(statements.find(x => x.sql.startsWith("SELECT current_version"))?.params, ["doings", "alice", "run1"]);
  assert.equal(statements.at(-1)?.sql, "RELEASE");
});

test("stale append rolls back and releases connection", async () => {
  const statements: string[] = [];
  const client: SqlClient = {
    async query(sql) {
      statements.push(sql);
      return { rows: sql.startsWith("SELECT current_version") ? [{ current_version: 2 }] : [] } as any;
    },
    release() { statements.push("RELEASE"); },
  };
  const pool: SqlPool = { async connect() { return client; }, async query() { return { rows: [] }; } };
  await assert.rejects(new PostgresEventAdapter(pool).append(scope, 0, event), /VERSION_CONFLICT/);
  assert.ok(statements.includes("ROLLBACK"));
  assert.ok(!statements.includes("COMMIT"));
  assert.equal(statements.at(-1), "RELEASE");
});

test("reads use full scope and validate persisted events", async () => {
  let params: readonly unknown[] = [];
  const pool: SqlPool = {
    async connect() { throw new Error("not used"); },
    async query(_sql, values) { params = values ?? []; return { rows: [{ event_json: event }] } as any; },
  };
  const rows = await new PostgresEventAdapter(pool).read(scope);
  assert.equal(rows.length, 1);
  assert.deepEqual(params, ["doings", "alice", "run1"]);
});
