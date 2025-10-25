import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import Column from './Column';
import TaskCard from './TaskCard';

function Board({ tasks, onTaskMove, onTaskClick }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTaskId = active.id;
    let overColumnId = over.id;

    // 檢查 over.id 是否是 column ID (pending, inProgress, completed)
    const validColumns = ['pending', 'inProgress', 'completed'];
    if (!validColumns.includes(overColumnId)) {
      // over.id 是 task ID，需要找出該任務所在的 column
      for (const [status, taskList] of Object.entries(tasks)) {
        if (taskList.some(t => t.id === overColumnId)) {
          overColumnId = status;
          break;
        }
      }
    }

    // 找出 task 原本的狀態
    let fromStatus = null;
    for (const [status, taskList] of Object.entries(tasks)) {
      if (taskList.some(t => t.id === activeTaskId)) {
        fromStatus = status;
        break;
      }
    }

    // 如果拖到不同的欄位,觸發移動
    if (fromStatus && fromStatus !== overColumnId && validColumns.includes(overColumnId)) {
      onTaskMove(activeTaskId, fromStatus, overColumnId);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // 找出正在拖曳的 task
  const activeTask = activeId
    ? Object.values(tasks)
        .flat()
        .find(t => t.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto p-4">
        <Column
          status="pending"
          tasks={tasks.pending || []}
          onTaskClick={onTaskClick}
        />
        <Column
          status="inProgress"
          tasks={tasks.inProgress || []}
          onTaskClick={onTaskClick}
        />
        <Column
          status="completed"
          tasks={tasks.completed || []}
          onTaskClick={onTaskClick}
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 scale-105">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default Board;
