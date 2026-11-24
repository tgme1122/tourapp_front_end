import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "@/constants/theme";
import type { AgencyOverview, TimePoint, TopTour } from "@/services/agency";
import { formatPrice } from "@/utils/format";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

// ---------- Davrlar ----------
export type PeriodKey = "7d" | "30d" | "90d" | "1y";

export const PERIODS: { key: PeriodKey; label: string; days: number; group: "day" | "month" }[] = [
  { key: "7d", label: "7 kun", days: 7, group: "day" },
  { key: "30d", label: "30 kun", days: 30, group: "day" },
  { key: "90d", label: "3 oy", days: 90, group: "month" },
  { key: "1y", label: "1 yil", days: 365, group: "month" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const rangeFor = (key: PeriodKey) => {
  const p = PERIODS.find((x) => x.key === key) ?? PERIODS[1];
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - (p.days - 1));
  return { from: iso(from), to: iso(to), group: p.group };
};

// Ma'lumoti yo'q kun/oylar ham grafikda 0 bo'lib ko'rinishi uchun
export const fillSeries = (
  points: TimePoint[], from: string, to: string, group: "day" | "month"
): TimePoint[] => {
  const map = new Map(points.map((p) => [p.period, p]));
  const out: TimePoint[] = [];
  const cur = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (group === "month") cur.setDate(1);
  while (cur <= end) {
    const key = group === "day" ? iso(cur) : `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}`;
    out.push(map.get(key) ?? { period: key, bookings: 0, guests: 0, revenue: 0 });
    if (group === "day") cur.setDate(cur.getDate() + 1);
    else cur.setMonth(cur.getMonth() + 1);
  }
  return out;
};

// 12 500 000 -> "12.5 mln"
export const compactMoney = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} mlrd`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")} mln`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} ming`;
  return String(n);
};

const percent = (v: number) => `${Math.round(v * 100)}%`;

// ---------- Davr tanlagich ----------
export function PeriodTabs({ value, onChange }: { value: PeriodKey; onChange: (k: PeriodKey) => void }) {
  return (
    <View style={styles.periods}>
      {PERIODS.map((p) => {
        const active = p.key === value;
        return (
          <Pressable
            key={p.key}
            onPress={() => onChange(p.key)}
            style={[styles.period, active && styles.periodActive]}
          >
            <Text style={[styles.periodText, active && styles.periodTextActive]}>{p.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- Asosiy daromad kartasi ----------
export function RevenueHero({ data }: { data: AgencyOverview }) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <Text style={styles.heroLabel}>Daromad</Text>
        <View style={styles.heroBadge}>
          <Ionicons name="calendar-outline" size={12} color={colors.white} />
          <Text style={styles.heroBadgeText}>
            {data.date_from.slice(5).replace("-", ".")} – {data.date_to.slice(5).replace("-", ".")}
          </Text>
        </View>
      </View>
      <Text style={styles.heroValue}>{formatPrice(data.revenue)}</Text>
      <View style={styles.heroRow}>
        <HeroStat label="Bronlar" value={String(data.bookings_total)} />
        <View style={styles.heroDivider} />
        <HeroStat label="Mehmonlar" value={String(data.guests)} />
        <View style={styles.heroDivider} />
        <HeroStat label="O'rtacha chek" value={compactMoney(data.avg_booking_value)} />
      </View>
    </View>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

// ---------- KPI kartalar ----------
type Kpi = { icon: IconName; label: string; value: string; hint?: string; color: string; bg: string };

export function KpiGrid({ data }: { data: AgencyOverview }) {
  const items: Kpi[] = [
    {
      icon: "hourglass-outline", label: "To'lov kutilmoqda", value: String(data.pending_now),
      hint: "band qilingan bronlar", color: colors.warning, bg: colors.warningSoft,
    },
    {
      icon: "airplane-outline", label: "Kelgusi jo'nashlar", value: String(data.upcoming_departures),
      hint: `${data.seats_total - data.seats_left}/${data.seats_total} joy band`,
      color: colors.verified, bg: "#E8F1FD",
    },
    {
      icon: "pie-chart-outline", label: "To'lish darajasi", value: percent(data.occupancy),
      hint: "kelgusi jo'nashlar", color: colors.success, bg: colors.successSoft,
    },
    {
      icon: "star-outline", label: "Reyting",
      value: data.reviews_count ? data.rating.toFixed(1) : "—",
      hint: `${data.reviews_count} ta sharh`, color: colors.star, bg: "#FFF6E0",
    },
  ];

  return (
    <View style={styles.grid}>
      {items.map((k) => (
        <View key={k.label} style={styles.kpi}>
          <View style={[styles.kpiIcon, { backgroundColor: k.bg }]}>
            <Ionicons name={k.icon} size={18} color={k.color} />
          </View>
          <Text style={styles.kpiValue}>{k.value}</Text>
          <Text style={styles.kpiLabel}>{k.label}</Text>
          {!!k.hint && <Text style={styles.kpiHint} numberOfLines={1}>{k.hint}</Text>}
        </View>
      ))}
    </View>
  );
}

// ---------- Grafik ----------
type Metric = "revenue" | "bookings" | "guests";
const METRICS: { key: Metric; label: string }[] = [
  { key: "revenue", label: "Daromad" },
  { key: "bookings", label: "Bronlar" },
  { key: "guests", label: "Mehmonlar" },
];
const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

const periodLabel = (p: string) => {
  const [, m, d] = p.split("-");
  return d ? `${Number(d)}` : MONTHS[Number(m) - 1] ?? p;
};

export function TrendChart({ points }: { points: TimePoint[] }) {
  const [metric, setMetric] = useState<Metric>("revenue");
  const [selected, setSelected] = useState<number | null>(null);

  const max = useMemo(() => Math.max(1, ...points.map((p) => p[metric])), [points, metric]);
  const total = points.reduce((s, p) => s + p[metric], 0);
  const sel = selected !== null ? points[selected] : null;
  const fmt = (v: number) => (metric === "revenue" ? formatPrice(v) : String(v));

  // Ko'p ustunlarda yorliqlar faqat ba'zilariga qo'yiladi
  const step = Math.max(1, Math.ceil(points.length / 7));

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>Dinamika</Text>
        <View style={styles.metrics}>
          {METRICS.map((m) => (
            <Pressable
              key={m.key}
              onPress={() => { setMetric(m.key); setSelected(null); }}
              style={[styles.metric, metric === m.key && styles.metricActive]}
            >
              <Text style={[styles.metricText, metric === m.key && styles.metricTextActive]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View>
        <Text style={styles.chartValue}>{fmt(sel ? sel[metric] : total)}</Text>
        <Text style={styles.chartHint}>
          {sel ? sel.period.split("-").reverse().join(".") : "tanlangan davr bo'yicha jami"}
        </Text>
      </View>

      {total === 0 ? (
        <View style={styles.chartEmpty}>
          <Ionicons name="bar-chart-outline" size={28} color={colors.muted} />
          <Text style={styles.chartHint}>Bu davrda ma'lumot yo'q</Text>
        </View>
      ) : (
        <>
          <View style={styles.bars}>
            {points.map((p, i) => {
              const h = Math.max(3, (p[metric] / max) * 120);
              const active = selected === i;
              return (
                <Pressable
                  key={p.period}
                  style={styles.barSlot}
                  onPress={() => setSelected(active ? null : i)}
                  hitSlop={4}
                >
                  <View
                    style={[
                      styles.bar,
                      { height: h },
                      p[metric] === 0 && { backgroundColor: colors.border },
                      selected !== null && !active && { opacity: 0.35 },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
          <View style={styles.axis}>
            {points.map((p, i) => (
              <Text key={p.period} style={styles.axisText} numberOfLines={1}>
                {i % step === 0 ? periodLabel(p.period) : ""}
              </Text>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

// ---------- Bronlar holati ----------
export function BookingBreakdown({ data }: { data: AgencyOverview }) {
  const rows = [
    { label: "Tasdiqlangan", value: data.confirmed, color: colors.success },
    { label: "Yakunlangan", value: data.completed, color: colors.verified },
    { label: "Kutilmoqda", value: data.pending, color: colors.warning },
    { label: "Bekor qilingan", value: data.cancelled, color: colors.danger },
  ];
  const total = Math.max(1, rows.reduce((s, r) => s + r.value, 0));

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>Bronlar holati</Text>
        <Text style={styles.cancelRate}>Bekor qilish: {percent(data.cancel_rate)}</Text>
      </View>

      <View style={styles.stack}>
        {rows.map((r) =>
          r.value > 0 ? (
            <View key={r.label} style={{ flex: r.value / total, backgroundColor: r.color }} />
          ) : null
        )}
        {data.bookings_total === 0 && <View style={{ flex: 1, backgroundColor: colors.border }} />}
      </View>

      <View style={{ gap: 10 }}>
        {rows.map((r) => (
          <View key={r.label} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: r.color }]} />
            <Text style={styles.legendLabel}>{r.label}</Text>
            <Text style={styles.legendValue}>{r.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------- Eng yaxshi turlar ----------
export function TopToursCard({ tours, onPress }: { tours: TopTour[]; onPress: (id: string) => void }) {
  const max = Math.max(1, ...tours.map((t) => t.revenue));
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Eng ko'p sotilgan turlar</Text>
      {tours.length === 0 ? (
        <Text style={styles.chartHint}>Bu davrda sotuvlar bo'lmadi</Text>
      ) : (
        tours.map((t, i) => (
          <Pressable key={t.tour_id} style={styles.topRow} onPress={() => onPress(t.tour_id)}>
            <View style={[styles.rank, i === 0 && { backgroundColor: colors.primary }]}>
              <Text style={[styles.rankText, i === 0 && { color: colors.white }]}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={styles.topLine}>
                <Text style={styles.topTitle} numberOfLines={1}>{t.title}</Text>
                <Text style={styles.topRevenue}>{compactMoney(t.revenue)}</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${(t.revenue / max) * 100}%` }]} />
              </View>
              <Text style={styles.topMeta}>{t.bookings} bron · {t.guests} mehmon</Text>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}

