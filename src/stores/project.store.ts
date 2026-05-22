import { create } from 'zustand';
import type { Project } from '@/types';

interface ProjectState {
  activeProjectId: string | null;
  activeProject: Project | null;
  currentProject: Project | null;
  projects: Project[];
  setActiveProject: (project: Project | null) => void;
  clearActiveProject: () => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  setProjects: (projects: Project[]) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  activeProjectId: null,
  activeProject: null,
  currentProject: null,
  projects: [],
  setActiveProject: (project) =>
    set({ activeProject: project, currentProject: project, activeProjectId: project?.id ?? null }),
  clearActiveProject: () => set({ activeProject: null, currentProject: null, activeProjectId: null }),
  setCurrentProject: (project) =>
    set({ currentProject: project, activeProject: project, activeProjectId: project?.id ?? null }),
  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects.filter((item) => item.id !== project.id)],
    })),
  setProjects: (projects) => set({ projects }),
}));
