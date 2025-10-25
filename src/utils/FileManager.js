/**
 * FileManager - 使用 File System Access API 管理檔案系統
 * 支援讀寫 todo.md 和 todo/ 資料夾中的任務檔案
 */

const STATUS_FOLDERS = {
  pending: 'pending',
  inProgress: 'in-progress',
  completed: 'completed',
};

class FileManager {
  constructor() {
    this.directoryHandle = null;
    this.todoFileHandle = null;
    this.todoFolderHandle = null;
  }

  /**
   * 請求存取專案資料夾
   * @returns {Promise<boolean>} 是否成功取得權限
   */
  async requestAccess() {
    try {
      // 檢查瀏覽器支援度
      if (!('showDirectoryPicker' in window)) {
        throw new Error('Your browser does not support File System Access API. Please use Chrome or Edge.');
      }

      // 請求選擇資料夾
      this.directoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
      });

      // 驗證資料夾結構
      await this.validateFolderStructure();

      return true;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('User cancelled folder selection');
        return false;
      }
      throw error;
    }
  }

  /**
   * 驗證並建立必要的資料夾結構
   */
  async validateFolderStructure() {
    // 取得或建立 todo.md
    try {
      this.todoFileHandle = await this.directoryHandle.getFileHandle('todo.md', { create: true });
    } catch (error) {
      throw new Error('Cannot access todo.md file');
    }

    // 取得或建立 todo 資料夾
    try {
      this.todoFolderHandle = await this.directoryHandle.getDirectoryHandle('todo', { create: true });
    } catch (error) {
      throw new Error('Cannot access todo folder');
    }

    // 建立子資料夾
    for (const folder of Object.values(STATUS_FOLDERS)) {
      await this.todoFolderHandle.getDirectoryHandle(folder, { create: true });
    }
  }

  /**
   * 讀取 todo.md 內容
   * @returns {Promise<string>} 檔案內容
   */
  async readTodoMd() {
    if (!this.todoFileHandle) {
      throw new Error('No access to todo.md. Please select a folder first.');
    }

    const file = await this.todoFileHandle.getFile();
    const content = await file.text();
    return content;
  }

  /**
   * 寫入 todo.md
   * @param {string} content 檔案內容
   */
  async writeTodoMd(content) {
    if (!this.todoFileHandle) {
      throw new Error('No access to todo.md. Please select a folder first.');
    }

    const writable = await this.todoFileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  /**
   * 讀取單一 task 檔案
   * @param {string} taskId task ID (例: task-001)
   * @param {string} status 狀態 (pending/inProgress/completed)
   * @returns {Promise<string>} 檔案內容
   */
  async readTaskFile(taskId, status) {
    const folderName = STATUS_FOLDERS[status];
    const folderHandle = await this.todoFolderHandle.getDirectoryHandle(folderName);
    const fileHandle = await folderHandle.getFileHandle(`${taskId}.md`);
    const file = await fileHandle.getFile();
    return await file.text();
  }

  /**
   * 寫入 task 檔案
   * @param {string} taskId task ID
   * @param {string} status 狀態
   * @param {string} content 檔案內容
   */
  async writeTaskFile(taskId, status, content) {
    const folderName = STATUS_FOLDERS[status];
    const folderHandle = await this.todoFolderHandle.getDirectoryHandle(folderName);
    const fileHandle = await folderHandle.getFileHandle(`${taskId}.md`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  /**
   * 移動 task 檔案
   * @param {string} taskId task ID
   * @param {string} fromStatus 來源狀態
   * @param {string} toStatus 目標狀態
   */
  async moveTaskFile(taskId, fromStatus, toStatus) {
    // 讀取原檔案內容
    const content = await this.readTaskFile(taskId, fromStatus);

    // 更新 status metadata
    const updatedContent = this.updateTaskStatus(content, toStatus);

    // 寫入新位置
    await this.writeTaskFile(taskId, toStatus, updatedContent);

    // 刪除舊檔案
    await this.deleteTaskFile(taskId, fromStatus);
  }

  /**
   * 更新 task 檔案中的 status metadata
   * @param {string} content 檔案內容
   * @param {string} newStatus 新狀態
   * @returns {string} 更新後的內容
   */
  updateTaskStatus(content, newStatus) {
    // 將 camelCase 轉為 kebab-case
    const statusValue = newStatus.replace(/([A-Z])/g, '-$1').toLowerCase();

    // 更新 status 行
    const statusRegex = /^Status:\s*.+$/m;
    if (statusRegex.test(content)) {
      return content.replace(statusRegex, `Status: ${statusValue}`);
    } else {
      // 如果沒有 status 行,在結尾加上
      return content.trimEnd() + `\nStatus: ${statusValue}\n`;
    }
  }

  /**
   * 刪除 task 檔案
   * @param {string} taskId task ID
   * @param {string} status 狀態
   */
  async deleteTaskFile(taskId, status) {
    const folderName = STATUS_FOLDERS[status];
    const folderHandle = await this.todoFolderHandle.getDirectoryHandle(folderName);
    await folderHandle.removeEntry(`${taskId}.md`);
  }

  /**
   * 列出所有 tasks
   * @returns {Promise<Object>} { pending: [], inProgress: [], completed: [] }
   */
  async listAllTasks() {
    const tasks = {
      pending: [],
      inProgress: [],
      completed: [],
    };

    for (const [status, folderName] of Object.entries(STATUS_FOLDERS)) {
      try {
        const folderHandle = await this.todoFolderHandle.getDirectoryHandle(folderName);

        for await (const entry of folderHandle.values()) {
          if (entry.kind === 'file' && entry.name.endsWith('.md')) {
            const taskId = entry.name.replace('.md', '');
            tasks[status].push(taskId);
          }
        }
      } catch (error) {
        console.warn(`Cannot access ${folderName} folder:`, error);
      }
    }

    return tasks;
  }

  /**
   * 取得下一個可用的 task ID
   * @returns {Promise<string>} 新的 task ID (例: task-001)
   */
  async getNextTaskId() {
    const allTasks = await this.listAllTasks();
    const allIds = [
      ...allTasks.pending,
      ...allTasks.inProgress,
      ...allTasks.completed,
    ];

    if (allIds.length === 0) {
      return 'task-001';
    }

    // 找出最大的數字
    const numbers = allIds
      .map(id => parseInt(id.replace('task-', ''), 10))
      .filter(n => !isNaN(n));

    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;

    return `task-${String(nextNumber).padStart(3, '0')}`;
  }

  /**
   * 建立新的 task
   * @param {string} title 標題
   * @param {string} status 初始狀態 (預設: pending)
   * @returns {Promise<string>} 新建立的 task ID
   */
  async createTask(title, status = 'pending') {
    const taskId = await this.getNextTaskId();
    const today = new Date().toISOString().split('T')[0];

    const content = `# [${taskId}] ${title}

## 描述
[新增描述]

## Checklist
- [ ] 待辦事項 1

## 筆記
[新增筆記]

---
Created: ${today}
Status: ${status}
`;

    await this.writeTaskFile(taskId, status, content);
    return taskId;
  }

  /**
   * 檢查是否有資料夾存取權限
   * @returns {boolean}
   */
  hasAccess() {
    return this.directoryHandle !== null;
  }
}

export default FileManager;
