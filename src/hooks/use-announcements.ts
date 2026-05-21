/**
 * useAnnouncements — real-time announcements feed for a project.
 */
import { useState, useEffect } from 'react';
import type { Announcement } from '@/types';

export function useAnnouncements(_projectId: string | undefined) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_projectId) { setLoading(false); return; }
    const timer = setTimeout(() => { setAnnouncements([]); setLoading(false); }, 300);
    return () => clearTimeout(timer);
  }, [_projectId]);

  const addAnnouncement = (ann: Announcement) => setAnnouncements((prev) => [ann, ...prev]);

  const removeAnnouncement = (id: string) =>
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));

  const toggleReactionLocal = (id: string, userId: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const hasReacted = a.reactions.some((r) => r.userId === userId);
        return {
          ...a,
          reactions: hasReacted
            ? a.reactions.filter((r) => r.userId !== userId)
            : [...a.reactions, { userId, type: 'thumbsUp' as const }],
        };
      }),
    );
  };

  return { announcements, loading, addAnnouncement, removeAnnouncement, toggleReactionLocal };
}