// ---------- Turlar soni ----------
export function ToursSummary({ data, onPress }: { data: AgencyOverview; onPress: () => void }) {
  const items = [
    { label: "Nashrda", value: data.tours.published, color: colors.success },
    { label: "Qoralama", value: data.tours.draft, color: colors.warning },
    { label: "Arxiv", value: data.tours.archived, color: colors.muted },
  ];
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>Turlar</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </View>
      <View style={styles.toursRow}>
        {items.map((it) => (
          <View key={it.label} style={styles.tourStat}>
            <Text style={[styles.tourValue, { color: it.color }]}>{it.value}</Text>
            <Text style={styles.kpiLabel}>{it.label}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  periods: {
    flexDirection: "row", padding: 4, gap: 4, borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  period: { flex: 1, height: 36, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  periodActive: { backgroundColor: colors.background, ...shadows.soft },
  periodText: { fontSize: 13, fontWeight: "700", color: colors.muted },
  periodTextActive: { color: colors.primary },

  hero: { padding: 18, gap: 10, borderRadius: radius.xl, backgroundColor: colors.primary, ...shadows.card },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroLabel: { fontSize: 14, fontWeight: "700", color: "rgba(255,255,255,0.85)" },
  heroBadge: {
    flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, height: 24,
    borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.2)",
  },
  heroBadgeText: { fontSize: 11, fontWeight: "700", color: colors.white },
  heroValue: { fontSize: 30, fontWeight: "900", color: colors.white, letterSpacing: -0.5 },
  heroRow: {
    flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4, padding: 12,
    borderRadius: radius.lg, backgroundColor: "rgba(255,255,255,0.14)",
  },
  heroDivider: { width: 1, alignSelf: "stretch", backgroundColor: "rgba(255,255,255,0.25)" },
  heroStatValue: { fontSize: 16, fontWeight: "800", color: colors.white },
  heroStatLabel: { fontSize: 11, color: "rgba(255,255,255,0.8)" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  kpi: {
    width: "47.8%", flexGrow: 1, padding: 14, gap: 4, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, ...shadows.soft,
  },
  kpiIcon: {
    width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  kpiValue: { fontSize: 22, fontWeight: "900", color: colors.text },
  kpiLabel: { fontSize: 12, fontWeight: "700", color: colors.text },
  kpiHint: { fontSize: 11, color: colors.muted },

  card: {
    padding: 16, gap: 14, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background, ...shadows.soft,
  },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.text },

  metrics: { flexDirection: "row", gap: 4 },
  metric: { paddingHorizontal: 10, height: 28, borderRadius: radius.pill, justifyContent: "center" },
  metricActive: { backgroundColor: colors.primarySoft },
  metricText: { fontSize: 11, fontWeight: "700", color: colors.muted },
  metricTextActive: { color: colors.primary },
  chartValue: { fontSize: 22, fontWeight: "900", color: colors.text },
  chartHint: { fontSize: 12, color: colors.muted },
  chartEmpty: { height: 140, alignItems: "center", justifyContent: "center", gap: 6 },
  bars: { flexDirection: "row", alignItems: "flex-end", height: 124, gap: 3 },
  barSlot: { flex: 1, height: "100%", justifyContent: "flex-end" },
  bar: { borderRadius: 4, backgroundColor: colors.primary },
  axis: { flexDirection: "row", gap: 3, marginTop: -6 },
  axisText: { flex: 1, fontSize: 9, color: colors.muted, textAlign: "center", overflow: "visible" },

  cancelRate: { fontSize: 12, fontWeight: "700", color: colors.danger },
  stack: {
    flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", gap: 2,
    backgroundColor: colors.surface,
  },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 14, color: colors.text },
  legendValue: { fontSize: 14, fontWeight: "800", color: colors.text },

  topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  rank: {
    width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  rankText: { fontSize: 13, fontWeight: "800", color: colors.primary },
  topLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  topTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.text },
  topRevenue: { fontSize: 13, fontWeight: "800", color: colors.primary },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.surface, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  topMeta: { fontSize: 11, color: colors.muted },

  toursRow: { flexDirection: "row", gap: 10 },
  tourStat: {
    flex: 1, alignItems: "center", paddingVertical: 12, gap: 2, borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  tourValue: { fontSize: 22, fontWeight: "900" },
});
