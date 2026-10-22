import { AgentEventSchema, type AgentEvent } from "./agent-runtime-contracts";
import { projectRunEvents, type RunProjection } from "./agent-run-projection";

/**
 * Storage contract only. An adapter must persist committed events atomically and
 * constrain every read and write by tenant AND owner. This module does not
 * instantiate a database, worker or privileged service.
 */
export type RunScope = Readonly<{ tenantId: string; ownerId: string; runId: string }>;
export type AppendResult = Readonly<{ version: number; eventId: string }>;

export interface DurableEventAdapter {
  /** Compare-and-append. Reject stale versions rather than silently overwriting. */
  append(scope: RunScope, expectedVersion: number, event: AgentEvent): Promise<AppendResult>;
  /** Return only events belonging to this exact trusted scope, in append order. */
  read(scope: RunScope): Promise<readonly AgentEvent[]>;
}

export function validateRunScope(scope: RunScope): void {
  if (![scope.tenantId, scope.ownerId, scope.runId].every(v => typeof v === "string" && v.trim().length > 0))
    throw new Error("INVALID_RUN_SCOPE");
}

export class RunEventStore {
  constructor(private readonly adapter: DurableEventAdapter) {}

  async append(scope: RunScope, expectedVersion: number, rawEvent: unknown): Promise<AppendResult> {
    validateRunScope(scope);
    if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0) throw new Error("INVALID_EXPECTED_VERSION");
    const event = AgentEventSchema.parse(rawEvent);
    if (event.runId !== scope.runId) throw new Error("CROSS_RUN_EVENT");
    return this.adapter.append(scope, expectedVersion, event);
  }

  async replay(scope: RunScope): Promise<{ version: number; projection: RunProjection }> {
    validateRunScope(scope);
    const events = await this.adapter.read(scope);
    return { version: events.length, projection: projectRunEvents(scope.runId, events) };
  }
}

/**
 * Test-only adapter; NEVER use this in production as a persistence mechanism.
 * A production adapter must use a database transaction with a unique constraint
 * on (tenant_id, owner_id, run_id, version) and unique event IDs in scope.
 */
export class InMemoryEventAdapter implements DurableEventAdapter {
  private readonly streams = new Map<string, AgentEvent[]>();

  private key(scope: RunScope): string {
    validateRunScope(scope);
    return JSON.stringify([scope.tenantId, scope.ownerId, scope.runId]);
  }

  async append(scope: RunScope, expectedVersion: number, event: AgentEvent): Promise<AppendResult> {
    const key = this.key(scope);
    const current = this.streams.get(key) ?? [];
    if (current.length !== expectedVersion) throw new Error("VERSION_CONFLICT");
    if (current.some(existing => existing.eventId === event.eventId)) throw new Error("DUPLICATE_EVENT_ID");
    projectRunEvents(scope.runId, [...current, event]);
    this.streams.set(key, [...current, event]);
    return { version: current.length + 1, eventId: event.eventId };
  }

  async read(scope: RunScope): Promise<readonly AgentEvent[]> {
    return [...(this.streams.get(this.key(scope)) ?? [])];
  }
}
