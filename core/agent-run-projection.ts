import { z } from "zod";
import { AgentEventSchema, RunStateSchema, type AgentEvent, type RunState } from "./agent-runtime-contracts";

export const StoredAgentEventSchema = AgentEventSchema;
export type StoredAgentEvent = z.infer<typeof StoredAgentEventSchema>;

export type RunProjection = {
  runId: string;
  lastEventAt: string | null;
  taskStates: Record<string, RunState>;
  artifacts: Record<string, { taskId: string; title: string }>;
  pendingDecisions: Record<string, string>;
  verifiedActions: string[];
  messages: Array<{ eventId: string; agentId: string; text: string; visibility: "user" | "team" | "internal" }>;
  blockedCapabilities: Record<string, { capability: string; reason: string }>;
};

export function projectRunEvents(runId: string, rawEvents: readonly unknown[]): RunProjection {
  if (!runId) throw new Error("RUN_ID_REQUIRED");
  const projection: RunProjection = {
    runId, lastEventAt: null, taskStates: {}, artifacts: {},
    pendingDecisions: {}, verifiedActions: [], messages: [], blockedCapabilities: {},
  };
  const seenEvents = new Set<string>();
  const seenReceipts = new Set<string>();
  let previousTime = "";
  for (const raw of rawEvents) {
    const event: AgentEvent = StoredAgentEventSchema.parse(raw);
    if (event.runId !== runId) throw new Error("CROSS_RUN_EVENT");
    if (seenEvents.has(event.eventId)) throw new Error("DUPLICATE_EVENT_ID");
    if (previousTime && event.occurredAt < previousTime) throw new Error("OUT_OF_ORDER_EVENT");
    previousTime = event.occurredAt;
    seenEvents.add(event.eventId);
    projection.lastEventAt = event.occurredAt;

    switch (event.type) {
      case "task_status_changed": {
        RunStateSchema.parse(event.status);
        if (event.status === "completed") {
          const hasArtifact = Object.values(projection.artifacts).some(a => a.taskId === event.taskId);
          const hasReceipt = projection.verifiedActions.some(key => key.startsWith(event.taskId + ":"));
          if (!hasArtifact && !hasReceipt) throw new Error("UNVERIFIED_COMPLETION");
        }
        projection.taskStates[event.taskId] = event.status;
        break;
      }
      case "artifact_created":
        if (projection.artifacts[event.artifactId]) throw new Error("DUPLICATE_ARTIFACT");
        projection.artifacts[event.artifactId] = { taskId: event.taskId, title: event.title };
        break;
      case "decision_requested":
        projection.pendingDecisions[event.taskId] = event.question;
        break;
      case "capability_blocked":
        projection.blockedCapabilities[event.taskId] = { capability: event.capability, reason: event.reason };
        projection.taskStates[event.taskId] = "blocked_missing_capability";
        break;
      case "action_verified": {
        const key = event.receipt.idempotencyKey;
        if (seenReceipts.has(key)) throw new Error("DUPLICATE_ACTION_RECEIPT");
        seenReceipts.add(key);
        projection.verifiedActions.push(event.taskId + ":" + key);
        break;
      }
      case "message":
        projection.messages.push({ eventId: event.eventId, agentId: event.agentId, text: event.text, visibility: event.visibility });
        break;
    }
  }
  return projection;
}
