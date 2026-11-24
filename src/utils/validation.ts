import { CardBrand } from "../store/cards";

// "+998 90 777 88 99" ko'rinishiga keltiradi
export const formatPhone = (raw: string) => {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("998")) digits = digits.slice(3);
  digits = digits.slice(0, 9);
  const parts = [
    digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9),
  ].filter(Boolean);
  return parts.length > 0 ? `+998 ${parts.join(" ")}` : "+998 ";
};

export const isValidPhone = (v: string) => {
  const d = v.replace(/\D/g, "");
  return d.length === 12 && d.startsWith("998");
};

export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// Karta
export const formatCardNumber = (raw: string) =>
  raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

export const formatExpiry = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export const luhnValid = (num: string) => {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
};

export const detectBrand = (num: string): CardBrand => {
  const d = num.replace(/\D/g, "");
  if (d.startsWith("9860")) return "humo";
  if (d.startsWith("8600")) return "uzcard";
  if (d.startsWith("4")) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "mastercard";
  return "unknown";
};

export const isValidExpiry = (v: string) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  return new Date(year, month, 0, 23, 59, 59) >= new Date();
};

// Telefonni "+998 90 123 45 67" ko'rinishiga keltiradi (9 yoki 12 raqam qabul qilinadi)
export const normalizePhone = (v: string) => {
  let d = v.replace(/\D/g, "");
  if (d.length === 9) d = `998${d}`;
  return d.length === 12 && d.startsWith("998") ? formatPhone(`+${d}`) : null;
};

// Kirishdagi "email yoki telefon" maydonini aniqlaydi
export const parseIdentifier = (raw: string) => {
  const v = raw.trim();
  if (!v) return null;
  if (v.includes("@")) {
    return isValidEmail(v) ? { type: "email" as const, value: v.toLowerCase() } : null;
  }
  const phone = normalizePhone(v);
  return phone ? { type: "phone" as const, value: phone } : null;
};

export const passwordChecks = (p: string) => ({
  length: p.length >= 8,
  mix: /[A-Za-z]/.test(p) && /\d/.test(p),
});

export const isStrongPassword = (p: string) => {
  const c = passwordChecks(p);
  return c.length && c.mix;
};

const p2 = (n: number) => String(n).padStart(2, "0");
const isoOf = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;

export const todayISO = () => isoOf(new Date());

export const addDaysISO = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return isoOf(d);
};

export const addMonthsISO = (iso: string, months: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setMonth(d.getMonth() + months);
  return isoOf(d);
};

// "12102026" -> "12.10.2026"
export const formatDateMask = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join(".");
};

// "12.10.2026" -> "2026-10-12" (haqiqiy sana bo'lsa)
export const dmyToISO = (v: string): string | null => {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(v);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (
    d.getFullYear() !== Number(yyyy) ||
    d.getMonth() !== Number(mm) - 1 ||
    d.getDate() !== Number(dd)
  ) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
};

// Berilgan sanadagi yosh
export const ageOn = (birthISO: string, onISO: string) => {
  const b = new Date(`${birthISO}T00:00:00`);
  const t = new Date(`${onISO}T00:00:00`);
  let age = t.getFullYear() - b.getFullYear();
  const had =
    t.getMonth() > b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() >= b.getDate());
  if (!had) age -= 1;
  return age;
};

// Pasport: 2 ta lotin harfi + 7 ta raqam (masalan AA1234567)
export const isValidPassport = (series: string, number: string) =>
  /^[A-Z]{2}$/.test(series) && /^\d{7}$/.test(number);