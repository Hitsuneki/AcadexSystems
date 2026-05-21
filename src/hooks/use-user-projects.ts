/**
 * useUserProjects — returns projects for a given userId.
 * Backend engineer implements the real subscription here.
 */
import { useState, useEffect } from 'react';
import type { Project } from '@/types';

export function useUserProjects(_userId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_userId) { setLoading(false); return; }
    // TODO: subscribe to user's projects from backend
    const timer = setTimeout(() => {
      setProjects([]);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [_userId]);

  return { projects, loading };
}
