import { create } from 'zustand';
import type { Project } from '@/types';

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  setProjects: (projects: Project[]) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  projects: [],
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) => set((state) => ({
    projects: [project, ...state.projects.filter((p) => p.id !== project.id)],
  })),
  setProjects: (projects) => set({ projects }),
}));
