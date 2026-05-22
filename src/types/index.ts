// ─── Domain Types ────────────────────────────────────────────────────────────

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'inProgress' | 'review' | 'done' | 'cancelled';
export type ProjectVisibility = 'private' | 'public';
export type RoleLabel = 'Student' | 'Teacher' | 'Researcher' | 'Professional';
export type FileType = 'pdf' | 'docx' | 'pptx' | 'jpg' | 'png' | 'txt';
export type ActionItemStatus = 'pending' | 'done' | 'pushed';
export type ColumnKey = 'backlog' | 'inProgress' | 'review' | 'done';

export interface UserProfile {
  id: string;
  uid?: string;
  fullName: string;
  email: string;
  avatarUri?: string;
  avatarUrl?: string;
  course: string;
  roleLabel: RoleLabel;
  bio?: string;
  projectIds: string[];
  completedTasksCount: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  subjectTag: string;
  coverColor: string;
  visibility: ProjectVisibility;
  memberIds: string[];
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  createdBy?: string;
  status?: 'active' | 'archived';
  isArchived?: boolean;
}

export interface TaskChecklist {
  id: string;
  text: string;
  label?: string;
  isCompleted: boolean;
  isDone?: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  column?: string;
  taskStatus?: 'active' | 'completed' | 'cancelled';
  priority: Priority;
  dueDate?: string;
  assigneeIds: string[];
  attachmentUrls?: string[];
  checklist?: TaskChecklist[];
  attachmentIds?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  completedAt?: string | null;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  storageUrl: string;
  storagePath?: string;
  status?: 'uploading' | 'available' | 'failed' | 'deleted';
  uploadedBy: string;
  uploadedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Note {
  id: string;
  projectId: string;
  title: string;
  body: string;
  createdBy?: string;
  lastEditedBy: string;
  updatedAt: string;
  createdAt: string;
}

export interface AnnouncementReaction {
  userId: string;
  type: 'thumbsUp';
}

export interface Announcement {
  id: string;
  projectId: string;
  authorId: string;
  body: string;
  attachmentUrl?: string | null;
  reactions: AnnouncementReaction[];
  status?: 'active' | 'deleted';
  createdAt: string;
}

export interface ActionItem {
  id: string;
  body: string;
  assignedTo?: string;
  pushedToTaskId?: string | null;
  status: ActionItemStatus;
  createdAt?: any;
}

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  date: string;
  heldAt?: any;
  nextMeetingAt?: any;
  attendeeIds: string[];
  agendaItems?: string[];
  decisions?: string;
  notes?: string;
  actionItems: ActionItem[];
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  createdAt?: string;
}

export interface KanbanColumns {
  backlog: Task[];
  inProgress: Task[];
  review: Task[];
  done: Task[];
}
