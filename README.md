# VTodo - Visual Todo Manager for Vibe Coding

A visual kanban board and CLI tool for managing project todo. Perfect for vibe coding workflows!

VTodo is designed to work seamlessly with AI coding assistants like Claude Code, Cursor, and other AI-powered editors. By integrating vtodo into your AI workflow, you can maintain clear project context and track implementation progress automatically.

## Features

- 🎯 **Visual Kanban Board** - Drag and drop todo between Pending, In Progress, and Completed
- 💾 **JSON Storage** - Fast, reliable storage with .vtodo/todos.json
- 📝 **Optional Markdown Details** - Add detailed markdown files for complex todos
- 🖥️ **Dual Interface** - CLI commands + Web UI
- ✅ **Todo Management** - Create, edit, delete todos with tags and time estimates
- 📊 **Progress Tracking** - Checklists with visual progress bars
- 🚀 **Zero Config** - Just run `vtodo init` to get started

## Quick Start

### Installation

```bash
# Run from anywhere
cd ~/my-project
pnpm add vtodo
```

### Using npx (Recommended)

```bash
# Navigate to your project directory
cd ~/my-project

# Initialize vtodo (creates .vtodo/todos.json)
npx vtodo init

# Setup for Claude Code, Codex, Cursor or other AI Editors

Add this to your `claude.md` or `agent.md`:

---

# Project Todo Management

This project uses VTodo for todo management.

## VTodo Commands
- Use `vtodo add "title" --detail` to create todos with detail files
- All todos are stored in `.vtodo/todos.json`
- Detail files go in `todo/XXX-todo.md`
- When implementing features, update todo status with `vtodo status <id> in-progress`
- Mark complete with `vtodo done <id>`

## Instructions for AI Assistant
1. When starting a new feature, create a todo with details:
   - Run `vtodo add "Feature title" --detail --tags <tags>`
   - Edit the detail file in `todo/` to add implementation notes, technical decisions, and step-by-step plan
2. Update todo status as you work (`pending` → `in-progress` → `completed`)
3. Use checklists in detail files for breaking down complex tasks
4. Always check `vtodo list` before starting work to see current priorities

---

# Add a todo
Use your agent editor to follow instruction to add todo or 
`npx vtodo add "Implement user login" --tags backend --expected 2h`

# List todo
npx vtodo list

# Open web UI
npx vtodo web
```

The web UI will:
1. Start a local server at http://localhost:3456
2. Open your browser automatically
3. Load your todos from .vtodo/todos.json
4. Provide a visual kanban board interface

## File Structure

VTodo creates the following structure in your project:

```
my-project/
├── .vtodo/
│   ├── todos.json       # Main todo storage (JSON format)
│   └── backup/          # Backup files (if migrated from old format)
└── todo/                # Optional: detailed markdown files
    ├── 001-[slug].md
    ├── 002-[slug].md
    └── ...
```

### todos.json Format

```json
{
  "version": "1.0.0",
  "todos": [
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

### Todo Detail File (Optional: todo/001-todo.md)

You can create detailed markdown files for complex todos using `vtodo edit 1`:

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

# Add a new todo
vtodo add "Todo title" [options]
  --description, -d    Todo description
  --tags, -t          Comma-separated tags
  --expected, -e      Expected time (e.g., "2h", "30min")
  --detail            Create detail markdown file

# List all Todo
vtodo list

# Show todo details
vtodo show <id>

# Update todo status
vtodo status <id> <pending|in-progress|completed>

# Mark todo as done (shortcut)
vtodo done <id>

# Reopen todo (shortcut)
vtodo undo <id>

# Update todo properties
vtodo update <id> [options]
  --title             New title
  --description       New description
  --tags              New tags
  --expected          New time estimate

# Edit todo detail file
vtodo edit <id>

# Remove a todo
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

# Add todos
vtodo add "Setup database" --tags backend --expected 1h
vtodo add "Design homepage" --tags frontend,ui --expected 3h

# List all todos
vtodo list

# Update todo status
vtodo status 1 in-progress
vtodo done 2

# Show todo details
vtodo show 1

# Edit detailed notes (opens $EDITOR)
vtodo edit 1
```

## Project Structure

```
vtodo/
├── bin/
│   └── cli.js              # CLI entry point
├── lib/
│   ├── commands.js         # CLI command implementations
│   ├── file-utils.js       # File operations & todo management
│   ├── server.js           # Express server for web UI
│   ├── storage-schema.js   # Data structure definitions
│   └── migrate.js          # Migration tool (todo.md → todos.json)
├── src/
│   ├── components/         # React components
│   │   ├── Board.jsx       # Kanban board with drag & drop
│   │   ├── Column.jsx      # Status column
│   │   ├── TodoCard.jsx    # Todo card display
│   │   └── TodoEditor.jsx  # Todo editor dialog
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
