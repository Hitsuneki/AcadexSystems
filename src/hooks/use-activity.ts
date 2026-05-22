import { useEffect, useState } from 'react';

import { listenToProjectActivity } from '@/services/activity.service';
import type { Activity } from '@/types';

export function useActivity(projectId: string | undefined, limit = 20) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setActivities([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);
    const unsubscribe = listenToProjectActivity(projectId, limit, (nextActivities) => {
      setActivities(nextActivities);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId, limit]);

  return { activities, loading, error };
}
