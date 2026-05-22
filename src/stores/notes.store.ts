import { create } from 'zustand';
import type { Note } from '@/types';

interface NotesState {
  notesByProject: Record<string, Note[]>;
  addNote: (projectId: string, note: Note) => void;
  updateNote: (projectId: string, noteId: string, patch: Partial<Note>) => void;
  setNotes: (projectId: string, notes: Note[]) => void;
}

export const useNotesStore = create<NotesState>((set) => ({
  notesByProject: {},
  addNote: (projectId, note) =>
    set((state) => ({
      notesByProject: {
        ...state.notesByProject,
        [projectId]: [note, ...(state.notesByProject[projectId] ?? [])],
      },
    })),
  updateNote: (projectId, noteId, patch) =>
    set((state) => ({
      notesByProject: {
        ...state.notesByProject,
        [projectId]: (state.notesByProject[projectId] ?? []).map((n) =>
          n.id === noteId ? { ...n, ...patch } : n,
        ),
      },
    })),
  setNotes: (projectId, notes) =>
    set((state) => ({
      notesByProject: { ...state.notesByProject, [projectId]: notes },
    })),
}));
