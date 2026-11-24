export const formatPrice = (n: number) =>
  `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`;

export const discountPercent = (price: number, oldPrice?: number) =>
  oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;

const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];


export const formatDateRange = (startISO: string, days: number) => {
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + days - 1);

  const sd = start.getDate();
  const ed = end.getDate();
  const sm = MONTHS[start.getMonth()];
  const em = MONTHS[end.getMonth()];

  if (days <= 1) return `${sd} ${sm}`;
  if (sm === em) return `${sd}–${ed} ${sm}`;
  return `${sd} ${sm} – ${ed} ${em}`;
};

export const formatDate = (d: Date) =>
  `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

const pad = (n: number) => String(n).padStart(2, "0");
const WEEKDAYS = ["Yak", "Du", "Se", "Chor", "Pay", "Ju", "Sha"];

// Server vaqti zonasiz kelsa (UTC deb hisoblab), to'g'ri o'qiydi
export const parseServerDate = (value: string): Date | null => {
  if (!value) return null;
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
  const d = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatClock = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// Suhbatlar ro'yxati uchun: bugun "10:24", kecha "Kecha", hafta ichida "Du", undan eski "12 Okt"
export const formatChatTime = (value: string) => {
  const d = parseServerDate(value);
  if (!d) return "";
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  if (diffDays <= 0) return formatClock(d);
  if (diffDays === 1) return "Kecha";
  if (diffDays < 7) return WEEKDAYS[d.getDay()];
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
};