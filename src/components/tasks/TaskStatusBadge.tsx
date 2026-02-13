'use client';

import Badge from '@/components/ui/Badge';

interface TaskStatusBadgeProps {
  status: 'To Do' | 'In Progress' | 'Done' | 'Carried Over';
  onStatusChange?: (newStatus: string) => void;
}

const statusVariant: Record<string, 'todo' | 'inProgress' | 'done' | 'carriedOver'> = {
  'To Do': 'todo',
  'In Progress': 'inProgress',
  'Done': 'done',
  'Carried Over': 'carriedOver',
};

const cycleMap: Record<string, string> = {
  'To Do': 'In Progress',
  'In Progress': 'Done',
  'Done': 'To Do',
};

export default function TaskStatusBadge({ status, onStatusChange }: TaskStatusBadgeProps) {
  const isInteractive = status !== 'Carried Over' && !!onStatusChange;

  function handleClick() {
    if (!isInteractive) return;
    const next = cycleMap[status];
    if (next) onStatusChange?.(next);
  }

  return (
    <Badge
      variant={statusVariant[status] || 'muted'}
      onClick={isInteractive ? handleClick : undefined}
    >
      {status}
    </Badge>
  );
}
