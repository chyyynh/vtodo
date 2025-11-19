// ============================================
// State Management
// ============================================
const state = {
  todos: [],
  loading: false,
  error: null,
  viewMode: 'list', // 'list' or 'board'
  selectedTags: [], // Array of selected tag strings for filtering
};

const listeners = [];

function setState(updates) {
  Object.assign(state, updates);
  listeners.forEach((fn) => fn(state));
}

function subscribe(listener) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

// Generate issue ID - just use the todo's actual id
function generateIssueId(todoId) {
  return todoId;
}

// ============================================
// API Client
// ============================================
const API = {
  async fetchTodos() {
    const response = await fetch('/api/todos');
    const data = await response.json();
    return data.todos || [];
  },

  async fetchTodoDetail(id) {
    const response = await fetch(`/api/todos/${id}`);
    const data = await response.json();
    return data.todo;
  },

  async createTodo(todoData) {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todoData),
    });
    const data = await response.json();
    return data.todo;
  },

  async updateTodo(id, updates) {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data.todo;
  },

  async deleteTodo(id) {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
  },

  async archiveTodo(id) {
    await fetch(`/api/todos/${id}/archive`, { method: 'POST' });
  },

  async updateDetail(id, content) {
    await fetch(`/api/todos/${id}/detail`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  },
};

// ============================================
// Utilities
// ============================================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Todo',
    'in-progress': 'In Progress',
    backlog: 'Backlog',
    completed: 'Done',
  };
  return labels[status] || status;
}

