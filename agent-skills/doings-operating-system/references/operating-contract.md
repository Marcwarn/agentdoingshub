# Operating contract

## Delegation

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

## Handoff

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

A plan or draft is not evidence that an external action happened.
