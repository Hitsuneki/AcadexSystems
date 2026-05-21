/**
 * useMeetings — meeting list for a project.
 */
import { useState, useEffect } from 'react';
import type { Meeting } from '@/types';

export function useMeetings(_projectId: string | undefined) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_projectId) { setLoading(false); return; }
    const timer = setTimeout(() => { setMeetings([]); setLoading(false); }, 300);
    return () => clearTimeout(timer);
  }, [_projectId]);

  const addMeeting = (meeting: Meeting) => setMeetings((prev) => [meeting, ...prev]);

  return { meetings, loading, addMeeting };
}
