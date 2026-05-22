import type {
  Activity,
  Announcement,
  FileType,
  Meeting,
  Note,
  Priority,
  Project,
  ProjectFile,
  Task,
  TaskChecklist,
  TaskStatus,
  UserProfile,
} from '@/types';

export const COLUMN_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  inProgress: 'In Progress',
  review: 'Review',
  done: 'Done',
  Backlog: 'Backlog',
  'In Progress': 'In Progress',
  Review: 'Review',
  Done: 'Done',
};

export const COLUMN_KEYS: Record<string, TaskStatus> = {
  Backlog: 'backlog',
  'In Progress': 'inProgress',
  Review: 'review',
  Done: 'done',
  backlog: 'backlog',
  inProgress: 'inProgress',
  review: 'review',
  done: 'done',
  cancelled: 'cancelled',
};

const PRIORITY_KEYS: Record<string, Priority> = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Urgent: 'urgent',
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
};

export function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export function toIso(value: any): string {
  return toDate(value)?.toISOString() ?? new Date().toISOString();
}

export function toColumnLabel(value: any): string {
  return COLUMN_LABELS[String(value ?? 'Backlog')] ?? 'Backlog';
}

export function toColumnKey(value: any): TaskStatus {
  return COLUMN_KEYS[String(value ?? 'Backlog')] ?? 'backlog';
}

export function toPriorityKey(value: any): Priority {
  return PRIORITY_KEYS[String(value ?? 'Medium')] ?? 'medium';
}

export function inferFileType(fileName: string, mimeType?: string): FileType {
  const lower = fileName.toLowerCase();
  if (mimeType?.includes('pdf') || lower.endsWith('.pdf')) return 'pdf';
  if (mimeType?.includes('word') || lower.endsWith('.docx')) return 'docx';
  if (mimeType?.includes('presentation') || lower.endsWith('.pptx')) return 'pptx';
  if (mimeType?.includes('png') || lower.endsWith('.png')) return 'png';
  if (mimeType?.includes('jpeg') || mimeType?.includes('jpg') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'jpg';
  return 'txt';
}

export function mapUserProfile(id: string, data: any): UserProfile {
  return {
    id,
    uid: data.uid ?? id,
    fullName: data.fullName ?? '',
    email: data.email ?? '',
    avatarUri: data.avatarUrl ?? data.avatarUri ?? '',
    avatarUrl: data.avatarUrl ?? data.avatarUri ?? '',
    bio: data.bio ?? '',
    course: data.course ?? '',
    roleLabel: data.roleLabel ?? 'Student',
    projectIds: data.projectIds ?? [],
    completedTasksCount: data.completedTasksCount ?? 0,
  } as UserProfile;
}

export function mapProject(id: string, data: any): Project {
  return {
    id,
    name: data.name ?? '',
    description: data.description ?? '',
    subjectTag: data.subjectTag ?? '',
    visibility: data.visibility ?? 'private',
    coverColor: data.coverColor ?? '#2563EB',
    createdBy: data.createdBy ?? data.ownerId ?? '',
    ownerId: data.createdBy ?? data.ownerId ?? '',
    memberIds: data.memberIds ?? [],
    inviteCode: data.inviteCode ?? '',
    status: data.status ?? 'active',
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    isArchived: data.status === 'archived',
  } as Project;
}

function mapChecklistItem(item: any): TaskChecklist {
  return {
    id: item.id,
    text: item.text ?? item.label ?? '',
    label: item.label ?? item.text ?? '',
    isCompleted: Boolean(item.isCompleted ?? item.isDone),
    isDone: Boolean(item.isDone ?? item.isCompleted),
  } as TaskChecklist;
}

export function mapTask(id: string, data: any): Task {
  const columnKey = toColumnKey(data.column ?? data.status);
  const uiStatus = data.status === 'cancelled' ? 'cancelled' : columnKey;
  return {
    id,
    projectId: data.projectId,
    title: data.title ?? '',
    description: data.description ?? '',
    column: toColumnLabel(data.column ?? data.status),
    status: uiStatus,
    taskStatus: data.status ?? 'active',
    priority: toPriorityKey(data.priority),
    dueDate: toDate(data.dueDate)?.toISOString(),
    assigneeIds: data.assigneeIds ?? [],
    attachmentUrls: data.attachmentUrls ?? [],
    attachmentIds: data.attachmentIds ?? [],
    checklist: (data.checklist ?? []).map(mapChecklistItem),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    createdBy: data.createdBy ?? '',
    completedAt: data.completedAt ? toIso(data.completedAt) : null,
  } as Task;
}

export function mapProjectFile(id: string, data: any): ProjectFile {
  return {
    id,
    projectId: data.projectId,
    uploadedBy: data.uploadedBy ?? '',
    fileName: data.fileName ?? '',
    fileType: data.fileType ?? 'txt',
    storageUrl: data.storageUrl ?? '',
    storagePath: data.storagePath ?? '',
    fileSize: data.fileSize ?? 0,
    status: data.status ?? 'available',
    uploadedAt: toIso(data.createdAt ?? data.uploadedAt),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  } as ProjectFile;
}

export function mapNote(id: string, data: any): Note {
  return {
    id,
    projectId: data.projectId,
    title: data.title ?? '',
    body: data.body ?? '',
    createdBy: data.createdBy ?? '',
    lastEditedBy: data.lastEditedBy ?? data.createdBy ?? '',
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  } as Note;
}

export function mapAnnouncement(id: string, data: any): Announcement {
  return {
    id,
    projectId: data.projectId,
    authorId: data.authorId ?? '',
    body: data.body ?? '',
    attachmentUrl: data.attachmentUrl ?? null,
    reactions: data.reactions ?? [],
    status: data.status ?? 'active',
    createdAt: toIso(data.createdAt),
  } as Announcement;
}

export function mapMeeting(id: string, data: any): Meeting {
  return {
    id,
    projectId: data.projectId,
    title: data.title ?? '',
    heldAt: data.heldAt,
    nextMeetingAt: data.nextMeetingAt ?? null,
    date: toIso(data.heldAt ?? data.date),
    attendeeIds: data.attendeeIds ?? [],
    agendaItems: data.agendaItems ?? [],
    decisions: data.decisions ?? data.notes ?? '',
    notes: data.decisions ?? data.notes ?? '',
    actionItems: data.actionItems ?? [],
    createdBy: data.createdBy ?? '',
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  } as Meeting;
}

export function mapActivity(id: string, data: any): Activity {
  return {
    id,
    projectId: data.projectId,
    userId: data.userId,
    actionType: data.actionType,
    entityType: data.entityType,
    entityId: data.entityId,
    metadata: data.metadata ?? {},
    timestamp: toIso(data.createdAt ?? data.timestamp),
    createdAt: toIso(data.createdAt),
  } as Activity;
}
