import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

function TaskCard({ task, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const progress = task.progress || 0;
  const hasProgress = task.checklist && task.checklist.length > 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="mb-3 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-ring transition-all bg-card"
    >
      <CardContent className="p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground flex-1">
          {task.title}
        </h3>
        <span className="text-xs text-muted-foreground ml-2">{task.id}</span>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Expected time */}
      {task.expected && (
        <div className="text-xs text-muted-foreground mb-2">
          ⏱️ {task.expected}
        </div>
      )}

      {/* Progress bar */}
      {hasProgress && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>進度</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {task.checklist.filter(item => item.checked).length} / {task.checklist.length} 完成
          </div>
        </div>
      )}
      </CardContent>
    </Card>
  );
}

export default TaskCard;
