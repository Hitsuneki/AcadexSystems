import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { Announcement } from '@/types';
import { logActivity } from './activity.service';
import { mapAnnouncement } from './mappers';

export async function postAnnouncement(
  projectId: string,
  userId: string,
  body: string,
  attachmentUrl: string | null = null,
): Promise<Announcement> {
  try {
    const ref = await addDoc(collection(db, 'announcements'), {
      projectId,
      authorId: userId,
      body,
      attachmentUrl,
      reactions: [],
      status: 'active',
      createdAt: serverTimestamp(),
    });
    await updateDoc(ref, { id: ref.id });
    await logActivity(projectId, userId, 'announcement_posted', 'announcement', ref.id);
    return mapAnnouncement(ref.id, {
      projectId,
      authorId: userId,
      body,
      attachmentUrl,
      reactions: [],
      status: 'active',
      createdAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(`Failed to post announcement: ${error.message}`);
  }
}

export async function toggleReaction(announcementId: string, userId: string): Promise<void> {
  try {
    const ref = doc(db, 'announcements', announcementId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) throw new Error('Announcement not found');
    const reactions = snapshot.data().reactions ?? [];
    const existing = reactions.find((reaction: any) => reaction.userId === userId);
    await updateDoc(ref, {
      reactions: existing
        ? arrayRemove(existing)
        : arrayUnion({ userId, type: 'thumbsup' }),
    });
  } catch (error: any) {
    throw new Error(`Failed to toggle reaction: ${error.message}`);
  }
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'announcements', announcementId), { status: 'deleted' });
  } catch (error: any) {
    throw new Error(`Failed to delete announcement: ${error.message}`);
  }
}

export function listenToAnnouncements(
  projectId: string,
  callback: (announcements: Announcement[]) => void,
): () => void {
  const q = query(
    collection(db, 'announcements'),
    where('projectId', '==', projectId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((item) => mapAnnouncement(item.id, item.data()))),
    (error) => {
      throw new Error(`Failed to listen to announcements: ${error.message}`);
    },
  );
}
