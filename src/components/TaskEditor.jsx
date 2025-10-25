import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

function TaskEditor({ task, onSave, onClose, onDelete, open }) {
  const [editedTask, setEditedTask] = useState({
    ...task,
    content: task.content || ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedTask({
      ...task,
      content: task.content || ''
    });
  }, [task]);

  const handleTitleChange = (e) => {
    setEditedTask({ ...editedTask, title: e.target.value });
  };

  const handleContentChange = (e) => {
    setEditedTask({ ...editedTask, content: e.target.value });
  };

  const handleExpectedChange = (e) => {
    setEditedTask({ ...editedTask, expected: e.target.value });
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
    setEditedTask({ ...editedTask, tags });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedTask);
      onClose();
    } catch (error) {
      alert('儲存失敗: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`確定要刪除任務 ${task.id} 嗎?`)) {
      try {
        await onDelete(task);
        onClose();
      } catch (error) {
        alert('刪除失敗: ' + error.message);
      }
    }
  };

  // Parse checklist from content
  const checklist = (editedTask.content || '').split('\n')
    .filter(line => /^-\s\[([x\s])\]/.test(line))
    .map(line => {
      const match = line.match(/^-\s\[([x\s])\]\s*(.+)$/);
      return match ? {
        checked: match[1].toLowerCase() === 'x',
        text: match[2].trim()
      } : null;
    })
    .filter(Boolean);

  const progress = checklist.length > 0
    ? Math.round((checklist.filter(i => i.checked).length / checklist.length) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                編輯任務: {task.id}
              </DialogTitle>
              {checklist.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{progress}% 完成</span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? '編輯' : '預覽'}
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {!showPreview ? (
            /* 編輯模式 */
            <div className="flex-1 overflow-y-auto pr-4">
              {/* 標題 */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  標題
                </label>
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Expected Time */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  預估時間 (例: 2h, 1d)
                </label>
                <input
                  type="text"
                  value={editedTask.expected || ''}
                  onChange={handleExpectedChange}
                  placeholder="2h"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  標籤 (逗號分隔)
                </label>
                <input
                  type="text"
                  value={editedTask.tags?.join(', ') || ''}
                  onChange={handleTagsChange}
                  placeholder="frontend, backend"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {editedTask.tags && editedTask.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editedTask.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Content (Markdown) */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  內容 (支援 Markdown)
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  提示: 使用 <code className="bg-gray-100 px-1">- [ ]</code> 建立 checklist
                </div>
                <textarea
                  value={editedTask.content}
                  onChange={handleContentChange}
                  rows={18}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="# 任務描述&#10;&#10;## Checklist&#10;- [ ] 步驟一&#10;- [ ] 步驟二&#10;&#10;## 筆記&#10;..."
                />
              </div>
            </div>
          ) : (
            /* 預覽模式 */
            <div className="flex-1 overflow-y-auto pr-4">
              <div className="prose max-w-none">
                <h1 className="text-2xl font-bold mb-4">{editedTask.title}</h1>

                {editedTask.expected && (
                  <p className="text-gray-600 mb-2">
                    <strong>預估時間:</strong> {editedTask.expected}
                  </p>
                )}

                {editedTask.tags && editedTask.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {editedTask.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}

                <div className="border-t pt-4 mt-4 whitespace-pre-wrap">
                  {editedTask.content.split('\n').map((line, i) => {
                    // Render checkboxes
                    const match = line.match(/^-\s\[([x\s])\]\s*(.+)$/);
                    if (match) {
                      const checked = match[1].toLowerCase() === 'x';
                      return (
                        <div key={i} className="flex items-center gap-2 mb-1">
                          <input
                            type="checkbox"
                            checked={checked}
                            readOnly
                            className="w-4 h-4"
                          />
                          <span className={checked ? 'line-through text-gray-500' : ''}>
                            {match[2]}
                          </span>
                        </div>
                      );
                    }

                    // Render headers
                    if (line.startsWith('# ')) {
                      return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-xl font-bold mt-3 mb-2">{line.slice(3)}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-lg font-bold mt-2 mb-1">{line.slice(4)}</h3>;
                    }

                    // Regular text
                    return <p key={i} className="mb-2">{line || '\u00A0'}</p>;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between w-full">
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            刪除任務
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? '儲存中...' : '儲存'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TaskEditor;
