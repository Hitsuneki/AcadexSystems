import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { Project, ProjectVisibility } from '@/types';
import { logActivity } from './activity.service';
import { mapProject } from './mappers';

export interface CreateProjectPayload {
  name: string;
  description?: string;
  subjectTag: string;
  coverColor: string;
  visibility: ProjectVisibility;
}

function generateInviteCode(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

async function generateUniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = generateInviteCode();
    const existing = await getDocs(
      query(collection(db, 'projects'), where('inviteCode', '==', code)),
    );
    if (existing.empty) return code;
  }
  throw new Error('Could not generate a unique project code');
}

export async function createProject(userId: string, data: CreateProjectPayload): Promise<Project> {
  try {
    const inviteCode = await generateUniqueInviteCode();
    const projectRef = await addDoc(collection(db, 'projects'), {
      name: data.name,
      description: data.description ?? '',
      subjectTag: data.subjectTag ?? '',
      visibility: data.visibility ?? 'private',
      coverColor: data.coverColor ?? '#2563EB',
      createdBy: userId,
      memberIds: [userId],
      inviteCode,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(projectRef, { id: projectRef.id });
    await updateDoc(doc(db, 'users', userId), {
      projectIds: arrayUnion(projectRef.id),
      updatedAt: serverTimestamp(),
    });
    await logActivity(projectRef.id, userId, 'member_joined', 'project', projectRef.id);

    const snapshot = await getDoc(projectRef);
    return mapProject(projectRef.id, snapshot.data());
  } catch (error: any) {
    throw new Error(`Failed to create project: ${error.message}`);
  }
}

export async function joinProjectByCode(
  codeOrUserId: string,
  userIdOrCode: string,
): Promise<Project> {
  const looksLikeCode = /^[A-Z0-9]{6}$/i.test(codeOrUserId);
  const code = (looksLikeCode ? codeOrUserId : userIdOrCode).trim().toUpperCase();
  const userId = looksLikeCode ? userIdOrCode : codeOrUserId;

  try {
    const q = query(
      collection(db, 'projects'),
      where('inviteCode', '==', code),
      where('status', '==', 'active'),
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error('Invalid invite code');

    const projectDoc = snapshot.docs[0];
    const project = mapProject(projectDoc.id, projectDoc.data());
    if (project.memberIds.includes(userId)) throw new Error('Already a member');

    await updateDoc(projectDoc.ref, {
      memberIds: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'users', userId), {
      projectIds: arrayUnion(projectDoc.id),
      updatedAt: serverTimestamp(),
    });
    await logActivity(projectDoc.id, userId, 'member_joined', 'project', projectDoc.id);

    const updated = await getDoc(projectDoc.ref);
    return mapProject(projectDoc.id, updated.data());
  } catch (error: any) {
    if (error.message === 'Already a member' || error.message === 'Invalid invite code') throw error;
    throw new Error(`Failed to join project: ${error.message}`);
  }
}

export async function getProject(projectId: string): Promise<Project> {
  try {
    const snapshot = await getDoc(doc(db, 'projects', projectId));
    if (!snapshot.exists()) throw new Error('Project not found');
    return mapProject(snapshot.id, snapshot.data());
  } catch (error: any) {
    if (error.message === 'Project not found') throw error;
    throw new Error(`Failed to load project: ${error.message}`);
  }
}

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  try {
    const userSnapshot = await getDoc(doc(db, 'users', userId));
    const projectIds = userSnapshot.exists() ? userSnapshot.data().projectIds ?? [] : [];
    const snapshots = await Promise.all(
      projectIds.map((projectId: string) => getDoc(doc(db, 'projects', projectId))),
    );
    return snapshots
      .filter((snapshot) => snapshot.exists())
      .map((snapshot) => mapProject(snapshot.id, snapshot.data()));
  } catch (error: any) {
    throw new Error(`Failed to load projects: ${error.message}`);
  }
}

export async function getPublicProjects(searchTerm = ''): Promise<Project[]> {
  try {
    const q = query(
      collection(db, 'projects'),
      where('visibility', '==', 'public'),
      where('status', '==', 'active'),
    );
    const snapshot = await getDocs(q);
    const projects = snapshot.docs.map((item) => mapProject(item.id, item.data()));
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return projects;
    return projects.filter((project) => project.name.toLowerCase().includes(normalized));
  } catch (error: any) {
    throw new Error(`Failed to load public projects: ${error.message}`);
  }
}

export async function requestJoin(userId: string, projectId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'projects', projectId), {
      memberIds: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'users', userId), {
      projectIds: arrayUnion(projectId),
      updatedAt: serverTimestamp(),
    });
    await logActivity(projectId, userId, 'member_joined', 'project', projectId);
  } catch (error: any) {
    throw new Error(`Failed to join public project: ${error.message}`);
  }
}

