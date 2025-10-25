# VTodo - Visual Task Manager for Vibe Coding

A visual kanban board and CLI tool for managing project tasks. Perfect for vibe coding workflows!

## Features

- 🎯 **Visual Kanban Board** - Drag and drop tasks between Pending, In Progress, and Completed
- 💾 **JSON Storage** - Fast, reliable storage with .vtodo/tasks.json
- 📝 **Optional Markdown Details** - Add detailed markdown files for complex tasks
- 🖥️ **Dual Interface** - CLI commands + Web UI
- ✅ **Task Management** - Create, edit, delete tasks with tags and time estimates
- 📊 **Progress Tracking** - Checklists with visual progress bars
- 🚀 **Zero Config** - Just run `vtodo init` to get started

## Quick Start

### Using npx (Recommended)

```bash
# Navigate to your project directory
cd ~/my-project

# Initialize vtodo (creates .vtodo/tasks.json)
npx vtodo init

# Add a task
npx vtodo add "Implement user login" --tags backend --expected 2h

# List tasks
npx vtodo list

# Open web UI
npx vtodo web
```

The web UI will:
1. Start a local server at http://localhost:3456
2. Open your browser automatically
3. Load your tasks from .vtodo/tasks.json
4. Provide a visual kanban board interface

### Global Installation

```bash
# Install globally
pnpm add -g vtodo

# Run from anywhere
cd ~/my-project
vtodo
```

### Local Installation

```bash
# Install as dev dependency
pnpm add -D vtodo

# Add to package.json scripts
{
  "scripts": {
    "todo": "vtodo"
  }
}

# Run
pnpm todo
```

### Local Development (Before Publishing)

If you're developing vtodo locally and haven't published it to npm yet:

```bash
# Step 1: Clone and install
git clone https://github.com/chyyynh/vtodo.git
cd vtodo
pnpm install

# Step 2: Build frontend
pnpm build

# Step 3: Create global link
pnpm link --global

# Step 4: Now you can use vtodo command anywhere
cd ~/my-project
vtodo init
vtodo list
vtodo web

# Alternative: Run directly without linking
node bin/cli.js init
node bin/cli.js web
```

## File Structure

VTodo creates the following structure in your project:

```
my-project/
├── .vtodo/
│   ├── tasks.json       # Main task storage (JSON format)
│   └── backup/          # Backup files (if migrated from old format)
└── todo/                # Optional: detailed markdown files
    ├── 001-task.md
    ├── 002-task.md
    └── ...
```

### tasks.json Format

```json
{
  "version": "1.0.0",
  "tasks": [
    {
      "id": "001",
      "title": "Implement user registration",
      "status": "pending",
      "description": "Build complete user registration flow",
      "tags": ["backend", "auth"],
      "expected": "2h",
      "checklist": [
        { "text": "Design form UI", "checked": false },
        { "text": "Implement validation", "checked": false }
      ],
      "created": "2025-10-25T10:00:00.000Z",
      "updated": "2025-10-25T10:00:00.000Z",
      "hasDetailFile": false
    }
  ]
}
```

### Task Detail File (Optional: todo/001-task.md)

You can create detailed markdown files for complex tasks using `vtodo edit 1`:

```markdown
# Implement user registration

## 詳細說明
Build complete user registration flow with email verification.

## Checklist
- [ ] Design registration form UI
- [ ] Implement frontend validation
- [ ] Connect to backend API
- [ ] Add email verification
- [ ] Write tests

## 技術筆記
- Use React Hook Form for form management
- Email verification via SendGrid
- Password requirements: 8+ chars, mixed case + numbers

## 相關連結
- [Design Mockup](https://figma.com/xxx)
- [API Specification](./docs/auth-api.md)
```

## CLI Commands

