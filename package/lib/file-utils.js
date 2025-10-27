import fs from "fs";
import path from "path";
import {
  DEFAULT_TODOS_DATA,
  createDefaultTodo,
  validateTodo,
  PATHS,
  STATUS
} from "./schema.js";

/**
 * Ensure repository is initialized (create .vtodo and todo/ if not exist)
 * @param {string} cwd - project directory
 */

export async function ensureRepoInit(cwd) {
  const vtodoDir = path.join(cwd, PATHS.VTODO_DIR);
  const todosJsonPath = path.join(cwd, PATHS.TODOS_JSON);
  const todoDir = path.join(cwd, PATHS.TODO_DIR);

  if (!fs.existsSync(vtodoDir)) {
    fs.mkdirSync(vtodoDir, { recursive: true });
  }

  if (!fs.existsSync(todosJsonPath)) {
    fs.writeFileSync(
      todosJsonPath,
      JSON.stringify(DEFAULT_TODOS_DATA, null, 2),
      "utf-8"
    );
  }

  if (!fs.existsSync(todoDir)) {
    fs.mkdirSync(todoDir, { recursive: true });
  }
}

/**
 * Read todos.json
 * @param {string} cwd - project directory
 * @returns {Object} { version, todos }
 */
export function readTodosJson(cwd) {
  const todosJsonPath = path.join(cwd, PATHS.TODOS_JSON);

  if (!fs.existsSync(todosJsonPath)) {
    return DEFAULT_TODOS_DATA;
  }

  try {
    const content = fs.readFileSync(todosJsonPath, "utf-8");
    const data = JSON.parse(content);

    if (!data.version || !Array.isArray(data.todos)) {
      console.warn("Invalid todos.json structure, using default");
      return DEFAULT_TODOS_DATA;
    }

    return data;
  } catch (error) {
    console.error("Error reading todos.json:", error.message);
    return DEFAULT_TODOS_DATA;
  }
}

/**
 * write todos.json
 * @param {string} cwd - project directory
 * @param {Object} data
 */