function getStatusIcon(status) {
  const baseClass = "w-3.5 h-3.5";
  
  switch (status) {
    case 'completed':
      return `<svg class="${baseClass} text-[#5E6AD2]" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="7" r="7" fill="currentColor"/>
        <path d="M4 7L6 9L10 5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    
    case 'in-progress':
      return `<svg class="${baseClass} text-[#F59E0B]" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14Z" fill="currentColor" fill-opacity="0.2"/>
        <path d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0V14Z" fill="currentColor"/>
      </svg>`;
      
    case 'backlog':
      return `<svg class="${baseClass} text-gray-500" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="7" r="6.25" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3"/>
      </svg>`;
      
    default: // pending/todo
      return `<svg class="${baseClass} text-gray-500" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="7" r="6.25" stroke="currentColor" stroke-width="1.5"/>
      </svg>`;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (itemDate.getTime() === today.getTime()) {
    return 'Today';
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (itemDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getAllTags(todos) {
  const tagsSet = new Set();
  todos.forEach((todo) => {
    if (todo.tags && Array.isArray(todo.tags)) {
      todo.tags.forEach((tag) => tagsSet.add(tag));
    }
  });
  return Array.from(tagsSet).sort();
}

function filterTodosByTags(todos, selectedTags) {
  if (selectedTags.length === 0) {
    return todos;
  }
  return todos.filter((todo) => {
    if (!todo.tags || !Array.isArray(todo.tags)) {
      return false;
    }
    return selectedTags.some((tag) => todo.tags.includes(tag));
  });
}

// ============================================
// Rendering Functions
// ============================================
function groupTodosByStatus(todos) {
  const groups = {
    'in-progress': [],
    pending: [],
    backlog: [],
    completed: [],
  };

  todos.forEach((todo) => {
    if (groups[todo.status]) {
      groups[todo.status].push(todo);
    }
  });

  return groups;
}

function renderStatusSection(status, todos, label) {
  const section = document.createElement('div');
  section.className = 'status-section mb-6';
  section.dataset.status = status;

  // Section header
  const header = document.createElement('div');
  header.className = 'flex items-center gap-2 mb-2 px-4 group';

  const icon = document.createElement('span');
  icon.className = 'flex items-center opacity-70';
  icon.innerHTML = getStatusIcon(status);

  const title = document.createElement('h3');
  title.className = 'text-sm font-medium text-[#eeeeee]';
  title.textContent = label;

  const count = document.createElement('span');
  count.className = 'text-xs text-gray-500 ml-1';
  count.textContent = todos.length;

  const addBtn = document.createElement('button');
  addBtn.className = 'ml-2 p-0.5 text-gray-500 hover:text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity';
  addBtn.innerHTML =
    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>';
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openEditModal(null);
  });

  header.appendChild(icon);
  header.appendChild(title);
  header.appendChild(count);
  header.appendChild(addBtn);
  section.appendChild(header);

  // Drop zone setup
  section.addEventListener('dragover', handleDragOver);
  section.addEventListener('drop', handleDrop);
  section.addEventListener('dragleave', handleDragLeave);

  // Issues list container
  const listContainer = document.createElement('div');
  listContainer.className = 'border-t border-[#2a2a2a]';
  
  if (todos.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'px-4 py-3 text-xs text-gray-600 italic';
    emptyState.textContent = 'No issues';
    listContainer.appendChild(emptyState);
  } else {
    todos.forEach((todo) => {
      listContainer.appendChild(renderIssueItem(todo));
    });
  }

  section.appendChild(listContainer);
  return section;
}

function renderIssueItem(todo) {
  const item = document.createElement('div');
  item.className = 'issue-item flex items-center gap-3 py-2 px-4 cursor-default group hover:bg-[#1a1a1a]';
  item.dataset.todoId = todo.id;
  item.draggable = true;

  // Drag events
  item.addEventListener('dragstart', handleDragStart);
  item.addEventListener('dragend', handleDragEnd);

  // Click event
  let isDragging = false;
  item.addEventListener('mousedown', () => { isDragging = false; });
  item.addEventListener('dragstart', () => { isDragging = true; });
  item.addEventListener('click', () => {
    if (!isDragging) openEditModal(todo.id);
    isDragging = false;
  });

  // Checkbox/Status
  const statusIcon = document.createElement('div');
  statusIcon.className = 'flex items-center flex-shrink-0 cursor-pointer opacity-70 hover:opacity-100';
  statusIcon.innerHTML = getStatusIcon(todo.status);
  item.appendChild(statusIcon);

  // Issue ID
  const issueId = document.createElement('div');
  issueId.className = 'text-xs text-gray-500 font-mono w-14 flex-shrink-0';
  issueId.textContent = generateIssueId(todo.id);
  item.appendChild(issueId);

  // Title
  const titleContainer = document.createElement('div');
  titleContainer.className = 'flex-1 min-w-0 flex items-center gap-2';
  
  const titleText = document.createElement('span');
  titleText.className = 'text-sm text-[#eeeeee] truncate font-medium';
  titleText.textContent = todo.title;
  titleContainer.appendChild(titleText);

  if (todo.checklist && todo.checklist.length > 0) {
    const completed = todo.checklist.filter(i => i.done).length;
    const badge = document.createElement('span');
    badge.className = 'flex items-center gap-1 text-[10px] text-gray-500 bg-[#2a2a2a] px-1.5 py-0.5 rounded';
    badge.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg> ${completed}/${todo.checklist.length}`;
    titleContainer.appendChild(badge);
  }

  item.appendChild(titleContainer);

  // Tags
  if (todo.tags && todo.tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'flex gap-1.5 flex-shrink-0 mr-4';
    todo.tags.forEach((tag) => {
      const tagEl = document.createElement('span');
      tagEl.className = 'text-[10px] px-1.5 py-0.5 border border-[#333] text-gray-400 rounded-md';
      tagEl.textContent = tag;
      tagsContainer.appendChild(tagEl);
    });
    item.appendChild(tagsContainer);
  }

  // Date
  const dateDiv = document.createElement('div');
  dateDiv.className = 'text-xs text-gray-500 w-20 text-right flex-shrink-0';
  dateDiv.textContent = formatDate(todo.createdAt || new Date().toISOString());
  item.appendChild(dateDiv);

  // Avatar
  const userIcon = document.createElement('div');
  userIcon.className = 'w-5 h-5 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 ml-3 flex-shrink-0';
  item.appendChild(userIcon);

  return item;
}

