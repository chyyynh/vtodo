---
description: Open the VTodo visual kanban board
---

# Open Visual Kanban Board

Launch the VTodo web interface with an interactive kanban board.

Run the following command:

```bash
npx vtodo web
```

This will:
1. Start a local server at http://localhost:3456
2. Automatically open your browser
3. Load your todos from `.vtodo/todos.json`
4. Display a drag-and-drop kanban board

## Features

The web UI provides:
- **Visual Kanban Board**: Drag and drop todos between Pending, In Progress, and Completed columns
- **Real-time Updates**: Changes are saved immediately to `.vtodo/todos.json`
- **Todo Editor**: Click on any todo to edit details, tags, descriptions, and checklists
- **Progress Tracking**: Visual progress bars for todos with checklists
- **Responsive Design**: Works on desktop and mobile browsers

## Custom Port

To use a different port:

```bash
npx vtodo web --port 8080
```

Press `Ctrl+C` in the terminal to stop the server when done.
