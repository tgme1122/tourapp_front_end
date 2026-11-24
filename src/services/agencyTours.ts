import { api, ApiError, mediaUrl } from "./api";
import { asList, logShape, num, str } from "./mappers";
import { toTour } from "./tours";
import { appendFile, PickedFile } from "./upload";
import { Tour, TourCategory } from "@/types/tour";

export type TourStatus = "draft" | "published" | "archived";
export type AgencyTour = Tour & { status: TourStatus; bookingsCount: number };

export type ItineraryItem = { day: number; title: string; text: string };
export type ManagedDeparture = { id: string; startISO: string; seatsTotal: number; seatsLeft: number };
export type ManagedImage = { id: string; url: string };
export type NewDeparture = { startISO: string; seatsTotal: number };

// Boshqaruv ekrani uchun to'liq tur
export type ManagedTour = AgencyTour & {
  description: string;
  hotel: string;
  meals: string;
  transport: string;
  groupSize: string;
  language: string;
  included: string[];
  excluded: string[];
  itinerary: ItineraryItem[];
  images: ManagedImage[];
  departures: ManagedDeparture[];
};

// Forma yuboradigan ma'lumot
export type TourInput = {
  title: string;
  description: string;
  city: string;
  country: string;
  category: TourCategory;
  days: number;
  price: number;
  oldPrice: number | null;
  hotel: string;
  meals: string;
  transport: string;
  groupSize: string;
  language: string;
  included: string[];
  excluded: string[];
  hot: boolean;
  itinerary: ItineraryItem[];
};

// ---------------------------------------------------------------- mapperlar
const toStatus = (v: unknown): TourStatus => {
  const s = str(v);
  return s === "published" || s === "archived" ? s : "draft";
};

const toStrings = (v: unknown): string[] =>
  Array.isArray(v)
    ? v
        .map((x) => (x && typeof x === "object" ? str((x as any).text ?? (x as any).title) : str(x)))
        .filter(Boolean)
    : [];

export const toManagedTour = (raw: any): ManagedTour => {
  const images: ManagedImage[] = (Array.isArray(raw.images) ? [...raw.images] : [])
    .sort((a, b) => num(a?.position) - num(b?.position))
    .map((i) => ({
      id: str(i?.id),
      url: mediaUrl(typeof i === "string" ? i : i?.url ?? i?.image_url ?? i?.path) ?? "",
    }))
    .filter((i) => i.url);

  return {
    ...toTour(raw),
    status: toStatus(raw.status),
    bookingsCount: num(raw.bookings_count),
    description: str(raw.description),
    hotel: str(raw.hotel),
    meals: str(raw.meals),
    transport: str(raw.transport),
    groupSize: str(raw.group_size),
    language: str(raw.language),
    included: toStrings(raw.included),
    excluded: toStrings(raw.excluded),
    itinerary: asList(raw.itinerary)
      .map((d) => ({ day: num(d.day), title: str(d.title), text: str(d.text ?? d.description) }))
      .sort((a, b) => a.day - b.day),
    images,
    departures: asList(raw.departures)
      .map((d) => ({
        id: str(d.id),
        startISO: str(d.start_iso ?? d.start_date ?? d.date).slice(0, 10),
        seatsTotal: num(d.seats_total),
        seatsLeft: num(d.seats_left ?? d.seats_available),
      }))
      .filter((d) => d.id)
      .sort((a, b) => a.startISO.localeCompare(b.startISO)),
  };
};

export const toTourInput = (t: ManagedTour): TourInput => ({
  title: t.title,
  description: t.description,
  city: t.city,
  country: t.country,
  category: t.category,
  days: t.days,
  price: t.price,
  oldPrice: t.oldPrice ?? null,
  hotel: t.hotel,
  meals: t.meals,
  transport: t.transport,
  groupSize: t.groupSize,
  language: t.language,
  included: t.included,
  excluded: t.excluded,
  hot: !!t.hot,
  itinerary: t.itinerary,
});

// ---------------------------------------------------------------- so'rovlar
export const listMyTours = async (): Promise<ManagedTour[]> => {
  const list = asList(await api("/tours/mine"));
  logShape("MENING TURIM", list[0]);
  return list.map(toManagedTour);
};

// Ro'yxatda rasm/jo'nash to'liq kelmasa, tur tafsilotidan to'ldiramiz
export const getManagedTour = async (id: string): Promise<ManagedTour> => {
  const mine = asList(await api("/tours/mine")).find((r) => str(r.id) === id);
  let raw: any = mine;

  if (!mine || !Array.isArray(mine.departures) || !Array.isArray(mine.images)) {
    try {
      const detail: any = await api(`/tours/${id}`);
      const details = detail?.details ?? {};
      const card = detail?.tour ?? detail;
      raw = {
        ...mine,
        ...details,
        ...card,
        status: detail?.status ?? mine?.status,
      };
    } catch (e) {
      if (!mine) throw e;
    }
  }
  if (!raw) throw new ApiError(404, "Tur topilmadi.");
  return toManagedTour(raw);
};

