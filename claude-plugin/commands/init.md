---
description: Initialize VTodo in the current project
---

# Initialize VTodo

Initialize VTodo todo management system in the current project.

## Steps

**Step 1**: Check if vtodo is installed
```bash
npm list vtodo
```

**Step 2**: If not installed, install vtodo as a dev dependency
```bash
npm install -D vtodo
```

**Step 3**: Initialize VTodo in the project
```bash
npx vtodo init
```

This will create:
- `.vtodo/` directory for storing todos.json
- `todo/` directory for detailed markdown files

**Step 4**: Verify initialization
```bash
npx vtodo list
```

## After initialization

VTodo is ready to use:
- Add todos: `npx vtodo add "Task title"`
- List todos: `npx vtodo list`
- Update status: `npx vtodo status <id> <status>`
- Open visual kanban board: `npx vtodo web`

## Note

If the user wants to use vtodo across multiple projects, they can install it globally:
```bash
npm install -g vtodo
```

Then use `vtodo` directly without `npx`.