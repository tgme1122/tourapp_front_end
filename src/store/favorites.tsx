import { create } from "zustand";
import { queryClient } from "@/services/queryClient";
import { isApiError } from "@/services/api";
import { saveTour, savedKey, unsaveTour } from "@/services/tours";
import { notify } from "@/utils/confirm";

type FavoritesState = {
  ids: string[];
  setIds: (ids: string[]) => void;
  toggle: (id: string) => void;
};

export const useFavorites = create<FavoritesState>((set, get) => ({
  ids: [],
  setIds: (ids) => set({ ids }),

  toggle: (id) => {
    const had = get().ids.includes(id);
    set({ ids: had ? get().ids.filter((x) => x !== id) : [...get().ids, id] });

    (had ? unsaveTour(id) : saveTour(id))
      .then(() => queryClient.invalidateQueries({ queryKey: savedKey }))
      .catch((e) => {
        // Xato bo'lsa, oldingi holatga qaytaramiz
        set({ ids: had ? [...get().ids, id] : get().ids.filter((x) => x !== id) });
        notify("Saqlab bo'lmadi", isApiError(e) ? e.message : "Qayta urinib ko'ring.");
      });
  },
}));