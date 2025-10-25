import { spawn } from "child_process";
import chalk from "chalk";
import {
  ensureRepoInit,
  getAllTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
  groupTasksByStatus,
  createTaskDetailFile,
  readTaskDetailFile,
  calculateProgress
} from "./file-utils.js";
import { STATUS } from "./storage-schema.js";
import path from "path";
import fs from "fs";

/**
 * Initialize vtodo (create .vtodo/tasks.json and todo/ folder)
 */
export async function initCmd(cwd) {
  await ensureRepoInit(cwd);
  console.log(chalk.green("✅ Initialized vtodo in repository."));
  console.log(chalk.gray("   Created: .vtodo/tasks.json, /todo"));
}

/**
 * Add a new task
 */
export async function addCmd(cwd, title, options) {
  await ensureRepoInit(cwd);

  const taskData = {
    title,
    description: options.description || "",
    expected: options.expected || "",
    tags: options.tags ? options.tags.split(",").map(s => s.trim()) : []
  };

  const newTask = addTask(cwd, taskData);

  console.log(chalk.green(`✨ Added TODO #${newTask.id}: ${newTask.title}`));

  // 如果使用 --detail 選項,建立詳細檔案
  if (options.detail) {
    const detailPath = createTaskDetailFile(cwd, newTask.id, newTask.title);
    console.log(chalk.gray(`   Detail file: ${detailPath}`));
  }
}

/**
 * List all tasks
 */
export async function listCmd(cwd, options = {}) {
  const tasks = getAllTasks(cwd);

  if (tasks.length === 0) {
    console.log(chalk.gray("No tasks yet. Add one with `vtodo add \"Task title\"`"));
    return;
  }

  const grouped = groupTasksByStatus(tasks);

  console.log(chalk.blue("\n📝 Todo List:\n"));

  // Pending
  if (grouped.pending.length > 0) {
    console.log(chalk.yellow("⏳ Pending:"));
    grouped.pending.forEach(displayTask);
    console.log();
  }

  // In Progress
  if (grouped.inProgress.length > 0) {
    console.log(chalk.cyan("🚀 In Progress:"));
    grouped.inProgress.forEach(displayTask);
    console.log();
  }

  // Completed
  if (grouped.completed.length > 0 && !options.hideCompleted) {
    console.log(chalk.green("✅ Completed:"));
    grouped.completed.forEach(displayTask);
    console.log();
  }
}

/**
 * Display a single task
 */
function displayTask(task) {
  const checkbox = task.status === STATUS.COMPLETED ? chalk.green("✅") : chalk.yellow("🔲");
  const time = task.expected ? chalk.gray(`(${task.expected})`) : "";
  const tagStr = task.tags.length > 0 ? chalk.cyan(`[${task.tags.join(", ")}]`) : "";

  console.log(`${checkbox} [${task.id}] ${task.title} ${time} ${tagStr}`);

  // Show progress if has checklist
  if (task.checklist && task.checklist.length > 0) {
    const progress = calculateProgress(task.checklist);
    const completed = task.checklist.filter(i => i.checked).length;
    const total = task.checklist.length;
    console.log(chalk.gray(`   Progress: ${completed}/${total} (${progress}%)`));
  }

  if (task.description) {
    console.log(chalk.gray(`   ${task.description}`));
  }
}

/**
 * Show task details
 */
export async function showCmd(cwd, id) {
  const taskId = String(id).padStart(3, "0");
  const task = getTaskById(cwd, taskId);

  if (!task) {
    console.log(chalk.red(`❌ Task #${taskId} not found`));
    return;
  }

  console.log(chalk.blue(`\n📋 Task #${task.id}: ${task.title}\n`));
  console.log(chalk.gray(`Status: ${task.status}`));
  console.log(chalk.gray(`Created: ${new Date(task.created).toLocaleString()}`));
  console.log(chalk.gray(`Updated: ${new Date(task.updated).toLocaleString()}`));

  if (task.expected) {
    console.log(chalk.gray(`Expected: ${task.expected}`));
  }

  if (task.tags.length > 0) {
    console.log(chalk.gray(`Tags: ${task.tags.join(", ")}`));
  }

  if (task.description) {
    console.log(chalk.gray(`\nDescription:\n${task.description}`));
  }

  if (task.checklist && task.checklist.length > 0) {
    console.log(chalk.yellow("\nChecklist:"));
    task.checklist.forEach(item => {
      const checkbox = item.checked ? "[x]" : "[ ]";
      console.log(`  ${checkbox} ${item.text}`);
    });

    const progress = calculateProgress(task.checklist);
    console.log(chalk.gray(`\nProgress: ${progress}%`));
  }

  // Show detail file if exists
  if (task.hasDetailFile) {
    const detailContent = readTaskDetailFile(cwd, taskId);
    if (detailContent) {
      console.log(chalk.yellow("\n--- Detail File ---"));
      console.log(detailContent.substring(0, 500)); // Show first 500 chars
      if (detailContent.length > 500) {
        console.log(chalk.gray("\n... (use 'vtodo edit' to see full content)"));
      }
    }
  }

  console.log();
}

