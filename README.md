# VTodo - Todo.md Manager for Vibe Coding

A visual kanban board for managing markdown-based todos. Perfect for vibe coding workflows!

## Features

- 🎯 **Visual Kanban Board** - Drag and drop tasks between Pending, In Progress, and Completed
- 📝 **Markdown-Based** - All data stored in simple markdown files
- 🔄 **File System Access** - Directly read/write local files (Chrome/Edge only)
- ✅ **Task Management** - Create, edit, delete tasks with checklists
- 📊 **Progress Tracking** - Visual progress bars for checklist completion
- 🚀 **Zero Config** - Just run and select your project folder

## Quick Start

### Using npx (Recommended)

```bash
# Navigate to your project directory
cd ~/my-project

# Run VTodo
npx vtodo
```

The tool will:
1. Automatically download the latest version
2. Start a local server
3. Open your browser
4. Ask you to select your project folder

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

## File Structure

VTodo expects the following structure in your project:

```
my-project/
├── todo.md              # Main todo list
└── todo/                # Task details folder
    ├── pending/
    │   ├── task-001.md
    │   └── task-002.md
    ├── in-progress/
    │   └── task-003.md
    └── completed/
        └── task-004.md
```

### todo.md Format

```markdown
# Todo List

## Pending
- [ ] [task-001] Implement user registration
- [ ] [task-002] Fix homepage loading issue

## In Progress
- [ ] [task-003] Refactor database schema

## Completed
- [x] [task-004] Setup CI/CD pipeline
```

### Task File Format (e.g., task-001.md)

```markdown
# [task-001] Implement user registration

## 描述
Build complete user registration flow with email verification

## Checklist
- [ ] Design registration form UI
- [ ] Implement frontend validation
- [ ] Connect to backend API
- [ ] Add email verification
- [ ] Write tests

## 筆記
- Use React Hook Form
- Email via SendGrid
- Password: 8+ chars, mixed case + numbers

## 相關連結
- [Design](https://figma.com/xxx)
- [API Spec](./docs/auth-api.md)

---
Created: 2025-10-24
Status: pending
Priority: high
```

## Browser Requirements

VTodo uses the **File System Access API**, which is only supported in:
- ✅ Chrome 86+
- ✅ Edge 86+
- ❌ Firefox (not supported)
- ❌ Safari (not supported)

## Usage Guide

### First Time Setup

1. Run `npx vtodo` in your terminal
2. Browser opens automatically at `http://localhost:3456`
3. Click "Select Project Folder"
4. Choose the folder containing `todo.md`
5. Grant file access permission
6. Start managing your todos!

### Daily Workflow

```bash
cd ~/my-project
npx vtodo
```

The tool remembers your folder selection and automatically loads your tasks.

### Managing Tasks

- **Create**: Click "+ New Task" button
- **Edit**: Click on any task card to open editor
- **Move**: Drag and drop cards between columns
- **Delete**: Open task editor and click "Delete Task"
- **Progress**: Check off items in the task checklist

### Keyboard Shortcuts (Coming Soon)

- `Cmd/Ctrl + N`: New task
- `Cmd/Ctrl + F`: Search
- `Cmd/Ctrl + S`: Save (auto-saved)

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/chyyynh/vtodo.git
cd vtodo

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview

# Test CLI locally
pnpm start
```

### Testing Local Package

```bash
# Create local link
pnpm link --global

# Test command
vtodo

# Unlink when done
pnpm unlink --global
```

## Publishing

```bash
# Build the project
pnpm build

# Login to npm (first time only)
npm login

# Publish to npm
npm publish

# Test published package
npx vtodo@latest
```

## Project Structure

```
vtodo/
├── bin/
│   └── cli.js              # CLI entry point
├── src/
│   ├── components/         # React components
│   │   ├── Board.jsx       # Kanban board
│   │   ├── Column.jsx      # Column component
│   │   ├── TaskCard.jsx    # Task card
│   │   └── TaskEditor.jsx  # Task editor modal
│   ├── utils/              # Utility functions
│   │   ├── FileManager.js  # File system operations
│   │   └── MarkdownParser.js # Markdown parsing
│   ├── App.jsx             # Main application
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles
├── dist/                   # Build output (published to npm)
├── example-data/           # Example todo data (not published)
├── package.json
├── vite.config.js
└── README.md
```

## Tech Stack

- **Frontend**: React 19 + Vite
- **Drag & Drop**: @dnd-kit
- **Markdown**: markdown-it
- **Styling**: Tailwind CSS
- **CLI**: Express + open
- **File Access**: File System Access API

## Troubleshooting

### "Browser not supported"
Use Chrome or Edge browser (86+).

### "Cannot access folder"
Make sure you granted file access permission when prompted.

### "dist folder not found"
Run `pnpm build` before using `pnpm start`.

### Changes not saving
Check browser console for errors. Ensure you have write permissions to the folder.

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
