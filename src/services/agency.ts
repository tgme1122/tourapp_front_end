import { api } from "@/services/api";
import { rawPhone } from "@/services/auth";
import { appendFile, PickedFile } from "@/services/upload";
import { useAuth } from "@/store/auth";
import type { AgencyDocument, AgencyProfile, DocumentType } from "@/types/agency";

// ---------- Profil (ko'rish: egasi va menejer; o'zgartirish: faqat egasi) ----------
export type AgencyUpdateInput = {
  name?: string;
  description?: string | null;
  license_number?: string;
  tax_id?: string;
  region?: string;
  city?: string;
  address?: string;
  contact_phone?: string | null;
  website?: string | null;
};

export const getMyAgency = () => api<AgencyProfile>("/agency/me");

export const updateMyAgency = (input: AgencyUpdateInput) =>
  api<AgencyProfile>("/agency/me", { method: "PATCH", body: input });

export const uploadAgencyLogo = async (file: PickedFile) => {
  const form = new FormData();
  await appendFile(form, "file", file, "logo.jpg");
  return api<AgencyProfile>("/agency/me/logo", { method: "PUT", form });
};

// ---------- Hujjatlar (egasi) ----------
export const uploadAgencyDocument = async (type: DocumentType, file: PickedFile) => {
  const form = new FormData();
  form.append("type", type);
  await appendFile(form, "file", file, `${type}.jpg`);
  return api<AgencyDocument>("/agency/me/documents", { method: "POST", form });
};

export const deleteAgencyDocument = (id: string) =>
  api<void>(`/agency/me/documents/${id}`, { method: "DELETE" });

export const resubmitAgency = () =>
  api<AgencyProfile>("/agency/me/resubmit", { method: "POST" });

// ---------- Xodimlar (egasi) ----------
export type AgencyMember = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: "owner" | "manager";
  is_active: boolean;
  created_at: string;
};

export type NewMemberInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
};

export type UpdateMemberInput = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  password?: string;
};

export const listMembers = () => api<AgencyMember[]>("/agency/me/members");

export const createManager = (input: NewMemberInput) =>
  api<AgencyMember>("/agency/me/members", {
    method: "POST",
    body: { ...input, phone: rawPhone(input.phone) },
  });

export const updateMember = (userId: string, input: UpdateMemberInput) =>
  api<AgencyMember>(`/agency/me/members/${userId}`, {
    method: "PATCH",
    body: {
      ...input,
      ...(input.phone ? { phone: rawPhone(input.phone) } : {}),
    },
  });

export const deleteMember = (userId: string) =>
  api<void>(`/agency/me/members/${userId}`, { method: "DELETE" });

export const setMemberActive = (userId: string, active: boolean) =>
  api<AgencyMember>(`/agency/me/members/${userId}/${active ? "activate" : "deactivate"}`, {
    method: "POST",
  });

// ---------- Hisobotlar (egasi) ----------
export type ReportRange = { from: string; to: string }; // YYYY-MM-DD

export type AgencyOverview = {
  date_from: string;
  date_to: string;
  tours: { draft: number; published: number; archived: number };
  bookings_total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  guests: number;
  revenue: number;
  avg_booking_value: number;
  cancel_rate: number; // 0..1
  pending_now: number;
  rating: number;
  reviews_count: number;
  upcoming_departures: number;
  seats_total: number;
  seats_left: number;
  occupancy: number; // 0..1
};

export type TimePoint = { period: string; bookings: number; guests: number; revenue: number };

export type TopTour = {
  tour_id: string;
  title: string;
  bookings: number;
  guests: number;
  revenue: number;
};

export const getOverview = (r: ReportRange) =>
  api<AgencyOverview>("/agency/reports/overview", { query: r });

export const getTimeseries = (r: ReportRange, group: "day" | "month") =>
  api<TimePoint[]>("/agency/reports/timeseries", { query: { ...r, group } });

export const getTopTours = (r: ReportRange, limit = 5) =>
  api<TopTour[]>("/agency/reports/top-tours", { query: { ...r, limit } });

// ---------- Hisob (barcha rollar) ----------
export const changePassword = async (current_password: string, new_password: string) => {
  const res = await api<{ access_token?: string } | void>("/users/me/change-password", {
    method: "POST",
    body: { current_password, new_password },
  });
  if (res && typeof res === "object" && typeof res.access_token === "string") {
    useAuth.setState({ token: res.access_token });
  }
};
