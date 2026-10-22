# Doings Agent Hub – Codex workspace

Run `node scripts/restore-transfer.mjs` on a fresh checkout, then start with docs/CODEX_HANDOFF.md. This is an independent development copy of the Sites source, not a newly deployed application.

## User requirements

Preserve the named human avatars and all eleven agent identities. Chief of Staff coordinates; specialists own bounded work; Iris reviews independently. Support multiple kinds of work, not a hard-coded Alleima workshop. Match the usability ambition of ChatGPT, including genuine voice conversation connected to the same durable run as text.

The user has repeatedly lost the work thread. Keep progress, decisions, blockers, verification and the next action in docs/PROJECT_STATUS.md. Keep all source and agent instructions in Git. Always provide a concrete location for deliverables.

## Read first

- docs/AGENT_ARCHITECTURE.md: binding architecture.
- docs/AGENT_ARCHITECTURE_SOURCES.md: dated primary sources.
- agent-skills/doings-operating-system/SKILL.md and its references.
- core/agent-skill-registry.ts and core/agent-runtime-contracts.ts.

Load specialist skills only when needed. These files are project runtime assets; they are not automatically installed in Codex merely by existing here.

## Current constraints

AI runtime, durable worker jobs, child-thread streaming and full voice conversation are not implemented. Do not represent source definitions as working agents. Twelve eval specifications are not twelve passed agent runs. An external action is complete only with an actual verified receipt.

Sites identity headers, connector bindings, D1 and private hosting do not automatically transfer to another provider. Preserve per-user authorization. Never trust user-supplied identity headers on an independently hosted deployment.

There is no configured OpenAI key in this snapshot. The user authorized creating a new key, but its storage destination has not been confirmed. Use secure provisioning if needed; never place credentials in Git, downloads or output.

Do not deploy to the original Sites project from this copy or broaden its audience unless explicitly requested. Do not replace frameworks or infrastructure merely for convenience. Prepare a concrete migration after inspecting the current implementation.

## Checks

Use the package's pinned pnpm version and Node >=22.13. Run node scripts/validate-agent-skills.mjs and pnpm exec tsc --noEmit. Build with pnpm build after dependency installation. The source build passed before export; this does not prove the application works outside Sites.

Update the progress record and commit completed changes. Add an external remote only when the user supplies or authorizes the repository destination. The included Git bundle can restore all source history independently of Sites.