function renderBoardIssueItem(todo) {
  const item = document.createElement('div');
  item.className = 'board-card p-3 mb-2 cursor-pointer rounded-md bg-[#1f1f1f] border border-[#2a2a2a] hover:border-[#3a3a3a] shadow-sm group';
  item.dataset.todoId = todo.id;
  item.draggable = true;

  // Drag events
  item.addEventListener('dragstart', handleDragStart);
  item.addEventListener('dragend', handleDragEnd);

  // Click event
  let isDragging = false;
  item.addEventListener('mousedown', () => { isDragging = false; });
  item.addEventListener('dragstart', () => { isDragging = true; });
  item.addEventListener('click', () => {
    if (!isDragging) openEditModal(todo.id);
    isDragging = false;
  });

  // Header: ID and User
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between mb-2';
  
  const issueId = document.createElement('span');
  issueId.className = 'text-[10px] text-gray-500 font-mono';
  issueId.textContent = generateIssueId(todo.id);
  
  const userIcon = document.createElement('div');
  userIcon.className = 'w-4 h-4 rounded-full bg-gray-700';
  
  header.appendChild(issueId);
  header.appendChild(userIcon);
  item.appendChild(header);

  // Title
  const titleText = document.createElement('div');
  titleText.className = 'text-sm text-[#eeeeee] mb-3 line-clamp-2 font-medium leading-snug';
  titleText.textContent = todo.title;
  item.appendChild(titleText);

  // Footer: Tags and Checklist
  const footer = document.createElement('div');
  footer.className = 'flex items-center justify-between mt-2';

  const tagsContainer = document.createElement('div');
  tagsContainer.className = 'flex gap-1';
  if (todo.tags && todo.tags.length > 0) {
    const tag = todo.tags[0]; // Show only first tag in board view to save space
    const tagEl = document.createElement('span');
    tagEl.className = 'text-[10px] px-1.5 py-0.5 border border-[#333] text-gray-400 rounded';
    tagEl.textContent = tag;
    tagsContainer.appendChild(tagEl);
    if (todo.tags.length > 1) {
      const moreEl = document.createElement('span');
      moreEl.className = 'text-[10px] text-gray-600';
      moreEl.textContent = `+${todo.tags.length - 1}`;
      tagsContainer.appendChild(moreEl);
    }
  }
  footer.appendChild(tagsContainer);

  if (todo.checklist && todo.checklist.length > 0) {
    const completedCount = todo.checklist.filter((item) => item.done).length;
    const checklistBadge = document.createElement('div');
    checklistBadge.className = 'flex items-center gap-1 text-[10px] text-gray-500';
    checklistBadge.innerHTML = `
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
      <span>${completedCount}/${todo.checklist.length}</span>
    `;
    footer.appendChild(checklistBadge);
  }

  item.appendChild(footer);
  return item;
}

function renderBoardStatusColumn(status, todos, label) {
  const column = document.createElement('div');
  column.className = 'board-column flex-1 min-w-[280px] flex flex-col h-full';
  column.dataset.status = status;

  // Column header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between mb-3 px-1';

  const leftPart = document.createElement('div');
  leftPart.className = 'flex items-center gap-2';

  const icon = document.createElement('span');
  icon.className = 'flex items-center opacity-70';
  icon.innerHTML = getStatusIcon(status);

  const title = document.createElement('h3');
  title.className = 'text-sm font-medium text-[#eeeeee]';
  title.textContent = label;

  const count = document.createElement('span');
  count.className = 'text-xs text-gray-500';
  count.textContent = todos.length;

  leftPart.appendChild(icon);
  leftPart.appendChild(title);
  leftPart.appendChild(count);

  const addBtn = document.createElement('button');
  addBtn.className = 'p-1 text-gray-500 hover:text-gray-300 rounded hover:bg-[#2a2a2a]';
  addBtn.innerHTML =
    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>';
  addBtn.addEventListener('click', () => openEditModal(null));

  header.appendChild(leftPart);
  header.appendChild(addBtn);
  column.appendChild(header);

  // Column content
  const content = document.createElement('div');
  content.className = 'board-column-content flex-1 space-y-2 overflow-y-auto min-h-[100px] pr-1';

  // Drop zone setup
  content.addEventListener('dragover', handleDragOver);
  content.addEventListener('drop', handleDrop);
  content.addEventListener('dragleave', handleDragLeave);

  todos.forEach((todo) => {
    content.appendChild(renderBoardIssueItem(todo));
  });

  column.appendChild(content);
  return column;
}

