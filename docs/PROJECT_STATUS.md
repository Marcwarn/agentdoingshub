# Doings Agent Hub – project status

Updated: 2026-10-22, Europe/Stockholm.

## Delivered

- Original source preserved through Sites version 8, source commit 6b3245e2faf7f0195f6ecf1f75c43742175fca14.
- Independent Codex development copy with project source and Git history.
- Twelve skills: common operating system, Chief of Staff and ten specialists.
- Binding architecture, primary-source ledger, agent registry, Zod contracts and twelve eval specifications.
- Agentramverk UI with access to the saved framework and downloads.
- Browser speech recognition and read-aloud controls.
- Existing read-only CRM/SharePoint/Slack integration contracts and owner-scoped metadata routes.

## Verification

The original source passed TypeScript, framework structural validation and production build. The framework download was checked against all 34 exported files. The Codex package is checked for snapshot consistency and Git bundle validity. No fresh dependency install or portable deployment has been performed in the independent copy.

## Open defects and limits

- Sites page denies access to the user; owner status is confirmed, root cause unknown.
- CRM invocation returned tool_not_found for search_customers. Tool name / connector compatibility must be verified against actual accessible tools.
- No model credentials are configured; no API key has been created by this thread.
- No active AI conversation, durable job runner, runtime use of specialist skills, child-thread streams or full voice conversation.
- The eval cases have not been executed as live agent tasks.
- Sites authentication and delegated connectors are platform dependencies, not portable credentials.

## Next action

Open the exported source directory in Codex, read AGENTS.md and CODEX_HANDOFF.md, install pinned dependencies, and verify the baseline. Then make a concrete runtime/auth/integration migration plan from the binding contracts and implement it incrementally. Record results here at each completed step.

## GitHub handoff — 2026-10-22

- Project recovered from the preserved Codex export and prepared for Marcwarn/agentdoingshub. The user explicitly authorized public publication.
- Original Git history is retained in SOURCE_HISTORY.bundle; the GitHub import uses a snapshot commit.
- Re-ran the skill validator: 12 skills and 12 eval definitions passed structural validation. Scanned current files and bundled history for common private key and API token patterns; no matches found.
- No application changes, dependency install, new production build or deployment were performed during this transfer. Runtime and integration limitations above still apply.
- Continue in Codex from AGENTS.md and docs/CODEX_HANDOFF.md.

## Batched transfer

Two large binary files are preserved as base64 chunks under transfer-parts/. Run node scripts/restore-transfer.mjs after checkout to restore the avatar atlas and original Git bundle. Both are verified against SHA-256 hashes. Application source and instructions remain ordinary files.

## Completed GitHub verification — 2026-10-22

- All 45 upload batches are committed to main in public Marcwarn/agentdoingshub; complete import commit dd0b9e06c1615cbec6f70f7e5716ff1338d49c53.
- Cloned GitHub independently and compared all 261 uploaded files byte for byte against the prepared batches: exact match.
- Ran scripts/restore-transfer.mjs on that fresh checkout: both original binaries restored with matching SHA-256 hashes.
- git bundle verify confirms complete original history. Skills validator passed 12 skills and 12 eval definitions; these remain structural checks, not live agent runs.
- Fresh dependency installation, TypeScript check, production build and independent application deployment remain pending.
- Next: open Marcwarn/agentdoingshub in Codex, run node scripts/restore-transfer.mjs, read AGENTS.md and docs/CODEX_HANDOFF.md, then verify the portable baseline before implementing the runtime.
