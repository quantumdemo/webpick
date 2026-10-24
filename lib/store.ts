import { create } from "zustand";

interface UserState {
  user: { email: string; name: string } | null;
  importsRemaining: number;
  setUser: (user: { email: string; name: string } | null) => void;
  decrementImports: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: { email: "demo@webpicks.dev", name: "Demo User" },
  importsRemaining: 3,
  setUser: (user) => set({ user }),
  decrementImports: () =>
    set((state) => ({
      importsRemaining: Math.max(0, state.importsRemaining - 1),
    })),
}));