function render() {
  const issuesList = document.getElementById('issues-list');
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');

  if (state.loading) {
    issuesList.classList.add('hidden');
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    return;
  }

  loadingEl.classList.add('hidden');

  if (state.error) {
    errorEl.classList.remove('hidden');
    document.getElementById('error-message').textContent = state.error;
    issuesList.classList.add('hidden');
    return;
  }

  errorEl.classList.add('hidden');
  issuesList.classList.remove('hidden');
  issuesList.innerHTML = '';

  // Apply tag filter
  const filteredTodos = filterTodosByTags(state.todos, state.selectedTags);

  // Group by status
  const groups = groupTodosByStatus(filteredTodos);

  // Render sections in order: In Progress, Todo, Backlog, Done
  const sections = [
    { status: 'in-progress', label: 'In Progress', todos: groups['in-progress'] },
    { status: 'pending', label: 'Todo', todos: groups['pending'] },
    { status: 'backlog', label: 'Backlog', todos: groups['backlog'] },
    { status: 'completed', label: 'Done', todos: groups['completed'] },
  ];

  if (state.viewMode === 'board') {
    // Board View - horizontal columns
    issuesList.className = 'flex gap-6 overflow-x-auto pb-4';
    sections.forEach(({ status, label, todos }) => {
      const column = renderBoardStatusColumn(status, todos, label);
      issuesList.appendChild(column);
    });
  } else {
    // List View - vertical sections
    issuesList.className = 'space-y-8'; 
    sections.forEach(({ status, label, todos }) => {
      if (todos.length > 0 || status === 'pending') { // Always show Todo section or if has items
        const section = renderStatusSection(status, todos, label);
        issuesList.appendChild(section);
      }
    });
  }
}