```bash
# Initialize vtodo in current directory
vtodo init

# Add a new task
vtodo add "Task title" [options]
  --description, -d    Task description
  --tags, -t          Comma-separated tags
  --expected, -e      Expected time (e.g., "2h", "30min")
  --detail            Create detail markdown file

# List all tasks
vtodo list

# Show task details
vtodo show <id>

# Update task status
vtodo status <id> <pending|in-progress|completed>

# Mark task as done (shortcut)
vtodo done <id>

# Reopen task (shortcut)
vtodo undo <id>

# Update task properties
vtodo update <id> [options]
  --title             New title
  --description       New description
  --tags              New tags
  --expected          New time estimate

# Edit task detail file
vtodo edit <id>

# Remove a task
vtodo remove <id>

# Open web UI
vtodo web [--port 3456]

# Migrate from old todo.md format (if needed)
vtodo migrate
```

## Usage Guide

### CLI Workflow

```bash
# Initialize in your project
cd ~/my-project
vtodo init

# Add tasks
vtodo add "Setup database" --tags backend --expected 1h
vtodo add "Design homepage" --tags frontend,ui --expected 3h

# List all tasks
vtodo list

# Update task status
vtodo status 1 in-progress
vtodo done 2

# Show task details
vtodo show 1

# Edit detailed notes (opens $EDITOR)
vtodo edit 1
```

### Web UI Workflow

```bash
# Start web server
cd ~/my-project
vtodo web
```

The web UI provides:
- **Visual Kanban Board** - See all tasks organized by status
- **Drag & Drop** - Move tasks between columns to update status
- **Task Editor** - Click any task to edit details, checklists, tags
- **Progress Tracking** - Visual progress bars for task checklists
- **Real-time Updates** - Changes sync immediately to .vtodo/tasks.json

Web UI works in any modern browser (Chrome, Firefox, Safari, Edge)

## Project Structure

```
vtodo/
├── bin/
│   └── cli.js              # CLI entry point
├── lib/
│   ├── commands.js         # CLI command implementations
│   ├── file-utils.js       # File operations & task management
│   ├── server.js           # Express server for web UI
│   ├── storage-schema.js   # Data structure definitions
│   └── migrate.js          # Migration tool (todo.md → tasks.json)
├── src/
│   ├── components/         # React components
│   │   ├── Board.jsx       # Kanban board with drag & drop
│   │   ├── Column.jsx      # Status column
│   │   ├── TaskCard.jsx    # Task card display
│   │   └── TaskEditor.jsx  # Task editor dialog
│   ├── utils/              # Utility functions
│   │   ├── FileManager.js  # (deprecated - using API now)
│   │   └── MarkdownParser.js # (deprecated)
│   ├── App.jsx             # Main React application
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles (Tailwind)
├── dist/                   # Build output (published to npm)
├── package.json
├── vite.config.js
└── README.md
```

## Tech Stack

- **CLI**: Commander.js + Chalk (colored output)
- **Storage**: JSON-based with optional Markdown detail files
- **Web Server**: Express.js
- **Frontend**: React 19 + Vite
- **Drag & Drop**: @dnd-kit
- **Styling**: Tailwind CSS + Radix UI
- **Markdown**: markdown-it (for detail files)

## Troubleshooting

### Tasks not showing in CLI
Run `vtodo init` first to create `.vtodo/tasks.json`.

### Web UI shows "Failed to fetch tasks"
- Make sure you're in a directory with `.vtodo/tasks.json`
- Check that the file has valid JSON format
- Try restarting the server: `vtodo web`

### "dist folder not found" error
Run `pnpm build` before using `pnpm start` (for development).

### Editor not opening for `vtodo edit`
Set your `EDITOR` environment variable:
```bash
export EDITOR=vim     # or nano, code, etc.
```

### Migrating from old todo.md format
If you have existing `todo.md` files:
```bash
vtodo migrate
```
This will backup your old files to `.vtodo/backup/` and create `tasks.json`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- [GitHub Repository](https://github.com/chyyynh/vtodo)
- [npm Package](https://www.npmjs.com/package/vtodo)
- [Issue Tracker](https://github.com/chyyynh/vtodo/issues)

## Author

Created with ❤️ for vibe coding workflows
