import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import { mapActivity } from './mappers';

export async function logActivity(
  projectId: string,
  userId: string,
  actionType: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, 'activity_logs'), {
      projectId,
      userId,
      actionType,
      entityType,
      entityId,
      metadata,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error: any) {
    throw new Error(`Failed to log activity: ${error.message}`);
  }
}

export function listenToProjectActivity(
  projectId: string,
  limitCount = 20,
  callback: (activities: any[]) => void,
): () => void {
  const q = query(
    collection(db, 'activity_logs'),
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  );

  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((doc) => mapActivity(doc.id, doc.data()))),
    (error) => {
      throw new Error(`Failed to listen to activity: ${error.message}`);
    },
  );
}
