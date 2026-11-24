import { api } from "./api";
import { asList, logShape, num, pickImage, str } from "./mappers";
import { Booking, BookingStatus } from "@/types/booking";
import { formatDateRange } from "@/utils/format";

const STATUSES: BookingStatus[] = [
  "pending_payment", "confirmed", "completed", "cancelled", "expired", "refunded",
];

const toStatus = (v: unknown): BookingStatus => {
  const s = str(v).toLowerCase();
  if (s === "confirmed" || s === "completed" || s === "expired" || s === "refunded") return s;
  if (s.startsWith("cancel")) return "cancelled";
  return "pending_payment"; // pending_payment, draft va eski "pending"
};

export const toBooking = (raw: any): Booking => {
  const tour = raw.tour ?? {};
  const departure = raw.departure ?? {};
  const agencyRaw = tour.agency ?? raw.agency ?? {};
  const agency = typeof agencyRaw === "string" ? { name: agencyRaw } : agencyRaw;

  const start = str(departure.start_date ?? raw.departure_date ?? raw.start_date).slice(0, 10);
  const end = str(departure.end_date ?? raw.end_date).slice(0, 10);
  // Backend start_date/end_date beradi: kunlar sonini shundan hisoblaymiz
  const span =
    start && end ? Math.round((Date.parse(`${end}T00:00:00`) - Date.parse(`${start}T00:00:00`)) / 86400000) + 1 : NaN;
  const days = Number.isFinite(span) && span > 0 ? span : num(tour.days ?? raw.days, 1);
  const dates = /^\d{4}-\d{2}-\d{2}$/.test(start)
    ? `${formatDateRange(start, days)} ${start.slice(0, 4)}`
    : "";

  const id = str(raw.id);
  return {
    id,
    code: str(raw.code ?? raw.booking_code, id.slice(0, 8).toUpperCase()),
    tourId: str(raw.tour_id ?? tour.id),
    title: str(tour.title ?? raw.tour_title ?? raw.title, "Tur"),
    city: str(tour.city ?? raw.tour_city ?? raw.city),
    country: str(tour.country ?? raw.tour_country ?? raw.country),
    agency: str(agency.name ?? raw.agency_name ?? tour.agency_name),
    image: pickImage(tour) ?? pickImage(raw) ?? "",
    dates,
    guests: num(raw.guests, 1),
    total: num(raw.total ?? raw.total_price),
    status: toStatus(raw.status),
    holdExpiresAt: str(raw.hold_expires_at) || null,
  };
};

export const listBookings = async (): Promise<Booking[]> => {
  const list = asList(await api("/bookings"));
  logShape("BRON", list[0]);
  return list.map(toBooking);
};

export const cancelBooking = (id: string) =>
  api(`/bookings/${id}/cancel`, { method: "POST" });


export const getBooking = async (id: string): Promise<Booking> => {
  const raw: any = await api(`/bookings/${id}`);
  return toBooking(raw?.booking ?? raw);
};
