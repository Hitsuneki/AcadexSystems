/**
 * useProject — loads a project by ID into the project store.
 * Call this in every project screen to ensure currentProject is populated,
 * even when navigating directly (e.g. deep link).
 */
import { useEffect } from 'react';
import { useProjectStore } from '@/stores/project.store';
import { useAuthStore } from '@/stores/auth.store';
import { useUserProjects } from './use-user-projects';

export function useProject(projectId: string | undefined) {
  const { currentProject, setCurrentProject } = useProjectStore();
  const { user } = useAuthStore();
  const { projects } = useUserProjects(user?.uid);

  useEffect(() => {
    if (!projectId) return;
    if (currentProject?.id === projectId) return;

    // Try to find in already-loaded projects
    const found = projects.find((p) => p.id === projectId);
    if (found) {
      setCurrentProject(found);
    }
    // TODO: if not found, fetch from backend using getProject(projectId)
  }, [projectId, projects, currentProject]);

  return { project: currentProject?.id === projectId ? currentProject : null };
}
