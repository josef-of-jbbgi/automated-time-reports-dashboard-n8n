'use client';

import { Task } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatTime } from '@/lib/utils';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

const statusVariant: Record<string, 'todo' | 'inProgress' | 'done' | 'carriedOver'> = {
  'To Do': 'todo',
  'In Progress': 'inProgress',
  'Done': 'done',
  'Carried Over': 'carriedOver',
};

const priorityVariant: Record<string, 'high' | 'medium' | 'low'> = {
  'High': 'high',
  'Medium': 'medium',
  'Low': 'low',
};

function getBasecampUrl(basecampId: string): string | null {
  if (!basecampId) return null;
  return `https://3.basecamp.com/5774565/buckets/38194091/todos/${basecampId}`;
}

export default function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  if (!task) return null;

  const basecampUrl = getBasecampUrl(task.basecampId);

  return (
    <Modal isOpen={!!task} onClose={onClose} title={task.taskName}>
      <div className="space-y-4">
        {/* Status + Priority row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusVariant[task.status] || 'muted'}>{task.status}</Badge>
          <Badge variant={priorityVariant[task.priority] || 'muted'}>{task.priority} priority</Badge>
          <Badge variant="muted">{task.source}</Badge>
        </div>

        {/* Details grid */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Date</span>
            <span className="text-[var(--text-primary)]">{task.date}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Created</span>
            <span className="text-[var(--text-primary)]">
              {task.createdAt ? formatTime(task.createdAt) : '—'}
            </span>
          </div>

          {task.completedAt && (
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Completed</span>
              <span className="text-[var(--text-primary)]">{formatTime(task.completedAt)}</span>
            </div>
          )}

          {task.approach && (
            <div>
              <span className="text-[var(--text-muted)] block mb-1">Approach</span>
              <p className="text-[var(--text-primary)] bg-[var(--bg-hover)] rounded-md px-3 py-2 whitespace-pre-wrap">
                {task.approach}
              </p>
            </div>
          )}

          {task.aiInsights && (
            <div>
              <span className="text-[var(--text-muted)] block mb-1">AI Insights</span>
              <p className="text-[var(--text-primary)] bg-[var(--bg-hover)] rounded-md px-3 py-2 whitespace-pre-wrap">
                {task.aiInsights}
              </p>
            </div>
          )}

          {task.basecampId && (
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Basecamp ID</span>
              <span className="text-[var(--text-primary)] font-mono text-xs">{task.basecampId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer with action buttons */}
      <div className="flex justify-end gap-2 mt-6">
        {basecampUrl && (
          <a href={basecampUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">
              Open in Basecamp
            </Button>
          </a>
        )}
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