const tourBody = (i: TourInput) => ({
  title: i.title.trim(),
  description: i.description.trim(),
  city: i.city.trim(),
  country: i.country.trim(),
  category: i.category,
  days: i.days,
  price: i.price,
  old_price: i.oldPrice,
  hotel: i.hotel.trim() || null,
  meals: i.meals.trim() || null,
  transport: i.transport.trim() || null,
  group_size: i.groupSize.trim() || null,
  language: i.language.trim() || null,
  included: i.included,
  excluded: i.excluded,
  hot: i.hot,
  itinerary: i.itinerary.map((d) => ({ day: d.day, title: d.title.trim(), text: d.text.trim() })),
});

// Tur qoralama holatda yaratiladi
export const createTour = async (input: TourInput, departures: NewDeparture[]) => {
  const raw: any = await api("/tours", {
    method: "POST",
    body: {
      ...tourBody(input),
      departures: departures.map((d) => ({ start_date: d.startISO, seats_total: d.seatsTotal })),
    },
  });
  return str((raw?.tour ?? raw)?.id);
};

export const updateTour = (id: string, input: TourInput) =>
  api(`/tours/${id}`, { method: "PATCH", body: tourBody(input) });

export const setTourStatus = (id: string, status: TourStatus) =>
  api(`/tours/${id}`, { method: "PATCH", body: { status } });

export const archiveTour = (id: string) => api(`/tours/${id}`, { method: "DELETE" });

export const addDeparture = (id: string, d: NewDeparture) =>
  api(`/tours/${id}/departures`, {
    method: "POST",
    body: { start_date: d.startISO, seats_total: d.seatsTotal },
  });

export const deleteDeparture = (id: string, departureId: string) =>
  api(`/tours/${id}/departures/${departureId}`, { method: "DELETE" });

export const uploadTourImages = async (id: string, files: PickedFile[]) => {
  const form = new FormData();
  for (const f of files) await appendFile(form, "files", f);
  return api(`/tours/${id}/images`, { method: "POST", form });
};

export const deleteTourImage = (id: string, imageId: string) =>
  api(`/tours/${id}/images/${imageId}`, { method: "DELETE" });

// ---------------------------------------------------------------- qo'shimcha xizmatlar va bekor qilish
export type TourAddon = {
  id: string;
  name: string;
  description: string;
  price: number;
  perPerson: boolean;
  isActive: boolean;
};

export type AddonInput = {
  name: string;
  description?: string;
  price: number;
  perPerson: boolean;
  isActive?: boolean;
};

export type PolicyRule = {
  daysBefore: number;
  refundPercent: number;
};

export type TourPolicy = {
  rules: PolicyRule[];
  isDefault: boolean;
};

const toAddon = (r: any): TourAddon => ({
  id: str(r?.id),
  name: str(r?.name),
  description: str(r?.description),
  price: num(r?.price),
  perPerson: r?.per_person !== false,
  isActive: r?.is_active !== false,
});

export const listTourAddons = async (tourId: string): Promise<TourAddon[]> =>
  asList(await api(`/tours/${tourId}/addons`)).map(toAddon);

export const createTourAddon = async (tourId: string, input: AddonInput): Promise<TourAddon> =>
  toAddon(
    await api(`/tours/${tourId}/addons`, {
      method: "POST",
      body: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        price: input.price,
        per_person: input.perPerson,
        is_active: input.isActive ?? true,
      },
    })
  );

export const updateTourAddon = async (
  tourId: string,
  addonId: string,
  patch: Partial<AddonInput>
): Promise<TourAddon> =>
  toAddon(
    await api(`/tours/${tourId}/addons/${addonId}`, {
      method: "PATCH",
      body: {
        ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
        ...(patch.description !== undefined
          ? { description: patch.description.trim() || null }
          : {}),
        ...(patch.price !== undefined ? { price: patch.price } : {}),
        ...(patch.perPerson !== undefined ? { per_person: patch.perPerson } : {}),
        ...(patch.isActive !== undefined ? { is_active: patch.isActive } : {}),
      },
    })
  );

export const deleteTourAddon = (tourId: string, addonId: string) =>
  api(`/tours/${tourId}/addons/${addonId}`, { method: "DELETE" });

const toPolicy = (raw: any): TourPolicy => ({
  rules: asList(raw?.rules)
    .map((r) => ({ daysBefore: num(r?.days_before), refundPercent: num(r?.refund_percent) }))
    .sort((a, b) => b.daysBefore - a.daysBefore),
  isDefault: Boolean(raw?.is_default),
});

export const getTourPolicy = async (tourId: string): Promise<TourPolicy> =>
  toPolicy(await api(`/tours/${tourId}/cancellation-policy`));

export const setTourPolicy = async (tourId: string, rules: PolicyRule[]): Promise<TourPolicy> =>
  toPolicy(
    await api(`/tours/${tourId}/cancellation-policy`, {
      method: "PUT",
      body: {
        rules: rules.map((r) => ({ days_before: r.daysBefore, refund_percent: r.refundPercent })),
      },
    })
  );