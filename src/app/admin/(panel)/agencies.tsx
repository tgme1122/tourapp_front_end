import { useEffect, useMemo, useState } from "react";
import {
  View, Text, TextInput, FlatList, Pressable, ScrollView, RefreshControl, ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { ListRowSkeleton } from "@/components/ui/Skeleton";
import { StatusFilter, useAgencyCounts, useAgencyList } from "@/hooks/useAdminApi";
import { useDebounced } from "@/hooks/useDebounced";
import { isApiError } from "@/services/api";
import AgencyRow from "@/components/admin/AgencyRow";
import EmptyState from "@/components/ui/EmptyState";

const TABS: { key: StatusFilter; label: string }[] = [
  { key: "pending", label: "Kutilayotgan" },
  { key: "approved", label: "Tasdiqlangan" },
  { key: "rejected", label: "Rad etilgan" },
  { key: "suspended", label: "Bloklangan" },
  { key: "all", label: "Hammasi" },
];

export default function AgenciesScreen() {
  const params = useLocalSearchParams<{ status?: string }>();
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [query, setQuery] = useState("");
  const q = useDebounced(query.trim(), 400);

  // Bosh sahifadagi kartadan kelgan holat
  useEffect(() => {
    if (params.status && TABS.some((t) => t.key === params.status)) {
      setStatus(params.status as StatusFilter);
    }
  }, [params.status]);

  const counts = useAgencyCounts().data;
  const total = counts ? counts.pending + counts.approved + counts.rejected + counts.suspended : undefined;

  const {
    data, isPending, isError, error, refetch, isRefetching,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useAgencyList(status, q);

  const agencies = useMemo(() => data?.pages.flat() ?? [], [data]);

  const countOf = (key: StatusFilter) =>
    key === "all" ? total : counts?.[key as "pending" | "approved" | "rejected" | "suspended"];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.header}>Agentliklar</Text>

      <View style={styles.searchWrap}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Nomi, STIR yoki litsenziya raqami"
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

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map((t) => {
            const active = t.key === status;
            const count = countOf(t.key);
            return (
              <Pressable
                key={t.key}
                onPress={() => setStatus(t.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {t.label}{count !== undefined ? ` (${count})` : ""}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={agencies}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        renderItem={({ item }) => (
          <AgencyRow
            agency={item}
            onPress={() => router.push({ pathname: "/admin/agency/[id]", params: { id: item.id } })}
          />
        )}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={{ margin: 16 }} /> : null
        }
        ListEmptyComponent={
          isPending ? (
            <View style={{ paddingTop: 8 }}>
              <ListRowSkeleton />
              <ListRowSkeleton />
              <ListRowSkeleton />
              <ListRowSkeleton />
            </View>
          ) : isError ? (
            <View style={styles.empty}>
              <EmptyState
                icon="cloud-offline-outline"
                title="Yuklab bo'lmadi"
                text={isApiError(error) ? error.message : "Qayta urinib ko'ring."}
                actionLabel="Qayta urinish"
                onAction={() => refetch()}
              />
            </View>
          ) : (
            <View style={styles.empty}>
              <EmptyState
                icon="business-outline"
                title="Agentlik topilmadi"
                text={q ? "Boshqa so'z bilan qidirib ko'ring." : "Bu bo'limda hozircha agentliklar yo'q."}
              />
            </View>
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
  searchWrap: { paddingHorizontal: 16, paddingTop: 8 },
  search: {
    flexDirection: "row", alignItems: "center", gap: 10, height: 48, paddingHorizontal: 16,
    borderRadius: radius.pill, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, ...shadows.soft,
  },
  input: { flex: 1, fontSize: 14, color: colors.text },
  tabs: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 15, height: 38, borderRadius: radius.pill, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center",
    ...shadows.soft,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "700", color: colors.text },
  chipTextActive: { color: colors.white },
  list: { paddingBottom: 24, flexGrow: 1 },
  empty: { flex: 1, justifyContent: "center", paddingVertical: 60 },
});