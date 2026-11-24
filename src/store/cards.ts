import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "./storage";

export type CardBrand = "humo" | "uzcard" | "visa" | "mastercard" | "unknown";

export type PaymentCard = {
  id: string;
  brand: CardBrand;
  last4: string;
  expiry: string;
  holder: string;
};

type CardsState = {
  cards: PaymentCard[];
  defaultId: string | null;
  add: (card: Omit<PaymentCard, "id">) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
  clear: () => void;
};

export const useCards = create<CardsState>()(
  persist(
    (set) => ({
      cards: [],
      defaultId: null,
      add: (card) =>
        set((s) => {
          const id = `c${Date.now()}`;
          return {
            cards: [...s.cards, { ...card, id }],
            defaultId: s.defaultId ?? id,
          };
        }),
      remove: (id) =>
        set((s) => {
          const cards = s.cards.filter((c) => c.id !== id);
          return {
            cards,
            defaultId: s.defaultId === id ? cards[0]?.id ?? null : s.defaultId,
          };
        }),
      setDefault: (id) => set({ defaultId: id }),
      clear: () => set({ cards: [], defaultId: null }),
    }),
    { name: "cards-v1", storage: persistStorage }
  )
);