'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import TaskStatusBadge from './TaskStatusBadge';

interface TaskRowProps {
  task: Task;
  onStatusChange: (id: string, newStatus: string) => void;
  onClick?: () => void;
}

const statusIcon: Record<string, string> = {
  'Done': '\u2705',
  'To Do': '\u25CB',
  'In Progress': '\u25D0',
  'Carried Over': '\uD83D\uDD04',
};

export default function TaskRow({ task, onStatusChange, onClick }: TaskRowProps) {
  const [insightsOpen, setInsightsOpen] = useState(false);

  return (
    <div className="flex items-center gap-3 py-2 px-1 hover:bg-[var(--bg-hover)] rounded-md transition-colors cursor-pointer" onClick={onClick}>
      <span className="text-base flex-shrink-0 w-6 text-center">
        {statusIcon[task.status] || '\u25CB'}
      </span>

      <span className="text-sm text-[var(--text-primary)] flex-1 min-w-0 truncate">
        {task.taskName}
      </span>

      <Badge variant="muted" className="flex-shrink-0">
        {task.source}
      </Badge>

      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <TaskStatusBadge
          status={task.status}
          onStatusChange={(newStatus) => onStatusChange(task.id, newStatus)}
        />
      </div>

      {task.aiInsights && (
        <button
          onClick={(e) => { e.stopPropagation(); setInsightsOpen(!insightsOpen); }}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] flex-shrink-0 truncate max-w-[80px]"
          title={task.aiInsights}
        >
          {insightsOpen ? task.aiInsights : `\uD83D\uDCA1 ${task.aiInsights.slice(0, 12)}...`}
        </button>
      )}
    </div>
  );
}