// ============================================
// Drag & Drop
// ============================================
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = e.currentTarget;
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  // Remove drag-over from all sections and columns
  document.querySelectorAll('.status-section, .board-column-content').forEach((section) => {
    section.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  if (e.preventDefault) e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  // Find the section or column element
  let container = e.target;
  while (
    container &&
    !container.classList.contains('status-section') &&
    !container.classList.contains('board-column-content')
  ) {
    container = container.parentElement;
  }

  // Remove drag-over from all containers first
  document.querySelectorAll('.status-section, .board-column-content').forEach((c) => {
    if (c !== container) {
      c.classList.remove('drag-over');
    }
  });

  // Add drag-over to current container
  if (container) {
    container.classList.add('drag-over');
  }
  return false;
}

function handleDragLeave(e) {
  // Find the container element
  let container = e.target;
  while (
    container &&
    !container.classList.contains('status-section') &&
    !container.classList.contains('board-column-content')
  ) {
    container = container.parentElement;
  }

  // Only remove if we're actually leaving the container (not going to a child)
  if (container && e.relatedTarget) {
    let related = e.relatedTarget;
    while (related && related !== container) {
      related = related.parentElement;
    }
    // If related target is not inside this container, remove the class
    if (related !== container) {
      container.classList.remove('drag-over');
    }
  }
}

async function handleDrop(e) {
  if (e.stopPropagation) e.stopPropagation();
  e.preventDefault();

  // Find the container element (section or column)
  let container = e.target;
  while (
    container &&
    !container.classList.contains('status-section') &&
    !container.classList.contains('board-column-content')
  ) {
    container = container.parentElement;
  }

  if (container) {
    container.classList.remove('drag-over');
  }

  // Get status from parent column or section
  let statusContainer = container;
  if (container && container.classList.contains('board-column-content')) {
    statusContainer = container.parentElement; // Get the board-column
  }

  if (draggedElement && statusContainer) {
    const todoId = draggedElement.dataset.todoId;
    const newStatus = statusContainer.dataset.status;
    const currentTodo = state.todos.find((t) => t.id === todoId);

    console.log(`🎯 Dropping todo ${todoId}: ${currentTodo?.status} → ${newStatus}`);

    if (currentTodo && currentTodo.status !== newStatus) {
      try {
        console.log(`📝 Updating todos.json: ${todoId} status to "${newStatus}"`);
        await API.updateTodo(todoId, { status: newStatus });
        await loadTodos();
        console.log('✅ Status updated successfully in todos.json');
      } catch (error) {
        console.error('❌ Error updating todo:', error);
        setState({ error: 'Failed to update todo status' });
      }
    } else if (currentTodo && currentTodo.status === newStatus) {
      console.log('ℹ️ Same status, no update needed');
    }
  }

  return false;
}

// ============================================
// Modal Management
// ============================================
async function openEditModal(todoId = null) {
  const modal = document.getElementById('modal');
  const modalContent = modal.querySelector('div');

  let todo = null;
  if (todoId) {
    try {
      todo = await API.fetchTodoDetail(todoId);
    } catch (error) {
      console.error('Error fetching todo:', error);
      setState({ error: 'Failed to load todo details' });
      return;
    }
  }

  const isNew = !todo;
  const title = isNew ? 'New todo' : 'Edit todo';
  const hasDetailFile = !isNew && todo.hasDetailFile && todo.detailContent;
  const renderedMarkdown = hasDetailFile ? marked.parse(todo.detailContent || '') : '';

  modalContent.innerHTML = `
    <div class="flex flex-col h-full bg-[#1f1f1f] text-[#eeeeee]">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 select-none">
        <div class="flex items-center gap-2 text-xs text-gray-500">
           <span class="bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded-[4px] font-medium tracking-wide">VTODO</span>
           <span>›</span>
           <span class="text-gray-400">${title}</span>
        </div>
        <div class="flex items-center gap-3">
           <button type="button" class="text-gray-500 hover:text-gray-300 transition-colors" onclick="closeModal()">
             <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
           </button>
        </div>
      </div>

      <!-- Form Content -->
      <form id="todo-form" class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto px-5 pt-1 pb-4">
           <!-- Title -->
           <input
             type="text"
             name="title"
             value="${escapeHtml(todo?.title || '')}"
             class="w-full bg-transparent border-none text-lg font-medium placeholder-gray-600 focus:ring-0 focus:outline-none p-0 mb-3 text-[#eeeeee]"
             placeholder="Todo title"
             required
             autocomplete="off"
           >

           <!-- Description -->
           <textarea
             name="description"
             class="w-full bg-transparent border-none text-[15px] text-gray-300 placeholder-gray-600 focus:ring-0 focus:outline-none p-0 min-h-[80px] resize-none leading-relaxed"
             placeholder="Add description..."
           >${escapeHtml(todo?.description || '')}</textarea>

           <!-- Properties Bar -->
           <div class="flex items-center gap-2 mt-4 mb-6">
              <!-- Status Pill -->
              <div class="relative group">
                <div class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <select name="status" class="appearance-none bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-gray-300 py-1.5 pl-8 pr-3 rounded-[4px] border border-[#3a3a3a] focus:ring-0 focus:outline-none focus:border-[#4a4a4a] cursor-pointer transition-colors shadow-sm">
                   <option value="pending" ${todo?.status === 'pending' ? 'selected' : ''}>Todo</option>
                   <option value="in-progress" ${todo?.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                   <option value="backlog" ${todo?.status === 'backlog' ? 'selected' : ''}>Backlog</option>
                   <option value="completed" ${todo?.status === 'completed' ? 'selected' : ''}>Done</option>
                </select>
              </div>

              <!-- Tags Input -->
              <div class="relative group">
                 <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <span class="text-gray-500 text-xs">#</span>
                 </div>
                 <input 
                   type="text" 
                   name="tags"
                   value="${(todo?.tags || []).join(', ')}"
                   class="bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-gray-300 py-1.5 px-2 pl-6 rounded-[4px] border border-[#3a3a3a] focus:ring-0 focus:outline-none focus:border-[#4a4a4a] w-24 transition-all focus:w-48 placeholder-gray-500 shadow-sm"
                   placeholder="Tags"
                   autocomplete="off"
                 >
              </div>
           </div>
           
           <!-- Secondary Fields (Expected Outcome & Checklist) -->
           <div class="space-y-4">
              <div>
                <input 
                   type="text" 
                   name="expected" 
                   value="${escapeHtml(todo?.expected || '')}"
                   class="w-full bg-transparent border-none text-sm text-gray-400 placeholder-gray-700 focus:ring-0 focus:outline-none p-0" 
                   placeholder="Expected outcome..."
                   autocomplete="off"
                >
              </div>

              ${
                hasDetailFile
                  ? `
              <!-- Markdown Detail File Section -->
              <div class="border border-[#2a2a2a] rounded-lg overflow-hidden mt-4">
                <div class="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] border-b border-[#2a2a2a]">
                  <div class="flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <span class="text-xs font-mono text-gray-500">todo/${todo.id}-todo.md</span>
                  </div>
                  <button type="button" id="toggle-md-view-btn" class="text-[10px] text-[#5E6AD2] hover:underline uppercase font-medium tracking-wide">Edit</button>
                </div>
                <div id="md-view-mode" class="markdown-content bg-[#0f0f0f] p-3 max-h-[200px] overflow-y-auto text-sm">${renderedMarkdown}</div>
                <div id="md-edit-mode" class="hidden">
                  <textarea id="md-content" rows="10" class="w-full bg-[#0f0f0f] text-gray-300 font-mono text-xs p-3 focus:outline-none resize-y" placeholder="Write with markdown...">${escapeHtml(todo.detailContent)}</textarea>
                </div>
              </div>
              `
                  : ''
              }
              
              <!-- Checklist -->
              <div id="checklist-section" class="pt-2">
                 <div id="checklist-container" class="space-y-0.5">
                   ${renderChecklistItems(todo?.checklist || [])}
                 </div>
                 <button type="button" id="add-checklist-item" class="mt-2 text-xs text-gray-500 hover:text-[#5E6AD2] flex items-center gap-1 transition-colors">
                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                   Add checklist item
                 </button>
              </div>
           </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 border-t border-[#2a2a2a] flex items-center justify-between bg-[#1f1f1f] select-none">
           <div class="flex items-center gap-4 text-gray-500">
              <button type="button" class="hover:text-gray-300 transition-colors" title="Attach file">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
              </button>
              ${!isNew ? `<button type="button" id="delete-btn" class="hover:text-red-400 transition-colors" title="Delete"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>` : ''}
           </div>
           <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                 <div class="relative inline-block w-7 h-4 rounded-full bg-[#333] transition-colors">
                   <input type="checkbox" class="sr-only peer">
                   <div class="w-3 h-3 bg-gray-500 rounded-full absolute top-0.5 left-0.5 peer-checked:translate-x-3 peer-checked:bg-[#5E6AD2] transition-all"></div>
                 </div>
                 <span>Create more</span>
              </label>
              <button type="submit" class="bg-[#5E6AD2] hover:bg-[#4e5ac0] text-white text-xs font-medium px-3 py-1.5 rounded-[4px] shadow-sm transition-colors">
                 ${isNew ? 'Create todo' : 'Save changes'}
              </button>
           </div>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');

  // Event listeners
  if (!isNew) {
    document.getElementById('delete-btn').addEventListener('click', () => deleteTodoHandler(todoId));
  }

  if (hasDetailFile) {
    document.getElementById('toggle-md-view-btn').addEventListener('click', () => {
      const viewDiv = document.getElementById('md-view-mode');
      const editDiv = document.getElementById('md-edit-mode');
      const toggleBtn = document.getElementById('toggle-md-view-btn');
      const markdownContainer = viewDiv;

      const isEditing = !editDiv.classList.contains('hidden');

      if (isEditing) {
        const currentContent = document.getElementById('md-content').value;
        const renderedHtml = marked.parse(currentContent);
        markdownContainer.innerHTML = renderedHtml;
        viewDiv.classList.remove('hidden');
        editDiv.classList.add('hidden');
        toggleBtn.textContent = 'Edit';
      } else {
        viewDiv.classList.add('hidden');
        editDiv.classList.remove('hidden');
        toggleBtn.textContent = 'Preview';
      }
    });
  }

  document.getElementById('add-checklist-item').addEventListener('click', addChecklistItem);

  document.getElementById('todo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveTodo(todoId, hasDetailFile);
  });

  setupChecklistListeners();
}

function renderChecklistItems(checklist) {
  if (!checklist || checklist.length === 0) {
    return '';
  }

  return checklist
    .map(
      (item, index) => `
        <div class="checklist-item flex items-center gap-2 group" data-index="${index}">
          <input
            type="checkbox"
            class="checklist-checkbox w-4 h-4 rounded border-gray-600 bg-transparent focus:ring-0 focus:ring-offset-0 checked:bg-[#5E6AD2] checked:border-[#5E6AD2]"
            ${item.done ? 'checked' : ''}
          >
          <input
            type="text"
            class="checklist-text flex-1 px-2 py-1 border-none bg-transparent text-sm text-gray-300 focus:ring-0 focus:outline-none placeholder-gray-600"
            value="${escapeHtml(item.text)}"
            placeholder="Checklist item"
          >
          <button type="button" class="remove-checklist opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      `
    )
    .join('');
}

