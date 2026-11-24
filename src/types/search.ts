import { TourCategory } from "./tour";

export type SortKey = "cheap" | "popular" | "rating";
export type PriceRangeKey = "lt1" | "1to5" | "5to10" | "gt10";
export type DurationKey = "short" | "mid" | "long";

export type SearchFilters = {
  categories: TourCategory[];
  country: string | null;
  priceRange: PriceRangeKey | null;
  duration: DurationKey | null;
  minRating: number | null;
  hotOnly: boolean;
};