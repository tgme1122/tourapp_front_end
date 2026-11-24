export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "expired"
  | "refunded";

export type Booking = {
  id: string;
  code: string;
  tourId: string;
  title: string;
  city: string;
  country: string;
  agency: string;
  image: string;
  dates: string;
  guests: number;
  total: number;
  status: BookingStatus;
  holdExpiresAt?: string | null;
};