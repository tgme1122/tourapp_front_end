import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "./storage";
import type { AgencyRole } from "@/types/agency";

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: "traveler" | "agency" | "admin";
  photoUri: string | null;
  agencyRole: AgencyRole | null;
};

type UserState = {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  update: (patch: Partial<UserProfile>) => void;
  reset: () => void;
};

const emptyUser: UserProfile = {
  id: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  role: "traveler",
  photoUri: null,
  agencyRole: null,
};

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      user: emptyUser,
      setUser: (user) => set({ user }),
      update: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),
      reset: () => set({ user: emptyUser }),
    }),
    { name: "user-v1", storage: persistStorage }
  )
);

export const fullName = (u: UserProfile) => `${u.firstName} ${u.lastName}`.trim();

export const initialsOf = (u: UserProfile) =>
  `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase() || "?";