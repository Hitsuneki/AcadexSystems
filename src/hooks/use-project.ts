import { useEffect, useState } from 'react';

import { listenToProject } from '@/services/project.service';
import { useProjectStore } from '@/stores/project.store';
import type { Project } from '@/types';

export function useProject(projectId: string | undefined) {
  const { setCurrentProject } = useProjectStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);
    const unsubscribe = listenToProject(projectId, (nextProject) => {
      setProject(nextProject);
      setCurrentProject(nextProject);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId, setCurrentProject]);

  return { project, loading, error };
}
