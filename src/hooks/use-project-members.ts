/**
 * useProjectMembers — fetches member profiles for a list of member IDs.
 */
import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';

export function useProjectMembers(_memberIds: string[] | undefined) {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_memberIds || _memberIds.length === 0) { setLoading(false); return; }
    // TODO: batch-fetch user profiles from backend
    const timer = setTimeout(() => { setMembers([]); setLoading(false); }, 300);
    return () => clearTimeout(timer);
  }, [JSON.stringify(_memberIds)]);

  return { members, loading };
}
