import { useMemo, useState } from "react";
import {
  View, Text, ScrollView, FlatList, Pressable, StyleSheet, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { colors } from "@/constants/theme";
import { useTours } from "@/hooks/useToursApi";
import { useUnreadNotifications } from "@/hooks/useNotificationsApi";
import { isApiError } from "@/services/api";
import { TourCategory } from "@/types/tour";
import HomeHeader from "@/components/home/HomeHeader";
import SearchBar from "@/components/home/SearchBar";
import CategoryRow, { CategoryKey, categoryLabels } from "@/components/home/CategoryRow";
import CountryChips from "@/components/home/CountryChips";
import SectionHeader from "@/components/home/SectionHeader";
import HotTourCard from "@/components/home/HotTourCard";
import FeatureTourCard from "@/components/home/FeatureTourCard";
import FilterChips, { SortKey } from "@/components/home/FilterChips";
import StoriesRow from "@/components/search/StoriesRow";
import StoryViewer from "@/components/search/StoryViewer";
import EmptyState from "@/components/ui/EmptyState";
import { HotCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

const categoryMap: Record<Exclude<CategoryKey, "countries">, TourCategory> = {
  cities: "city",
  mountains: "mountain",
  sea: "sea",
  culture: "culture",
};

export default function HomeScreen() {
  const { data, isPending, isError, error, refetch, isRefetching } = useTours();
  const allTours = useMemo(() => data ?? [], [data]);
  const unread = useUnreadNotifications().data ?? 0;

  const [sort, setSort] = useState<SortKey>("cheap");
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  // Stories: filtrdan mustaqil, hamma hot turlar
  const storyTours = useMemo(() => allTours.filter((t) => t.hot), [allTours]);

  const markSeen = (id: string) =>
    setSeen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  const openTourFromStory = (id: string) => {
    setStoryIndex(null);
    // Modal yopilib bo'lgach o'tamiz
    setTimeout(() => router.push({ pathname: "/tour/[id]", params: { id } }), 250);
  };

  // Kartalar ostidagi sonlar (filtrdan mustaqil, hamma turlar bo'yicha)
  const counts = useMemo(
    () => ({
      countries: new Set(allTours.map((t) => t.country)).size,
      cities: allTours.filter((t) => t.category === "city").length,
      mountains: allTours.filter((t) => t.category === "mountain").length,
      sea: allTours.filter((t) => t.category === "sea").length,
      culture: allTours.filter((t) => t.category === "culture").length,
    }),
    [allTours]
  );

  const countryList = useMemo(() => {
    const map = new Map<string, number>();
    allTours.forEach((t) => map.set(t.country, (map.get(t.country) ?? 0) + 1));
    return Array.from(map, ([name, count]) => ({ name, count }));
  }, [allTours]);

  const filtered = useMemo(
    () =>
      allTours.filter((t) => {
        if (category === "countries") return !country || t.country === country;
        if (category) return t.category === categoryMap[category];
        return true;
      }),
    [allTours, category, country]
  );

  const hotTours = useMemo(() => filtered.filter((t) => t.hot), [filtered]);

  const sortedTours = useMemo(() => {
    const list = [...filtered];
    if (sort === "cheap") list.sort((a, b) => a.price - b.price);
    if (sort === "popular") list.sort((a, b) => b.reviews - a.reviews);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [filtered, sort]);

  const onCategory = (key: CategoryKey) => {
    setCountry(null);
    setCategory((prev) => (prev === key ? null : key));
  };

  const clearFilter = () => {
    setCategory(null);
    setCountry(null);
  };

  const summaryTitle =
    category === "countries" ? country ?? "Barcha davlatlar" : category ? categoryLabels[category] : "";

  // "Barchasi" bosilganda Qidiruvga shu filtr bilan o'tish
  let filterParams: Record<string, string> = {};
  if (category === "countries") {
    if (country) filterParams = { country };
  } else if (category) {
    filterParams = { category: categoryMap[category] };
  }

  const goSearch = (params: Record<string, string> = {}) =>
    router.navigate({ pathname: "/search", params: { ...params, t: String(Date.now()) } });

  const filterKey = `${category ?? "all"}-${country ?? "all"}`;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isPending}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.head}>
          <HomeHeader unread={unread} />
          <SearchBar
            onPress={() => goSearch({ focus: "1" })}
            onFilterPress={() => goSearch({ filters: "1" })}
          />
        </Animated.View>

        {storyTours.length > 0 && (
          <Animated.View entering={FadeInDown.delay(60).duration(400)} style={styles.stories}>
            <StoriesRow tours={storyTours} seen={seen} onPress={setStoryIndex} />
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
          <CategoryRow selected={category} onSelect={onCategory} counts={counts} />
        </Animated.View>

        {category === "countries" && (
          <CountryChips
            countries={countryList}
            total={allTours.length}
            selected={country}
            onSelect={setCountry}
          />
        )}

        {category && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.summary}>
            <Text style={styles.summaryText}>
              {summaryTitle} · {filtered.length} ta tur
            </Text>
            <Pressable style={styles.clear} onPress={clearFilter} hitSlop={8}>
              <Ionicons name="close" size={14} color={colors.primary} />
              <Text style={styles.clearText}>Tozalash</Text>
            </Pressable>
          </Animated.View>
        )}

        {isPending ? (
          <View style={styles.section}>
            <View style={styles.skeletonTitle}>
              <Skeleton width={140} height={22} />
            </View>
            <ScrollView
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              <HotCardSkeleton />
              <HotCardSkeleton />
            </ScrollView>
          </View>
        ) : isError ? (
          <View style={styles.empty}>
            <EmptyState
              icon="cloud-offline-outline"
              title="Turlarni yuklab bo'lmadi"
              text={isApiError(error) ? error.message : "Internetni tekshirib, qayta urinib ko'ring."}
              actionLabel="Qayta urinish"
              onAction={() => refetch()}
            />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <EmptyState
              icon="search-outline"
              title={category ? "Bu bo'limda tur topilmadi" : "Hozircha turlar yo'q"}
              text={category ? "Boshqa yo'nalishni tanlab ko'ring." : "Keyinroq qayta tekshirib ko'ring."}
              actionLabel={category ? "Filtrni tozalash" : undefined}
              onAction={category ? clearFilter : undefined}
            />
          </View>
        ) : (
          <>
            {hotTours.length > 0 && (
              <Animated.View
                key={`hot-${filterKey}`}
                entering={FadeInDown.delay(100).duration(350)}
                style={styles.section}
              >
                <SectionHeader
                  title="Hot turlar"
                  subtitle="Hozir eng ko'p bron qilinayotgan sayohatlar"
                  onPress={() => goSearch({ hot: "1", ...filterParams })}
                />
                <FlatList
                  data={hotTours}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                  snapToInterval={312}
                  decelerationRate="fast"
                  renderItem={({ item, index }) => <HotTourCard tour={item} index={index} />}
                />
              </Animated.View>
            )}

            <Animated.View
              key={`cheap-${filterKey}`}
              entering={FadeInDown.delay(160).duration(350)}
              style={styles.section}
            >
              <SectionHeader
                title={sort === "cheap" ? "Eng arzon turlar" : sort === "popular" ? "Mashhur turlar" : "Yuqori reytingli turlar"}
                subtitle={sort === "cheap" ? "Byudjetga mos sayohatlar" : "Boshqa foydalanuvchilar tanlovi"}
                onPress={() => goSearch({ sort, ...filterParams })}
              />
              <FilterChips value={sort} onChange={setSort} />
              <View style={{ gap: 16 }}>
                {sortedTours.map((item, index) => (
                  <FeatureTourCard key={item.id} tour={item} index={index} />
                ))}
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>

      {storyIndex !== null && (
        <StoryViewer
          tours={storyTours}
          initialIndex={storyIndex}
          onClose={() => setStoryIndex(null)}
          onSeen={markSeen}
          onOpenTour={openTourFromStory}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  head: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14, gap: 14 },
  stories: { marginTop: 4 },
  section: { marginTop: 18 },
  skeletonTitle: { paddingHorizontal: 16, marginBottom: 12 },
  summary: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 16, marginTop: 16, paddingHorizontal: 14, height: 44,
    borderRadius: 14, backgroundColor: colors.primarySoft,
  },
  summaryText: { fontSize: 14, fontWeight: "700", color: colors.primary },
  clear: { flexDirection: "row", alignItems: "center", gap: 4 },
  clearText: { fontSize: 13, fontWeight: "700", color: colors.primary },
  empty: { paddingVertical: 48 },
});