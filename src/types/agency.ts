export type AgencyStatus = "pending" | "approved" | "rejected" | "suspended";
export type AgencyRole = "owner" | "manager";

export type DocumentType =
  | "license"
  | "tax_certificate"
  | "registration"
  | "director_passport"
  | "other";

export type AgencyDocument = {
  id: string;
  type: DocumentType | string;
  file_url?: string;
  file_name?: string;
  is_checked?: boolean;
  created_at?: string;
};

export type AgencyProfile = {
  id: string;
  name: string;
  status: AgencyStatus;
  verified?: boolean;
  rejection_reason?: string | null;
  logo_url?: string | null;
  license_number?: string;
  tax_id?: string;
  region?: string;
  city?: string;
  address?: string;
  contact_phone?: string;
  website?: string | null;
  description?: string | null;
  documents?: AgencyDocument[];
};

// Admin ko'radigan to'liq ma'lumot
export type AdminAgency = AgencyProfile & {
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  email_verified: boolean;
  created_at: string;
  reviewed_at?: string | null;
};

// Tasdiqlanish uchun majburiy hujjatlar
export const REQUIRED_DOCS: DocumentType[] = ["license", "tax_certificate", "registration"];

export const DOC_LABELS: Record<string, string> = {
  license: "Litsenziya",
  tax_certificate: "STIR guvohnomasi",
  registration: "Ro'yxatga olish guvohnomasi",
  director_passport: "Direktor pasporti",
  other: "Boshqa hujjat",
};