function setupChecklistListeners() {
  document.querySelectorAll('.remove-checklist').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.checklist-item').remove();
    });
  });
}

function addChecklistItem() {
  const container = document.getElementById('checklist-container');
  const existingMessage = container.querySelector('p');
  if (existingMessage) {
    existingMessage.remove();
  }

  const itemDiv = document.createElement('div');
  itemDiv.className = 'checklist-item flex items-center gap-2 group';
  itemDiv.innerHTML = `
        <input type="checkbox" class="checklist-checkbox w-4 h-4 rounded border-gray-600 bg-transparent focus:ring-0 focus:ring-offset-0 checked:bg-[#5E6AD2] checked:border-[#5E6AD2]">
        <input
          type="text"
          class="checklist-text flex-1 px-2 py-1 border-none bg-transparent text-sm text-gray-300 focus:ring-0 focus:outline-none placeholder-gray-600"
          placeholder="New checklist item"
        >
        <button type="button" class="remove-checklist opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      `;

  container.appendChild(itemDiv);

  itemDiv.querySelector('.remove-checklist').addEventListener('click', () => {
    itemDiv.remove();
  });

  itemDiv.querySelector('.checklist-text').focus();
}

function getChecklistFromForm() {
  const items = [];
  document.querySelectorAll('.checklist-item').forEach((item) => {
    const text = item.querySelector('.checklist-text').value.trim();
    if (text) {
      items.push({
        text,
        done: item.querySelector('.checklist-checkbox').checked,
      });
    }
  });
  return items;
}

