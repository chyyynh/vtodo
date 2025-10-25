/**
 * VTodo Storage Schema
 *
 * 1. .vtodo/tasks.json - 主要資料來源 (快速讀寫)
 * 2. todo/*.md - 可選的詳細筆記 (markdown-friendly)
 */

/**
 * tasks.json 結構
 * @typedef {Object} TasksData
 * @property {string} version - Schema version
 * @property {Task[]} tasks - 任務列表
 */

/**
 * 單一任務結構
 * @typedef {Object} Task
 * @property {string} id - 任務 ID (001, 002, ...)
 * @property {string} title - 任務標題
 * @property {string} status - 狀態: pending | in-progress | completed
 * @property {string} description - 簡短描述
 * @property {ChecklistItem[]} checklist - 檢查清單
 * @property {string[]} tags - 標籤
 * @property {string} expected - 預計時間
 * @property {string} created - 建立時間 ISO string
 * @property {string} updated - 更新時間 ISO string
 * @property {boolean} hasDetailFile - 是否有詳細筆記檔案
 */

/**
 * Checklist 項目
 * @typedef {Object} ChecklistItem
 * @property {string} text - 項目文字
 * @property {boolean} checked - 是否完成
 */

/**
 * 預設的 tasks.json 結構
 */
export const DEFAULT_TASKS_DATA = {
  version: "1.0.0",
  tasks: []
};

/**
 * 建立新任務的預設值
 * @param {string} id
 * @param {string} title
 * @returns {Task}
 */
export function createDefaultTask(id, title) {
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
 * todo/001-task.md:
 *
 * # 任務標題
 *
 * ## 詳細說明
 * ...
 *
 * ## 技術筆記
 * ...
 *
 * ## 相關連結
 * - [Link 1](...)
 */

/**
 * 檔案路徑常數
 */
export const PATHS = {
  VTODO_DIR: ".vtodo",
  TASKS_JSON: ".vtodo/tasks.json",
  TODO_DIR: "todo"
};

/**
 * 狀態常數
 */
export const STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed"
};

/**
 * 驗證任務資料
 * @param {Task} task
 * @returns {boolean}
 */
export function validateTask(task) {
  if (!task.id || typeof task.id !== 'string') return false;
  if (!task.title || typeof task.title !== 'string') return false;
  if (!Object.values(STATUS).includes(task.status)) return false;
  if (!Array.isArray(task.checklist)) return false;
  if (!Array.isArray(task.tags)) return false;

  return true;
}

export default {
  DEFAULT_TASKS_DATA,
  createDefaultTask,
  validateTask,
  PATHS,
  STATUS
};
