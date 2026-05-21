/**
 * useTasks — real-time task list for a project, organised by column.
 */
import { useState, useEffect } from 'react';
import type { Task, KanbanColumns } from '@/types';

export function useTasks(_projectId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_projectId) { setLoading(false); return; }
    // TODO: subscribe to tasks for this project
    const timer = setTimeout(() => {
      setTasks([]);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [_projectId]);

  const columns: KanbanColumns = {
    backlog: tasks.filter((t) => t.status === 'backlog'),
    inProgress: tasks.filter((t) => t.status === 'inProgress'),
    review: tasks.filter((t) => t.status === 'review'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done' && t.status !== 'cancelled',
  );

  const completedCount = tasks.filter((t) => t.status === 'done').length;

  return { tasks, columns, overdue, completedCount, loading };
}
