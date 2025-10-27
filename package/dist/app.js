    // ============================================
    // State Management
    // ============================================
    const state = {
      todos: [],
      loading: false,
      error: null,
      viewMode: 'list', // 'list' or 'board'
      selectedTags: [] // Array of selected tag strings for filtering
    };

    const listeners = [];

    function setState(updates) {
      Object.assign(state, updates);
      listeners.forEach(fn => fn(state));
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
          body: JSON.stringify(todoData)
        });
        const data = await response.json();
        return data.todo;
      },

      async updateTodo(id, updates) {
        const response = await fetch(`/api/todos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
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
          body: JSON.stringify({ content })
        });
      }
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
        'pending': 'Todo',
        'in-progress': 'In Progress',
        'backlog': 'Backlog',
        'completed': 'Done'
      };
      return labels[status] || status;
    }

    function getStatusIcon(status) {
      if (status === 'completed') {
        return '<span class="status-icon status-completed">✓</span>';
      } else if (status === 'in-progress') {
        return '<span class="status-icon status-in-progress">●</span>';
      } else if (status === 'backlog') {
        return '<span class="status-icon status-backlog"></span>';
      } else {
        return '<span class="status-icon status-pending"></span>';
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
      todos.forEach(todo => {
        if (todo.tags && Array.isArray(todo.tags)) {
          todo.tags.forEach(tag => tagsSet.add(tag));
        }
      });
      return Array.from(tagsSet).sort();
    }

    function filterTodosByTags(todos, selectedTags) {
      if (selectedTags.length === 0) {
        return todos;
      }
      return todos.filter(todo => {
        if (!todo.tags || !Array.isArray(todo.tags)) {
          return false;
        }
        return selectedTags.some(tag => todo.tags.includes(tag));
      });
    }

    // ============================================
    // Rendering Functions
    // ============================================
    function groupTodosByStatus(todos) {
      const groups = {
        'in-progress': [],
        'pending': [],
        'backlog': [],
        'completed': []
      };

      todos.forEach(todo => {
        if (groups[todo.status]) {
          groups[todo.status].push(todo);
        }
      });

      return groups;
    }

    function renderStatusSection(status, todos, label) {
      const section = document.createElement('div');
      section.className = 'status-section';
      section.dataset.status = status;

      // Section header
      const header = document.createElement('div');
      header.className = 'section-header flex items-center justify-between px-2 py-1 bg-gray-800 border-b border-gray-800';

      const leftPart = document.createElement('div');
      leftPart.className = 'flex items-center gap-2';

      const icon = document.createElement('span');
      icon.className = 'flex items-center';
      icon.innerHTML = getStatusIcon(status);

      const title = document.createElement('h2');
      title.className = 'text-sm font-semibold text-gray-400';
      title.textContent = label;

      const count = document.createElement('span');
      count.className = 'text-sm text-gray-600';
      count.textContent = todos.length;

      leftPart.appendChild(icon);
      leftPart.appendChild(title);
      leftPart.appendChild(count);

      const addBtn = document.createElement('button');
      addBtn.className = 'p-1 text-gray-600 hover:text-gray-400 rounded hover:bg-gray-800';
      addBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>';
      addBtn.addEventListener('click', () => openEditModal(null));

      header.appendChild(leftPart);
      header.appendChild(addBtn);
      section.appendChild(header);

      // Drop zone setup
      section.addEventListener('dragover', handleDragOver);
      section.addEventListener('drop', handleDrop);
      section.addEventListener('dragleave', handleDragLeave);

      // Issues list
      todos.forEach((todo) => {
        section.appendChild(renderIssueItem(todo));
      });

      return section;
    }

    function renderIssueItem(todo) {
      const item = document.createElement('div');
      item.className = 'issue-item flex items-center gap-3 py-3 px-3 cursor-pointer';
      item.dataset.todoId = todo.id;
      item.draggable = true;

      // Drag events
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragend', handleDragEnd);

      // Click event - only trigger if not dragging
      let isDragging = false;
      item.addEventListener('mousedown', () => {
        isDragging = false;
      });
      item.addEventListener('dragstart', () => {
        isDragging = true;
      });
      item.addEventListener('click', (e) => {
        if (!isDragging) {
          openEditModal(todo.id);
        }
        isDragging = false;
      });

      // Status icon
      const statusIcon = document.createElement('div');
      statusIcon.className = 'flex items-center';
      statusIcon.innerHTML = getStatusIcon(todo.status);
      item.appendChild(statusIcon);

      // Issue ID
      const issueId = document.createElement('div');
      issueId.className = 'text-sm text-gray-600 font-mono w-16 flex-shrink-0';
      issueId.textContent = generateIssueId(todo.id);
      item.appendChild(issueId);

      // Title and subtasks
      const titleContainer = document.createElement('div');
      titleContainer.className = 'flex-1 min-w-0';

      const titleText = document.createElement('div');
      titleText.className = 'text-sm text-gray-300 truncate';
      const subtaskCount = todo.checklist && todo.checklist.length > 0 ? ` (${todo.checklist.length})` : '';
      titleText.textContent = todo.title + subtaskCount;

      titleContainer.appendChild(titleText);
      item.appendChild(titleContainer);

      // Tags
      if (todo.tags && todo.tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'flex gap-1 flex-shrink-0';
        todo.tags.forEach(tag => {
          const tagEl = document.createElement('span');
          tagEl.className = 'text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded';
          tagEl.textContent = tag;
          tagsContainer.appendChild(tagEl);
        });
        item.appendChild(tagsContainer);
      }

      // User icon (placeholder)
      const userIcon = document.createElement('div');
      userIcon.className = 'w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400';
      userIcon.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
      item.appendChild(userIcon);

      // Date
      const dateDiv = document.createElement('div');
      dateDiv.className = 'text-xs text-gray-600 w-20 text-right flex-shrink-0';
      dateDiv.textContent = formatDate(todo.createdAt || new Date().toISOString());
      item.appendChild(dateDiv);

      return item;
    }

    function renderBoardIssueItem(todo) {
      const item = document.createElement('div');
      item.className = 'board-card bg-[#252525] border border-gray-700 rounded-lg p-3 mb-2 cursor-pointer hover:bg-[#2a2a2a] transition';
      item.dataset.todoId = todo.id;
      item.draggable = true;

      // Drag events
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragend', handleDragEnd);

      // Click event
      let isDragging = false;
      item.addEventListener('mousedown', () => {
        isDragging = false;
      });
      item.addEventListener('dragstart', () => {
        isDragging = true;
      });
      item.addEventListener('click', () => {
        if (!isDragging) {
          openEditModal(todo.id);
        }
        isDragging = false;
      });

      // Issue ID
      const issueId = document.createElement('div');
      issueId.className = 'text-xs text-gray-600 font-mono mb-2';
      issueId.textContent = generateIssueId(todo.id);
      item.appendChild(issueId);

      // Title
      const titleText = document.createElement('div');
      titleText.className = 'text-sm text-gray-200 mb-2 line-clamp-2';
      titleText.textContent = todo.title;
      item.appendChild(titleText);

      // Tags
      if (todo.tags && todo.tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'flex flex-wrap gap-1 mb-2';
        todo.tags.forEach(tag => {
          const tagEl = document.createElement('span');
          tagEl.className = 'text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded';
          tagEl.textContent = tag;
          tagsContainer.appendChild(tagEl);
        });
        item.appendChild(tagsContainer);
      }

      // Footer with checklist count
      if (todo.checklist && todo.checklist.length > 0) {
        const footer = document.createElement('div');
        footer.className = 'flex items-center justify-between text-xs text-gray-500';
        const completedCount = todo.checklist.filter(item => item.done).length;
        footer.innerHTML = `
          <div class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <span>${completedCount}/${todo.checklist.length}</span>
          </div>
        `;
        item.appendChild(footer);
      }

      return item;
    }

    function renderBoardStatusColumn(status, todos, label) {
      const column = document.createElement('div');
      column.className = 'board-column flex-1 min-w-[280px]';
      column.dataset.status = status;

      // Column header
      const header = document.createElement('div');
      header.className = 'flex items-center justify-between mb-3 px-2';

      const leftPart = document.createElement('div');
      leftPart.className = 'flex items-center gap-2';

      const icon = document.createElement('span');
      icon.className = 'flex items-center';
      icon.innerHTML = getStatusIcon(status);

      const title = document.createElement('h3');
      title.className = 'text-sm font-semibold text-gray-300';
      title.textContent = label;

      const count = document.createElement('span');
      count.className = 'text-sm text-gray-600';
      count.textContent = todos.length;

      leftPart.appendChild(icon);
      leftPart.appendChild(title);
      leftPart.appendChild(count);

      const addBtn = document.createElement('button');
      addBtn.className = 'p-1 text-gray-600 hover:text-gray-400 rounded hover:bg-gray-800';
      addBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>';
      addBtn.addEventListener('click', () => openEditModal(null));

      header.appendChild(leftPart);
      header.appendChild(addBtn);
      column.appendChild(header);

      // Column content
      const content = document.createElement('div');
      content.className = 'board-column-content space-y-2 min-h-[200px] p-2 rounded-lg';

      // Drop zone setup
      content.addEventListener('dragover', handleDragOver);
      content.addEventListener('drop', handleDrop);
      content.addEventListener('dragleave', handleDragLeave);

      todos.forEach(todo => {
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
        { status: 'completed', label: 'Done', todos: groups['completed'] }
      ];

      if (state.viewMode === 'board') {
        // Board View - horizontal columns
        issuesList.className = 'px-6 py-4 flex gap-4 overflow-x-auto';
        sections.forEach(({ status, label, todos }) => {
          const column = renderBoardStatusColumn(status, todos, label);
          issuesList.appendChild(column);
        });
      } else {
        // List View - vertical sections
        issuesList.className = 'px-6 py-4';
        sections.forEach(({ status, label, todos }) => {
          const section = renderStatusSection(status, todos, label);
          issuesList.appendChild(section);
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
      document.querySelectorAll('.status-section, .board-column-content').forEach(section => {
        section.classList.remove('drag-over');
      });
    }

    function handleDragOver(e) {
      if (e.preventDefault) e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      // Find the section or column element
      let container = e.target;
      while (container && !container.classList.contains('status-section') && !container.classList.contains('board-column-content')) {
        container = container.parentElement;
      }

      // Remove drag-over from all containers first
      document.querySelectorAll('.status-section, .board-column-content').forEach(c => {
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
      while (container && !container.classList.contains('status-section') && !container.classList.contains('board-column-content')) {
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
      while (container && !container.classList.contains('status-section') && !container.classList.contains('board-column-content')) {
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
        const currentTodo = state.todos.find(t => t.id === todoId);

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
      const title = isNew ? 'Create New Todo' : 'Edit Todo';
      const hasDetailFile = !isNew && todo.hasDetailFile && todo.detailContent;

      // Render markdown to HTML if detail file exists
      const renderedMarkdown = hasDetailFile ? marked.parse(todo.detailContent || '') : '';

      modalContent.innerHTML = `
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-200">${title} ${!isNew ? `<span class="text-sm text-gray-500 font-mono">#${todo.id}</span>` : ''}</h2>
          <div class="flex gap-2">
            <button
              type="button"
              id="cancel-btn"
              class="px-3 py-1.5 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            ${!isNew ? `
            <button
              type="button"
              id="delete-btn"
              class="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-500 transition"
            >
              Delete
            </button>
            ` : ''}
            <button
              type="submit"
              form="todo-form"
              class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition"
            >
              ${isNew ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
        <form id="todo-form">
          <!-- JSON Fields Section (Compact) -->
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="col-span-3">
              <label class="block text-xs font-medium mb-1 text-gray-400">Title *</label>
              <input
                type="text"
                name="title"
                value="${escapeHtml(todo?.title || '')}"
                required
                class="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 text-gray-200 rounded focus:ring-1 focus:ring-gray-600 text-sm"
                placeholder="Enter todo title"
              >
            </div>

            <div>
              <label class="block text-xs font-medium mb-1 text-gray-400">Tags</label>
              <input
                type="text"
                name="tags"
                value="${(todo?.tags || []).join(', ')}"
                class="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 text-gray-200 rounded focus:ring-1 focus:ring-gray-600 text-sm"
                placeholder="e.g., frontend, bug"
              >
            </div>

            ${!isNew ? `
            <div>
              <label class="block text-xs font-medium mb-1 text-gray-400">Status</label>
              <select
                name="status"
                class="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 text-gray-200 rounded focus:ring-1 focus:ring-gray-600 text-sm"
              >
                <option value="in-progress" ${todo.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                <option value="pending" ${todo.status === 'pending' ? 'selected' : ''}>Todo</option>
                <option value="backlog" ${todo.status === 'backlog' ? 'selected' : ''}>Backlog</option>
                <option value="completed" ${todo.status === 'completed' ? 'selected' : ''}>Done</option>
              </select>
            </div>
            ` : '<div></div>'}

            <div>
              <label class="block text-xs font-medium mb-1 text-gray-400">Expected Outcome</label>
              <input
                type="text"
                name="expected"
                class="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 text-gray-200 rounded focus:ring-1 focus:ring-gray-600 text-sm"
                placeholder="What should be achieved?"
                value="${escapeHtml(todo?.expected || '')}"
              >
            </div>

            <div class="col-span-3">
              <label class="block text-xs font-medium mb-1 text-gray-400">Description</label>
              <textarea
                name="description"
                rows="2"
                class="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 text-gray-200 rounded focus:ring-1 focus:ring-gray-600 text-sm"
                placeholder="Brief description"
              >${escapeHtml(todo?.description || '')}</textarea>
            </div>
          </div>

          ${hasDetailFile ? `
          <!-- Markdown Detail File Section -->
          <div class="mb-4 border border-gray-700 rounded-lg p-3 bg-[#0d0d0d]">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-medium text-gray-400">
                📄 Detail File <span class="text-gray-600 ml-1 font-mono">todo/${todo.id}-todo.md</span>
              </label>
              <button
                type="button"
                id="toggle-md-view-btn"
                class="px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition"
              >
                Edit
              </button>
            </div>

            <!-- Markdown View Mode -->
            <div id="md-view-mode" class="markdown-content bg-[#1a1a1a] border border-gray-700 rounded p-3 max-h-[50vh] overflow-y-auto text-sm">
              ${renderedMarkdown}
            </div>

            <!-- Markdown Edit Mode -->
            <div id="md-edit-mode" class="hidden">
              <textarea
                id="md-content"
                rows="20"
                class="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 text-gray-200 rounded focus:ring-1 focus:ring-gray-600 font-mono text-xs"
                placeholder="Enter markdown content..."
              >${escapeHtml(todo.detailContent)}</textarea>
            </div>
          </div>
          ` : ''}

          <!-- Checklist Section -->
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2 text-gray-300">Checklist</label>
            <div id="checklist-container" class="space-y-2 mb-2">
              ${renderChecklistItems(todo?.checklist || [])}
            </div>
            <button
              type="button"
              id="add-checklist-item"
              class="text-sm text-blue-400 hover:text-blue-300"
            >
              + Add checklist item
            </button>
          </div>
        </form>
      `;

      modal.classList.remove('hidden');

      // Event listeners
      document.getElementById('cancel-btn').addEventListener('click', closeModal);

      if (!isNew) {
        document.getElementById('delete-btn').addEventListener('click', () => deleteTodoHandler(todoId));
      }

      // Markdown view/edit toggle
      if (hasDetailFile) {
        document.getElementById('toggle-md-view-btn').addEventListener('click', () => {
          const viewDiv = document.getElementById('md-view-mode');
          const editDiv = document.getElementById('md-edit-mode');
          const toggleBtn = document.getElementById('toggle-md-view-btn');
          const markdownContainer = viewDiv;

          const isEditing = !editDiv.classList.contains('hidden');

          if (isEditing) {
            // Switch to view mode - re-render markdown from textarea
            const currentContent = document.getElementById('md-content').value;
            const renderedHtml = marked.parse(currentContent);
            markdownContainer.innerHTML = renderedHtml;

            viewDiv.classList.remove('hidden');
            editDiv.classList.add('hidden');
            toggleBtn.textContent = 'Edit';
          } else {
            // Switch to edit mode
            viewDiv.classList.add('hidden');
            editDiv.classList.remove('hidden');
            toggleBtn.textContent = 'View';
          }
        });
      }

      document.getElementById('add-checklist-item').addEventListener('click', addChecklistItem);

      document.getElementById('todo-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveTodo(todoId, hasDetailFile);
      });

      // Setup checklist item listeners
      setupChecklistListeners();
    }

    function renderChecklistItems(checklist) {
      if (!checklist || checklist.length === 0) {
        return '<p class="text-sm text-gray-500">No checklist items yet</p>';
      }

      return checklist.map((item, index) => `
        <div class="checklist-item flex items-center gap-2 p-2 border border-gray-700 rounded bg-[#1a1a1a]" data-index="${index}">
          <input
            type="checkbox"
            class="checklist-checkbox"
            ${item.done ? 'checked' : ''}
          >
          <input
            type="text"
            class="checklist-text flex-1 px-2 py-1 border-0 bg-transparent text-gray-200 focus:ring-1 focus:ring-gray-600 rounded"
            value="${escapeHtml(item.text)}"
          >
          <button type="button" class="remove-checklist text-red-400 hover:text-red-300 text-sm">Remove</button>
        </div>
      `).join('');
    }

    function setupChecklistListeners() {
      document.querySelectorAll('.remove-checklist').forEach(btn => {
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
      itemDiv.className = 'checklist-item flex items-center gap-2 p-2 border border-gray-700 rounded bg-[#1a1a1a]';
      itemDiv.innerHTML = `
        <input type="checkbox" class="checklist-checkbox">
        <input
          type="text"
          class="checklist-text flex-1 px-2 py-1 border-0 bg-transparent text-gray-200 focus:ring-1 focus:ring-gray-600 rounded"
          placeholder="New checklist item"
        >
        <button type="button" class="remove-checklist text-red-400 hover:text-red-300 text-sm">Remove</button>
      `;

      container.appendChild(itemDiv);

      itemDiv.querySelector('.remove-checklist').addEventListener('click', () => {
        itemDiv.remove();
      });

      itemDiv.querySelector('.checklist-text').focus();
    }

    function getChecklistFromForm() {
      const items = [];
      document.querySelectorAll('.checklist-item').forEach(item => {
        const text = item.querySelector('.checklist-text').value.trim();
        if (text) {
          items.push({
            text,
            done: item.querySelector('.checklist-checkbox').checked
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
        tags: formData.get('tags').split(',').map(t => t.trim()).filter(Boolean),
        checklist: getChecklistFromForm()
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
      if (confirm('Are you sure you want to delete this todo?\n\nThis will remove it from JSON and delete all related files.')) {
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
        tagListContainer.innerHTML = '<p class="text-sm text-gray-500 py-2">No tags available</p>';
        return;
      }

      allTags.forEach(tag => {
        const isSelected = state.selectedTags.includes(tag);
        const tagItem = document.createElement('label');
        tagItem.className = 'flex items-center gap-2 px-2 py-1.5 hover:bg-gray-700 rounded cursor-pointer';
        tagItem.innerHTML = `
          <input type="checkbox" ${isSelected ? 'checked' : ''} class="tag-checkbox" data-tag="${escapeHtml(tag)}">
          <span class="text-sm text-gray-300">${escapeHtml(tag)}</span>
        `;
        tagListContainer.appendChild(tagItem);
      });

      // Add event listeners to checkboxes
      document.querySelectorAll('.tag-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const tag = e.target.dataset.tag;
          const newSelectedTags = e.target.checked
            ? [...state.selectedTags, tag]
            : state.selectedTags.filter(t => t !== tag);
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

    // Display button dropdown
    const displayBtn = document.getElementById('display-btn');
    const displayDropdown = document.getElementById('display-dropdown');
    const displayLabel = document.getElementById('display-mode-label');

    displayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      displayDropdown.classList.toggle('hidden');
      filterDropdown.classList.add('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      displayDropdown.classList.add('hidden');
      filterDropdown.classList.add('hidden');
    });

    // Handle view selection
    document.querySelectorAll('.view-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const viewMode = e.currentTarget.dataset.view;
        setState({ viewMode });
        displayLabel.textContent = viewMode === 'board' ? 'Board' : 'List';
        displayDropdown.classList.add('hidden');
      });
    });

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
