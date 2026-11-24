import { api, ApiError, mediaUrl } from "./api";
import type { UserProfile } from "@/store/user";
import { formatPhone } from "@/utils/validation";
import { splitName } from "@/utils/name";
import { logShape, str } from "./mappers";
import type { AgencyProfile, AgencyRole } from "@/types/agency";

// =====================================================================
// BACKEND BILAN KELISHUV: maydon nomlari faqat shu faylda.
// Swagger'dagi nomlar boshqacha bo'lsa, FAQAT shu yerni o'zgartiring.
// =====================================================================

export type ApiUser = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null; // eski javoblar uchun zaxira
  email: string;
  phone?: string | null;
  role: "traveler" | "agency" | "admin";
  is_email_verified?: boolean;
  avatar_url?: string | null;
  [key: string]: unknown;
  agency_profile?: AgencyProfile | null;
  agency_role?: AgencyRole | null;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

export type AgencyRegisterInput = RegisterInput & {
  agencyName: string;
  licenseNumber: string;
  taxId: string;
  region: string;
  city: string;
  address: string;
  contactPhone?: string;
  website?: string;
  description?: string;
};

// "+998 90 123 45 67" -> "+998901234567"
export const rawPhone = (p: string) => p.replace(/[^\d+]/g, "");

const TOKEN_KEYS = ["access_token", "accessToken", "token", "access", "jwt", "id_token"];

// Javobning istalgan joyida (3 darajagacha) token qidiradi
const pickToken = (data: unknown, depth = 0): string | null => {
  if (!data || typeof data !== "object" || depth > 3) return null;
  const d = data as Record<string, unknown>;

  for (const key of TOKEN_KEYS) {
    const v = d[key];
    if (typeof v === "string" && v.length > 20) return v;
  }
  for (const v of Object.values(d)) {
    const found = pickToken(v, depth + 1);
    if (found) return found;
  }
  return null;
};

// Ro'yxatdan o'tish. Backend token qaytarsa olamiz, aks holda store o'zi kiradi.
export const registerTraveler = async (input: RegisterInput) => {
  const data = await api("/auth/register/traveler", {
    method: "POST",
    auth: false,
    body: {
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: rawPhone(input.phone),
      password: input.password,
    },
  });
  return { token: pickToken(data) };
};

export const registerAgency = (input: AgencyRegisterInput) =>
  api<{ message: string }>("/auth/register/agency", {
    method: "POST",
    auth: false,
    body: {
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: rawPhone(input.phone),
      password: input.password,
      agency_name: input.agencyName,
      license_number: input.licenseNumber,
      tax_id: input.taxId,
      region: input.region,
      city: input.city,
      address: input.address,
      contact_phone: input.contactPhone ? rawPhone(input.contactPhone) : undefined,
      website: input.website?.trim() || undefined,
      description: input.description?.trim() || undefined,
    },
  });

export const verifyEmail = async (email: string, code: string) => {
  const data = await api("/auth/verify-email", {
    method: "POST",
    auth: false,
    body: { email, code },
  });
  return { token: pickToken(data) };
};

export const resendCode = (email: string) =>
  api("/auth/resend-code", { method: "POST", auth: false, body: { email } });

export const login = async (identifier: string, password: string) => {
  const body = identifier.includes("@")
    ? { email: identifier, password }
    : { phone: rawPhone(identifier), password };

  const data = await api("/auth/login", { method: "POST", auth: false, body });
  const token = pickToken(data);

  if (!token) {
    if (__DEV__) {
      console.log(
        "LOGIN javobi (qiymatlar yashirilgan):",
        JSON.stringify(data, (_k, v) => (typeof v === "string" ? `<${v.length} belgi>` : v))
      );
    }
    throw new ApiError(500, "Server token qaytarmadi");
  }
  return { token };
};

export const me = async (token?: string): Promise<ApiUser> => {
  const data: any = await api("/auth/me", { token });
  const user = data?.user ?? data;
  logShape("ME", user);
  return user as ApiUser;
};

// Backenddagi foydalanuvchini ilovadagi profil shakliga o'tkazadi
// Ism-familiya turli nomlar bilan kelishi mumkin
const pickName = (u: any) => {
  const first = u.first_name ?? u.firstName ?? u.firstname ?? u.name;
  const last = u.last_name ?? u.lastName ?? u.lastname ?? u.surname ?? u.family_name;
  if (first != null || last != null) return { firstName: str(first), lastName: str(last) };
  return splitName(str(u.full_name ?? u.fullName ?? ""));
};

export const toAgencyRole = (u: ApiUser): AgencyRole | null => {
  const raw = u.agency_role ?? (u as any).agency_member?.role;
  return raw === "owner" || raw === "manager" ? raw : null;
};

export const toProfile = (u: ApiUser): UserProfile => {
  const { firstName, lastName } = pickName(u);
  return {
    id: String(u.id),
    firstName,
    lastName,
    phone: u.phone ? formatPhone(u.phone) : "",
    email: u.email,
    role: u.role === "agency" || u.role === "admin" ? u.role : "traveler",
    photoUri: mediaUrl(u.avatar_url ?? null),
    agencyRole: toAgencyRole(u)
  };
};