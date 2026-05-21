/**
 * useMyTasks — cross-project tasks assigned to the current user.
 */
import { useState, useEffect } from 'react';
import type { Task } from '@/types';

export interface GroupedTasks {
  projectId: string;
  projectName: string;
  tasks: Task[];
}

export function useMyTasks(_userId: string | undefined) {
  const [groups, setGroups] = useState<GroupedTasks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_userId) { setLoading(false); return; }
    // TODO: query tasks assigned to userId across all projects
    const timer = setTimeout(() => {
      setGroups([]);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [_userId]);

  return { groups, loading };
}
