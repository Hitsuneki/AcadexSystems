/**
 * useAuth — reads from auth.store (populated by backend listener).
 * Backend engineer sets up onAuthStateChanged → useAuthStore.setUser/setProfile.
 */
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const { user, profile, loading, setLoading } = useAuthStore();

  // Simulate initial auth check resolving (backend replaces this)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [setLoading]);

  return { user, profile, loading, isAuthenticated: !!user };
}
