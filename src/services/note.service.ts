/**
 * Note service — stub.
 */
import type { Note } from '@/types';

export async function createNote(_projectId: string, _uid: string, _title: string): Promise<Note> {
  await new Promise((r) => setTimeout(r, 400));
  return {
    id: `note-${Date.now()}`,
    projectId: _projectId,
    title: _title,
    body: '',
    lastEditedBy: _uid,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

export async function updateNote(_noteId: string, _payload: { title?: string; body?: string; lastEditedBy: string }): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
}

export async function deleteNote(_noteId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
}
