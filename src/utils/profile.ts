import type { UserProfile } from '@/types';

/** Profile is complete when required fields are saved on the user document. */
export function isProfileComplete(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  return Boolean(profile.fullName?.trim() && profile.course?.trim());
}
