import { api, apiUrl, mediaUrl } from "./api";
import { asList, num, pickImage, str } from "./mappers";
import { AdminAgency, AgencyDocument, AgencyStatus } from "@/types/agency";
import {
  AdminBooking, AdminTour, AdminTourDetail, AdminUser, AdminUserDetail, BookingStats, TourCounts,
  TourSort, TourStatus, UserCounts, UserRole,
} from "@/types/admin";

export type AgencyCounts = {
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
};

const STATUSES: AgencyStatus[] = ["pending", "approved", "rejected", "suspended"];

export const getAgencyCounts = async (): Promise<AgencyCounts> => {
  const d: any = await api("/admin/agencies/counts");
  return {
    pending: num(d?.pending),
    approved: num(d?.approved),
    rejected: num(d?.rejected),
    suspended: num(d?.suspended),
  };
};

const toDocument = (d: any): AgencyDocument => ({
  id: str(d.id),
  type: str(d.type),
  file_url: d.file_url ? apiUrl(str(d.file_url)) : undefined,
  file_name: d.file_name ? str(d.file_name) : undefined,
  is_checked: Boolean(d.is_checked),
  created_at: d.created_at ? str(d.created_at) : undefined,
});

export const toAdminAgency = (raw: any): AdminAgency => ({
  id: str(raw.id),
  name: str(raw.name),
  status: STATUSES.includes(raw.status) ? raw.status : "pending",
  verified: Boolean(raw.verified),
  rejection_reason: raw.rejection_reason ?? null,
  logo_url: mediaUrl(raw.logo_url ?? null),
  license_number: str(raw.license_number),
  tax_id: str(raw.tax_id),
  region: str(raw.region),
  city: str(raw.city),
  address: str(raw.address),
  contact_phone: str(raw.contact_phone),
  website: raw.website ?? null,
  description: raw.description ?? null,
  owner_name: str(raw.owner_name),
  owner_email: str(raw.owner_email),
  owner_phone: str(raw.owner_phone),
  email_verified: Boolean(raw.email_verified),
  created_at: str(raw.created_at),
  reviewed_at: raw.reviewed_at ?? null,
  documents: asList(raw.documents).map(toDocument),
});

export const listAgencies = async (params: {
  status?: AgencyStatus;
  q?: string;
  limit: number;
  offset: number;
}): Promise<AdminAgency[]> => {
  const data = await api("/admin/agencies", { query: params });
  return asList(data).map(toAdminAgency);
};

export const getAgency = async (id: string): Promise<AdminAgency> => {
  const raw: any = await api(`/admin/agencies/${id}`);
  return toAdminAgency(raw?.agency ?? raw);
};

export const approveAgency = (id: string) =>
  api(`/admin/agencies/${id}/approve`, { method: "POST" });

export const rejectAgency = (id: string, reason: string) =>
  api(`/admin/agencies/${id}/reject`, { method: "POST", body: { reason } });

export const suspendAgency = (id: string, reason: string) =>
  api(`/admin/agencies/${id}/suspend`, { method: "POST", body: { reason } });

export const checkDocument = (agencyId: string, documentId: string, isChecked: boolean) =>
  api(`/admin/agencies/${agencyId}/documents/${documentId}`, {
    method: "PATCH",
    body: { is_checked: isChecked },
  });

// ---------------------------------------------------------------- foydalanuvchilar
const ROLES: UserRole[] = ["traveler", "agency", "admin"];

export const toAdminUser = (raw: any): AdminUser => ({
  id: str(raw.id),
  first_name: str(raw.first_name),
  last_name: str(raw.last_name),
  email: str(raw.email),
  phone: str(raw.phone),
  role: ROLES.includes(raw.role) ? raw.role : "traveler",
  is_email_verified: Boolean(raw.is_email_verified ?? raw.email_verified),
  is_active: raw.is_active === undefined ? true : Boolean(raw.is_active),
  agency_id: raw.agency_id ? str(raw.agency_id) : null,
  agency_name: str(raw.agency_name),
  agency_status: str(raw.agency_status),
  created_at: str(raw.created_at),
});

export const listUsers = async (params: {
  role?: UserRole;
  isActive?: boolean;
  q?: string;
  limit: number;
  offset: number;
}): Promise<AdminUser[]> => {
  const data = await api("/admin/users", { query: params });
  return asList(data).map(toAdminUser);
};


// ---------------------------------------------------------------- turlar
const TOUR_STATUSES: TourStatus[] = ["draft", "published", "archived"];

export const getTourCounts = async (): Promise<TourCounts> => {
  const d: any = await api("/admin/tours/counts");
  return {
    total: num(d?.total),
    draft: num(d?.draft),
    published: num(d?.published),
    archived: num(d?.archived),
  };
};

export const toAdminTour = (raw: any): AdminTour => {
  const agency = raw.agency ?? {};
  const next = raw.next_departure;
  const seats = raw.seats_left ?? raw.available_seats ?? (next && typeof next === "object" ? next.seats_left : null);
  const nextDate = next && typeof next === "object" ? next.start_date ?? next.date : next;
  return {
    id: str(raw.id),
    image: pickImage(raw),
    title: str(raw.title),
    agency_id: str(agency.id ?? raw.agency_id),
    agency_name: str(agency.name ?? raw.agency_name),
    agency_status: str(agency.status ?? raw.agency_status),
    status: TOUR_STATUSES.includes(raw.status) ? raw.status : "draft",
    price: num(raw.price),
    rating: num(raw.rating ?? raw.avg_rating),
    bookings_count: num(raw.bookings_count ?? raw.booking_count ?? raw.bookings),
    next_departure: str(nextDate).slice(0, 10),
    seats_left: seats == null ? null : num(seats),
    city: str(raw.city),
    country: str(raw.country),
    days: num(raw.days),
  };
};

