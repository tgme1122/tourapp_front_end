import { api, mediaUrl } from "./api";
import { asList, initialsFrom, logShape, num, pickImage, str } from "./mappers";
import { SearchFilters, SortKey } from "@/types/search";
import { Tour, TourCategory } from "@/types/tour";
import { Departure, ItineraryDay, Review, TourDetails } from "@/types/tourDetails";
import { formatDate, parseServerDate } from "@/utils/format";

export const toursKey = ["tours", "all"] as const;
export const countriesKey = ["tours", "countries"] as const;
export const savedKey = ["tours", "saved"] as const;
export const tourKey = (id: string) => ["tours", "detail", id] as const;

const pad = (n: number) => String(n).padStart(2, "0");
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const round1 = (n: number) => Math.round(n * 10) / 10;

const CATEGORIES: TourCategory[] = ["sea", "mountain", "city", "culture"];
const toCategory = (v: unknown): TourCategory => {
  const s = str(v).toLowerCase() as TourCategory;
  return CATEGORIES.includes(s) ? s : "city";
};

// Faqat kelajakdagi jo'nashlar
const toDepartures = (raw: any): Departure[] =>
  asList(raw?.departures)
    .map((d) => ({
      id: str(d.id),
      startISO: str(d.start_iso ?? d.start_date ?? d.date).slice(0, 10),
      endISO: str(d.end_iso ?? d.end_date).slice(0, 10) || undefined,
      seatsLeft: num(d.seats_left ?? d.seats_available),
      seatsTotal: d.seats_total != null ? num(d.seats_total) : undefined,
    }))
    .filter((d) => d.id && d.startISO >= todayISO())
    .sort((a, b) => a.startISO.localeCompare(b.startISO));

// ---------------------------------------------------------------- tur kartasi
export const toTour = (raw: any): Tour => {
  // Backend kartada `agency` — nom (string), qolgan maydonlar alohida
  const agency = raw.agency && typeof raw.agency === "object" ? raw.agency : {};
  const agencyName = typeof raw.agency === "string" ? raw.agency : agency.name ?? raw.agency_name;
  const open = toDepartures(raw).find((d) => d.seatsLeft > 0);
  const reviewList: any[] = Array.isArray(raw.reviews) ? raw.reviews : [];

  const given = num(raw.rating ?? raw.avg_rating ?? raw.average_rating);
  const average = reviewList.length
    ? reviewList.reduce((sum, r) => sum + num(r.rating), 0) / reviewList.length
    : 0;

  return {
    id: str(raw.id),
    agencyId: str(agency.id ?? raw.agency_id) || undefined,
    city: str(raw.city),
    country: str(raw.country),
    title: str(raw.title),
    agency: str(agencyName),
    agencyVerified: Boolean(
      raw.agency_verified ??
        agency.verified ??
        agency.is_verified ??
        (agency.status ? agency.status === "approved" : true)
    ),
    agencyRating: round1(num(agency.rating ?? raw.agency_rating)),
    rating: round1(given || average),
    // Backend kartada `reviews` — son; tafsilotda ro'yxat bo'lishi mumkin
    reviews: num(
      raw.reviews_count ?? raw.review_count ?? (Array.isArray(raw.reviews) ? reviewList.length : raw.reviews)
    ),
    days: num(raw.days, 1),
    price: num(raw.price),
    oldPrice: raw.old_price != null ? num(raw.old_price) : undefined,
    seatsLeft: raw.seats_left != null ? num(raw.seats_left) : open?.seatsLeft,
    category: toCategory(raw.category),
    image: pickImage(raw) ?? "",
    hot: Boolean(raw.hot),
    trending: Boolean(raw.trending),
  };
};

// ---------------------------------------------------------------- tur tafsiloti
const toStrings = (v: unknown): string[] =>
  Array.isArray(v)
    ? v
        .map((x) => (x && typeof x === "object" ? str((x as any).text ?? (x as any).title) : str(x)))
        .filter(Boolean)
    : [];