async function saveTodo(todoId, hasDetailFile) {
  const form = document.getElementById('todo-form');
  const formData = new FormData(form);

  const todoData = {
    title: formData.get('title'),
    description: formData.get('description'),
    expected: formData.get('expected'),
    tags: formData
      .get('tags')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    checklist: getChecklistFromForm(),
  };

  if (!todoId) {
    // Creating new todo
    todoData.status = 'pending';
  } else {
    // Updating existing todo
    todoData.status = formData.get('status');
  }

  try {
    if (todoId) {
      await API.updateTodo(todoId, todoData);

      // Save markdown content if detail file exists
      if (hasDetailFile) {
        const mdContent = document.getElementById('md-content')?.value;
        if (mdContent !== undefined) {
          await API.updateDetail(todoId, mdContent);
        }
      }
    } else {
      await API.createTodo(todoData);
    }
    await loadTodos();
    closeModal();
  } catch (error) {
    console.error('Error saving todo:', error);
    setState({ error: 'Failed to save todo' });
  }
}

async function deleteTodoHandler(id) {
  if (
    confirm('Are you sure you want to delete this todo?\n\nThis will remove it from JSON and delete all related files.')
  ) {
    try {
      await API.deleteTodo(id);
      await loadTodos();
      closeModal();
    } catch (error) {
      console.error('Error deleting todo:', error);
      setState({ error: 'Failed to delete todo' });
    }
  }
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// ============================================
// App Initialization
// ============================================
async function loadTodos() {
  setState({ loading: true, error: null });
  try {
    const todos = await API.fetchTodos();
    setState({ todos, loading: false });
  } catch (error) {
    console.error('Error loading todos:', error);
    setState({ error: error.message, loading: false });
  }
}

// Subscribe to state changes
subscribe(render);

// Initialize app
loadTodos();

// Event listeners
document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') closeModal();
});