export async function updateProject(
  projectId: string,
  data: Partial<CreateProjectPayload>,
): Promise<void> {
  try {
    await updateDoc(doc(db, 'projects', projectId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to update project: ${error.message}`);
  }
}

export async function archiveProject(projectId: string, _userId?: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'projects', projectId), {
      status: 'archived',
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to archive project: ${error.message}`);
  }
}

export async function leaveProject(
  projectIdOrUserId: string,
  userIdOrProjectId: string,
): Promise<void> {
  const firstLooksProject = projectIdOrUserId.startsWith('proj') || projectIdOrUserId.length > 20;
  const projectId = firstLooksProject ? projectIdOrUserId : userIdOrProjectId;
  const userId = firstLooksProject ? userIdOrProjectId : projectIdOrUserId;

  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnapshot = await getDoc(projectRef);
    if (!projectSnapshot.exists()) throw new Error('Project not found');
    const project = mapProject(projectSnapshot.id, projectSnapshot.data());
    const remainingMemberIds = project.memberIds.filter((memberId) => memberId !== userId);

    await updateDoc(projectRef, {
      memberIds: arrayRemove(userId),
      status: remainingMemberIds.length === 0 ? 'archived' : project.status ?? 'active',
      updatedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'users', userId), {
      projectIds: arrayRemove(projectId),
      updatedAt: serverTimestamp(),
    });
    await logActivity(projectId, userId, 'member_left', 'project', projectId);
  } catch (error: any) {
    throw new Error(`Failed to leave project: ${error.message}`);
  }
}

export function listenToProject(projectId: string, callback: (project: Project | null) => void): () => void {
  return onSnapshot(
    doc(db, 'projects', projectId),
    (snapshot) => callback(snapshot.exists() ? mapProject(snapshot.id, snapshot.data()) : null),
    (error) => {
      throw new Error(`Failed to listen to project: ${error.message}`);
    },
  );
}

export function listenToUserProjects(
  userId: string,
  callback: (projects: Project[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const projectUnsubscribes = new Map<string, Unsubscribe>();
  const projects = new Map<string, Project>();

  const emitProjects = () => {
    callback(Array.from(projects.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  };

  const unsubscribeUser = onSnapshot(
    doc(db, 'users', userId),
    (snapshot) => {
      const projectIds: string[] = snapshot.exists() ? snapshot.data().projectIds ?? [] : [];
      const activeProjectIds = new Set(projectIds);

      for (const [projectId, unsubscribe] of projectUnsubscribes) {
        if (!activeProjectIds.has(projectId)) {
          unsubscribe();
          projectUnsubscribes.delete(projectId);
          projects.delete(projectId);
        }
      }

      for (const projectId of projectIds) {
        if (projectUnsubscribes.has(projectId)) continue;

        const unsubscribeProject = onSnapshot(
          doc(db, 'projects', projectId),
          (projectSnapshot) => {
            if (projectSnapshot.exists()) {
              projects.set(projectSnapshot.id, mapProject(projectSnapshot.id, projectSnapshot.data()));
            } else {
              projects.delete(projectId);
            }
            emitProjects();
          },
          () => {
            projectUnsubscribes.get(projectId)?.();
            projectUnsubscribes.delete(projectId);
            projects.delete(projectId);
            emitProjects();
          },
        );
        projectUnsubscribes.set(projectId, unsubscribeProject);
      }

      if (projectIds.length === 0) emitProjects();
    },
    (error) => {
      onError?.(new Error(`Failed to listen to user projects: ${error.message}`));
    },
  );

  return () => {
    unsubscribeUser();
    for (const unsubscribe of projectUnsubscribes.values()) {
      unsubscribe();
    }
    projectUnsubscribes.clear();
  };
}
