# Contributing to VTodo

Thank you for your interest in contributing to VTodo! This document provides guidelines and information for developers who want to contribute to the project.

## Development Setup

### Repository Structure

```
vtodo/
├── package/                # npm package (published to npm)
│   ├── bin/
│   │   └── cli.js          # CLI entry point
│   ├── lib/
│   │   ├── commands.js     # CLI command implementations
│   │   ├── file-utils.js   # File operations & todo management
│   │   ├── server.js       # Express server for web UI
│   │   └── schema.js       # Data structure definitions
│   ├── dist/
│   │   ├── index.html      # Single-file web UI
│   │   ├── app.js          # Web UI JavaScript
│   │   └── style.css       # Web UI styles
│   ├── package.json
│   ├── .npmignore
│   └── README.md           # npm package README
├── claude-plugin/          # Claude Code plugin (distributed separately)
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/           # Slash commands
│   └── skills/             # Skills
├── README.md               # Main GitHub README
├── CONTRIBUTING.md         # This file
├── LICENSE
└── PLUGIN.md               # Claude Code plugin documentation
```

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/chyyynh/vtodo.git
   cd vtodo
   ```

2. **Install dependencies**
   ```bash
   cd package
   pnpm install
   ```

3. **Test locally**
   ```bash
   # From package directory
   node bin/cli.js init
   node bin/cli.js list
   node bin/cli.js web
   ```

4. **Use local version in projects**
   ```bash
   # From root directory
   pnpm add ./package
   ```

## Project Architecture

### Core Components

#### 1. CLI (`bin/cli.js`)
Entry point for the command-line interface using Commander.js.

#### 2. File Utilities (`lib/file-utils.js`)
- Todo CRUD operations
- JSON file management
- Detail markdown file handling
- Migration utilities

#### 3. Commands (`lib/commands.js`)
Implementation of all CLI commands:
- `init`, `add`, `list`, `show`
- `status`, `done`, `undo`
- `update`, `edit`, `remove`
- `web`, `migrate`

#### 4. Web Server (`lib/server.js`)
Express server that:
- Serves the web UI
- Provides REST API endpoints
- Handles real-time updates

#### 5. Web UI (`dist/index.html`)
Single-file application with:
- Vanilla JavaScript (no build step)
- Tailwind CSS (CDN)
- Drag-and-drop kanban board
- Real-time todo management

#### 6. Schema (`lib/schema.js`)
Data structure definitions and constants.

### Data Format

**todos.json Structure:**
```json
{
  "version": "1.0.0",
  "todos": [
    {
      "id": "001",
      "title": "Task title",
      "status": "pending|in-progress|completed",
      "description": "Task description",
      "tags": ["tag1", "tag2"],
      "expected": "2h",
      "checklist": [
        { "text": "Item", "checked": false }
      ],
      "created": "ISO timestamp",
      "updated": "ISO timestamp",
      "hasDetailFile": false
    }
  ]
}
```

**Detail File Format (todo/XXX-todo.md):**
```markdown
# Task Title
## Description
...
## Checklist
- [ ] Item 1
- [ ] Item 2
## Technical Notes
...
## Links
...
```

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes in package directory**
   ```bash
   cd package
   # Edit files in bin/, lib/, or dist/
   ```

3. **Test your changes**
   ```bash
   node bin/cli.js <command>
   ```

4. **Update version if needed**
   ```bash
   # In package/package.json
   # Follow semver: major.minor.patch
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**

### Publishing to npm

1. **Update version**
   ```bash
   cd package
   npm version patch|minor|major
   ```

2. **Test package contents**
   ```bash
   npm pack --dry-run
   ```

3. **Publish**
   ```bash
   npm publish
   ```

### Publishing Claude Code Plugin

The plugin is distributed through Claude Code's plugin system. Update files in `claude-plugin/` directory and commit to the repository.

## Code Style

- Use ES modules (`import/export`)
- Use async/await for async operations
- Add JSDoc comments for public functions
- Keep functions focused and small
- Use meaningful variable names
- Add error handling

## Testing

### Manual Testing Checklist

- [ ] `vtodo init` creates `.vtodo/todos.json`
- [ ] `vtodo add` creates todos with correct IDs
- [ ] `vtodo list` displays all todos correctly
- [ ] `vtodo status` updates todo status
- [ ] `vtodo done/undo` shortcuts work
- [ ] `vtodo update` modifies todo properties
- [ ] `vtodo edit` creates/opens detail files
- [ ] `vtodo remove` deletes todos
- [ ] `vtodo web` starts server and opens browser
- [ ] Web UI drag-and-drop works
- [ ] Web UI checklist editing works
- [ ] Detail files sync with checklists

## Common Issues

### Issue: `node_modules` not found
**Solution:** Run `pnpm install` in the `package/` directory.

### Issue: Web UI not loading
**Solution:** Check that `dist/index.html` exists and server is running on correct port.

### Issue: Changes not reflected
**Solution:** If you're using `pnpm add ./package`, re-run the command after changes.

## Feature Requests

Have an idea? Please:
1. Check existing issues first
2. Create a new issue with detailed description
3. Tag it as `enhancement`
4. Discuss the approach before implementing

## Bug Reports

Found a bug? Please:
1. Check if it's already reported
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (OS, Node version)
   - Error messages/logs

## Questions?

- Open an issue with the `question` label
- Check existing issues and discussions
- Read the main [README.md](README.md) and [PLUGIN.md](PLUGIN.md)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to VTodo! 🎉