export const listAdminTours = async (params: {
  status?: TourStatus;
  sort?: TourSort;
  q?: string;
  agencyId?: string;
  limit: number;
  offset: number;
}): Promise<AdminTour[]> => {
  const data = await api("/admin/tours", { query: params });
  return asList(data).map(toAdminTour);
};

const toStats = (s: any): BookingStats => ({
  pending: num(s?.pending),
  confirmed: num(s?.confirmed),
  completed: num(s?.completed),
  cancelled: num(s?.cancelled),
  guests: num(s?.guests),
  revenue: num(s?.revenue),
});

export const getAdminTour = async (id: string): Promise<AdminTourDetail> => {
  const raw: any = await api(`/admin/tours/${id}`);
  const base = raw?.tour ?? raw;
  const d = raw?.details ?? base?.details ?? base;
  const gallery = asList(d?.images ?? d?.gallery)
    .map((i: any) => mediaUrl(typeof i === "string" ? i : i?.url ?? i?.image_url ?? i?.path))
    .filter((u): u is string => !!u);

  return {
    tour: toAdminTour(base),
    description: str(d?.description ?? base?.description),
    gallery: gallery.length ? gallery : [pickImage(base)].filter((u): u is string => !!u),
    itinerary: asList(d?.itinerary).map((x: any) => ({
      day: num(x.day),
      title: str(x.title),
      text: str(x.text ?? x.description),
    })),
    departures: asList(d?.departures).map((x: any) => ({
      id: str(x.id),
      date: str(x.start_iso ?? x.start_date ?? x.date).slice(0, 10),
      seats_left: x.seats_left == null ? null : num(x.seats_left),
    })),
    reviews: asList(d?.reviews).map((r: any) => {
      const u = r.user ?? {};
      return {
        id: str(r.id),
        author:
          `${str(u.first_name)} ${str(u.last_name)}`.trim() || str(r.author ?? u.name, "Foydalanuvchi"),
        rating: num(r.rating),
        text: str(r.text),
        date: str(r.date ?? r.created_at).slice(0, 10),
      };
    }),
    stats: toStats(raw?.booking_stats ?? base?.booking_stats),
  };
};

export const listTourBookings = async (id: string): Promise<AdminBooking[]> => {
  const data = await api(`/admin/tours/${id}/bookings`);
  return asList(data).map((b: any): AdminBooking => {
    const u = b.user ?? b.customer ?? {};
    return {
      id: str(b.id),
      customer_name:
        `${str(u.first_name)} ${str(u.last_name)}`.trim() ||
        str(b.customer_name ?? u.full_name ?? u.name),
      phone: str(u.phone ?? b.phone ?? b.customer_phone),
      email: str(u.email ?? b.email ?? b.customer_email),
      guests: num(b.guests ?? b.guests_count),
      status: str(b.status),
      total_price: num(b.total_price ?? b.total ?? b.amount),
      departure: str(b.departure?.start_date ?? b.start_date ?? b.departure_date).slice(0, 10),
      created_at: str(b.created_at),
    };
  });
};

export const sendPromo = async (input: { title: string; text: string; tourId?: string }) => {
  const d: any = await api("/admin/promo", {
    method: "POST",
    body: { title: input.title, text: input.text, tour_id: input.tourId ?? null },
  });
  return { sent: num(d?.sent) };
};

export const getUserCounts = async (): Promise<UserCounts> => {
  const d: any = await api("/admin/users/counts");
  return {
    total: num(d?.total),
    travelers: num(d?.travelers),
    agencies: num(d?.agencies),
    admins: num(d?.admins),
    active: num(d?.active),
    blocked: num(d?.blocked),
  };
};

export const getAdminUser = async (id: string): Promise<AdminUserDetail> => {
  const raw: any = await api(`/admin/users/${id}`);
  const base = raw?.user ?? raw;
  const tourItem = (t: any) => {
    const x = t.tour ?? t;
    return {
      id: str(x.id),
      title: str(x.title),
      city: str(x.city),
      price: num(x.price),
      status: str(x.status),
    };
  };
  return {
    user: toAdminUser(base),
    bookings: asList(raw?.bookings ?? base?.bookings).map((b: any) => {
      const t = b.tour ?? {};
      return {
        id: str(b.id),
        tour_id: str(t.id ?? b.tour_id),
        tour_title: str(t.title ?? b.tour_title),
        guests: num(b.guests ?? b.guests_count),
        status: str(b.status),
        total_price: num(b.total_price ?? b.total),
        created_at: str(b.created_at).slice(0, 10),
      };
    }),
    reviews: asList(raw?.reviews ?? base?.reviews).map((r: any) => ({
      id: str(r.id),
      tour_title: str(r.tour?.title ?? r.tour_title),
      rating: num(r.rating),
      text: str(r.text),
      created_at: str(r.created_at).slice(0, 10),
    })),
    saved_tours: asList(raw?.saved_tours ?? base?.saved_tours).map(tourItem),
    tours: asList(raw?.tours ?? base?.tours).map(tourItem),
  };
};
