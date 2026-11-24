export type ItineraryDay = { day: number; title: string; text: string };

export type Departure = {
  id: string;
  startISO: string;
  endISO?: string;
  seatsLeft: number;
  seatsTotal?: number;
};

export type Review = {
  id: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  text: string;
};

export type TourDetails = {
  gallery: string[];
  description: string;
  hotel: string;
  meals: string;
  transport: string;
  groupSize: string;
  language: string;
  included: string[];
  excluded: string[];
  itinerary: ItineraryDay[];
  departures: Departure[];
  reviews: Review[];
};