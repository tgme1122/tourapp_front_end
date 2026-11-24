export type UserRole = "traveler" | "agency" | "admin";

export type AdminUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: UserRole;
  is_email_verified: boolean;
  is_active: boolean;
  agency_id: string | null;
  agency_name: string;
  agency_status: string;
  created_at: string;
};

export type UserCounts = {
  total: number;
  travelers: number;
  agencies: number;
  admins: number;
  active: number;
  blocked: number;
};

export type UserTourItem = { id: string; title: string; city: string; price: number; status: string };

export type AdminUserDetail = {
  user: AdminUser;
  bookings: {
    id: string; tour_id: string; tour_title: string; guests: number;
    status: string; total_price: number; created_at: string;
  }[];
  reviews: { id: string; tour_title: string; rating: number; text: string; created_at: string }[];
  saved_tours: UserTourItem[];
  tours: UserTourItem[];
};

export type TourStatus = "draft" | "published" | "archived";
export type TourSort = "newest" | "bookings" | "rating" | "price";

export type TourCounts = { total: number; draft: number; published: number; archived: number };

export type AdminTour = {
  id: string;
  image: string | null;
  title: string;
  agency_id: string;
  agency_name: string;
  agency_status: string;
  status: TourStatus;
  price: number;
  rating: number;
  bookings_count: number;
  next_departure: string;
  seats_left: number | null;
  city: string;
  country: string;
  days: number;
};

export type BookingStats = {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  guests: number;
  revenue: number;
};

export type AdminTourDetail = {
  tour: AdminTour;
  description: string;
  gallery: string[];
  itinerary: { day: number; title: string; text: string }[];
  departures: { id: string; date: string; seats_left: number | null }[];
  reviews: { id: string; author: string; rating: number; text: string; date: string }[];
  stats: BookingStats;
};

export type AdminBooking = {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  guests: number;
  status: string;
  total_price: number;
  departure: string;
  created_at: string;
};
