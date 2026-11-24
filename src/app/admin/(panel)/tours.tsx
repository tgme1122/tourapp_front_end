import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { useAdminTourList, useTourCounts } from "@/hooks/useAdminApi";
import { useDebounced } from "@/hooks/useDebounced";
import { isApiError } from "@/services/api";
import { AdminTour, TourSort, TourStatus } from "@/types/admin";
import DataTable, { Column } from "@/components/admin/DataTable";
import TourStatusBadge, { money } from "@/components/admin/TourStatusBadge";
import EmptyState from "@/components/ui/EmptyState";

type StatusFilter = TourStatus | "all";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Hammasi" },
  { key: "published", label: "Nashr etilgan" },
  { key: "draft", label: "Qoralama" },
  { key: "archived", label: "Arxiv" },
];

const SORTS: { key: TourSort; label: string }[] = [
  { key: "newest", label: "Yangi" },
  { key: "bookings", label: "Bronlar" },
  { key: "rating", label: "Reyting" },
  { key: "price", label: "Narx" },
];

const COLUMNS: Column<AdminTour>[] = [
  {
    key: "image", title: "Rasm", width: 80,
    render: (t) =>
      t.image ? (
        <Image source={{ uri: t.image }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty]}>
          <Ionicons name="image-outline" size={20} color={colors.muted} />
        </View>
      ),
  },
  { key: "title", title: "Tur nomi", width: 230, value: (t) => t.title },
  {
    key: "agency", title: "Agentlik", width: 190,
    render: (t) => (
      <View>
        <Text style={styles.cellText} numberOfLines={1}>{t.agency_name || "—"}</Text>
        {!!t.agency_status && <Text style={styles.sub}>{t.agency_status}</Text>}
      </View>
    ),
  },
  { key: "status", title: "Holat", width: 130, render: (t) => <TourStatusBadge status={t.status} /> },
  { key: "price", title: "Narxi", width: 140, align: "right", value: (t) => money(t.price) },
  { key: "rating", title: "Reyting", width: 90, align: "right", value: (t) => (t.rating ? t.rating.toFixed(1) : "—") },
  { key: "bookings", title: "Bronlar", width: 90, align: "right", value: (t) => String(t.bookings_count) },
  { key: "next", title: "Eng yaqin jo'nash", width: 150, value: (t) => t.next_departure },
  {
    key: "seats", title: "Bo'sh joy", width: 100, align: "right",
    value: (t) => (t.seats_left == null ? "" : String(t.seats_left)),
  },
];

export default function ToursScreen() {
  const params = useLocalSearchParams<{ agencyId?: string }>();
  const agencyId = params.agencyId || undefined;

  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<TourSort>("newest");
  const [query, setQuery] = useState("");
  const q = useDebounced(query.trim(), 400);

  const counts = useTourCounts().data;
  const {
    data, isPending, isError, error, refetch, isRefetching,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useAdminTourList({ status: status === "all" ? undefined : status, sort, q, agencyId });
  const tours = useMemo(() => data?.pages.flat() ?? [], [data]);

  const countOf = (k: StatusFilter) => (k === "all" ? counts?.total : counts?.[k]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.header}>Turlar</Text>

      {!!agencyId && (
        <Pressable style={styles.filterBanner} onPress={() => router.setParams({ agencyId: "" })}>
          <Ionicons name="business-outline" size={16} color={colors.primary} />
          <Text style={styles.filterText}>Agentlik bo'yicha filtr</Text>
          <Ionicons name="close-circle" size={16} color={colors.primary} />
        </Pressable>
      )}

      <View style={styles.searchWrap}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Tur nomi, shahar yoki agentlik"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {STATUS_TABS.map((t) => {
          const active = t.key === status;
          const c = countOf(t.key);
          return (
            <Pressable key={t.key} onPress={() => setStatus(t.key)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {t.label}{c !== undefined ? ` (${c})` : ""}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
        <Text style={styles.sortLabel}>Saralash:</Text>
        {SORTS.map((s) => {
          const active = s.key === sort;
          return (
            <Pressable key={s.key} onPress={() => setSort(s.key)} style={[styles.sortChip, active && styles.sortActive]}>
              <Text style={[styles.sortText, active && styles.sortTextActive]}>{s.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <DataTable
        columns={COLUMNS}
        rows={tours}
        keyOf={(t) => t.id}
        loading={isPending}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => refetch()}
        loadingMore={isFetchingNextPage}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onRowPress={(t) => router.push({ pathname: "/admin/tour/[id]", params: { id: t.id } })}
        empty={
          isError ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Yuklab bo'lmadi"
              text={isApiError(error) ? error.message : "Qayta urinib ko'ring."}
              actionLabel="Qayta urinish"
              onAction={() => refetch()}
            />
          ) : (
            <EmptyState
              icon="map-outline"
              title="Tur topilmadi"
              text={q ? "Boshqa so'z bilan qidirib ko'ring." : "Bu bo'limda turlar yo'q."}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    fontSize: 28, fontWeight: "800", color: colors.text, letterSpacing: -0.5,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  filterBanner: {
    flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginBottom: 8,
    paddingHorizontal: 12, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignSelf: "flex-start",
  },
  filterText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  searchWrap: { paddingHorizontal: 16, paddingTop: 4 },
  search: {
    flexDirection: "row", alignItems: "center", gap: 10, height: 48, paddingHorizontal: 16,
    borderRadius: radius.pill, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, ...shadows.soft,
  },
  input: { flex: 1, fontSize: 14, color: colors.text },
  chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 15, height: 38, borderRadius: radius.pill, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center",
    ...shadows.soft,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "700", color: colors.text },
  chipTextActive: { color: colors.white },
  sortRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8, alignItems: "center" },
  sortLabel: { fontSize: 12, color: colors.muted, fontWeight: "700" },
  sortChip: { paddingHorizontal: 12, height: 30, borderRadius: 15, justifyContent: "center", backgroundColor: colors.surface },
  sortActive: { backgroundColor: colors.primarySoft },
  sortText: { fontSize: 12, fontWeight: "700", color: colors.muted },
  sortTextActive: { color: colors.primary },
  thumb: { width: 56, height: 40, borderRadius: 8, backgroundColor: colors.surface },
  thumbEmpty: { alignItems: "center", justifyContent: "center" },
  cellText: { fontSize: 13, color: colors.text },
  sub: { fontSize: 11, color: colors.muted },
});
