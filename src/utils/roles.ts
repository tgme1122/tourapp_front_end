import type { Href } from "expo-router";

export type Role = "traveler" | "agency" | "admin";

// Har bir rolning bosh sahifasi.
// Haqiqiy URL: /agency va /admin (typed routes ularni "/x/index" deb noto'g'ri chiqaradi).
export const homeFor = (role: Role): Href =>
  (role === "agency" ? "/agency" : role === "admin" ? "/admin" : "/") as Href;
