import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "./storage";

export type Language = "uz" | "ru" | "en";

export const languageLabels: Record<Language, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
};

export type Settings = {
  push: boolean;
  priceDrop: boolean;
  agencyMessages: boolean;
  language: Language;
};

type SettingsState = Settings & { update: (patch: Partial<Settings>) => void };

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      push: true,
      priceDrop: true,
      agencyMessages: true,
      language: "uz",
      update: (patch) => set(patch),
    }),
    { name: "settings-v1", storage: persistStorage }
  )
);