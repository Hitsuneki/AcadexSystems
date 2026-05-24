import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { auth, db } from '@/config/firebase';
import type { RoleLabel, UserProfile } from '@/types';
import { mapUserProfile } from './mappers';
import { uploadAvatar as uploadAvatarToStorage } from './storage.service';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName?: string;
  email: string;
  password: string;
}

export interface CreateProfilePayload {
  fullName: string;
  course: string;
  roleLabel: RoleLabel;
  bio?: string;
  avatarUri?: string;
  avatarUrl?: string;
}

function resolveEmailPassword(
  emailOrPayload: string | LoginPayload | RegisterPayload,
  password?: string,
): { email: string; password: string } {
  if (typeof emailOrPayload === 'string') {
    return { email: emailOrPayload, password: password ?? '' };
  }
  return { email: emailOrPayload.email, password: emailOrPayload.password };
}

export async function registerUser(
  emailOrPayload: string | RegisterPayload,
  password?: string,
): Promise<UserCredential & { uid: string }> {
  const credentials = resolveEmailPassword(emailOrPayload, password);
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email.trim(),
      credentials.password,
    );
    return Object.assign(userCredential, { uid: userCredential.user.uid });
  } catch (error: any) {
    throw new Error(`Registration failed: ${error.message}`);
  }
}

export async function loginUser(
  emailOrPayload: string | LoginPayload,
  password?: string,
): Promise<UserCredential> {
  const credentials = resolveEmailPassword(emailOrPayload, password);
  try {
    return await signInWithEmailAndPassword(auth, credentials.email.trim(), credentials.password);
  } catch (error: any) {
    throw new Error(`Login failed: ${error.message}`);
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(`Logout failed: ${error.message}`);
  }
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function createUserProfile(
  userId: string,
  data: CreateProfilePayload & Partial<UserProfile>,
): Promise<void> {
  try {
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      fullName: data.fullName ?? '',
      email: data.email ?? auth.currentUser?.email ?? '',
      avatarUrl: data.avatarUrl ?? data.avatarUri ?? '',
      bio: data.bio ?? '',
      course: data.course ?? '',
      roleLabel: data.roleLabel ?? 'Student',
      projectIds: data.projectIds ?? [],
      completedTasksCount: data.completedTasksCount ?? 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to create user profile: ${error.message}`);
  }
}

export async function updateUserProfile(
  userId: string,
  data: Partial<CreateProfilePayload & UserProfile>,
): Promise<void> {
  try {
    const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };

    if (data.fullName !== undefined) payload.fullName = data.fullName;
    if (data.email !== undefined) payload.email = data.email;
    if (data.course !== undefined) payload.course = data.course;
    if (data.bio !== undefined) payload.bio = data.bio;
    if (data.roleLabel !== undefined) payload.roleLabel = data.roleLabel;
    if (data.projectIds !== undefined) payload.projectIds = data.projectIds;
    if (data.completedTasksCount !== undefined) {
      payload.completedTasksCount = data.completedTasksCount;
    }

    const avatarUrl = data.avatarUrl ?? data.avatarUri;
    if (avatarUrl && !avatarUrl.startsWith('file://') && !avatarUrl.startsWith('content://')) {
      payload.avatarUrl = avatarUrl;
    }

    await updateDoc(doc(db, 'users', userId), payload);
  } catch (error: any) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const snapshot = await getDoc(doc(db, 'users', userId));
    if (!snapshot.exists()) return null;
    return mapUserProfile(snapshot.id, snapshot.data());
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      return null;
    }
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
}

/** Create or update the signed-in user's Firestore profile document. */
export async function saveUserProfile(
  userId: string,
  data: CreateProfilePayload & Partial<UserProfile>,
): Promise<void> {
  const existing = await getUserProfile(userId);
  if (existing) {
    await updateUserProfile(userId, data);
  } else {
    await createUserProfile(userId, data);
  }
}

export async function uploadAvatar(
  uid: string,
  localUri: string,
  mimeType = 'image/jpeg',
): Promise<string> {
  return uploadAvatarToStorage(uid, localUri, mimeType);
}

export async function signOutUser(): Promise<void> {
  await logoutUser();
}

export async function deleteUserAccount(userId: string): Promise<void> {
  try {
    // Delete Firestore profile first
    await deleteDoc(doc(db, 'users', userId));
    // Delete Firebase Auth account
    const currentUser = auth.currentUser;
    if (currentUser) {
      await deleteUser(currentUser);
    }
  } catch (error: any) {
    throw new Error(`Failed to delete account: ${error.message}`);
  }
}
