import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';

const COLUMN_LABELS = {
  pending: '📋 Pending',
  inProgress: '🚧 In Progress',
  completed: '✅ Completed',
};

const COLUMN_COLORS = {
  pending: 'bg-gray-50',
  inProgress: 'bg-blue-50',
  completed: 'bg-green-50',
};

function Column({ status, tasks = [], onTaskClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  // Defensive check: ensure tasks is an array
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const taskIds = safeTasks.map(task => task.id);

  return (
    <div
      className={`flex-1 min-w-[320px] ${
        isOver ? 'opacity-75' : 'opacity-100'
      }`}
    >
      <Card
        className={`flex flex-col h-full min-h-[700px] ${COLUMN_COLORS[status]}`}
      >
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {COLUMN_LABELS[status]}
            </CardTitle>
            <Badge variant="secondary" className="text-sm">
              {safeTasks.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent ref={setNodeRef} className="flex-1 space-y-2 min-h-[600px]">
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {safeTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={onTaskClick}
              />
            ))}
          </SortableContext>

          {safeTasks.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              沒有任務
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Column;
