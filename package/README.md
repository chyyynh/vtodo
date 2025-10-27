# VTodo - Visualized Todo Manager

A visual kanban board and CLI tool for managing project todos. Perfect for vibe coding workflows!

## Installation

```bash
npm install vtodo
# or
pnpm add vtodo
# or
yarn add vtodo
```

## Quick Start

```bash
# Initialize in your project
npx vtodo init

# Add a todo
npx vtodo add "Implement user login" --tags backend --expected 2h

# List todos
npx vtodo list

# Open visual kanban board
npx vtodo web
```

## Features

- 🎯 **Visual Kanban Board** - Drag and drop interface
- 💾 **JSON Storage** - Fast, reliable `.vtodo/todos.json` format
- 🖥️ **Dual Interface** - CLI commands + Web UI
- ✅ **Todo Management** - Create, edit, delete with tags and time estimates
- 📊 **Progress Tracking** - Checklists with visual progress bars
- 🚀 **Zero Config** - Just run `vtodo init` to get started

## CLI Commands

```bash
# Initialize
vtodo init

# Add todo
vtodo add "Title" [options]
  -d, --description    Description
  -t, --tags          Comma-separated tags
  -e, --expected      Time estimate (e.g., "2h", "30min")
  --detail            Create detail markdown file

# List todos
vtodo list

# Update status
vtodo status <id> <pending|in-progress|completed>
vtodo done <id>      # Mark as completed
vtodo undo <id>      # Reopen todo

# Show details
vtodo show <id>

# Edit detail file
vtodo edit <id>

# Update properties
vtodo update <id> [options]
  --title
  --description
  --tags
  --expected

# Remove todo
vtodo remove <id>

# Web UI
vtodo web [--port 3456]
```

## File Structure

```
my-project/
├── .vtodo/
│   └── todos.json       # Main todo storage
└── todo/                # Optional: detailed markdown files
    ├── 001-[slug].md
    └── 002-[slug].md
```

## AI-Enhanced Workflows

VTodo is designed to work seamlessly with AI coding assistants like Claude Code, Cursor, and other AI-powered editors.

**For AI-enhanced features, Claude Code integration, and advanced workflows:**

👉 **[See full documentation on GitHub](https://github.com/chyyynh/vtodo)**

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- [GitHub Repository](https://github.com/chyyynh/vtodo)
- [Issue Tracker](https://github.com/chyyynh/vtodo/issues)
- [npm Package](https://www.npmjs.com/package/vtodo)
