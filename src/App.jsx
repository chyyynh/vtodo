import { useState, useEffect } from 'react';
import Board from './components/Board';
import TaskEditor from './components/TaskEditor';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';

const API_BASE = '';  // Same origin

function App() {
  const [tasks, setTasks] = useState({
    pending: [],
    inProgress: [],
    completed: [],
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all tasks on mount
  useEffect(() => {
    loadAllTasks();
  }, []);

  // Load all tasks from API
  const loadAllTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/tasks`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load tasks');
      }

      if (!Array.isArray(data.tasks)) {
        console.error('Invalid API response:', data);
        throw new Error('API response is not an array');
      }

      // Group by status
      const grouped = {
        pending: [],
        inProgress: [],
        completed: [],
      };

      data.tasks.forEach(task => {
        if (task.status === 'completed') {
          grouped.completed.push(task);
        } else if (task.status === 'in-progress') {
          grouped.inProgress.push(task);
        } else {
          grouped.pending.push(task);
        }
      });

      setTasks(grouped);
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task move between columns
  const handleTaskMove = async (taskId, fromStatus, toStatus) => {
    try {
      // Defensive checks
      if (!tasks[fromStatus] || !Array.isArray(tasks[fromStatus])) {
        console.error('Invalid fromStatus:', fromStatus, tasks);
        return;
      }
      if (!tasks[toStatus] || !Array.isArray(tasks[toStatus])) {
        console.error('Invalid toStatus:', toStatus, tasks);
        return;
      }

      // Optimistic update
      const task = tasks[fromStatus].find((t) => t.id === taskId);
      if (!task) {
        console.error('Task not found:', taskId, 'in', fromStatus);
        return;
      }

      const newTasks = {
        ...tasks,
        [fromStatus]: tasks[fromStatus].filter((t) => t.id !== taskId),
        [toStatus]: [...tasks[toStatus], task],
      };
      setTasks(newTasks);

      // API call
      const response = await fetch(`${API_BASE}/api/tasks/${taskId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: toStatus === 'completed' ? 'completed' : toStatus === 'inProgress' ? 'in-progress' : 'pending'
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setLastSync(new Date());
    } catch (error) {
      console.error('Move failed:', error);
      alert('Failed to move task: ' + error.message);
      // Reload to revert
      await loadAllTasks();
    }
  };

  // Handle task click
  const handleTaskClick = async (task) => {
    setSelectedTask(task);
    setIsEditing(true);
  };

  // Handle save task
  const handleSaveTask = async (editedTask) => {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${editedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedTask),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Reload tasks
      await loadAllTasks();
      setLastSync(new Date());
    } catch (error) {
      throw error;
    }
  };

  // Handle delete task
  const handleDeleteTask = async (task) => {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Reload tasks
      await loadAllTasks();
      setLastSync(new Date());
    } catch (error) {
      throw error;
    }
  };

  // Create new task
  const handleCreateTask = async () => {
    try {
      setIsLoading(true);
      const title = prompt('輸入任務標題:');
      if (!title || title.trim() === '') return;

      const response = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Reload tasks
      await loadAllTasks();
    } catch (error) {
      alert('建立任務失敗: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const totalTasks = tasks.pending.length + tasks.inProgress.length + tasks.completed.length;
  const completedCount = tasks.completed.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📋 VTodo - Markdown Todo Manager
              </h1>
              {lastSync && (
                <p className="text-sm text-gray-500 mt-1">
                  最後同步: {lastSync.toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {totalTasks} 個任務
                </Badge>
                <Badge variant="default" className="text-sm bg-green-600 hover:bg-green-700">
                  {progressPercentage}% 完成
                </Badge>
              </div>
              <Button
                onClick={handleCreateTask}
                disabled={isLoading}
                size="default"
              >
                + 新增任務
              </Button>
              <Button
                variant="outline"
                onClick={loadAllTasks}
                disabled={isLoading}
                size="default"
              >
                🔄 重新載入
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {error ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-red-600 mb-2">錯誤</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadAllTasks} variant="default">
                重試
              </Button>
            </div>
          </div>
        ) : isLoading && totalTasks === 0 ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">載入中...</p>
            </div>
          </div>
        ) : (
          <Board
            tasks={tasks}
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
          />
        )}
      </main>

      {/* Task Editor Dialog */}
      {selectedTask && (
        <TaskEditor
          task={selectedTask}
          open={isEditing}
          onSave={handleSaveTask}
          onClose={() => {
            setIsEditing(false);
            setSelectedTask(null);
          }}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}

export default App;
