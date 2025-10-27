---
description: List all todos in the project
---

# List All Todos

Display all todos in the current project, organized by status.

Run the following command:

```bash
npx vtodo list
```

This will show:
- **Pending** todos (not started)
- **In Progress** todos (currently working on)
- **Completed** todos (finished tasks)

Each todo displays:
- ID number
- Title
- Tags
- Expected time
- Created/updated timestamps

## Tips

- Use the todo IDs to manage tasks:
  - `npx vtodo show <id>` - View details
  - `npx vtodo status <id> in-progress` - Update status
  - `npx vtodo done <id>` - Mark as complete
  - `npx vtodo edit <id>` - Edit detailed notes

- For a visual interface, use `npx vtodo web` to open the kanban board
