---
name: vtodo
description: Manage VTodo tasks - list todos, add new tasks, update status, and open kanban board. Use when user wants to view/create/update todos or manage project tasks.
---

# VTodo Task Management

This skill helps manage VTodo tasks through Claude Code.

## Available Commands

### List Todos
View all todos in the project:
```bash
npx vtodo list
```

### Add New Todo
When user describes what they want to accomplish:
1. Auto-generate: title, description, tags, time estimate
2. Create todo:
```bash
npx vtodo add "[Title]" -d "[Description]" -t [tags] -e [time] --detail
```
3. Edit `todo/[ID]-todo.md` with:
```markdown
# [Title]

## Context
[Why needed, problem it solves]

## Acceptance Criteria
- [ ] [Specific criterion]
- [ ] [Specific criterion]

## Implementation Steps
1. [Detailed step]
2. [Detailed step]

## Technical Notes
- [Key considerations]
- [Related files]

## Resources
- [Relevant docs]
```

### Update Status
Change todo status:
```bash
npx vtodo status [ID] [pending|in-progress|completed]
```

### Open Kanban Board
Launch visual board:
```bash
npx vtodo web
```

## Usage Examples

- "Show me all todos" → list
- "Add a task to research authentication" → add with auto-generated details
- "Mark todo 5 as completed" → status update
- "Open the todo board" → web interface