const toGallery = (raw: any, fallback?: string): string[] => {
  const source = Array.isArray(raw.images) ? raw.images : Array.isArray(raw.gallery) ? raw.gallery : [];
  const imgs: any[] = [...source];
  imgs.sort((a, b) => num(a?.position) - num(b?.position));
  const urls = imgs
    .map((i) => (typeof i === "string" ? i : i?.url ?? i?.image_url ?? i?.path))
    .map((p) => mediaUrl(p))
    .filter((u): u is string => !!u);
  if (urls.length === 0) {
    const one = pickImage(raw) ?? (fallback || null);
    if (one) urls.push(one);
  }
  return urls;
};

const toReview = (r: any): Review => {
  const u = r.user ?? {};
  const name =
    `${str(u.first_name)} ${str(u.last_name)}`.trim() ||
    str(r.author ?? u.full_name ?? u.name, "Foydalanuvchi");
  // Backend `date` ni "2026-10-12" ko'rinishida beradi (created_at bo'lsa — to'liq vaqt)
  const rawDate = str(r.date ?? r.created_at);
  const d = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? new Date(`${rawDate}T00:00:00`)
    : parseServerDate(rawDate);
  return {
    id: str(r.id),
    author: name,
    initials: initialsFrom(name),
    rating: num(r.rating),
    date: d && !Number.isNaN(d.getTime()) ? formatDate(d) : "",
    text: str(r.text),
  };
};

const toDetails = (raw: any, fallbackImage?: string): TourDetails => ({
  gallery: toGallery(raw, fallbackImage),
  description: str(raw.description),
  hotel: str(raw.hotel) || "—",
  meals: str(raw.meals) || "—",
  transport: str(raw.transport) || "—",
  groupSize: str(raw.group_size) || "—",
  language: str(raw.language) || "—",
  included: toStrings(raw.included),
  excluded: toStrings(raw.excluded),
  itinerary: asList(raw.itinerary)
    .map((d): ItineraryDay => ({
      day: num(d.day),
      title: str(d.title),
      text: str(d.text ?? d.description),
    }))
    .sort((a, b) => a.day - b.day),
  departures: toDepartures(raw),
  reviews: asList(raw.reviews).map(toReview),
});

// ---------------------------------------------------------------- so'rovlar
export const listTours = async (): Promise<Tour[]> => {
  const list = asList(await api("/tours", { query: { limit: 50 } }));
  logShape("TUR", list[0]);
  return list.map(toTour);
};

export const getTourCountries = async (): Promise<string[]> =>
  asList(await api("/tours/countries")).map((c) => str(c)).filter(Boolean);

export const getTour = async (id: string): Promise<{ tour: Tour; details: TourDetails }> => {
  const raw: any = await api(`/tours/${id}`);
  // Backend: { tour: <karta>, details: <tafsilot>, status }
  const card = raw?.tour ?? raw;
  const detailsRaw = raw?.details ?? raw;
  logShape("TUR TAFSILOTI", raw);
  const tour = toTour(card);
  return { tour, details: toDetails(detailsRaw, tour.image) };
};

export const getSavedTours = async (): Promise<Tour[]> => {
  const list = asList(await api("/tours/saved"));
  return list.map((item) => toTour(item.tour ?? item));
};

export const saveTour = (id: string) => api(`/tours/${id}/save`, { method: "PUT" });
export const unsaveTour = (id: string) => api(`/tours/${id}/save`, { method: "DELETE" });

// Server-side qidiruv va sahifalash (GET /tours)
export async function searchToursPage(params: {
  query: string;
  filters: SearchFilters;
  sort: SortKey;
  limit: number;
  offset: number;
}): Promise<Tour[]> {
  const { query, filters, sort, limit, offset } = params;
  const list = asList(
    await api("/tours", {
      query: {
        q: query.trim() || undefined,
        categories: filters.categories.length ? filters.categories : undefined,
        country: filters.country || undefined,
        priceRange: filters.priceRange || undefined,
        duration: filters.duration || undefined,
        minRating: filters.minRating || undefined,
        hotOnly: filters.hotOnly ? true : undefined,
        sort,
        limit,
        offset,
      },
    })
  );
  return list.map(toTour);
}