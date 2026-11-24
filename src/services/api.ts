export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
const TIMEOUT_MS = 15000;

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// Backend camelCase ishlatadi, ilova ichida snake_case. Chegarada bir marta o'giramiz.
const toSnakeKey = (k: string) => k.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
const toCamelKey = (k: string) => k.replace(/_([a-z0-9])/g, (_m, c: string) => c.toUpperCase());

const mapKeys = (value: unknown, fn: (k: string) => string): unknown => {
  if (Array.isArray(value)) return value.map((v) => mapKeys(v, fn));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [fn(k), mapKeys(v, fn)])
    );
  }
  return value;
};

let getToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

// store/auth.ts shu funksiya orqali tokenni va "sessiya tugadi" hodisasini ulaydi
export const configureApi = (cfg: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) => {
  getToken = cfg.getToken;
  onUnauthorized = cfg.onUnauthorized;
};

export const isApiError = (e: unknown): e is ApiError =>
  typeof e === "object" && e !== null && (e as { name?: string }).name === "ApiError";

// Serverdan kelgan rasm yo'lini to'liq manzilga aylantiradi
export const mediaUrl = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) {
    // Backend localhost bilan javob bersa, telefon uchun haqiqiy manzilga almashtiramiz
    return path.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, API_URL);
  }
  const clean = path.replace(/^\/+/, "");
  return `${API_URL}/${clean.startsWith("media/") ? clean : `media/${clean}`}`;
};

type Query = Record<string, string | number | boolean | null | undefined | (string | number)[]>;

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown; // JSON (kalitlar avtomatik camelCase ga o'giriladi)
  form?: FormData; // fayl yuklash (multipart)
  query?: Query;
  auth?: boolean; // false: tokensiz so'rov (login, register)
  token?: string; // aniq token bilan (kirish paytida)
  headers?: Record<string, string>; // qo'shimcha sarlavhalar (masalan Idempotency-Key)
  idempotencyKey?: string;
};

const buildUrl = (path: string, query?: Query) => {
  const parts: string[] = [];
  Object.entries(query ?? {}).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value];
    values.forEach((v) => {
      if (v === undefined || v === null || v === "") return;
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    });
  });
  return `${API_URL}${path}${parts.length ? `?${parts.join("&")}` : ""}`;
};

// FastAPI xatolari: {"detail": "matn"} yoki {"detail": [{loc, msg}, ...]}
const parseError = (status: number, data: any) => {
  const fieldErrors: Record<string, string> = {};
  let message = "";
  const detail = data?.detail;

  if (typeof detail === "string") {
    message = detail;
  } else if (Array.isArray(detail)) {
    detail.forEach((d) => {
      const field = Array.isArray(d?.loc) ? String(d.loc[d.loc.length - 1]) : "";
      if (field && d?.msg) fieldErrors[toSnakeKey(field)] = String(d.msg);
    });
    message = Object.values(fieldErrors)[0] ?? "Ma'lumotlar noto'g'ri";
  }

  if (!message) {
    message =
      status === 401 ? "Sessiya tugagan. Qayta kiring."
      : status === 403 ? "Bu amal uchun ruxsat yo'q."
      : status === 404 ? "Topilmadi."
      : status === 429 ? "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring."
      : status >= 500 ? "Serverda xatolik. Keyinroq urinib ko'ring."
      : "Xatolik yuz berdi.";
  }
  return new ApiError(status, message, fieldErrors);
};

export async function api<T = unknown>(path: string, options: Options = {}): Promise<T> {
  const { method = "GET", body, form, query, auth = true, token: tokenOverride, idempotencyKey } = options;
  const token = tokenOverride ?? getToken();

  const headers: Record<string, string> = { Accept: "application/json", ...options.headers };
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  let payload: BodyInit | undefined;
  if (form) {
    payload = form; // Content-Type'ni RN o'zi qo'yadi (boundary bilan)
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(mapKeys(body, toCamelKey));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method, headers, body: payload, signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, "Serverga ulanib bo'lmadi. Internetni tekshiring.");
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => null);
  const data = mapKeys(json, toSnakeKey);

  if (!res.ok) {
    if (__DEV__) {
      console.log(
        `API ${method} ${path} -> ${res.status}`,
        JSON.stringify(data, (k, v) => (k === "input" || k === "ctx" ? undefined : v))
      );
    }

    const error = parseError(res.status, json ?? {});
    if (res.status === 401) onUnauthorized();
    throw error;
  }

  return data as T;
}
// Backend yo'lini (masalan /agency/documents/1/file) to'liq manzilga aylantiradi
export const apiUrl = (path: string) =>
  /^https?:\/\//i.test(path)
    ? path.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, API_URL)
    : `${API_URL}/${path.replace(/^\/+/, "")}`;