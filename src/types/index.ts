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
  fullName: string;
  email: string;
  avatarUri?: string;
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
  isArchived?: boolean;
}

export interface TaskChecklist {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  assigneeIds: string[];
  checklist?: TaskChecklist[];
  attachmentIds?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  storageUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Note {
  id: string;
  projectId: string;
  title: string;
  body: string;
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
  reactions: AnnouncementReaction[];
  createdAt: string;
}

export interface ActionItem {
  id: string;
  body: string;
  assignedTo?: string;
  status: ActionItemStatus;
}

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  date: string;
  attendeeIds: string[];
  notes?: string;
  actionItems: ActionItem[];
  createdAt: string;
}

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  timestamp: string;
}

export interface KanbanColumns {
  backlog: Task[];
  inProgress: Task[];
  review: Task[];
  done: Task[];
}
