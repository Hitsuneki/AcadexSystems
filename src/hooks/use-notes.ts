import { useEffect, useState } from 'react';

import { listenToProjectNotes } from '@/services/note.service';
import { useNotesStore } from '@/stores/notes.store';
import type { Note } from '@/types';

export function useNotes(projectId: string | undefined) {
  const { notesByProject, addNote, updateNote: storeUpdateNote, setNotes } = useNotesStore();
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);
  const notes: Note[] = projectId ? notesByProject[projectId] ?? [] : [];

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);
    const unsubscribe = listenToProjectNotes(projectId, (nextNotes) => {
      setNotes(projectId, nextNotes);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId, setNotes]);

  const addNoteLocal = (note: Note) => {
    if (projectId) addNote(projectId, note);
  };

  const updateNoteLocal = (noteId: string, patch: Partial<Note>) => {
    if (projectId) storeUpdateNote(projectId, noteId, patch);
  };

  return { notes, loading, error, addNote: addNoteLocal, updateNote: updateNoteLocal };
}
