'use client';

import { useMemo, useState } from 'react';
import { useTasks } from '@/lib/hooks/useTasks';
import { useMiddayLogs } from '@/lib/hooks/useMiddayLogs';
import { useToast } from '@/components/ui/Toast';
import { Task } from '@/lib/types';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import TaskRow from './TaskRow';
import TaskQuickAdd from './TaskQuickAdd';
import TaskDetailModal from './TaskDetailModal';
import { useAgentStatus } from '@/lib/context/AgentContext';

function isClientTask(task: Task): boolean {
  return task.source === 'Basecamp';
}

export default function TaskList() {
  const { tasks, isLoading, error, mutate: mutateTasks } = useTasks();
  const { mutate: mutateMiddayLogs } = useMiddayLogs();
  const { toast } = useToast();
  const { isProcessing } = useAgentStatus();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { internalTasks, clientTasks } = useMemo(() => {
    const internal: Task[] = [];
    const client: Task[] = [];
    for (const task of tasks) {
      if (isClientTask(task)) {
        client.push(task);
      } else {
        internal.push(task);
      }
    }
    return { internalTasks: internal, clientTasks: client };
  }, [tasks]);

  async function handleStatusChange(taskId: string, newStatus: string) {
    // Optimistic update
    const previousTasks = tasks;
    mutateTasks(
      tasks.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          status: newStatus as typeof t.status,
          completedAt: newStatus === 'Done' ? new Date().toISOString() : t.completedAt,
        };
      }),
      false
    );

    try {
      const fields: Record<string, unknown> = { Status: newStatus };
      if (newStatus === 'Done') {
        fields['Completed At'] = new Date().toISOString();
      }

      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, fields }),
      });

      if (!res.ok) throw new Error('Update failed');
      mutateTasks();
    } catch {
      // Revert on error
      mutateTasks(previousTasks, false);
      toast('Update failed', 'error');
    }
  }

  return (
    <Card>
      <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
        Today&apos;s Tasks
      </h2>

      {isProcessing && (
        <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-md border border-purple-800/50 bg-purple-900/20">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs text-purple-300">Agent is updating tasks...</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : error ? (
        <EmptyState title="Failed to load tasks." />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet."
          description="Morning workflow runs at 7:30 AM."
        />
      ) : (
        <div className="space-y-4">
          {/* Internal Tasks */}
          <section>
            <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1 px-1">
              Internal
            </h3>
            {internalTasks.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] px-1 py-2">No internal tasks</p>
            ) : (
              <div className="max-h-52 overflow-y-auto divide-y divide-[var(--border)]">
                {internalTasks.map(task => (
                  <TaskRow key={task.id} task={task} onStatusChange={handleStatusChange} onClick={() => setSelectedTask(task)} />
                ))}
              </div>
            )}
          </section>

          {/* Client Tasks */}
          <section>
            <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1 px-1">
              Client
            </h3>
            {clientTasks.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] px-1 py-2">No client tasks</p>
            ) : (
              <div className="max-h-52 overflow-y-auto divide-y divide-[var(--border)]">
                {clientTasks.map(task => (
                  <TaskRow key={task.id} task={task} onStatusChange={handleStatusChange} onClick={() => setSelectedTask(task)} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <div className="mt-2 border-t border-[var(--border)] pt-2">
        <TaskQuickAdd
          onTaskAdded={() => mutateTasks()}
          onMiddayLogAdded={() => mutateMiddayLogs()}
        />
      </div>

      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
    </Card>
  );
}
