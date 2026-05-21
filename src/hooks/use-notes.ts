/**
 * useNotes — note list for a project.
 */
import { useState, useEffect } from 'react';
import type { Note } from '@/types';

export function useNotes(_projectId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_projectId) { setLoading(false); return; }
    const timer = setTimeout(() => { setNotes([]); setLoading(false); }, 300);
    return () => clearTimeout(timer);
  }, [_projectId]);

  const addNote = (note: Note) => setNotes((prev) => [note, ...prev]);

  return { notes, loading, addNote };
}
