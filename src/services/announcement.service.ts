/**
 * Announcement service — stub.
 */
import type { Announcement } from '@/types';

export async function postAnnouncement(_projectId: string, _uid: string, _body: string): Promise<Announcement> {
  await new Promise((r) => setTimeout(r, 400));
  return {
    id: `ann-${Date.now()}`,
    projectId: _projectId,
    authorId: _uid,
    body: _body,
    reactions: [],
    createdAt: new Date().toISOString(),
  };
}

export async function toggleReaction(_announcementId: string, _uid: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
}

export async function deleteAnnouncement(_announcementId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
}
