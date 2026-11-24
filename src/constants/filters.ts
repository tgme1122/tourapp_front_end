import { Ionicons } from "@expo/vector-icons";
import { DurationKey, PriceRangeKey, SearchFilters } from "@/types/search";
import { TourCategory } from "@/types/tour";

// Yozish tugagach necha millisekunddan keyin qidirilishi (3000 = 3 soniya)
export const SEARCH_DEBOUNCE_MS = 3000;

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export const categoryOptions: { key: TourCategory; label: string; icon: IconName }[] = [
  { key: "sea", label: "Dengiz", icon: "water-outline" },
  { key: "mountain", label: "Tog'lar", icon: "triangle-outline" },
  { key: "city", label: "Shaharlar", icon: "business-outline" },
  { key: "culture", label: "Madaniy", icon: "library-outline" },
];

export const priceRanges: { key: PriceRangeKey; label: string; min: number; max: number }[] = [
  { key: "lt1", label: "1 mln gacha", min: 0, max: 1000000 },
  { key: "1to5", label: "1–5 mln", min: 1000000, max: 5000000 },
  { key: "5to10", label: "5–10 mln", min: 5000000, max: 10000000 },
  { key: "gt10", label: "10 mln+", min: 10000000, max: Infinity },
];

export const durations: { key: DurationKey; label: string; min: number; max: number }[] = [
  { key: "short", label: "1–3 kun", min: 1, max: 3 },
  { key: "mid", label: "4–7 kun", min: 4, max: 7 },
  { key: "long", label: "8+ kun", min: 8, max: Infinity },
];

export const ratingOptions = [4.0, 4.5, 4.7];

export const defaultFilters: SearchFilters = {
  categories: [],
  country: null,
  priceRange: null,
  duration: null,
  minRating: null,
  hotOnly: false
};

export const countActiveFilters = (f: SearchFilters) =>
  f.categories.length +
  (f.country ? 1 : 0) +
  (f.priceRange ? 1 : 0) +
  (f.duration ? 1 : 0) +
  (f.minRating ? 1 : 0) +
  (f.hotOnly ? 1 : 0);