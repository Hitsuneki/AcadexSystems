import { useEffect } from 'react';

import { getUserProfile, onAuthStateChange } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const { user, profile, loading, setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setProfile(null);
          return;
        }

        setUser({ uid: firebaseUser.uid, email: firebaseUser.email ?? '' });
        const userProfile = await getUserProfile(firebaseUser.uid);
        setProfile(userProfile);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [setLoading, setProfile, setUser]);

  return { user, profile, loading, isAuthenticated: Boolean(user) };
}
