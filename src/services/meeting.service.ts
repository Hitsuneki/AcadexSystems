import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { ActionItem, Meeting } from '@/types';
import { logActivity } from './activity.service';
import { mapMeeting } from './mappers';

type MeetingActionItemInput = Omit<ActionItem, 'id'> & Partial<Pick<ActionItem, 'id'>>;

export interface CreateMeetingPayload {
  title: string;
  date?: string;
  heldAt?: Date | string;
  nextMeetingAt?: Date | string | null;
  attendeeIds: string[];
  agendaItems?: string[];
  decisions?: string;
  notes?: string;
  actionItems?: MeetingActionItemInput[];
}

function normalizeActionItems(actionItems: MeetingActionItemInput[] = []) {
  return actionItems.map((item, index) => ({
    id: item.id ?? `ai-${Date.now()}-${index}`,
    body: item.body,
    assignedTo: item.assignedTo ?? '',
    pushedToTaskId: item.pushedToTaskId ?? null,
    status: item.status ?? 'pending',
    createdAt: item.createdAt ?? new Date(),
  }));
}

export async function createMeeting(
  projectId: string,
  userIdOrData: string | CreateMeetingPayload,
  maybeData?: CreateMeetingPayload,
): Promise<Meeting> {
  const userId = typeof userIdOrData === 'string' ? userIdOrData : '';
  const data = typeof userIdOrData === 'string' ? maybeData! : userIdOrData;

  try {
    const heldAt = data.heldAt ?? data.date ?? new Date();
    const actionItems = normalizeActionItems(data.actionItems);
    const meetingRef = await addDoc(collection(db, 'meetings'), {
      projectId,
      title: data.title,
      heldAt: new Date(heldAt),
      nextMeetingAt: data.nextMeetingAt ? new Date(data.nextMeetingAt) : null,
      attendeeIds: data.attendeeIds ?? [],
      agendaItems: data.agendaItems ?? [],
      decisions: data.decisions ?? data.notes ?? '',
      actionItems,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await updateDoc(meetingRef, { id: meetingRef.id });
    if (userId) await logActivity(projectId, userId, 'meeting_created', 'meeting', meetingRef.id);
    return mapMeeting(meetingRef.id, {
      ...data,
      projectId,
      heldAt,
      decisions: data.decisions ?? data.notes ?? '',
      actionItems,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(`Failed to create meeting: ${error.message}`);
  }
}

export async function updateMeeting(meetingId: string, data: Partial<CreateMeetingPayload>): Promise<void> {
  try {
    const payload: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
    if (data.date && !data.heldAt) payload.heldAt = new Date(data.date);
    if (data.notes !== undefined && data.decisions === undefined) payload.decisions = data.notes;
    if (data.actionItems !== undefined) payload.actionItems = normalizeActionItems(data.actionItems);
    delete payload.date;
    delete payload.notes;
    await updateDoc(doc(db, 'meetings', meetingId), payload);
  } catch (error: any) {
    throw new Error(`Failed to update meeting: ${error.message}`);
  }
}

export async function pushActionItemToBoard(
  meetingId: string,
  actionItemOrId: ActionItem | string,
  projectId: string,
  userId: string,
): Promise<string> {
  try {
    const meetingRef = doc(db, 'meetings', meetingId);
    const meetingSnapshot = await getDoc(meetingRef);
    if (!meetingSnapshot.exists()) throw new Error('Meeting not found');

    const meeting = mapMeeting(meetingSnapshot.id, meetingSnapshot.data());
    const actionItem =
      typeof actionItemOrId === 'string'
        ? meeting.actionItems.find((item) => item.id === actionItemOrId)
        : actionItemOrId;
    if (!actionItem) throw new Error('Action item not found');

    const taskRef = doc(collection(db, 'tasks'));
    const batch = writeBatch(db);
    batch.set(taskRef, {
      id: taskRef.id,
      projectId,
      title: actionItem.body,
      description: '',
      column: 'Backlog',
      priority: 'Medium',
      assigneeIds: actionItem.assignedTo ? [actionItem.assignedTo] : [],
      attachmentUrls: [],
      checklist: [],
      dueDate: null,
      status: 'active',
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      completedAt: null,
    });
    batch.update(meetingRef, {
      actionItems: meeting.actionItems.map((item) =>
        item.id === actionItem.id
          ? { ...item, pushedToTaskId: taskRef.id, status: 'pushed' }
          : item,
      ),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    await logActivity(projectId, userId, 'action_item_pushed', 'meeting', meetingId, {
      actionItemId: actionItem.id,
      taskId: taskRef.id,
    });
    return taskRef.id;
  } catch (error: any) {
    throw new Error(`Failed to push action item to board: ${error.message}`);
  }
}

export function listenToProjectMeetings(
  projectId: string,
  callback: (meetings: Meeting[]) => void,
): () => void {
  const q = query(
    collection(db, 'meetings'),
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((item) => mapMeeting(item.id, item.data()))),
    (error) => {
      throw new Error(`Failed to listen to meetings: ${error.message}`);
    },
  );
}
