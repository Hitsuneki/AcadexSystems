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
  const { currentProject, setCurrentProject, projects: storeProjects } = useProjectStore();
  const { user } = useAuthStore();
  const { projects: fetchedProjects } = useUserProjects(user?.uid);

  useEffect(() => {
    if (!projectId) return;
    if (currentProject?.id === projectId) return;

    // Search store projects first (covers locally created/joined projects),
    // then fall back to backend-fetched projects
    const found =
      storeProjects.find((p) => p.id === projectId) ??
      fetchedProjects.find((p) => p.id === projectId);

    if (found) {
      setCurrentProject(found);
    }
    // TODO: if not found, fetch from backend using getProject(projectId)
  }, [projectId, storeProjects, fetchedProjects, currentProject]);

  return { project: currentProject?.id === projectId ? currentProject : null };
}
