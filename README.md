# VTodo - Visualized Todo Manager for Vibe Coding

[![npm version](https://badge.fury.io/js/vtodo.svg)](https://badge.fury.io/js/vtodo)

<img width="1707" height="855" alt="image" src="https://github.com/user-attachments/assets/df696f41-c2af-4e39-bb00-ecbe7fbeb3a2" />

A visual kanban board and CLI tool for managing project todo. Perfect for vibe coding workflows! V for Vibecoding and Visualized.

VTodo is designed to work seamlessly with AI coding assistants like Claude Code, Cursor, and other AI-powered editors. By integrating vtodo into your AI workflow, you can maintain clear project context and track implementation progress automatically.

## Features

- 🎯 **Visual Kanban Board** - Drag and drop todos between Pending, In Progress, and Completed
- 💾 **JSON Storage** - Fast, reliable storage with .vtodo/todos.json
- 🖥️ **Dual Interface** - CLI commands + Web UI
- ✅ **Todo Management** - Create, edit, delete todos with tags and time estimates
- 📊 **Progress Tracking** - Checklists with visual progress bars
- 🚀 **Zero Config** - Just run `vtodo init` to get started
- 🤖 **Claude Code Plugin** - Native integration with slash commands for AI-powered workflows

## Quick Start

### Installation

[![https://nodei.co/npm/vtodo.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/vtodo.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vtodo)

**Note**: The plugin executes `npx vtodo` commands, so the npm package must be installed in your project first.

```bash
# Step 1: Install npm package in your project
npm install vtodo
# or: pnpm add vtodo

# Step 2: Add marketplace and install plugin
/plugin marketplace add chyyynh/vtodo
/plugin install vtodo

# Step 3: Initialize in your project
/vtodo-init
```

**Available Plugin Commands:**
- `/vtodo-init` - Initialize VTodo in current project
- `/vtodo-add` - Add a new todo
- `/vtodo-list` - List all todos
- `/vtodo-status` - Update todo status
- `/vtodo-web` - Open visual kanban board

### Using

start a local server to manage todo, this command will open your browser automatically

```bash
vtodo web
```

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Checkout [CONTRIBUTING.md](CONTRIBUTING.md)

## Links

- [GitHub Repository](https://github.com/chyyynh/vtodo)
- [npm Package](https://www.npmjs.com/package/vtodo)
- [Claude Code Plugin Documentation](PLUGIN.md)
- [Issue Tracker](https://github.com/chyyynh/vtodo/issues)

## Author

Created with ❤️ for vibe coding workflows
