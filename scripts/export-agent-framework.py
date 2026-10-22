"""Export the versioned framework as view data and a downloadable source bundle."""
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
paths = [root / 'docs/AGENT_FRAMEWORK_RECOVERY.md', root / 'docs/AGENT_ARCHITECTURE.md', root / 'docs/AGENT_ARCHITECTURE_SOURCES.md', root / 'core/agent-skill-registry.ts', root / 'core/agent-runtime-contracts.ts', root / 'scripts/validate-agent-skills.mjs']
paths += sorted(p for p in (root / 'agent-skills').rglob('*') if p.is_file())
files = [{'path': str(p.relative_to(root)), 'text': p.read_text()} for p in paths]
(root / 'core/agent-framework-content.json').write_text(json.dumps({'restoredFrom': 'b35d8329ffdc86b6d53edfabb00fedfb852305f6', 'restoredAt': '2026-10-13', 'files': files}, ensure_ascii=False, indent=2) + '\n')
out = root / 'public/framework'
out.mkdir(parents=True, exist_ok=True)
with ZipFile(out / 'doings-agent-framework.zip', 'w', ZIP_DEFLATED) as archive:
    for item in files:
        archive.writestr('doings-agent-framework/' + item['path'], item['text'])
    archive.writestr('doings-agent-framework/START-HERE.md', files[0]['text'])
sections = [files[0]['text'], '\n---\n\n# Originalfiler\n']
for item in files[1:]:
    sections.append('\n---\n\n## ' + item['path'] + '\n\n' + item['text'])
(out / 'doings-agent-framework.md').write_text('\n'.join(sections))
print(f'Exported {len(files)} source files; {sum(p["path"].endswith("SKILL.md") for p in files)} skills.')
