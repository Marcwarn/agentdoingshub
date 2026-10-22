# Doings Agent Hub — strict agent architecture

Status: binding architecture  
Last reviewed: 2026-10-13

Doings presents specialists as human, approachable avatars. Their identity is the interface to a real versioned agent configuration, not a substitute for execution.

## Agent definition

Every agent has six separately versioned parts:

1. **Identity** — name, avatar, voice, tone, specialty, and description.
2. **Instructions** — a short system contract describing behavior and boundaries.
3. **Skills** — discoverable workflow knowledge loaded only when relevant.
4. **Capabilities** — typed tools and MCP adapters with explicit read, draft, or act authority.
5. **Runtime** — session, thread, context, sandbox, approvals, retries, and recovery.
6. **Evaluation** — task cases and graders that verify outcomes and trajectories.

Changing an avatar must not change authority. Changing a skill must not silently expand tool access.

## Runtime topology

Chief of Staff owns the primary session thread. It frames the goal, creates a dependency graph, assigns specialists, tracks decisions, and synthesizes the result.

Each specialist works in a separate child thread. Independent tasks may run concurrently. Child-thread events power the live activity panel. The interface must never invent dialogue or progress that does not exist in the event log.

Iris is the evaluator. For consequential deliverables, Iris receives the task contract, artifact, evidence, and tool receipts. Iris cannot approve work Iris authored.

## Interaction model

Voice and text enter the same durable run. A voice turn may start, steer, pause, or review work. Switching modality must not create separate memory or duplicate actions.

The interface exposes:

- who owns each task;
- what each agent is doing;
- evidence and artifacts;
- blockers and missing capabilities;
- decisions or approvals needed;
- verified external actions and receipts.

## Universal lifecycle

1. **Frame** — goal, success criteria, constraints, deadline, and authority.
2. **Plan** — dependency graph with one owner and acceptance criteria per task.
3. **Discover** — load only relevant skills, references, and tools.
4. **Execute** — run bounded tasks; parallelize only independent work.
5. **Handoff** — return the typed handoff contract.
6. **Synthesize** — reconcile evidence, conflicts, and tradeoffs.
7. **Evaluate** — run deterministic checks and Iris review.
8. **Decide** — request only material user decisions or required approval.
9. **Act** — perform approved external actions and record receipts.
10. **Learn** — turn failures and corrections into eval cases.

## State and recovery

The append-only event stream is the source of truth. Materialized views may summarize tasks, artifacts, and decisions, but must be reproducible from events.

Run states: `queued`, `working`, `waiting_on_dependency`, `needs_review`, `needs_user_decision`, `blocked_missing_capability`, `completed`, `failed`, and `cancelled`.

`completed` requires an artifact, verified state change, or external receipt. Generated prose is never evidence that an external action happened.

## Task contract

```yaml
task_id: stable-id
run_id: stable-id
goal: observable outcome
owner: agent-id
inputs: []
constraints: []
acceptance_criteria: []
dependencies: []
allowed_capabilities: []
authority: read | draft | act-with-approval | act
deadline: optional ISO-8601
```

## Handoff contract

```yaml
task_id: stable-id
status: completed | needs-review | blocked | failed
summary: concise result
artifacts: []
evidence:
  - claim: supported statement
    source: canonical reference
    observed_at: ISO-8601
    confidence: high | medium | low
assumptions: []
risks: []
decisions_needed: []
recommended_next_action: concrete next step
next_owner: agent-id | chief-of-staff | user
```

## Capability policy

Tools are narrow capabilities such as `search_knowledge`, `read_crm`, `draft_email`, `send_email`, `create_calendar_event`, or `publish_content`.

- Read, draft, and act are separate permissions.
- Every side effect uses an idempotency key.
- Retries must not duplicate external actions.
- Credentials remain outside model-controlled compute.
- Missing access produces `blocked_missing_capability`.
- External communication, publication, financial commitment, destructive change, and access change require explicit authority.

## Skills policy

Skills are concise and workflow-specific. Frontmatter describes what the skill does and when to load it. Details live in references or executable scripts and load only when needed.

Skills must not repeat generic model behavior, contain large persona biographies, grant tool authority, hard-code one use case as the agent's identity, or claim success without verification.

## Evaluation policy

Every agent must have outcome checks, trajectory and tool-selection checks, handoff-schema checks, permission checks, efficiency budgets, ambiguous cases, and a blocked-capability case.

Evaluate at three levels: direct capability tests, standalone agent runs, and the real Agent Hub harness. Passing in isolation does not prove production behavior.

See [AGENT_ARCHITECTURE_SOURCES.md](AGENT_ARCHITECTURE_SOURCES.md). Architectural changes require a source, dated claim, affected requirement, migration note, and regression eval.
