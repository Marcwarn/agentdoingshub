import test from "node:test";
import assert from "node:assert/strict";
import { projectRunEvents } from "../core/agent-run-projection";

const base = { runId: "run1", threadId: "thread1", agentId: "chief", occurredAt: "2026-10-22T20:00:00.000Z" };
const event = (eventId: string, values: Record<string, unknown>) => ({ ...base, eventId, ...values });

test("unverified completion is rejected", () => {
  assert.throws(() => projectRunEvents("run1", [
    event("1", { type: "task_status_changed", taskId: "t1", status: "completed" }),
  ]), /UNVERIFIED_COMPLETION/);
});

test("artifact and verified receipt allow grounded completion", () => {
  const p = projectRunEvents("run1", [
    event("1", { type: "artifact_created", taskId: "t1", artifactId: "a1", title: "Report" }),
    event("2", { type: "task_status_changed", taskId: "t1", status: "completed" }),
    event("3", { type: "action_verified", taskId: "t2", receipt: { capability: "crm", action: "update", idempotencyKey: "k2", verifiedAt: base.occurredAt } }),
    event("4", { type: "task_status_changed", taskId: "t2", status: "completed" }),
  ]);
  assert.equal(p.taskStates.t1, "completed");
  assert.equal(p.taskStates.t2, "completed");
  assert.equal(p.artifacts.a1.title, "Report");
});

test("reject cross-run, duplicate and out of order events", () => {
  const first = event("1", { type: "message", text: "Working", visibility: "user" });
  assert.throws(() => projectRunEvents("run1", [{ ...first, runId: "other" }]), /CROSS_RUN_EVENT/);
  assert.throws(() => projectRunEvents("run1", [first, first]), /DUPLICATE_EVENT_ID/);
  assert.throws(() => projectRunEvents("run1", [{ ...first, occurredAt: "2026-10-22T21:00:00.000Z" }, event("2", { type: "message", text: "Old", visibility: "internal" })]), /OUT_OF_ORDER_EVENT/);
});

test("blocked capabilities are visible and no activity is fabricated", () => {
  const p = projectRunEvents("run1", [
    event("1", { type: "capability_blocked", taskId: "t1", capability: "sharepoint", reason: "No delegated token" }),
  ]);
  assert.equal(p.taskStates.t1, "blocked_missing_capability");
  assert.equal(p.messages.length, 0);
});

test("reject duplicate verified external actions", () => {
  const receipt = { capability: "email", action: "send", idempotencyKey: "same", verifiedAt: base.occurredAt };
  assert.throws(() => projectRunEvents("run1", [
    event("1", { type: "action_verified", taskId: "t1", receipt }),
    event("2", { type: "action_verified", taskId: "t1", receipt }),
  ]), /DUPLICATE_ACTION_RECEIPT/);
});
