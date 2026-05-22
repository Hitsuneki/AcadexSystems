import { useEffect, useMemo, useState } from 'react';

import { listenToProjectTasks } from '@/services/task.service';
import type { KanbanColumns, Task } from '@/types';

export function useTasks(projectId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);
    const unsubscribe = listenToProjectTasks(projectId, (nextTasks) => {
      setTasks(nextTasks);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  const columns: KanbanColumns = useMemo(
    () => ({
      backlog: tasks.filter((task) => task.status === 'backlog'),
      inProgress: tasks.filter((task) => task.status === 'inProgress'),
      review: tasks.filter((task) => task.status === 'review'),
      done: tasks.filter((task) => task.status === 'done'),
    }),
    [tasks],
  );

  const overdue = tasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== 'done' &&
      task.status !== 'cancelled',
  );
  const completedCount = tasks.filter((task) => task.status === 'done').length;

  return { tasks, columns, backlog: columns.backlog, inProgress: columns.inProgress, review: columns.review, done: columns.done, overdue, completedCount, loading, error };
}
