import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "./storage";

type AppState = {
  onboardingDone: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      onboardingDone: false,
      completeOnboarding: () => set({ onboardingDone: true }),
      resetOnboarding: () => set({ onboardingDone: false }),
    }),
    { name: "app-v1", storage: persistStorage }
  )
);