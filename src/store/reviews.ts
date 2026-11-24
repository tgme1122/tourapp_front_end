import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "./storage";
import { formatDate } from "@/utils/format";

export type MyReview = {
  id: string;
  bookingId: string;
  tourId: string;
  tourTitle: string;
  city: string;
  image: string;
  rating: number;
  text: string;
  date: string;
};

type ReviewsState = {
  items: MyReview[];
  add: (review: Omit<MyReview, "id" | "date">) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useReviews = create<ReviewsState>()(
  persist(
    (set) => ({
      items: [],
      // Bitta bron uchun bitta sharh: qayta yozilsa, eskisi almashadi
      add: (review) =>
        set((s) => ({
          items: [
            { ...review, id: `r${Date.now()}`, date: formatDate(new Date()) },
            ...s.items.filter((r) => r.bookingId !== review.bookingId),
          ],
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((r) => r.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "reviews-v1", storage: persistStorage }
  )
);