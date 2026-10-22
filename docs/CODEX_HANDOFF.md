# Start here: Doings Agent Hub in Codex

## Open this project

Select the GitHub repository Marcwarn/agentdoingshub in Codex, or clone https://github.com/Marcwarn/agentdoingshub.git and open the project folder. Name the project and work thread **Doings Agent Hub – arkitektur och implementation**.

All current tracked project source is included: React/Vinext UI, server routes, integration contracts, D1 schema/migrations, twelve agent skills, sources, architecture, eval specifications and existing tests. Dependencies, personal session data and credentials are excluded.

The included SOURCE_HISTORY.bundle contains the project's Git commits. To restore history in the unpacked source directory, run:

```sh
git init
git fetch SOURCE_HISTORY.bundle main
git checkout -B main FETCH_HEAD
```

The files in the archive match this bundle. It has no configured external remote. You can also clone the bundle into another empty folder with `git clone SOURCE_HISTORY.bundle doings-agent-hub`.

## First prompt for Codex

> Fortsätt utveckla Doings Agent Hub i detta repo. Läs AGENTS.md, docs/CODEX_HANDOFF.md, docs/PROJECT_STATUS.md och den bindande agentarkitekturen först. Behåll de mänskliga avatarerna och deras namn. Chief of Staff ska samordna specialister genom typade uppgifter och överlämningar, Iris ska granska oberoende, och text och röst ska styra samma beständiga uppdrag. Kontrollera först vad som faktiskt fungerar i denna miljö. Koppla därefter in en verklig körmotor, beständiga uppdrag, riktiga integrationer och verkliga händelser i högerspalten. Följ verifierbara leveranser och skapa inga simulerade framsteg. Agent Hub ska kunna utföra många sorters konsultarbete; Alleima är inte ett låst första use case. Dokumentera framsteg och nästa steg i docs/PROJECT_STATUS.md så att arbetet går att återuppta utan den gamla chatten. Originalets Sites-publicering ska ligga kvar. Ge mig en tydlig sökväg till allt du skapar.

## Restore large files

Run `node scripts/restore-transfer.mjs` first. It reassembles SOURCE_HISTORY.bundle and public/agents/team-atlas.png from the small checked-in transfer-parts and verifies their SHA-256 hashes. Git history can then be inspected with `git bundle list-heads SOURCE_HISTORY.bundle`; the existing GitHub checkout already has its own import commits. Do not reset the GitHub branch to the bundle.

## Install and verify

Requires Node >=22.13 and pnpm 11.25.0, as specified in package.json.

```sh
pnpm install --frozen-lockfile
node scripts/validate-agent-skills.mjs
pnpm exec tsc --noEmit
pnpm build
pnpm dev
```

Clean checkouts default to the portable profile. Do not use the Linux-specific Sites installer for an ordinary macOS project. A successful local build does not confer Sites login, CRM, SharePoint or Slack access.

## What must be migrated deliberately

| Current dependency | Work required outside Sites |
| --- | --- |
| app/chatgpt-auth.ts | Replace platform-injected identity with verified authentication |
| lib/connector-context.ts and connector-contract.mts | Implement actual authorized provider adapters; do not expect plugins to inherit access |
| db/index.ts and D1 migrations | Decide whether to retain Cloudflare D1 or migrate storage |
| .openai/hosting.json and build/sites-* | Original Sites identity retained as provenance; independent deployment needs its own configuration |
| core/agents.ts | Disabled AI code must not be mistaken for an active production runtime |
| components/voice-controls.tsx | Browser dictation/read-aloud exists; true voice conversation remains to implement |

## Access incident

The original Site was published privately, but the user sees “Du har inte åtkomst till den här webbplatsen” while reporting the correct account and Doings workspace. Owner status was verified. The root cause was not established. Development in Codex avoids depending on that page to locate source; it does not repair the original Sites access control.

## Avoid losing continuity

Treat Git and docs/PROJECT_STATUS.md as the work record. Commit bounded completed work and record failed checks and blockers. The chat thread is supplementary context, not the only copy of decisions or deliverables.
