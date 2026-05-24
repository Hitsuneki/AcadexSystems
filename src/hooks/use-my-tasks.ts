import { useCallback, useEffect, useRef, useState } from 'react';

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

  // Stable ref so the Firestore listener closure always sees the latest projects
  // without re-subscribing every time the project store changes.
  const storeProjectsRef = useRef(storeProjects);
  useEffect(() => { storeProjectsRef.current = storeProjects; }, [storeProjects]);

  useEffect(() => {
    if (!userId) {
      setGroups([]);
      setTasks({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const projectIds = storeProjectsRef.current.map(p => p.id);
    const unsubscribe = listenToAssigneeTasks(
      userId,
      projectIds,
      (grouped) => {
        setTasks(grouped);
        resolveProjectNames(grouped, storeProjectsRef.current)
          .then((resolved) => {
            setGroups(resolved);
            setLoading(false);
          })
          .catch((err) => setError(err));
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  // Re-subscribe when userId changes, or when the number of loaded projects changes
  // so we don't miss tasks if projects load asynchronously.
  }, [userId, storeProjects.length]);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const projectIds = storeProjectsRef.current.map(p => p.id);
      const grouped = await getTasksByAssignee(userId, projectIds);
      setTasks(grouped);
      const resolved = await resolveProjectNames(grouped, storeProjectsRef.current);
      setGroups(resolved);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { groups, tasks, loading, error, refetch };
}
