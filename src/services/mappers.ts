import { mediaUrl } from "./api";

// Server massiv yoki {items: [...]} qaytarishi mumkin
export const asList = (data: unknown): any[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    for (const key of ["items", "results", "data", "bookings", "conversations", "messages" , "notifications"]) {
      if (Array.isArray(d[key])) return d[key] as any[];
    }
  }
  return [];
};

export const num = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const str = (v: unknown, fallback = "") =>
  typeof v === "string" ? v : v == null ? fallback : String(v);

// Rasm: to'g'ridan-to'g'ri maydon yoki images ro'yxatidagi birinchisi
export const pickImage = (obj: any): string | null => {
  if (!obj || typeof obj !== "object") return null;
  const direct = obj.image ?? obj.image_url ?? obj.cover ?? obj.cover_url ?? obj.thumbnail;
  const first = Array.isArray(obj.images) ? obj.images[0] : undefined;
  const fromList = typeof first === "string" ? first : first?.url ?? first?.image_url ?? first?.path;
  const fromDirect = typeof direct === "string" ? direct : direct?.url ?? direct?.path;
  return mediaUrl(fromDirect ?? fromList ?? null);
};

export const initialsFrom = (name: string) =>
  name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

export const logShape = (label: string, sample: any) => {
  if (!__DEV__ || !sample || typeof sample !== "object") return;
  const nested = Object.fromEntries(
    Object.entries(sample)
      .filter(([, v]) => v && typeof v === "object" && !Array.isArray(v))
      .map(([k, v]) => [k, Object.keys(v as object)])
  );
};