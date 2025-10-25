/**
 * MarkdownParser - 解析和序列化 Markdown 檔案
 * 處理 todo.md 和個別 task 檔案的格式轉換
 */

import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

/**
 * 解析 todo.md 內容
 * @param {string} content todo.md 的內容
 * @returns {Object} { pending: [...], inProgress: [...], completed: [...] }
 */
export function parseTodoMd(content) {
  const tasks = {
    pending: [],
    inProgress: [],
    completed: [],
  };

  if (!content || content.trim() === '') {
    return tasks;
  }

  const lines = content.split('\n');
  let currentSection = null;

  for (const line of lines) {
    // 識別區塊標題
    if (line.startsWith('## Pending')) {
      currentSection = 'pending';
      continue;
    } else if (line.startsWith('## In Progress')) {
      currentSection = 'inProgress';
      continue;
    } else if (line.startsWith('## Completed')) {
      currentSection = 'completed';
      continue;
    }

    // 解析 task 行
    if (currentSection && line.trim().startsWith('- [')) {
      const taskMatch = line.match(/\[([xX\s])\]\s*\[([^\]]+)\]\s*(.+)/);
      if (taskMatch) {
        const [, checked, id, title] = taskMatch;
        tasks[currentSection].push({
          id: id.trim(),
          title: title.trim(),
          checked: checked.toLowerCase() === 'x',
        });
      }
    }
  }

  return tasks;
}

/**
 * 序列化成 todo.md 格式
 * @param {Object} tasks { pending: [...], inProgress: [...], completed: [...] }
 * @returns {string} todo.md 內容
 */
export function serializeTodoMd(tasks) {
  let content = '# Todo List\n\n';

  // Pending 區塊
  content += '## Pending\n';
  if (tasks.pending && tasks.pending.length > 0) {
    for (const task of tasks.pending) {
      const checkbox = task.checked ? '[x]' : '[ ]';
      content += `- ${checkbox} [${task.id}] ${task.title}\n`;
    }
  }
  content += '\n';

  // In Progress 區塊
  content += '## In Progress\n';
  if (tasks.inProgress && tasks.inProgress.length > 0) {
    for (const task of tasks.inProgress) {
      const checkbox = task.checked ? '[x]' : '[ ]';
      content += `- ${checkbox} [${task.id}] ${task.title}\n`;
    }
  }
  content += '\n';

  // Completed 區塊
  content += '## Completed\n';
  if (tasks.completed && tasks.completed.length > 0) {
    for (const task of tasks.completed) {
      const checkbox = '[x]'; // Completed 永遠是勾選狀態
      content += `- ${checkbox} [${task.id}] ${task.title}\n`;
    }
  }

  return content;
}

/**
 * 解析單一 task 檔案
 * @param {string} content task 檔案內容
 * @returns {Object} task 資料物件
 */
export function parseTaskFile(content) {
  const task = {
    id: '',
    title: '',
    description: '',
    checklist: [],
    notes: '',
    links: '',
    metadata: {},
    rawContent: content,
  };

  if (!content || content.trim() === '') {
    return task;
  }

  const lines = content.split('\n');
  let currentSection = null;
  let sectionContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 解析標題行 (第一行)
    if (i === 0 && line.startsWith('# [')) {
      const match = line.match(/# \[([^\]]+)\]\s*(.+)/);
      if (match) {
        task.id = match[1].trim();
        task.title = match[2].trim();
      }
      continue;
    }

    // 識別區塊
    if (line.startsWith('## 描述') || line.startsWith('## Description')) {
      if (currentSection && sectionContent.length > 0) {
        saveSection(task, currentSection, sectionContent);
      }
      currentSection = 'description';
      sectionContent = [];
      continue;
    } else if (line.startsWith('## Checklist')) {
      if (currentSection && sectionContent.length > 0) {
        saveSection(task, currentSection, sectionContent);
      }
      currentSection = 'checklist';
      sectionContent = [];
      continue;
    } else if (line.startsWith('## 筆記') || line.startsWith('## Notes') || line.startsWith('## 進度筆記')) {
      if (currentSection && sectionContent.length > 0) {
        saveSection(task, currentSection, sectionContent);
      }
      currentSection = 'notes';
      sectionContent = [];
      continue;
    } else if (line.startsWith('## 相關連結') || line.startsWith('## Links')) {
      if (currentSection && sectionContent.length > 0) {
        saveSection(task, currentSection, sectionContent);
      }
      currentSection = 'links';
      sectionContent = [];
      continue;
    } else if (line.trim() === '---') {
      if (currentSection && sectionContent.length > 0) {
        saveSection(task, currentSection, sectionContent);
      }
      currentSection = 'metadata';
      sectionContent = [];
      continue;
    }

    // 收集區塊內容
    if (currentSection) {
      sectionContent.push(line);
    }
  }

  // 儲存最後一個區塊
  if (currentSection && sectionContent.length > 0) {
    saveSection(task, currentSection, sectionContent);
  }

  return task;
}

