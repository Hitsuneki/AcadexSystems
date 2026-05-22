import { useEffect, useState } from 'react';

import { listenToAnnouncements } from '@/services/announcement.service';
import type { Announcement } from '@/types';

export function useAnnouncements(projectId: string | undefined) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setAnnouncements([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);
    const unsubscribe = listenToAnnouncements(projectId, (nextAnnouncements) => {
      setAnnouncements(nextAnnouncements);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  const addAnnouncement = (announcement: Announcement) => setAnnouncements((prev) => [announcement, ...prev]);
  const removeAnnouncement = (id: string) => setAnnouncements((prev) => prev.filter((announcement) => announcement.id !== id));
  const toggleReactionLocal = (id: string, userId: string) => {
    setAnnouncements((prev) =>
      prev.map((announcement) => {
        if (announcement.id !== id) return announcement;
        const existing = announcement.reactions.some((reaction) => reaction.userId === userId);
        return {
          ...announcement,
          reactions: existing
            ? announcement.reactions.filter((reaction) => reaction.userId !== userId)
            : [...announcement.reactions, { userId, type: 'thumbsUp' as const }],
        };
      }),
    );
  };

  return { announcements, loading, error, addAnnouncement, removeAnnouncement, toggleReactionLocal };
}
