import {
  addDoc,
  arrayUnion,
  collection,
  getDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { Priority, Task, TaskChecklist, TaskStatus } from '@/types';
import { logActivity } from './activity.service';
import { COLUMN_LABELS, mapTask, toColumnLabel } from './mappers';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  column?: string;
  priority: Priority | string;
  dueDate?: string | Date | null;
  assigneeIds: string[];
  checklist?: TaskChecklist[];
}

function normalizeChecklist(checklist: TaskChecklist[] = []) {
  return checklist.map((item) => ({
    id: item.id,
    label: item.label ?? item.text,
    isDone: Boolean(item.isDone ?? item.isCompleted),
  }));
}

export async function createTask(projectId: string, userId: string, data: CreateTaskPayload): Promise<Task> {
  try {
    const taskRef = await addDoc(collection(db, 'tasks'), {
      projectId,
      title: data.title,
      description: data.description ?? '',
      column: toColumnLabel(data.column ?? data.status ?? 'Backlog'),
      priority: String(data.priority ?? 'Medium'),
      assigneeIds: data.assigneeIds ?? [],
      attachmentUrls: [],
      checklist: normalizeChecklist(data.checklist),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: 'active',
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      completedAt: null,
    });
    await updateDoc(taskRef, { id: taskRef.id });
    await logActivity(projectId, userId, 'task_created', 'task', taskRef.id);
    return mapTask(taskRef.id, {
      ...data,
      projectId,
      column: toColumnLabel(data.column ?? data.status ?? 'Backlog'),
      status: 'active',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(`Failed to create task: ${error.message}`);
  }
}

export async function moveTask(
  taskId: string,
  fromColumn: string,
  toColumn: string,
  userId = '',
  projectId = '',
): Promise<void> {
  try {
    let resolvedUserId = userId;
    let resolvedProjectId = projectId;
    if (!resolvedUserId || !resolvedProjectId) {
      const snapshot = await getDoc(doc(db, 'tasks', taskId));
      if (snapshot.exists()) {
        const task = snapshot.data();
        resolvedUserId = resolvedUserId || task.createdBy || '';
        resolvedProjectId = resolvedProjectId || task.projectId || '';
      }
    }

    await updateDoc(doc(db, 'tasks', taskId), {
      column: toColumnLabel(toColumn),
      updatedAt: serverTimestamp(),
    });
    if (resolvedUserId && resolvedProjectId) {
      await logActivity(resolvedProjectId, resolvedUserId, 'task_moved', 'task', taskId, { fromColumn, toColumn });
    }
  } catch (error: any) {
    throw new Error(`Failed to move task: ${error.message}`);
  }
}

export async function completeTask(taskId: string, userId = '', projectId = ''): Promise<void> {
  try {
    let resolvedUserId = userId;
    let resolvedProjectId = projectId;
    if (!resolvedUserId || !resolvedProjectId) {
      const snapshot = await getDoc(doc(db, 'tasks', taskId));
      if (snapshot.exists()) {
        const task = snapshot.data();
        resolvedUserId = resolvedUserId || task.createdBy || '';
        resolvedProjectId = resolvedProjectId || task.projectId || '';
      }
    }

    await updateDoc(doc(db, 'tasks', taskId), {
      status: 'completed',
      column: COLUMN_LABELS.done,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    if (resolvedUserId && resolvedProjectId) {
      await logActivity(resolvedProjectId, resolvedUserId, 'task_completed', 'task', taskId);
    }
  } catch (error: any) {
    throw new Error(`Failed to complete task: ${error.message}`);
  }
}

export async function cancelTask(taskId: string, userId = '', projectId = ''): Promise<void> {
  try {
    let resolvedUserId = userId;
    let resolvedProjectId = projectId;
    if (!resolvedUserId || !resolvedProjectId) {
      const snapshot = await getDoc(doc(db, 'tasks', taskId));
      if (snapshot.exists()) {
        const task = snapshot.data();
        resolvedUserId = resolvedUserId || task.createdBy || '';
        resolvedProjectId = resolvedProjectId || task.projectId || '';
      }
    }

    await updateDoc(doc(db, 'tasks', taskId), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
    if (resolvedUserId && resolvedProjectId) {
      await logActivity(resolvedProjectId, resolvedUserId, 'task_cancelled', 'task', taskId);
    }
  } catch (error: any) {
    throw new Error(`Failed to cancel task: ${error.message}`);
  }
}

export async function updateTask(taskId: string, data: Partial<Task>): Promise<void> {
  try {
    const payload: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
    if (data.status && data.status !== 'cancelled') payload.column = toColumnLabel(data.status);
    delete payload.id;
    await updateDoc(doc(db, 'tasks', taskId), payload);
  } catch (error: any) {
    throw new Error(`Failed to update task: ${error.message}`);
  }
}

export async function updateChecklist(taskId: string, checklist: TaskChecklist[]): Promise<void> {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      checklist: normalizeChecklist(checklist),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to update checklist: ${error.message}`);
  }
}

export async function assignMembers(taskId: string, assigneeIds: string[]): Promise<void> {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      assigneeIds,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to assign members: ${error.message}`);
  }
}

export async function attachFileToTask(taskId: string, fileUrl: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      attachmentUrls: arrayUnion(fileUrl),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to attach file to task: ${error.message}`);
  }
}

export async function toggleChecklistItem(taskId: string, itemId: string): Promise<void> {
  try {
    const snapshot = await getDoc(doc(db, 'tasks', taskId));
    if (!snapshot.exists()) throw new Error('Task not found');
    const checklist = (snapshot.data().checklist ?? []).map((item: any) =>
      item.id === itemId ? { ...item, isDone: !item.isDone } : item,
    );
    await updateDoc(doc(db, 'tasks', taskId), {
      checklist,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to toggle checklist item: ${error.message}`);
  }
}

export async function addChecklistItem(taskId: string, label: string): Promise<TaskChecklist> {
  const item = { id: `chk-${Date.now()}`, text: label, label, isCompleted: false, isDone: false };
  try {
    const snapshot = await getDoc(doc(db, 'tasks', taskId));
    if (!snapshot.exists()) throw new Error('Task not found');
    const checklist = [...(snapshot.data().checklist ?? []), { id: item.id, label, isDone: false }];
    await updateDoc(doc(db, 'tasks', taskId), {
      checklist,
      updatedAt: serverTimestamp(),
    });
    return item;
  } catch (error: any) {
    throw new Error(`Failed to add checklist item: ${error.message}`);
  }
}

export function listenToProjectTasks(projectId: string, callback: (tasks: Task[]) => void): () => void {
  const q = query(collection(db, 'tasks'), where('projectId', '==', projectId));
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((item) => mapTask(item.id, item.data()))),
    (error) => {
      throw new Error(`Failed to listen to tasks: ${error.message}`);
    },
  );
}

export async function getTasksByAssignee(userId: string): Promise<Record<string, Task[]>> {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('assigneeIds', 'array-contains', userId),
      where('status', '==', 'active'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.reduce<Record<string, Task[]>>((groups, item) => {
      const task = mapTask(item.id, item.data());
      groups[task.projectId] = [...(groups[task.projectId] ?? []), task];
      return groups;
    }, {});
  } catch (error: any) {
    throw new Error(`Failed to load assigned tasks: ${error.message}`);
  }
}

export async function pushActionItemToBoard(
  meetingId: string,
  actionItemOrId: any,
  projectId: string,
  userId = '',
): Promise<string> {
  const { pushActionItemToBoard: pushFromMeeting } = await import('./meeting.service');
  return pushFromMeeting(meetingId, actionItemOrId, projectId, userId);
}
