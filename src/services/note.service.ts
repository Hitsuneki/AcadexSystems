import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { Note } from '@/types';
import { logActivity } from './activity.service';
import { mapNote } from './mappers';

export async function createNote(projectId: string, userId: string, title: string): Promise<Note> {
  try {
    const noteRef = await addDoc(collection(db, 'notes'), {
      projectId,
      title,
      body: '',
      createdBy: userId,
      lastEditedBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await updateDoc(noteRef, { id: noteRef.id });
    await logActivity(projectId, userId, 'note_created', 'note', noteRef.id);
    return mapNote(noteRef.id, {
      projectId,
      title,
      body: '',
      createdBy: userId,
      lastEditedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(`Failed to create note: ${error.message}`);
  }
}

export async function updateNote(
  noteId: string,
  userIdOrPayload: string | { title?: string; body?: string; lastEditedBy: string },
  body?: string,
): Promise<void> {
  const userId = typeof userIdOrPayload === 'string' ? userIdOrPayload : userIdOrPayload.lastEditedBy;
  const payload =
    typeof userIdOrPayload === 'string'
      ? { body, lastEditedBy: userId }
      : { ...userIdOrPayload };

  try {
    const snapshot = await getDoc(doc(db, 'notes', noteId));
    const projectId = snapshot.exists() ? snapshot.data().projectId : '';
    await updateDoc(doc(db, 'notes', noteId), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
    if (projectId) await logActivity(projectId, userId, 'note_edited', 'note', noteId);
  } catch (error: any) {
    throw new Error(`Failed to update note: ${error.message}`);
  }
}

export function listenToProjectNotes(projectId: string, callback: (notes: Note[]) => void): () => void {
  const q = query(collection(db, 'notes'), where('projectId', '==', projectId));
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((item) => mapNote(item.id, item.data()))),
    (error) => {
      throw new Error(`Failed to listen to notes: ${error.message}`);
    },
  );
}

export async function deleteNote(noteId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'notes', noteId));
  } catch (error: any) {
    throw new Error(`Failed to delete note: ${error.message}`);
  }
}
