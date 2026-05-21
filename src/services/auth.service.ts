/**
 * Auth service — stub (backend implementation lives here).
 * DO NOT import Firebase / Supabase in UI components; use these exports only.
 */
import type { RoleLabel, UserProfile } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface CreateProfilePayload {
  fullName: string;
  course: string;
  roleLabel: RoleLabel;
  bio?: string;
  avatarUri?: string;
}

export async function loginUser(_payload: LoginPayload): Promise<void> {
  // TODO: implement
  await new Promise((r) => setTimeout(r, 800));
}

export async function registerUser(_payload: RegisterPayload): Promise<{ uid: string }> {
  // TODO: implement
  await new Promise((r) => setTimeout(r, 800));
  return { uid: 'stub-uid' };
}

export async function createUserProfile(_uid: string, _payload: CreateProfilePayload): Promise<void> {
  // TODO: implement
  await new Promise((r) => setTimeout(r, 400));
}

export async function updateUserProfile(_uid: string, _payload: Partial<CreateProfilePayload>): Promise<void> {
  // TODO: implement
  await new Promise((r) => setTimeout(r, 400));
}

export async function uploadAvatar(_uid: string, _localUri: string): Promise<string> {
  // TODO: implement — returns remote URL
  await new Promise((r) => setTimeout(r, 600));
  return _localUri;
}

export async function signOutUser(): Promise<void> {
  // TODO: implement
}
