import { spawn } from "child_process";
import chalk from "chalk";
import {
  ensureRepoInit,
  getAllTodos,
  getTodoById,
  addTodo,
  updateTodo,
  deleteTodo,
  groupTodosByStatus,
  createTodoDetailFile,
  readTodoDetailFile,
  calculateProgress
} from "./file-utils.js";
import { STATUS } from "./schema.js";
import path from "path";
import fs from "fs";

/**
 * Initialize vtodo (create .vtodo/todos.json and todo/ folder)
 */
export async function initCmd(cwd) {
  await ensureRepoInit(cwd);
  console.log(chalk.green("Initialized vtodo in repository."));
  console.log(chalk.gray("   Created: .vtodo/todos.json, /todo"));
}

/**
 * Add a new todo
 */
export async function addCmd(cwd, title, options) {
  await ensureRepoInit(cwd);

  const todoData = {
    title,
    description: options.description || "",
    expected: options.expected || "",
    tags: options.tags ? options.tags.split(",").map(s => s.trim()) : []
  };

  const newTodo = addTodo(cwd, todoData);

  console.log(chalk.green(`✨ Added TODO #${newTodo.id}: ${newTodo.title}`));

  // 如果使用 --detail 選項,建立詳細檔案
  if (options.detail) {
    const detailPath = createTodoDetailFile(cwd, newTodo.id, newTodo.title);
    console.log(chalk.gray(`   Detail file: ${detailPath}`));
  }
}

/**
 * List all todos
 */
export async function listCmd(cwd, options = {}) {
  const todos = getAllTodos(cwd);

  if (todos.length === 0) {
    console.log(chalk.gray("No todos yet. Add one with `vtodo add \"Todo title\"`"));
    return;
  }

  const grouped = groupTodosByStatus(todos);

  console.log(chalk.blue("\n📝 Todo List:\n"));

  // Pending
  if (grouped.pending.length > 0) {
    console.log(chalk.yellow("⏳ Pending:"));
    grouped.pending.forEach(displayTodo);
    console.log();
  }

  // In Progress
  if (grouped.inProgress.length > 0) {
    console.log(chalk.cyan("🚀 In Progress:"));
    grouped.inProgress.forEach(displayTodo);
    console.log();
  }

  // Completed
  if (grouped.completed.length > 0 && !options.hideCompleted) {
    console.log(chalk.green("✅ Completed:"));
    grouped.completed.forEach(displayTodo);
    console.log();
  }
}

/**
 * Display a single todo
 */
function displayTodo(todo) {
  const checkbox = todo.status === STATUS.COMPLETED ? chalk.green("✅") : chalk.yellow("🔲");
  const time = todo.expected ? chalk.gray(`(${todo.expected})`) : "";
  const tagStr = todo.tags.length > 0 ? chalk.cyan(`[${todo.tags.join(", ")}]`) : "";

  console.log(`${checkbox} [${todo.id}] ${todo.title} ${time} ${tagStr}`);

  // Show progress if has checklist
  if (todo.checklist && todo.checklist.length > 0) {
    const progress = calculateProgress(todo.checklist);
    const completed = todo.checklist.filter(i => i.checked).length;
    const total = todo.checklist.length;
    console.log(chalk.gray(`   Progress: ${completed}/${total} (${progress}%)`));
  }

  if (todo.description) {
    console.log(chalk.gray(`   ${todo.description}`));
  }
}

/**
 * Show todo details
 */
