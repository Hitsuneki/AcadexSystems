/**
 * Task service — stub.
 */
import type { Task, Priority, TaskStatus, TaskChecklist } from '@/types';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  assigneeIds: string[];
}

export async function createTask(_projectId: string, _uid: string, _payload: CreateTaskPayload): Promise<Task> {
  await new Promise((r) => setTimeout(r, 400));
  return {
    id: `task-${Date.now()}`,
    projectId: _projectId,
    title: _payload.title,
    description: _payload.description,
    status: _payload.status,
    priority: _payload.priority,
    dueDate: _payload.dueDate,
    assigneeIds: _payload.assigneeIds,
    checklist: [],
    attachmentIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: _uid,
  };
}

export async function updateTask(_taskId: string, _payload: Partial<Task>): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
}

export async function moveTask(_taskId: string, _fromColumn: string, _toColumn: TaskStatus): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
}

export async function completeTask(_taskId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
}

export async function cancelTask(_taskId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
}

export async function toggleChecklistItem(_taskId: string, _itemId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
}

export async function addChecklistItem(_taskId: string, _text: string): Promise<TaskChecklist> {
  await new Promise((r) => setTimeout(r, 200));
  return { id: `chk-${Date.now()}`, text: _text, isCompleted: false };
}

export async function attachFileToTask(_taskId: string, _fileId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
}

export async function pushActionItemToBoard(_meetingId: string, _actionItemId: string, _projectId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
}
