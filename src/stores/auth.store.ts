import { create } from 'zustand';
import type { UserProfile } from '@/types';

interface AuthState {
  user: { uid: string; email: string } | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: { uid: string; email: string } | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  loading: true,
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  clearAuth: () => set({ user: null, profile: null, isAuthenticated: false, loading: false }),
  signOut: () => set({ user: null, profile: null, isAuthenticated: false, loading: false }),
}));
