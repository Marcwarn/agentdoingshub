import { z } from "zod";

export const AgentAuthoritySchema = z.enum([
  "read",
  "draft",
  "act-with-approval",
  "act",
]);

export const RunStateSchema = z.enum([
  "queued",
  "working",
  "waiting_on_dependency",
  "needs_review",
  "needs_user_decision",
  "blocked_missing_capability",
  "completed",
  "failed",
  "cancelled",
]);

export const EvidenceItemSchema = z.object({
  claim: z.string().min(1),
  source: z.string().min(1),
  observedAt: z.string().datetime(),
  confidence: z.enum(["high", "medium", "low"]),
});

export const TaskContractSchema = z.object({
  taskId: z.string().min(1),
  runId: z.string().min(1),
  goal: z.string().min(1),
  owner: z.string().min(1),
  inputs: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  acceptanceCriteria: z.array(z.string()).min(1),
  dependencies: z.array(z.string()).default([]),
  allowedCapabilities: z.array(z.string()).default([]),
  authority: AgentAuthoritySchema,
  deadline: z.string().datetime().optional(),
});

export const ActionReceiptSchema = z.object({
  capability: z.string().min(1),
  action: z.string().min(1),
  idempotencyKey: z.string().min(1),
  externalId: z.string().min(1).optional(),
  verifiedAt: z.string().datetime(),
});

export const HandoffContractSchema = z
  .object({
    taskId: z.string().min(1),
    status: z.enum(["completed", "needs-review", "blocked", "failed"]),
    summary: z.string().min(1),
    artifacts: z.array(z.string()).default([]),
    evidence: z.array(EvidenceItemSchema).default([]),
    receipts: z.array(ActionReceiptSchema).default([]),
    assumptions: z.array(z.string()).default([]),
    risks: z.array(z.string()).default([]),
    decisionsNeeded: z.array(z.string()).default([]),
    recommendedNextAction: z.string().min(1),
    nextOwner: z.string().min(1),
  })
  .superRefine((handoff, context) => {
    if (
      handoff.status === "completed" &&
      handoff.artifacts.length === 0 &&
      handoff.receipts.length === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Completed work requires an artifact or verified action receipt.",
        path: ["status"],
      });
    }
  });

const BaseEventSchema = z.object({
  eventId: z.string().min(1),
  runId: z.string().min(1),
  threadId: z.string().min(1),
  agentId: z.string().min(1),
  occurredAt: z.string().datetime(),
});

export const AgentEventSchema = z.discriminatedUnion("type", [
  BaseEventSchema.extend({
    type: z.literal("task_status_changed"),
    taskId: z.string().min(1),
    status: RunStateSchema,
  }),
  BaseEventSchema.extend({
    type: z.literal("message"),
    text: z.string().min(1),
    visibility: z.enum(["user", "team", "internal"]),
  }),
  BaseEventSchema.extend({
    type: z.literal("artifact_created"),
    taskId: z.string().min(1),
    artifactId: z.string().min(1),
    title: z.string().min(1),
  }),
  BaseEventSchema.extend({
    type: z.literal("decision_requested"),
    taskId: z.string().min(1),
    question: z.string().min(1),
  }),
  BaseEventSchema.extend({
    type: z.literal("capability_blocked"),
    taskId: z.string().min(1),
    capability: z.string().min(1),
    reason: z.string().min(1),
  }),
  BaseEventSchema.extend({
    type: z.literal("action_verified"),
    taskId: z.string().min(1),
    receipt: ActionReceiptSchema,
  }),
]);

export type AgentAuthority = z.infer<typeof AgentAuthoritySchema>;
export type RunState = z.infer<typeof RunStateSchema>;
export type TaskContract = z.infer<typeof TaskContractSchema>;
export type HandoffContract = z.infer<typeof HandoffContractSchema>;
export type AgentEvent = z.infer<typeof AgentEventSchema>;
