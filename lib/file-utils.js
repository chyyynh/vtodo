import fs from "fs";
import path from "path";
import {
  DEFAULT_TASKS_DATA,
  createDefaultTask,
  validateTask,
  PATHS,
  STATUS
} from "./storage-schema.js";

/**
 * 確保專案已初始化
 * @param {string} cwd - 專案目錄
 */
export async function ensureRepoInit(cwd) {
  const vtodoDir = path.join(cwd, PATHS.VTODO_DIR);
  const tasksJsonPath = path.join(cwd, PATHS.TASKS_JSON);
  const todoDir = path.join(cwd, PATHS.TODO_DIR);

  // 建立 .vtodo 資料夾
  if (!fs.existsSync(vtodoDir)) {
    fs.mkdirSync(vtodoDir, { recursive: true });
  }

  // 建立 tasks.json
  if (!fs.existsSync(tasksJsonPath)) {
    fs.writeFileSync(
      tasksJsonPath,
      JSON.stringify(DEFAULT_TASKS_DATA, null, 2),
      "utf-8"
    );
  }

  // 建立 todo 資料夾 (用於存放詳細筆記)
  if (!fs.existsSync(todoDir)) {
    fs.mkdirSync(todoDir, { recursive: true });
  }
}

/**
 * 讀取 tasks.json
 * @param {string} cwd - 專案目錄
 * @returns {Object} { version, tasks }
 */
export function readTasksJson(cwd) {
  const tasksJsonPath = path.join(cwd, PATHS.TASKS_JSON);

  if (!fs.existsSync(tasksJsonPath)) {
    return DEFAULT_TASKS_DATA;
  }

  try {
    const content = fs.readFileSync(tasksJsonPath, "utf-8");
    const data = JSON.parse(content);

    // 驗證資料結構
    if (!data.version || !Array.isArray(data.tasks)) {
      console.warn("Invalid tasks.json structure, using default");
      return DEFAULT_TASKS_DATA;
    }

    return data;
  } catch (error) {
    console.error("Error reading tasks.json:", error.message);
    return DEFAULT_TASKS_DATA;
  }
}

/**
 * 寫入 tasks.json
 * @param {string} cwd - 專案目錄
 * @param {Object} data - { version, tasks }
 */
export function writeTasksJson(cwd, data) {
  const tasksJsonPath = path.join(cwd, PATHS.TASKS_JSON);

  // 更新時間戳
  data.tasks.forEach(task => {
    task.updated = new Date().toISOString();
  });

  fs.writeFileSync(
    tasksJsonPath,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

/**
 * 取得所有任務
 * @param {string} cwd - 專案目錄
 * @returns {Array} tasks 陣列
 */
export function getAllTasks(cwd) {
  const data = readTasksJson(cwd);
  return data.tasks;
}

/**
 * 根據 ID 取得任務
 * @param {string} cwd - 專案目錄
 * @param {string} id - 任務 ID
 * @returns {Object|null} task 或 null
 */
export function getTaskById(cwd, id) {
  const tasks = getAllTasks(cwd);
  return tasks.find(t => t.id === id) || null;
}

/**
 * 新增任務
 * @param {string} cwd - 專案目錄
 * @param {Object} taskData - 任務資料
 * @returns {Object} 新增的任務
 */
export function addTask(cwd, taskData) {
  const data = readTasksJson(cwd);

  // 產生新 ID
  const id = getNextTaskId(data.tasks);

  // 建立新任務
  const newTask = {
    ...createDefaultTask(id, taskData.title),
    ...taskData,
    id // 確保 ID 不被覆蓋
  };

  // 驗證任務
  if (!validateTask(newTask)) {
    throw new Error("Invalid task data");
  }

  data.tasks.push(newTask);
  writeTasksJson(cwd, data);

  return newTask;
}

/**
 * 更新任務
 * @param {string} cwd - 專案目錄
 * @param {string} id - 任務 ID
 * @param {Object} updates - 要更新的欄位
 * @returns {Object|null} 更新後的任務
 */
export function updateTask(cwd, id, updates) {
  const data = readTasksJson(cwd);
  const taskIndex = data.tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return null;
  }

  // 合併更新
  data.tasks[taskIndex] = {
    ...data.tasks[taskIndex],
    ...updates,
    id, // 確保 ID 不被改變
    updated: new Date().toISOString()
  };

  // 驗證更新後的任務
  if (!validateTask(data.tasks[taskIndex])) {
    throw new Error("Invalid task update");
  }

  writeTasksJson(cwd, data);
  return data.tasks[taskIndex];
}

/**
 * 刪除任務
 * @param {string} cwd - 專案目錄
 * @param {string} id - 任務 ID
 * @returns {boolean} 是否成功刪除
 */
export function deleteTask(cwd, id) {
  const data = readTasksJson(cwd);
  const taskIndex = data.tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return false;
  }

  const task = data.tasks[taskIndex];

  // 刪除任務
  data.tasks.splice(taskIndex, 1);
  writeTasksJson(cwd, data);

  // 如果有詳細檔案,也刪除
  if (task.hasDetailFile) {
    const detailPath = path.join(cwd, PATHS.TODO_DIR, `${id}-task.md`);
    if (fs.existsSync(detailPath)) {
      fs.unlinkSync(detailPath);
    }
  }

  return true;
}

