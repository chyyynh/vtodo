/**
 * Migration tool: Convert old format to new JSON format
 *
 * Old format:
 * - todo.md with markdown sections
 * - todo/*.md files with frontmatter
 *
 * New format:
 * - .vtodo/tasks.json with all task data
 * - todo/*.md optional detail files
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import chalk from "chalk";
import {
  DEFAULT_TASKS_DATA,
  createDefaultTask,
  PATHS
} from "./storage-schema.js";
import { writeTasksJson } from "./file-utils.js";

/**
 * Parse old todo.md format
 */
function parseOldTodoMd(filePath) {
  if (!fs.existsSync(filePath)) return { todos: [] };

  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw.split("\n");
  const todos = [];
  let currentStatus = "pending";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for section headers
    if (line.startsWith("## Pending")) {
      currentStatus = "pending";
      continue;
    } else if (line.startsWith("## In Progress")) {
      currentStatus = "in-progress";
      continue;
    } else if (line.startsWith("## Completed")) {
      currentStatus = "completed";
      continue;
    }

    // Parse task line: - [ ] [task-id] Title
    const taskMatch = line.match(/^\s*-\s\[([x\s])\]\s*\[([^\]]+)\]\s*(.+)$/i);

    if (taskMatch) {
      const checked = taskMatch[1].toLowerCase() === "x";
      const id = taskMatch[2].trim();
      const title = taskMatch[3].trim();

      todos.push({
        id,
        done: checked || currentStatus === "completed",
        status: currentStatus,
        title
      });
    }
  }

  return { todos };
}

/**
 * Parse old task detail file with frontmatter
 */
function parseOldTaskFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = matter(raw);

    // Extract checklist from content
    const checklist = [];
    const lines = parsed.content.split("\n");

    for (const line of lines) {
      const match = line.match(/^-\s\[([x\s])\]\s*(.+)$/i);
      if (match) {
        checklist.push({
          checked: match[1].toLowerCase() === "x",
          text: match[2].trim()
        });
      }
    }

    return {
      ...parsed.data,
      content: parsed.content,
      checklist
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Migrate old format to new format
 */
export async function migrateToNewFormat(cwd) {
  console.log(chalk.blue("\n🔄 Starting migration to new format...\n"));

  const oldTodoPath = path.join(cwd, "todo.md");
  const oldTodoDir = path.join(cwd, "todo");
  const newVtodoDir = path.join(cwd, PATHS.VTODO_DIR);
  const newTasksPath = path.join(cwd, PATHS.TASKS_JSON);

  // Check if old format exists
  if (!fs.existsSync(oldTodoPath)) {
    console.log(chalk.yellow("⚠️  No todo.md found. Nothing to migrate."));
    return;
  }

  // Check if new format already exists
  if (fs.existsSync(newTasksPath)) {
    console.log(chalk.yellow("⚠️  .vtodo/tasks.json already exists!"));
    const answer = prompt("Overwrite? (yes/no): ");
    if (answer !== "yes") {
      console.log(chalk.gray("Migration cancelled."));
      return;
    }
  }

  // Create .vtodo directory
  if (!fs.existsSync(newVtodoDir)) {
    fs.mkdirSync(newVtodoDir, { recursive: true });
  }

  // Parse old todo.md
  const { todos: oldTodos } = parseOldTodoMd(oldTodoPath);
  console.log(chalk.gray(`Found ${oldTodos.length} tasks in todo.md`));

  // Convert to new format
  const newTasks = [];

  for (const oldTodo of oldTodos) {
    // Create base task
    const newTask = createDefaultTask(oldTodo.id, oldTodo.title);
    newTask.status = oldTodo.status;

    // Try to find and parse detail file
    const detailFiles = fs.existsSync(oldTodoDir)
      ? fs.readdirSync(oldTodoDir).filter(f => f.startsWith(oldTodo.id + "-"))
      : [];

    if (detailFiles.length > 0) {
      const detailPath = path.join(oldTodoDir, detailFiles[0]);
      const detailData = parseOldTaskFile(detailPath);

      if (detailData) {
        // Merge detail data
        newTask.description = detailData.content?.split("\n")[0] || "";
        newTask.checklist = detailData.checklist || [];
        newTask.tags = detailData.tags || [];
        newTask.expected = detailData.expected || "";
        newTask.hasDetailFile = true;

        console.log(chalk.gray(`  ✓ Migrated ${oldTodo.id}: ${oldTodo.title}`));
      }
    } else {
      console.log(chalk.gray(`  ○ Migrated ${oldTodo.id}: ${oldTodo.title} (no detail file)`));
    }

    newTasks.push(newTask);
  }

  // Write new tasks.json
  const newData = {
    ...DEFAULT_TASKS_DATA,
    tasks: newTasks
  };

  fs.writeFileSync(
    newTasksPath,
    JSON.stringify(newData, null, 2),
    "utf-8"
  );

  // Backup old todo.md
  const backupPath = path.join(cwd, "todo.md.backup");
  fs.copyFileSync(oldTodoPath, backupPath);

  console.log("");
  console.log(chalk.green("✅ Migration completed!"));
  console.log(chalk.gray(`   Migrated ${newTasks.length} tasks`));
  console.log(chalk.gray(`   New file: ${newTasksPath}`));
  console.log(chalk.gray(`   Backup: ${backupPath}`));
  console.log("");
  console.log(chalk.yellow("📝 Next steps:"));
  console.log(chalk.gray("   • Review the migrated data in .vtodo/tasks.json"));
  console.log(chalk.gray("   • Test with: vtodo list"));
  console.log(chalk.gray("   • If everything looks good, you can delete todo.md.backup"));
  console.log("");
}

/**
 * CLI migration command
 */
export async function migrateCmd(cwd) {
  await migrateToNewFormat(cwd);
}
