# Agent architecture source ledger

Last reviewed: 2026-10-13

| Source | Freshness | Evidence used | Binding decision |
| --- | --- | --- | --- |
| [OpenAI API changelog](https://developers.openai.com/api/docs/changelog) | 2026-09-10 | Agents API provides durable sessions, orchestration, compaction, recovery, progress streaming, tools, MCP, and replaceable sandboxes | Use durable sessions and event streaming; keep compute replaceable |
| [OpenAI API changelog — GPT-Live 1](https://developers.openai.com/api/docs/changelog) | 2026-09-10 | Full-duplex voice continues while a backend agent handles reasoning and tools | Voice and text steer the same run |
| [OpenAI: Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra) | 2026-09-11 | Capable models need less handholding and less accumulated instruction context | Keep skills small, specific, and regularly pruned |
| [OpenAI: Harness-aware evaluation of plugins](https://developers.openai.com/cookbook/examples/partners/harness_aware_plugin_evals/harness_aware_plugin_evals) | 2026-09-23 | Isolated success does not transfer automatically into a product harness | Test capabilities, standalone runs, and Agent Hub end to end |
| [OpenAI: Codex as a platform](https://developers.openai.com/blog/codex-as-a-platform) | 2026-08-19 | The agent loop owns state, tools, progress, failures, approvals, and results while products retain their interface | Keep avatar experience separate from the harness |
| [OpenAI: Skills](https://developers.openai.com/api/docs/guides/tools-skills) | current 2026-10-13 | Agents API discovers skill directories through capability directories | Store portable Agent Skills in versioned directories |
| [Anthropic: Define your agent](https://platform.claude.com/docs/en/managed-agents/agent-setup) | current 2026-10-13 | A versioned agent bundles persona, model, tools, MCP servers, skills, and multiagent configuration | Maintain a versioned registry with separate identity and capabilities |
| [Anthropic Managed Agents API](https://platform.claude.com/docs/en/api/python/beta/agents/create) | `multiagent_20261001` | Coordinator topology supports subagents, workflows, and advisor models | Chief of Staff owns the primary thread and delegates through dynamic workflows |
| [Anthropic: Session threads](https://platform.claude.com/docs/en/managed-agents/session-threads) | current 2026-10-13 | Each child thread has its own event stream and preview | Drive the live panel from real child-thread events |
| [Anthropic: Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) | current 2026-10-13 | Skills are modular, filesystem-based, composable, and progressively disclosed | Use small SKILL.md files with on-demand references and scripts |
| [Anthropic: Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) | current 2026-10-13 | Effective skills are concise, structured, discoverable, and tested | Validate structure and forward-test realistic tasks |

Older sources may explain lineage but cannot override these current requirements.
