---
description: Add a new todo to the project
---

# Add New Todo

Add a new todo to your project's task list.

## Usage

Ask the user for the todo details, then run:

```bash
npx vtodo add "Todo title" --description "Description" --tags tag1,tag2 --expected 2h
```

## Options

- `--description, -d`: Detailed description of the todo
- `--tags, -t`: Comma-separated tags (e.g., "frontend,ui" or "backend,api")
- `--expected, -e`: Expected time to complete (e.g., "2h", "30min", "1d")
- `--detail`: Create a detailed markdown file in `todo/` directory

## Examples

```bash
# Simple todo
npx vtodo add "Fix login bug"

# Todo with full details
npx vtodo add "Implement user dashboard" \
  --description "Create a dashboard showing user statistics and recent activity" \
  --tags frontend,ui,react \
  --expected 4h \
  --detail

# Backend task
npx vtodo add "Optimize database queries" \
  --tags backend,performance \
  --expected 3h
```

After adding, you can:
- View with `npx vtodo list`
- Edit details with `npx vtodo edit <id>`
- Update status with `npx vtodo status <id> in-progress`
