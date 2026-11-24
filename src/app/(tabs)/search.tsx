import { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/theme";
import {
  SEARCH_DEBOUNCE_MS, categoryOptions, countActiveFilters, defaultFilters,
} from "@/constants/filters";
import { useTourCountries } from "@/hooks/useToursApi";
import { useTourSearch } from "@/hooks/useTourSearch";
import { isApiError } from "@/services/api";
import { SearchFilters, SortKey } from "@/types/search";
import ScreenHeader from "@/components/ui/ScreenHeader";
import EmptyState from "@/components/ui/EmptyState";
import FilterChips from "@/components/home/FilterChips";
import SearchInput from "@/components/search/SearchInput";
import FilterSheet from "@/components/search/FilterSheet";
import ActiveFilterChips from "@/components/search/ActiveFilterChips";
import ResultCard from "@/components/search/ResultCard";
import { ResultCardSkeleton } from "@/components/ui/Skeleton";

const isSortKey = (v?: string): v is SortKey =>
  v === "cheap" || v === "popular" || v === "rating";

export default function SearchScreen() {
  const params = useLocalSearchParams<{
    q?: string; category?: string; sort?: string;
    hot?: string; filters?: string; focus?: string; t?: string; country?: string;
  }>();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState("");
  const [committed, setCommitted] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [sort, setSort] = useState<SortKey>("popular");
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: countries = [] } = useTourCountries();

  // Home'dan kelgan parametrlarni qo'llash
  useEffect(() => {
    if (!params.t) return;

    const next: SearchFilters = { ...defaultFilters };
    const cat = categoryOptions.find((o) => o.key === params.category);
    if (cat) next.categories = [cat.key];
    if (params.country) next.country = params.country;
    if (params.hot === "1") next.hotOnly = true;

    setFilters(next);
    setSort(isSortKey(params.sort) ? params.sort : "popular");
    setQuery(params.q ?? "");
    setCommitted(params.q ?? "");

    if (params.filters === "1") setSheetOpen(true);
    if (params.focus === "1") setTimeout(() => inputRef.current?.focus(), 350);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.t]);

  // Yozish to'xtagach SEARCH_DEBOUNCE_MS dan keyin qidiruvni boshlaydi
  useEffect(() => {
    const timer = setTimeout(() => setCommitted(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const {
    results, loading, isError, error, refetch, isRefetching,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useTourSearch(committed, filters, sort);
  const typing = query.trim() !== committed;
  const filterCount = countActiveFilters(filters);

  const clearAll = () => {
    setFilters(defaultFilters);
    setQuery("");
    setCommitted("");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Qidiruv" />

      <View style={styles.searchWrap}>
        <SearchInput
          inputRef={inputRef}
          value={query}
          onChangeText={setQuery}
          onSubmit={() => setCommitted(query.trim())}
          onFilterPress={() => setSheetOpen(true)}
          filterCount={filterCount}
          busy={loading}
        />
        {typing && !loading && (
          <Text style={styles.hint}>Qidirish uchun klaviaturadagi «Qidirish» tugmasini bosing</Text>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 24 }}
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
        renderItem={({ item, index }) => <ResultCard tour={item} index={index} />}
        ListHeaderComponent={
          <View>
            <ActiveFilterChips filters={filters} onChange={setFilters} />
            <FilterChips value={sort} onChange={setSort} />
            <View style={styles.countRow}>
              <Text style={styles.count}>
                {loading ? "Qidirilmoqda..." : `${results.length} ta natija`}
              </Text>
            </View>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={{ margin: 16 }} /> : null
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: 12 }}>
              <ResultCardSkeleton />
              <ResultCardSkeleton />
              <ResultCardSkeleton />
            </View>
          ) : isError ? (
            <View style={styles.empty}>
              <EmptyState
                icon="cloud-offline-outline"
                title="Yuklab bo'lmadi"
                text={isApiError(error) ? error.message : "Internetni tekshirib, qayta urinib ko'ring."}
                actionLabel="Qayta urinish"
                onAction={() => refetch()}
              />
            </View>
          ) : (
            <View style={styles.empty}>
              <EmptyState
                icon="search-outline"
                title="Hech narsa topilmadi"
                text="So'rovni o'zgartiring yoki filtrlarni tozalab ko'ring."
                actionLabel="Filtrlarni tozalash"
                onAction={clearAll}
              />
            </View>
          )
        }
      />

      <FilterSheet
        visible={sheetOpen}
        filters={filters}
        countries={countries}
        onApply={(f) => {
          setFilters(f);
          setSheetOpen(false);
        }}
        onClose={() => setSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  hint: { marginTop: 8, fontSize: 12, color: colors.muted },
  countRow: { paddingHorizontal: 16, marginBottom: 12 },
  count: { fontSize: 13, fontWeight: "700", color: colors.muted },
  empty: { paddingVertical: 48, alignItems: "center" },
});