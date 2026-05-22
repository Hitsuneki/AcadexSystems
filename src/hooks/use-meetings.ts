import { useEffect, useState } from 'react';

import { listenToProjectMeetings } from '@/services/meeting.service';
import type { Meeting } from '@/types';

export function useMeetings(projectId: string | undefined) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setMeetings([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);
    const unsubscribe = listenToProjectMeetings(projectId, (nextMeetings) => {
      setMeetings(nextMeetings);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  const addMeeting = (meeting: Meeting) => setMeetings((prev) => [meeting, ...prev]);

  return { meetings, loading, error, addMeeting };
}
