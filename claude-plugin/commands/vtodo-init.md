---
description: Initialize VTodo in the current project
---

# Initialize VTodo

Initialize VTodo todo management system in the current project. This will create:
- `.vtodo/` directory for storing todos.json
- `todo/` directory for detailed markdown files (optional)

Run the following command to initialize:

```bash
npx vtodo init
```

After initialization:
1. VTodo is ready to use
2. You can start adding todos with `npx vtodo add "Task title"`
3. Open the visual kanban board with `npx vtodo web`

The system will automatically handle the file structure and storage.