export async function showCmd(cwd, id) {
  const todoId = String(id).padStart(3, "0");
  const todo = getTodoById(cwd, todoId);

  if (!todo) {
    console.log(chalk.red(`❌ Todo #${todoId} not found`));
    return;
  }

  console.log(chalk.blue(`\n📋 Todo #${todo.id}: ${todo.title}\n`));
  console.log(chalk.gray(`Status: ${todo.status}`));
  console.log(chalk.gray(`Created: ${new Date(todo.created).toLocaleString()}`));
  console.log(chalk.gray(`Updated: ${new Date(todo.updated).toLocaleString()}`));

  if (todo.expected) {
    console.log(chalk.gray(`Expected: ${todo.expected}`));
  }

  if (todo.tags.length > 0) {
    console.log(chalk.gray(`Tags: ${todo.tags.join(", ")}`));
  }

  if (todo.description) {
    console.log(chalk.gray(`\nDescription:\n${todo.description}`));
  }

  if (todo.checklist && todo.checklist.length > 0) {
    console.log(chalk.yellow("\nChecklist:"));
    todo.checklist.forEach(item => {
      const checkbox = item.checked ? "[x]" : "[ ]";
      console.log(`  ${checkbox} ${item.text}`);
    });

    const progress = calculateProgress(todo.checklist);
    console.log(chalk.gray(`\nProgress: ${progress}%`));
  }

  // Show detail file if exists
  if (todo.hasDetailFile) {
    const detailContent = readTodoDetailFile(cwd, todoId);
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
 * Update todo status
 */
export async function statusCmd(cwd, id, newStatus) {
  const todoId = String(id).padStart(3, "0");

  const validStatuses = Object.values(STATUS);
  if (!validStatuses.includes(newStatus)) {
    console.log(chalk.red(`❌ Invalid status. Use: ${validStatuses.join(", ")}`));
    return;
  }

  const updatedTodo = updateTodo(cwd, todoId, { status: newStatus });

  if (!updatedTodo) {
    console.log(chalk.red(`❌ Todo #${todoId} not found`));
    return;
  }

  const statusEmoji = {
    [STATUS.PENDING]: "⏳",
    [STATUS.IN_PROGRESS]: "🚀",
    [STATUS.COMPLETED]: "✅"
  };

  console.log(chalk.green(
    `${statusEmoji[newStatus]} Todo #${todoId} → ${newStatus}`
  ));
}

/**
 * Mark a todo as done (shortcut for status completed)
 */
export async function doneCmd(cwd, id) {
  await statusCmd(cwd, id, STATUS.COMPLETED);
}

/**
 * Reopen a todo (shortcut for status pending)
 */
export async function undoCmd(cwd, id) {
  await statusCmd(cwd, id, STATUS.PENDING);
}

/**
 * Edit todo detail file
 */
export async function editCmd(cwd, id) {
  const todoId = String(id).padStart(3, "0");
  const todo = getTodoById(cwd, todoId);

  if (!todo) {
    console.log(chalk.red(`❌ Todo #${todoId} not found`));
    return;
  }

  // Create detail file if not exists
  if (!todo.hasDetailFile) {
    const detailPath = createTodoDetailFile(cwd, todo.id, todo.title);
    console.log(chalk.gray(`Created detail file: ${detailPath}`));
  }

  const detailPath = path.join(cwd, "todo", `${todoId}-todo.md`);

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
 * Remove a todo
 */
export async function removeCmd(cwd, id) {
  const todoId = String(id).padStart(3, "0");
  const todo = getTodoById(cwd, todoId);

  if (!todo) {
    console.log(chalk.red(`❌ Todo #${todoId} not found`));
    return;
  }

  const success = deleteTodo(cwd, todoId);

  if (success) {
    console.log(chalk.red(`🗑️  Removed TODO #${todoId}: ${todo.title}`));
  } else {
    console.log(chalk.red(`❌ Failed to remove todo #${todoId}`));
  }
}

/**
 * Update todo properties
 */
export async function updateCmd(cwd, id, options) {
  const todoId = String(id).padStart(3, "0");

  const updates = {};

  if (options.title) updates.title = options.title;
  if (options.description) updates.description = options.description;
  if (options.expected) updates.expected = options.expected;
  if (options.tags) updates.tags = options.tags.split(",").map(s => s.trim());

  if (Object.keys(updates).length === 0) {
    console.log(chalk.yellow("No updates provided. Use --title, --description, --expected, or --tags"));
    return;
  }

  const updatedTodo = updateTodo(cwd, todoId, updates);

  if (!updatedTodo) {
    console.log(chalk.red(`❌ Todo #${todoId} not found`));
    return;
  }

  console.log(chalk.green(`✅ Updated todo #${todoId}`));
  console.log(chalk.gray(JSON.stringify(updates, null, 2)));
}
