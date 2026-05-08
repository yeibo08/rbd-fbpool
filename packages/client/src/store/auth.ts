import { create } from "zustand";
import type { AuthUser } from "../api/auth.js";

interface AuthStore {
  user: AuthUser | null;
  initialized: boolean;
  setUser: (user: AuthUser | null) => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  initialized: false,
  setUser: (user) => set({ user }),
  setInitialized: () => set({ initialized: true }),
}));