/**
 * Update task status
 */
export async function statusCmd(cwd, id, newStatus) {
  const taskId = String(id).padStart(3, "0");

  const validStatuses = Object.values(STATUS);
  if (!validStatuses.includes(newStatus)) {
    console.log(chalk.red(`❌ Invalid status. Use: ${validStatuses.join(", ")}`));
    return;
  }

  const updatedTask = updateTask(cwd, taskId, { status: newStatus });

  if (!updatedTask) {
    console.log(chalk.red(`❌ Task #${taskId} not found`));
    return;
  }

  const statusEmoji = {
    [STATUS.PENDING]: "⏳",
    [STATUS.IN_PROGRESS]: "🚀",
    [STATUS.COMPLETED]: "✅"
  };

  console.log(chalk.green(
    `${statusEmoji[newStatus]} Task #${taskId} → ${newStatus}`
  ));
}

/**
 * Mark a task as done (shortcut for status completed)
 */
export async function doneCmd(cwd, id) {
  await statusCmd(cwd, id, STATUS.COMPLETED);
}

/**
 * Reopen a task (shortcut for status pending)
 */
export async function undoCmd(cwd, id) {
  await statusCmd(cwd, id, STATUS.PENDING);
}

/**
 * Edit task detail file
 */
export async function editCmd(cwd, id) {
  const taskId = String(id).padStart(3, "0");
  const task = getTaskById(cwd, taskId);

  if (!task) {
    console.log(chalk.red(`❌ Task #${taskId} not found`));
    return;
  }

  // Create detail file if not exists
  if (!task.hasDetailFile) {
    const detailPath = createTaskDetailFile(cwd, task.id, task.title);
    console.log(chalk.gray(`Created detail file: ${detailPath}`));
  }

  const detailPath = path.join(cwd, "todo", `${taskId}-task.md`);

  if (!fs.existsSync(detailPath)) {
    console.log(chalk.red("❌ Detail file not found."));
    return;
  }

  const editor = process.env.EDITOR || "vi";
  console.log(chalk.gray(`Opening ${detailPath} in ${editor}...`));

  // Spawn editor
  const child = spawn(editor, [detailPath], {
    stdio: "inherit"
  });

  await new Promise(resolve => child.on("exit", resolve));
}

/**
 * Remove a task
 */
export async function removeCmd(cwd, id) {
  const taskId = String(id).padStart(3, "0");
  const task = getTaskById(cwd, taskId);

  if (!task) {
    console.log(chalk.red(`❌ Task #${taskId} not found`));
    return;
  }

  const success = deleteTask(cwd, taskId);

  if (success) {
    console.log(chalk.red(`🗑️  Removed TODO #${taskId}: ${task.title}`));
  } else {
    console.log(chalk.red(`❌ Failed to remove task #${taskId}`));
  }
}

/**
 * Update task properties
 */
export async function updateCmd(cwd, id, options) {
  const taskId = String(id).padStart(3, "0");

  const updates = {};

  if (options.title) updates.title = options.title;
  if (options.description) updates.description = options.description;
  if (options.expected) updates.expected = options.expected;
  if (options.tags) updates.tags = options.tags.split(",").map(s => s.trim());

  if (Object.keys(updates).length === 0) {
    console.log(chalk.yellow("No updates provided. Use --title, --description, --expected, or --tags"));
    return;
  }

  const updatedTask = updateTask(cwd, taskId, updates);

  if (!updatedTask) {
    console.log(chalk.red(`❌ Task #${taskId} not found`));
    return;
  }

  console.log(chalk.green(`✅ Updated task #${taskId}`));
  console.log(chalk.gray(JSON.stringify(updates, null, 2)));
}
