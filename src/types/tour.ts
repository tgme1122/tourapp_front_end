export type TourCategory = "sea" | "mountain" | "city" | "culture";

export type Tour = {
  id: string;
  city: string;
  country: string;
  title: string;
  agency: string;
  agencyVerified: boolean;
  agencyRating: number;
  rating: number;
  reviews: number;
  days: number;
  price: number;
  oldPrice?: number;
  seatsLeft?: number;
  category: TourCategory;
  image: string;
  hot?: boolean;
  trending?: boolean;
  agencyId?: string;
};