import { useCallback, useEffect, useState } from 'react';

import { getProject } from '@/services/project.service';
import { getTasksByAssignee, listenToAssigneeTasks } from '@/services/task.service';
import { useProjectStore } from '@/stores/project.store';
import type { Task } from '@/types';

export interface GroupedTasks {
  projectId: string;
  projectName: string;
  tasks: Task[];
}

async function resolveProjectNames(
  grouped: Record<string, Task[]>,
  knownProjects: { id: string; name: string }[],
): Promise<GroupedTasks[]> {
  const nameById = new Map(knownProjects.map((p) => [p.id, p.name]));

  const entries = await Promise.all(
    Object.entries(grouped).map(async ([projectId, projectTasks]) => {
      let projectName = nameById.get(projectId);
      if (!projectName) {
        try {
          const project = await getProject(projectId);
          projectName = project.name;
        } catch {
          projectName = 'Project';
        }
      }
      return { projectId, projectName, tasks: projectTasks };
    }),
  );

  return entries.sort((a, b) => a.projectName.localeCompare(b.projectName));
}

export function useMyTasks(userId: string | undefined) {
  const { projects: storeProjects } = useProjectStore();
  const [groups, setGroups] = useState<GroupedTasks[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<Error | null>(null);

  const applyGrouped = useCallback(
    async (grouped: Record<string, Task[]>) => {
      setTasks(grouped);
      const resolved = await resolveProjectNames(grouped, storeProjects);
      setGroups(resolved);
      setLoading(false);
    },
    [storeProjects],
  );

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
      await applyGrouped(grouped);
    } catch (err: any) {
      setError(err);
      setLoading(false);
    }
  }, [userId, applyGrouped]);

  useEffect(() => {
    if (!userId) {
      setGroups([]);
      setTasks({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const unsubscribe = listenToAssigneeTasks(
      userId,
      (grouped) => {
        applyGrouped(grouped).catch((err) => setError(err));
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [userId, applyGrouped]);

  return { groups, tasks, loading, error, refetch };
}
