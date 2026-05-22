import { useCallback, useEffect, useState } from 'react';

import { getTasksByAssignee } from '@/services/task.service';
import type { Task } from '@/types';

export interface GroupedTasks {
  projectId: string;
  projectName: string;
  tasks: Task[];
}

export function useMyTasks(userId: string | undefined) {
  const [groups, setGroups] = useState<GroupedTasks[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) {
      setGroups([]);
      setTasks({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const grouped = await getTasksByAssignee(userId);
      setTasks(grouped);
      setGroups(
        Object.entries(grouped).map(([projectId, projectTasks]) => ({
          projectId,
          projectName: projectId,
          tasks: projectTasks,
        })),
      );
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { groups, tasks, loading, error, refetch };
}
