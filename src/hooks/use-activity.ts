/**
 * useActivity — recent activity feed for a project.
 */
import { useState, useEffect } from 'react';
import type { Activity } from '@/types';

export function useActivity(_projectId: string | undefined, _limit = 20) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_projectId) { setLoading(false); return; }
    // TODO: fetch limited activity feed from backend
    const timer = setTimeout(() => { setActivities([]); setLoading(false); }, 300);
    return () => clearTimeout(timer);
  }, [_projectId, _limit]);

  return { activities, loading };
}
