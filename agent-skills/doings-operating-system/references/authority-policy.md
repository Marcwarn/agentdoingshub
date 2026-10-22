# Authority policy

Use the least authority required.

| Level | Permitted behavior |
| --- | --- |
| `read` | Search and inspect authorized sources |
| `draft` | Create internal drafts and recommendations |
| `act-with-approval` | Prepare an external action and wait for approval |
| `act` | Execute the specifically authorized action and store its receipt |

Require review before external communication, publication, financial commitment, destructive change, access change, or a high-impact decision with material ambiguity. Do not request approval again when the run already contains explicit authorization for the exact action.

If a capability is unavailable, return `blocked_missing_capability`, name the missing adapter, and preserve completed work.
