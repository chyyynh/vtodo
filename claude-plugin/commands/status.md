---
description: Update the status of a todo
---

# Update Todo Status

Update the status of a todo item between pending, in-progress, and completed.

## Usage

```bash
# Update to in-progress
npx vtodo status <id> in-progress

# Update to pending
npx vtodo status <id> pending

# Update to completed
npx vtodo status <id> completed
```

## Shortcuts

For common status changes:

```bash
# Mark as done (completed)
npx vtodo done <id>

# Reopen todo (back to pending)
npx vtodo undo <id>
```

## Examples

```bash
# Start working on todo #3
npx vtodo status 3 in-progress

# Complete todo #5
npx vtodo done 5

# Reopen todo #2 for more work
npx vtodo undo 2
```

## Workflow Tips

1. When starting a task: `npx vtodo status <id> in-progress`
2. While working: Check progress with `npx vtodo show <id>`
3. When finished: `npx vtodo done <id>`
4. If need to resume: `npx vtodo undo <id>` then `npx vtodo status <id> in-progress`

Use `npx vtodo list` to see all todos and their current status.
