/**
 * VTodo Storage Schema
 *
 * 1. .vtodo/todos.json - Main data source (fast read/write)
 * 2. todo/*.md - Optional detailed notes (markdown-friendly)
 */

/**
 * todos.json structure
 * @typedef {Object} TodosData
 * @property {string} version - Schema version
 * @property {Todo[]} todos - List of todos
 */

/**
 * Single todo structure
 * @typedef {Object} Todo
 * @property {string} id - Todo ID (001, 002, ...)
 * @property {string} title - Todo title
 * @property {string} status - Status: pending | in-progress | completed
 * @property {string} description - Short description
 * @property {ChecklistItem[]} checklist - Checklist items
 * @property {string[]} tags - Tags
 * @property {string} expected - Expected time
 * @property {string} created - Created timestamp (ISO string)
 * @property {string} updated - Updated timestamp (ISO string)
 * @property {boolean} hasDetailFile - Whether has detail file
 */

/**
 * Checklist item
 * @typedef {Object} ChecklistItem
 * @property {string} text - Item text
 * @property {boolean} checked - Whether checked
 */

/**
 * Default todos.json structure
 */
export const DEFAULT_TODOS_DATA = {
  version: "1.0.0",
  todos: []
};

/**
 * Create default todo
 * @param {string} id
 * @param {string} title
 * @returns {Todo}
 */
export function createDefaultTodo(id, title) {
  const now = new Date().toISOString();

  return {
    id,
    title,
    status: "pending",
    description: "",
    checklist: [],
    tags: [],
    expected: "",
    created: now,
    updated: now,
    hasDetailFile: false
  };
}

/**
 * Markdown Todo Implementation detail
 *
 * todo/001-todo.md:
 *
 * # Todo Title
 *
 * ## Description
 * ...
 *
 * ## Technical Notes
 * ...
 *
 * ## Related Links
 * - [Link 1](...)
 */

/**
 * File path constants
 */
export const PATHS = {
  VTODO_DIR: ".vtodo",
  TODOS_JSON: ".vtodo/todos.json",
  TODO_DIR: "todo"
};

/**
 * Status constants
 */
export const STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed"
};

/**
 * Validate todo data
 * @param {Todo} todo
 * @returns {boolean}
 */
export function validateTodo(todo) {
  if (!todo.id || typeof todo.id !== 'string') return false;
  if (!todo.title || typeof todo.title !== 'string') return false;
  if (!Object.values(STATUS).includes(todo.status)) return false;
  if (!Array.isArray(todo.checklist)) return false;
  if (!Array.isArray(todo.tags)) return false;

  return true;
}

export default {
  DEFAULT_TODOS_DATA,
  createDefaultTodo,
  validateTodo,
  PATHS,
  STATUS
};
