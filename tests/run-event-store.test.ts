import test from "node:test";
import assert from "node:assert/strict";
import { InMemoryEventAdapter, RunEventStore } from "../core/run-event-store";

const store = () => new RunEventStore(new InMemoryEventAdapter());
const scope = { tenantId: "doings", ownerId: "alice", runId: "run-1" };
const event = (id: string) => ({
  type: "message" as const, eventId: id, runId: "run-1",
  threadId: "thread-1", agentId: "chief-of-staff",
  occurredAt: "2026-10-22T21:00:00.000Z",
  text: "A real recorded event", visibility: "internal" as const,
});

test("replay contains only committed events", async () => {
  const s = store();
  assert.equal((await s.replay(scope)).version, 0);
  assert.equal((await s.append(scope, 0, event("e1"))).version, 1);
  const snapshot = await s.replay(scope);
  assert.equal(snapshot.version, 1);
  assert.equal(snapshot.projection.messages.length, 1);
});

test("tenant, owner and run isolation", async () => {
  const s = store();
  await s.append(scope, 0, event("e1"));
  assert.equal((await s.replay({ ...scope, ownerId: "bob" })).version, 0);
  assert.equal((await s.replay({ ...scope, tenantId: "other" })).version, 0);
  assert.equal((await s.replay({ ...scope, runId: "other" })).version, 0);
});

test("reject stale versions and duplicate IDs", async () => {
  const s = store();
  await s.append(scope, 0, event("e1"));
  await assert.rejects(s.append(scope, 0, event("e2")), /VERSION_CONFLICT/);
  await assert.rejects(s.append(scope, 1, event("e1")), /DUPLICATE_EVENT_ID/);
});

test("invalid scope and wrong run fail before storage", async () => {
  const s = store();
  await assert.rejects(s.append({ ...scope, ownerId: "" }, 0, event("e1")), /INVALID_RUN_SCOPE/);
  await assert.rejects(s.append(scope, 0, { ...event("e1"), runId: "other" }), /CROSS_RUN_EVENT/);
});
