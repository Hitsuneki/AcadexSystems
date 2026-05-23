import { useEffect, useState } from 'react';

import { listenToUserProjects } from '@/services/project.service';
import { useProjectStore } from '@/stores/project.store';
import type { Project } from '@/types';

export function useUserProjects(userId: string | undefined) {
  const { setProjects } = useProjectStore();
  const [projects, setLocalProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLocalProjects([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);
    const unsubscribe = listenToUserProjects(userId, (nextProjects) => {
      setLocalProjects(nextProjects);
      setProjects(nextProjects);
      setLoading(false);
    }, (listenerError) => {
      setError(listenerError);
      setLocalProjects([]);
      setProjects([]);
      setLoading(false);
    });

    return unsubscribe;
  }, [setProjects, userId]);

  return { projects, loading, error };
}
