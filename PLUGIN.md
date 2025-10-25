# VTodo Claude Code Plugin

VTodo is now available as a Claude Code plugin! This makes it super easy to integrate todo management into your AI-powered coding workflow.

## Installation

VTodo plugin requires the npm package to be installed in your project first.

### Step 1: Install npm package

```bash
# Navigate to your project
cd ~/my-project

# Install vtodo (local to project, not global)
npm install vtodo
# or
pnpm add vtodo
```

### Step 2: Install Claude Code Plugin

```bash
# Install directly from GitHub
/plugin install chyyynh/vtodo
```

That's it! The plugin will be installed from the GitHub repository.

**Note**: The plugin provides convenient slash commands that execute `npx vtodo` under the hood. This means vtodo must be installed in your project's `node_modules` for the commands to work.

## Available Commands

Once installed, you'll have access to these slash commands:

### `/vtodo-init`
Initialize VTodo in your current project
- Creates `.vtodo/` directory for storage
- Creates `todo/` directory for detailed notes
- Sets up the todo management system

### `/vtodo-add`
Add a new todo to your project
- Interactive: Claude will ask for todo details
- Supports tags, descriptions, time estimates
- Option to create detailed markdown files

### `/vtodo-list`
List all todos organized by status
- Shows Pending, In Progress, and Completed todos
- Displays IDs, titles, tags, and timestamps
- Use todo IDs for further management

### `/vtodo-status`
Update the status of a todo
- Change between pending/in-progress/completed
- Shortcuts: `done` and `undo` for quick updates
- Tracks todo lifecycle

### `/vtodo-web`
Open the visual kanban board
- Launches local server at http://localhost:3456
- Drag-and-drop interface
- Real-time updates
- Visual progress tracking

## Quick Start

```bash
# 1. Install vtodo npm package
npm install vtodo

# 2. Install the plugin
/plugin install chyyynh/vtodo

# 3. Initialize VTodo in your project
/vtodo-init

# 4. Add your first todo
/vtodo-add

# 5. View your todos
/vtodo-list

# 6. Open the visual board
/vtodo-web
```

## AI Workflow Integration

The plugin automatically helps Claude Code understand your project's todo system:

1. **Context Awareness**: Claude knows about your todos and can reference them
2. **Task Planning**: Claude can suggest adding todos when discussing new features
3. **Progress Tracking**: Update todo status as you complete tasks
4. **Documentation**: Detailed markdown files keep implementation notes organized

## Example Workflow with Claude Code

```
You: "Let's implement a user authentication system"

Claude: "I'll help you implement user authentication. Let me add this to your todos."
[Uses /vtodo-add to create a todo with proper tags and estimates]

Claude: "I've created todo #5 for 'Implement user authentication'.
         Let me start by updating its status to in-progress..."
[Uses /vtodo-status to mark as in-progress]

[After implementation...]

Claude: "Authentication is complete! Marking todo #5 as done."
[Uses /vtodo-done to complete the todo]
```

## Features

✅ Zero-config setup with `/vtodo-init`
✅ Quick todo management via slash commands
✅ Visual kanban board for progress tracking
✅ Detailed markdown files for complex tasks
✅ Tags and time estimates for better planning
✅ Seamless integration with AI coding assistants

## Requirements

- Node.js 14+
- npm or pnpm package manager
- Claude Code CLI

## Links

- [GitHub Repository](https://github.com/chyyynh/vtodo)
- [npm Package](https://www.npmjs.com/package/vtodo)
- [Issue Tracker](https://github.com/chyyynh/vtodo/issues)

## License

MIT License - Created with ❤️ for vibe coding workflows