/**
 * 儲存區塊內容到 task 物件
 */
function saveSection(task, section, lines) {
  const content = lines.join('\n').trim();

  switch (section) {
    case 'description':
      task.description = content;
      break;

    case 'checklist':
      task.checklist = lines
        .filter(line => line.trim().startsWith('- ['))
        .map(line => {
          const match = line.match(/- \[([xX\s])\]\s*(.+)/);
          if (match) {
            return {
              checked: match[1].toLowerCase() === 'x',
              text: match[2].trim(),
            };
          }
          return null;
        })
        .filter(Boolean);
      break;

    case 'notes':
      task.notes = content;
      break;

    case 'links':
      task.links = content;
      break;

    case 'metadata':
      const metadataLines = lines.filter(line => line.includes(':'));
      for (const line of metadataLines) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        if (key && value) {
          task.metadata[key.trim()] = value;
        }
      }
      break;
  }
}

/**
 * 序列化 task 物件成 markdown
 * @param {Object} task task 資料物件
 * @returns {string} markdown 內容
 */
export function serializeTaskFile(task) {
  let content = `# [${task.id}] ${task.title}\n\n`;

  // 描述區塊
  content += '## 描述\n';
  content += (task.description || '[新增描述]') + '\n\n';

  // Checklist 區塊
  content += '## Checklist\n';
  if (task.checklist && task.checklist.length > 0) {
    for (const item of task.checklist) {
      const checkbox = item.checked ? '[x]' : '[ ]';
      content += `- ${checkbox} ${item.text}\n`;
    }
  } else {
    content += '- [ ] 待辦事項 1\n';
  }
  content += '\n';

  // 筆記區塊
  content += '## 筆記\n';
  content += (task.notes || '[新增筆記]') + '\n\n';

  // 相關連結區塊
  if (task.links) {
    content += '## 相關連結\n';
    content += task.links + '\n\n';
  }

  // Metadata 區塊
  content += '---\n';
  if (task.metadata && Object.keys(task.metadata).length > 0) {
    for (const [key, value] of Object.entries(task.metadata)) {
      content += `${key}: ${value}\n`;
    }
  } else {
    const today = new Date().toISOString().split('T')[0];
    content += `Created: ${today}\n`;
    content += `Status: pending\n`;
  }

  return content;
}

/**
 * 計算 checklist 完成進度
 * @param {Array} checklist checklist 陣列
 * @returns {number} 完成百分比 (0-100)
 */
export function calculateProgress(checklist) {
  if (!checklist || checklist.length === 0) {
    return 0;
  }

  const completed = checklist.filter(item => item.checked).length;
  return Math.round((completed / checklist.length) * 100);
}

/**
 * 將 markdown 轉換成 HTML (用於預覽)
 * @param {string} markdown markdown 內容
 * @returns {string} HTML 內容
 */
export function markdownToHtml(markdown) {
  return md.render(markdown);
}

export default {
  parseTodoMd,
  serializeTodoMd,
  parseTaskFile,
  serializeTaskFile,
  calculateProgress,
  markdownToHtml,
};
