import { api } from "./api";
import { rawPhone } from "./auth";
import { toBooking } from "./bookings";
import { asList, logShape, num, str } from "./mappers";
import { Booking } from "@/types/booking";

// =====================================================================
// TEKSHIRING: Swagger'dagi yo'llar. Boshqacha bo'lsa, FAQAT shu yerni o'zgartiring.
// =====================================================================
const PATHS = {
  options: (tourId: string) => `/tours/${tourId}/booking-options`,
  quote: "/bookings/quote",
  create: "/bookings",
  pay: "/payments",
};

// ---------------------------------------------------------------- turlar
export type RoomOption = { id: string; label: string; price: number; description: string };
export type ExtraOption = { id: string; label: string; price: number; description: string };

export type BookingOptions = {
  maxGuests: number;
  childMaxAge: number;
  rooms: RoomOption[];
  extras: ExtraOption[];
  policy: string;
};

export type QuoteInput = {
  departureId: string;
  adults: number;
  childAges: number[];
  roomId?: string;
  extraIds: string[];
};

export type QuoteLine = { label: string; amount: number };
export type Quote = { lines: QuoteLine[]; total: number };

export type TravelerInput = {
  type: "adult" | "child";
  firstName: string;
  lastName: string;
  passportSeries: string;
  passportNumber: string;
  passportExpiry: string; // 2030-05-20
  birthDate: string; // 1990-01-15
};

export type SubmitInput = QuoteInput & {
  travelers: TravelerInput[];
  contactPhone: string;
  contactEmail: string;
};

export const PAY_PROVIDERS = [
  { id: "click", label: "Click" },
  { id: "payme", label: "Payme" },
];

// ---------------------------------------------------------------- mapperlar
const toOption = (r: any) => ({
  id: str(r.id ?? r.code ?? r.type),
  label: str(r.name ?? r.label ?? r.title ?? r.type),
  price: num(r.price ?? r.price_delta ?? r.surcharge ?? r.amount),
  description: str(r.description),
});

const policyText = (rules: any[]): string =>
  [...rules]
    .sort((a, b) => num(b.days_before) - num(a.days_before))
    .map((r) => `Jo'nashga ${num(r.days_before)}+ kun qolsa: ${num(r.refund_percent)}% qaytariladi`)
    .join("\n");

export const toBookingOptions = (raw: any): BookingOptions => ({
  maxGuests: num(raw.max_guests ?? raw.seats_left ?? raw.available_seats, 10),
  childMaxAge: num(raw.child_max_age ?? raw.max_child_age, 17),
  rooms: asList(raw.rooms ?? raw.room_types).map(toOption).filter((r) => r.id),
  // Backend: addons (faqat faollari ko'rsatiladi)
  extras: asList(raw.extras ?? raw.addons ?? raw.additional_services ?? raw.services)
    .filter((e) => e.is_active !== false)
    .map(toOption)
    .filter((e) => e.id),
  policy:
    Array.isArray(raw.cancellation_policy)
      ? policyText(raw.cancellation_policy)
      : str(raw.cancellation_policy ?? raw.policy ?? raw.cancellation?.text),
});

export const toQuote = (data: any): Quote => {
  const raw = data?.quote ?? data;
  let lines: QuoteLine[] = asList(raw.lines ?? raw.items ?? raw.breakdown)
    .map((l) => ({
      label: str(l.label ?? l.title ?? l.name ?? l.description),
      amount: num(l.amount ?? l.price ?? l.total),
    }))
    .filter((l) => l.label);

  if (lines.length === 0) {
    const guests = num(raw.guests, 1);
    lines = [
      { label: `Baza narxi (${guests} kishi × ${num(raw.unit_price)})`, amount: num(raw.base_total ?? raw.base ?? raw.base_price) },
      ...asList(raw.addons).map((a) => ({ label: str(a.name), amount: num(a.total) })),
    ].filter((l) => l.amount > 0);
  }
  return { lines, total: num(raw.total ?? raw.total_price ?? raw.amount) };
};

// ---------------------------------------------------------------- so'rovlar
export const getBookingOptions = async (tourId: string, departureId: string) => {
  const raw: any = await api(PATHS.options(tourId), { query: { departureId } });
  logShape("BRON PARAMETRLARI", raw);
  return toBookingOptions(raw);
};

// Backend `guests` (kattalar + bolalar) va `addon_ids` kutadi
const quoteBody = (tourId: string, i: QuoteInput) => ({
  tour_id: tourId,
  departure_id: i.departureId,
  guests: i.adults + i.childAges.length,
  addon_ids: i.extraIds,
});

export const getQuote = async (tourId: string, input: QuoteInput) => {
  const raw: any = await api(PATHS.quote, { method: "POST", body: quoteBody(tourId, input) });
  logShape("NARX HISOBI", raw);
  return toQuote(raw);
};

// Idempotency-Key bilan: tarmoq uzilib qayta urinilganda ikki marta bron yaratilmaydi
export const submitBooking = async (
  tourId: string,
  input: SubmitInput,
  idempotencyKey: string
): Promise<Booking> => {
  const raw: any = await api(PATHS.create, {
    method: "POST",
    idempotencyKey,
    body: {
      ...quoteBody(tourId, input),
      travelers: input.travelers.map((t) => ({
        first_name: t.firstName,
        last_name: t.lastName,
        // Backend seriya va raqamni bitta maydonda kutadi (masalan AB1234567)
        passport_number: `${t.passportSeries}${t.passportNumber}`.replace(/\s/g, "").toUpperCase(),
        passport_expiry: t.passportExpiry,
        birth_date: t.birthDate,
      })),
      contact_phone: rawPhone(input.contactPhone) || undefined,
      contact_email: input.contactEmail.trim() || undefined,
      accept_cancellation_policy: true,
    },
  });
  logShape("YARATILGAN BRON", raw?.booking ?? raw);
  return toBooking(raw?.booking ?? raw);
};

// payUrl hozircha null bo'lishi mumkin
export const payBooking = async (bookingId: string, provider: string) => {
  const raw: any = await api(PATHS.pay, {
    method: "POST",
    body: { booking_id: bookingId, provider },
  });
  logShape("TO'LOV", raw);
  return { payUrl: raw?.pay_url ? str(raw.pay_url) : null };
};