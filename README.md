# Doings Agent Hub

Start with [AGENTS.md](AGENTS.md) and [Codex handoff](docs/CODEX_HANDOFF.md).

## First checkout

Two large binary files are stored in small, lossless transfer parts to avoid the conversation upload limit. Restore the original avatar image and Git history before installing dependencies:

```sh
node scripts/restore-transfer.mjs
```

The script verifies SHA-256 hashes before writing either file. All application source, skills, contracts and eval definitions are stored normally. Original Git history is retained in the reconstructed SOURCE_HISTORY.bundle.

Private read-only Sites pilot. TypeScript / React / Vinext, isolated D1 metadata, per-request CRM and SharePoint adapters, shared core for web and MCP. AI synthesis disabled while key is deferred. No simulated production data.

## Run and check
Use Sites install-dependencies helper. Dev: pnpm dev. Typecheck: pnpm exec tsc --noEmit. Build: Sites build-site helper. Schema: pnpm db:generate, never edit applied migrations. Publication requires pushed source and matching built archive via Sites workflow.

Bundle tests/core.test.ts with esbuild for Node ESM, then node --test. tests/live-readcheck.ts is an authoring-only native-tool relay, not a hosted credential bridge.

## Runtime
Only CRM/SharePoint read-only declarations. Sites supplies identity and visitor consent. OPENAI_API_KEY absent; use ignored .env.local locally and secure Sites runtime config upon activation. Verify model access. Adding a key alone does not enable AI: core/agents.ts remains unexposed pending grounding/security checks.

## MCP
POST /mcp: initialize, tools/list, tools/call, ping. Sites manages OAuth. Six tool schemas share core logic; descriptions disclose partial discovery and disabled synthesis. get_task_status/list_knowledge_gaps return caller-owned metadata. Unknown tools and unauthenticated data fail closed.

## Boundaries
Separate Sites repository/database/deployment. GitHub, Vercel, PostgreSQL, Entra outstanding. See docs/ARCHITECTURE.md and docs/EVALUATION.md.

## Slack update
Public-channel message search is now included via the current visitor binding, in parallel with other sources. The public-only action is server-owned, limited to 8 results, context disabled. Private channels/DMs and all writes remain excluded. Messages stay in the current response, not durable history. Slack posts are attributed source statements, not independently verified facts. Native live search verified; hosted visitor path remains unverified.