export function writeTodosJson(cwd, data) {
  const todosJsonPath = path.join(cwd, PATHS.TODOS_JSON);

  data.todos.forEach(todo => {
    todo.updated = new Date().toISOString();
  });

  fs.writeFileSync(
    todosJsonPath,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

/**
 * Get all todos
 * @param {string} cwd - project directory
 * @returns {Array} todos array
 */
export function getAllTodos(cwd) {
  const data = readTodosJson(cwd);
  return data.todos;
}

/**
 * Get todo by ID
 * @param {string} cwd
 * @param {string} id
 * @returns {Object|null}
 */
export function getTodoById(cwd, id) {
  const todos = getAllTodos(cwd);
  return todos.find(t => t.id === id) || null;
}

/**
 * Add new todo
 * @param {string} cwd - project directory
 * @param {Object} todoData - todo data
 * @returns {Object} added todo
 */
export function addTodo(cwd, todoData) {
  const data = readTodosJson(cwd);
  const id = getNextTodoId(data.todos);
  const newTodo = {
    ...createDefaultTodo(id, todoData.title),
    ...todoData,
    id
  };

  if (!validateTodo(newTodo)) {
    throw new Error("Invalid todo data");
  }

  data.todos.push(newTodo);
  writeTodosJson(cwd, data);
  return newTodo;
}

/**
 * Update todo
 * @param {string} cwd - project directory
 * @param {string} id - todo ID
 * @param {Object} updates - updated fields
 * @returns {Object|null} updated todo
 */
export function updateTodo(cwd, id, updates) {
  const data = readTodosJson(cwd);
  const todoIndex = data.todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return null;
  }

  data.todos[todoIndex] = {
    ...data.todos[todoIndex],
    ...updates,
    id,
    updated: new Date().toISOString()
  };

  if (!validateTodo(data.todos[todoIndex])) {
    throw new Error("Invalid todo update");
  }

  writeTodosJson(cwd, data);
  return data.todos[todoIndex];
}

/**
 * Delete todo
 * @param {string} cwd - project directory
 * @param {string} id - todo ID
 * @returns {boolean} 是否成功刪除
 */
export function deleteTodo(cwd, id) {
  const data = readTodosJson(cwd);
  const todoIndex = data.todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return false;
  }

  // Remove from todos.json
  data.todos.splice(todoIndex, 1);
  writeTodosJson(cwd, data);

  // Delete all files in todo/ directory that start with this ID
  const todoDir = path.join(cwd, PATHS.TODO_DIR);
  if (fs.existsSync(todoDir)) {
    const files = fs.readdirSync(todoDir);
    // Delete all files that start with "{id}-" (e.g., "001-todo.md", "001-notes.md", etc.)
    files.forEach(file => {
      if (file.startsWith(`${id}-`)) {
        const filePath = path.join(todoDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted: ${file}`);
        } catch (error) {
          console.error(`Failed to delete ${file}:`, error.message);
        }
      }
    });
  }

  return true;
}

/**
 * Archive todo (remove from JSON but keep files)
 * @param {string} cwd - project directory
 * @param {string} id - todo ID
 * @returns {boolean} 是否成功封存
 */
export function archiveTodo(cwd, id) {
  const data = readTodosJson(cwd);
  const todoIndex = data.todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return false;
  }

  // Remove from todos.json only (keep all files in todo/ directory)
  data.todos.splice(todoIndex, 1);
  writeTodosJson(cwd, data);

  console.log(`Archived todo ${id} (files preserved in todo/ directory)`);
  return true;
}

/**
 * Get next todo ID
 * @param {Array} todos - todo array
 * @returns {string} new todo ID
 */
export function getNextTodoId(todos) {
  if (todos.length === 0) return "001";

  const numbers = todos
    .map(t => parseInt(t.id, 10))
    .filter(n => !isNaN(n));

  const maxNumber = Math.max(...numbers, 0);
  const nextNumber = maxNumber + 1;

  return String(nextNumber).padStart(3, "0");
}

/**
 * Group todos by status
 * @param {Array} todos - todo array
 * @returns {Object} { pending, inProgress, completed }
 */
export function groupTodosByStatus(todos) {
  return {
    pending: todos.filter(t => t.status === STATUS.PENDING),
    inProgress: todos.filter(t => t.status === STATUS.IN_PROGRESS),
    completed: todos.filter(t => t.status === STATUS.COMPLETED)
  };
}

/**
 * Read todo detail file
 * @param {string} cwd - project directory
 * @param {string} id -  todo ID
 * @returns {string|null}  markdown content or null if not exist
 */
export function readTodoDetailFile(cwd, id) {
  const detailPath = path.join(cwd, PATHS.TODO_DIR, `${id}-todo.md`);

  if (!fs.existsSync(detailPath)) {
    return null;
  }

  return fs.readFileSync(detailPath, "utf-8");
}

/**
 * Write todo detail file
 * @param {string} cwd - project directory
 * @param {string} id - todo ID
 * @param {string} content - Markdown content
 */
export function writeTodoDetailFile(cwd, id, content) {
  const detailPath = path.join(cwd, PATHS.TODO_DIR, `${id}-todo.md`);

  fs.writeFileSync(detailPath, content, "utf-8");

  updateTodo(cwd, id, { hasDetailFile: true });
}

/**
 * Create todo detail file with template content
 * @param {string} cwd - project directory
 * @param {string} id - todo ID
 * @param {string} title - todo title
 * @returns {string} detail file path
 */
export function createTodoDetailFile(cwd, id, title) {
  const content = `# ${title}
    ## Description
    Please provide detailed todo description here...

    ## Technical Notes
    - Technical details
    - API specifications
    - Implementation approach

    ## Related Links
    - [Documentation](...)
    - [Design mockups](...)

    ## Progress Log
    ### ${new Date().toISOString().split('T')[0]}
    - Todo created
  `;

  writeTodoDetailFile(cwd, id, content);

  return path.join(cwd, PATHS.TODO_DIR, `${id}-todo.md`);
}

/**
 * Calculate progress from checklist
 * @param {Array} checklist - checklist array
 * @returns {number} progress percentage (0-100)
 */
export function calculateProgress(checklist) {
  if (!checklist || checklist.length === 0) return 0;

  const completed = checklist.filter(item => item.checked).length;
  return Math.round((completed / checklist.length) * 100);
}

/**
 * Generate slug from text
 * @param {string} text - text
 * @returns {string} slug
 */
export function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export default {
  ensureRepoInit,
  readTodosJson,
  writeTodosJson,
  getAllTodos,
  getTodoById,
  addTodo,
  updateTodo,
  deleteTodo,
  archiveTodo,
  getNextTodoId,
  groupTodosByStatus,
  readTodoDetailFile,
  writeTodoDetailFile,
  createTodoDetailFile,
  calculateProgress,
  generateSlug
};
