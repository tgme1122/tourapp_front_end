import { useMemo, useState } from "react";
import {
  View, Text, Image, FlatList, Pressable, ScrollView, RefreshControl, ActivityIndicator, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { TOUR_STATUS_STYLE } from "@/constants/tourStatus";
import { ResultCardSkeleton } from "@/components/ui/Skeleton";
import { useAgency } from "@/hooks/useAgency";
import { useMyTours } from "@/hooks/useAgencyToursApi";
import { isApiError } from "@/services/api";
import { AgencyTour, TourStatus } from "@/services/agencyTours";
import { formatPrice } from "@/utils/format";
import ApprovalNotice from "@/components/agency/ApprovalNotice";
import EmptyState from "@/components/ui/EmptyState";
import ScreenHeader from "@/components/ui/ScreenHeader";

type Filter = TourStatus | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Hammasi" },
  { key: "published", label: "Nashr qilingan" },
  { key: "draft", label: "Qoralama" },
  { key: "archived", label: "Arxivlangan" },
];

function TourItem({ tour, onPress }: { tour: AgencyTour; onPress: () => void }) {
  const s = TOUR_STATUS_STYLE[tour.status];
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {tour.image ? (
        <Image source={{ uri: tour.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Ionicons name="image-outline" size={26} color={colors.muted} />
        </View>
      )}
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.title} numberOfLines={2}>{tour.title}</Text>
        <Text style={styles.muted} numberOfLines={1}>{tour.city}, {tour.country} · {tour.days} kun</Text>
        <Text style={styles.price}>{formatPrice(tour.price)}</Text>
        <View style={styles.row}>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
          </View>
          <Text style={styles.muted}>{tour.bookingsCount} ta bron</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

export default function AgencyToursScreen() {
  const { isApproved, isManager, isPending: agencyLoading } = useAgency();
  const { data, isPending, isError, error, refetch, isRefetching } = useMyTours(isApproved);
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(
    () => (data ?? []).filter((t) => filter === "all" || t.status === filter),
    [data, filter]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Turlar" />

      {agencyLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !isApproved ? (
        <ApprovalNotice />
      ) : (
        <>
          {!isManager && (
            <Text style={styles.readonly}>Faqat ko'rish. Turlarni menejer boshqaradi.</Text>
          )}

          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabs}
            >
              {FILTERS.map((f) => {
                const active = f.key === filter;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <FlatList
            data={list}
            keyExtractor={(t) => t.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            renderItem={({ item }) => (
              <TourItem
                tour={item}
                onPress={() => router.push({ pathname: "/agency/tour/[id]", params: { id: item.id } })}
              />
            )}
            ListEmptyComponent={
              isPending ? (
                <View style={{ gap: 14, paddingTop: 4 }}>
                  <ResultCardSkeleton />
                  <ResultCardSkeleton />
                  <ResultCardSkeleton />
                </View>
              ) : isError ? (
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
                  title="Turlar yo'q"
                  text={isManager ? "Birinchi turni yarating." : "Bu bo'limda hozircha turlar mavjud emas."}
                  actionLabel={isManager ? "Yangi tur" : undefined}
                  onAction={isManager ? () => router.push("/agency/tour/new") : undefined}
                />
              )
            }
          />

          {isManager && (
            <Pressable style={styles.fab} onPress={() => router.push("/agency/tour/new")}>
              <Ionicons name="add" size={22} color={colors.white} />
              <Text style={styles.fabText}>Yangi tur</Text>
            </Pressable>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", paddingVertical: 40 },
  readonly: { paddingHorizontal: 16, paddingTop: 10, fontSize: 12, color: colors.muted },
  tabs: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 15, height: 38, borderRadius: radius.pill, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center",
    ...shadows.soft,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "700", color: colors.text },
  chipTextActive: { color: colors.white },
  list: { paddingHorizontal: 16, paddingBottom: 96, flexGrow: 1 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
    ...shadows.soft,
  },
  image: { width: 96, height: 110, borderRadius: radius.lg },
  noImage: { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 15, fontWeight: "800", color: colors.text, lineHeight: 20 },
  muted: { fontSize: 12, color: colors.muted },
  price: { fontSize: 15, fontWeight: "800", color: colors.text },
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  badge: { paddingHorizontal: 10, height: 24, borderRadius: 12, justifyContent: "center" },
  badgeText: { fontSize: 11, fontWeight: "700" },
  fab: {
    position: "absolute", right: 16, bottom: 20, flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 18, height: 52, borderRadius: 26, backgroundColor: colors.primary,
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  fabText: { fontSize: 15, fontWeight: "800", color: colors.white },
});