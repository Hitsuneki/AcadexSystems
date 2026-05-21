/**
 * Project service — stub.
 */
import type { Project, ProjectVisibility } from '@/types';

export interface CreateProjectPayload {
  name: string;
  description?: string;
  subjectTag: string;
  coverColor: string;
  visibility: ProjectVisibility;
}

export async function createProject(_uid: string, _payload: CreateProjectPayload): Promise<Project> {
  await new Promise((r) => setTimeout(r, 600));
  return {
    id: `proj-${Date.now()}`,
    name: _payload.name,
    description: _payload.description,
    subjectTag: _payload.subjectTag,
    coverColor: _payload.coverColor,
    visibility: _payload.visibility,
    memberIds: [_uid],
    inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: _uid,
  };
}

export async function joinProjectByCode(_uid: string, _code: string): Promise<Project> {
  await new Promise((r) => setTimeout(r, 600));
  return {
    id: `proj-${Date.now()}`,
    name: 'Joined Project',
    subjectTag: 'General',
    coverColor: '#2563EB',
    visibility: 'public',
    memberIds: [_uid],
    inviteCode: _code,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: 'other-uid',
  };
}

export async function getPublicProjects(_search?: string): Promise<Project[]> {
  await new Promise((r) => setTimeout(r, 400));
  return [];
}

export async function requestJoin(_uid: string, _projectId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
}

export async function updateProject(_projectId: string, _payload: Partial<CreateProjectPayload>): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
}

export async function leaveProject(_uid: string, _projectId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
}

export async function archiveProject(_projectId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
}
