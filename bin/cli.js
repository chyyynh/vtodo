#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import {
  initCmd,
  addCmd,
  listCmd,
  doneCmd,
  undoCmd,
  editCmd,
  removeCmd,
  showCmd,
  statusCmd,
  updateCmd
} from "../lib/commands.js";
import { startServer } from "../lib/server.js";
import { migrateCmd } from "../lib/migrate.js";

program
  .name("vtodo")
  .description("Repo-local, AI-friendly todo manager with visual UI")
  .version("1.0.0");

// Initialize
program
  .command("init")
  .description("Initialize .vtodo/tasks.json and /todo folder")
  .action(() => initCmd(process.cwd()));

// Add todo
program
  .command("add <title...>")
  .description("Add a new todo")
  .option("-e, --expected <time>", "Expected time (e.g., 2h, 1d)")
  .option("-t, --tags <tags>", "Comma-separated tags")
  .action((title, options) => addCmd(process.cwd(), title.join(" "), options));

// List todos
program
  .command("list")
  .alias("ls")
  .description("List all todos")
  .action(() => listCmd(process.cwd()));

// Mark as done
program
  .command("done <id>")
  .description("Mark todo as completed")
  .action((id) => doneCmd(process.cwd(), id));

// Undo completion
program
  .command("undo <id>")
  .description("Reopen a completed todo")
  .action((id) => undoCmd(process.cwd(), id));

// Edit todo
program
  .command("edit <id>")
  .description("Open todo detail file in $EDITOR")
  .action((id) => editCmd(process.cwd(), id));

// Remove todo
program
  .command("remove <id>")
  .alias("rm")
  .description("Remove a todo")
  .action((id) => removeCmd(process.cwd(), id));

// Show todo details
program
  .command("show <id>")
  .description("Show detailed information about a todo")
  .action((id) => showCmd(process.cwd(), id));

// Update todo status
program
  .command("status <id> <status>")
  .description("Update todo status (pending|in-progress|completed)")
  .action((id, status) => statusCmd(process.cwd(), id, status));

// Update todo properties
program
  .command("update <id>")
  .description("Update todo properties")
  .option("--title <title>", "New title")
  .option("--description <desc>", "New description")
  .option("-e, --expected <time>", "Expected time")
  .option("-t, --tags <tags>", "Comma-separated tags")
  .action((id, options) => updateCmd(process.cwd(), id, options));

// Migrate from old format
program
  .command("migrate")
  .description("Migrate from old todo.md format to new JSON format")
  .action(() => migrateCmd(process.cwd()));

// Start web UI
program
  .command("web")
  .description("Start web UI server")
  .option("-p, --port <port>", "Port number", "3456")
  .action((options) => startServer(process.cwd(), options.port));

// Default: show help if no command
if (process.argv.length === 2) {
  program.help();
}

program.parse();