/**
 * 取得下一個可用的任務 ID
 * @param {Array} tasks - 任務陣列
 * @returns {string} 新的任務 ID (001, 002, ...)
 */
export function getNextTaskId(tasks) {
  if (tasks.length === 0) return "001";

  const numbers = tasks
    .map(t => parseInt(t.id, 10))
    .filter(n => !isNaN(n));

  const maxNumber = Math.max(...numbers, 0);
  const nextNumber = maxNumber + 1;

  return String(nextNumber).padStart(3, "0");
}

/**
 * 根據狀態分組任務
 * @param {Array} tasks - 任務陣列
 * @returns {Object} { pending, inProgress, completed }
 */
export function groupTasksByStatus(tasks) {
  return {
    pending: tasks.filter(t => t.status === STATUS.PENDING),
    inProgress: tasks.filter(t => t.status === STATUS.IN_PROGRESS),
    completed: tasks.filter(t => t.status === STATUS.COMPLETED)
  };
}

/**
 * 讀取任務的詳細筆記檔案
 * @param {string} cwd - 專案目錄
 * @param {string} id - 任務 ID
 * @returns {string|null} markdown 內容或 null
 */
export function readTaskDetailFile(cwd, id) {
  const detailPath = path.join(cwd, PATHS.TODO_DIR, `${id}-task.md`);

  if (!fs.existsSync(detailPath)) {
    return null;
  }

  return fs.readFileSync(detailPath, "utf-8");
}

/**
 * 寫入任務的詳細筆記檔案
 * @param {string} cwd - 專案目錄
 * @param {string} id - 任務 ID
 * @param {string} content - markdown 內容
 */
export function writeTaskDetailFile(cwd, id, content) {
  const detailPath = path.join(cwd, PATHS.TODO_DIR, `${id}-task.md`);

  fs.writeFileSync(detailPath, content, "utf-8");

  // 更新任務的 hasDetailFile 標記
  updateTask(cwd, id, { hasDetailFile: true });
}

/**
 * 建立任務的預設詳細檔案
 * @param {string} cwd - 專案目錄
 * @param {string} id - 任務 ID
 * @param {string} title - 任務標題
 * @returns {string} 建立的檔案路徑
 */
export function createTaskDetailFile(cwd, id, title) {
  const content = `# ${title}

## 詳細說明
請在此處填寫詳細的任務說明...

## 技術筆記
- 記錄技術細節
- API 規格
- 實作方式

## 相關連結
- [相關文件](...)
- [設計稿](...)

## 進度記錄
### ${new Date().toISOString().split('T')[0]}
- 建立任務
`;

  writeTaskDetailFile(cwd, id, content);

  return path.join(cwd, PATHS.TODO_DIR, `${id}-task.md`);
}

/**
 * 計算 checklist 進度
 * @param {Array} checklist - checklist 陣列
 * @returns {number} 0-100 的進度百分比
 */
export function calculateProgress(checklist) {
  if (!checklist || checklist.length === 0) return 0;

  const completed = checklist.filter(item => item.checked).length;
  return Math.round((completed / checklist.length) * 100);
}

/**
 * 產生 slug (用於檔名)
 * @param {string} text - 文字
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

// 為了向後相容,保留舊的 API (已棄用)
export function parseTodoMd() {
  console.warn("parseTodoMd is deprecated. Use readTasksJson instead.");
  return { todos: [] };
}

export function writeTodoMd() {
  console.warn("writeTodoMd is deprecated. Use writeTasksJson instead.");
}

export function readTaskFile() {
  console.warn("readTaskFile is deprecated. Use getTaskById instead.");
  return null;
}

export function writeTaskFile() {
  console.warn("writeTaskFile is deprecated. Use updateTask instead.");
}

export default {
  ensureRepoInit,
  readTasksJson,
  writeTasksJson,
  getAllTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
  getNextTaskId,
  groupTasksByStatus,
  readTaskDetailFile,
  writeTaskDetailFile,
  createTaskDetailFile,
  calculateProgress,
  generateSlug
};