// Filter button dropdown
const filterBtn = document.getElementById('filter-btn');
const filterDropdown = document.getElementById('filter-dropdown');
const filterBadge = document.getElementById('filter-badge');
const tagListContainer = document.getElementById('tag-list');
const clearFiltersBtn = document.getElementById('clear-filters');

function renderTagList() {
  const allTags = getAllTags(state.todos);
  tagListContainer.innerHTML = '';

  if (allTags.length === 0) {
    tagListContainer.innerHTML = '<p class="text-xs text-gray-500 py-2 px-2 italic">No tags available</p>';
    return;
  }

  allTags.forEach((tag) => {
    const isSelected = state.selectedTags.includes(tag);
    const tagItem = document.createElement('label');
    tagItem.className = 'flex items-center gap-2 px-2 py-1.5 hover:bg-[#2a2a2a] rounded cursor-pointer transition-colors';
    tagItem.innerHTML = `
          <input type="checkbox" ${isSelected ? 'checked' : ''} class="tag-checkbox w-3.5 h-3.5 rounded border-gray-600 bg-transparent focus:ring-0 focus:ring-offset-0 checked:bg-[#5E6AD2] checked:border-[#5E6AD2]" data-tag="${escapeHtml(tag)}">
          <span class="text-xs text-gray-300">${escapeHtml(tag)}</span>
        `;
    tagListContainer.appendChild(tagItem);
  });

  // Add event listeners to checkboxes
  document.querySelectorAll('.tag-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      const tag = e.target.dataset.tag;
      const newSelectedTags = e.target.checked
        ? [...state.selectedTags, tag]
        : state.selectedTags.filter((t) => t !== tag);
      setState({ selectedTags: newSelectedTags });
      updateFilterBadge();
    });
  });
}

function updateFilterBadge() {
  if (state.selectedTags.length > 0) {
    filterBadge.textContent = state.selectedTags.length;
    filterBadge.classList.remove('hidden');
  } else {
    filterBadge.classList.add('hidden');
  }
}

filterBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  renderTagList();
  filterDropdown.classList.toggle('hidden');
  displayDropdown.classList.add('hidden');
});

clearFiltersBtn.addEventListener('click', () => {
  setState({ selectedTags: [] });
  updateFilterBadge();
  renderTagList();
});

// Display button dropdown (Removed in new design, keeping variable cleanup if needed)
// const displayBtn = document.getElementById('display-btn');
// const displayDropdown = document.getElementById('display-dropdown');
// const displayLabel = document.getElementById('display-mode-label');

// displayBtn?.addEventListener('click', (e) => {
//   e.stopPropagation();
//   displayDropdown.classList.toggle('hidden');
//   filterDropdown.classList.add('hidden');
// });

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  displayDropdown.classList.add('hidden');
  filterDropdown.classList.add('hidden');
});

// Handle view selection
document.querySelectorAll('.view-option').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const viewMode = e.currentTarget.dataset.view;
    setState({ viewMode });
    
    // Update UI
    document.querySelectorAll('.view-option').forEach(b => {
      if (b.dataset.view === viewMode) {
        b.classList.add('bg-[#333]', 'text-white', 'shadow-sm');
        b.classList.remove('text-gray-400');
      } else {
        b.classList.remove('bg-[#333]', 'text-white', 'shadow-sm');
        b.classList.add('text-gray-400');
      }
    });
  });
});

// Initialize view state UI
const initialViewBtn = document.querySelector(`.view-option[data-view="${state.viewMode}"]`);
if (initialViewBtn) {
  initialViewBtn.classList.add('bg-[#333]', 'text-white', 'shadow-sm');
  initialViewBtn.classList.remove('text-gray-400');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // ESC to close modal and dropdowns
  if (e.key === 'Escape') {
    closeModal();
    displayDropdown.classList.add('hidden');
    filterDropdown.classList.add('hidden');
  }
  // Ctrl/Cmd + N to add new todo
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    openEditModal(null);
  }
});

// New Issue Button
document.getElementById('new-issue-btn')?.addEventListener('click', () => {
  openEditModal(null);
});
