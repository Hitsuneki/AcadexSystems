import { useEffect, useState } from 'react';

import { getUserProfile } from '@/services/auth.service';
import type { UserProfile } from '@/types';

export function useProjectMembers(memberIds: string[] | undefined) {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(Boolean(memberIds?.length));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMembers() {
      if (!memberIds || memberIds.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const profiles = await Promise.all(memberIds.map((id) => getUserProfile(id)));
        if (!cancelled) setMembers(profiles.filter(Boolean) as UserProfile[]);
      } catch (err: any) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMembers();
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(memberIds ?? [])]);

  return { members, loading, error };
}
