import { create } from 'zustand';
import type { UserProfile } from '@/types';

interface AuthState {
  user: { uid: string; email: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  setUser: (user: { uid: string; email: string } | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  signOut: () => set({ user: null, profile: null }),
}));
