import { useState } from "react";
import {
  View, Text, ScrollView, ActivityIndicator, Share, StyleSheet,
  NativeSyntheticEvent, NativeScrollEvent,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/theme";
import { categoryOptions } from "@/constants/filters";
import { useTour } from "@/hooks/useToursApi";
import { useFavorites } from "@/store/favorites";
import { isApiError } from "@/services/api";
import { startConversation } from "@/services/chats";
import { str } from "@/services/mappers";
import { queryClient } from "@/services/queryClient";
import { notify } from "@/utils/confirm";
import { discountPercent, formatPrice } from "@/utils/format";
import BackHeader from "@/components/ui/BackHeader";
import EmptyState from "@/components/ui/EmptyState";
import Gallery, { HERO_HEIGHT } from "@/components/tour/Gallery";
import RoundButton from "@/components/tour/RoundButton";
import DetailSection from "@/components/tour/DetailSection";
import QuickFacts, { Fact } from "@/components/tour/QuickFacts";
import AgencyCard from "@/components/tour/AgencyCard";
import ExpandableText from "@/components/tour/ExpandableText";
import DeparturePicker from "@/components/tour/DeparturePicker";
import ItineraryList from "@/components/tour/ItineraryList";
import IncludedList from "@/components/tour/IncludedList";
import ReviewsSection from "@/components/tour/ReviewsSection";
import BookingBar from "@/components/tour/BookingBar";

export default function TourScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, error, refetch } = useTour(id);

  const tour = data?.tour;
  const details = data?.details;

  const liked = useFavorites((s) => (tour ? s.ids.includes(tour.id) : false));
  const toggleFavorite = useFavorites((s) => s.toggle);

  const [departureId, setDepartureId] = useState<string | undefined>();
  const [showBar, setShowBar] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  if (isPending) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <BackHeader title="Tur" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !tour || !details) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <BackHeader title="Tur" />
        <View style={styles.center}>
          <EmptyState
            icon="search-outline"
            title="Tur topilmadi"
            text={
              isError && isApiError(error)
                ? error.message
                : "Bu tur mavjud emas yoki olib tashlangan."
            }
            actionLabel={isError ? "Qayta urinish" : "Orqaga"}
            onAction={() => (isError ? refetch() : router.back())}
          />
        </View>
      </SafeAreaView>
    );
  }

  const departures = details.departures;
  const firstAvailable = departures.find((d) => d.seatsLeft > 0);
  const selected = departures.find((d) => d.id === departureId) ?? firstAvailable;

  const discount = discountPercent(tour.price, tour.oldPrice);
  const categoryLabel = categoryOptions.find((o) => o.key === tour.category)?.label;

  const facts: Fact[] = [
    { icon: "time-outline", label: "Davomiyligi", value: `${tour.days} kun` },
    { icon: "bed-outline", label: "Yashash", value: details.hotel },
    { icon: "restaurant-outline", label: "Ovqat", value: details.meals },
    {
      icon: tour.country === "O'zbekiston" ? "bus-outline" : "airplane-outline",
      label: "Transport",
      value: details.transport,
    },
    { icon: "people-outline", label: "Guruh", value: details.groupSize },
    { icon: "language-outline", label: "Til", value: details.language },
  ];

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const past = e.nativeEvent.contentOffset.y > HERO_HEIGHT - insets.top - 60;
    setShowBar((prev) => (prev === past ? prev : past));
  };

  const onShare = () => {
    Share.share({ message: `${tour.title} — ${formatPrice(tour.price)}\n${tour.agency}` });
  };

  const openChat = async () => {
    if (!tour.agencyId) {
      notify("Suhbat ochib bo'lmadi", "Agentlik ma'lumoti topilmadi.");
      return;
    }
    setChatLoading(true);
    try {
      const conv: any = await startConversation({ agencyId: tour.agencyId, tourId: tour.id });
      const convId = str(conv?.id ?? conv?.conversation?.id ?? conv?.conversation_id);
      if (!convId) throw new Error("Suhbat ID topilmadi");
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      router.push({ pathname: "/chat/[id]", params: { id: convId } });
    } catch (e) {
      notify("Suhbat ochib bo'lmadi", isApiError(e) ? e.message : "Qayta urinib ko'ring.");
    } finally {
      setChatLoading(false);
    }
  };

  const onBook = () => {
    if (!selected) return;
    router.push({
      pathname: "/booking/[tourId]",
      params: { tourId: tour.id, departureId: selected.id },
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar style={showBar ? "dark" : "light"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <View>
          <Gallery images={details.gallery} />

          <View style={[styles.heroTop, { top: insets.top + 8 }]}>
            <RoundButton icon="chevron-back" onPress={() => router.back()} />
            <View style={styles.heroActions}>
              <RoundButton icon="share-social-outline" onPress={onShare} />
              <RoundButton
                icon={liked ? "heart" : "heart-outline"}
                color={liked ? colors.primary : undefined}
                onPress={() => toggleFavorite(tour.id)}
              />
            </View>
          </View>

          <View style={styles.badges}>
            {tour.hot && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Ionicons name="flame" size={12} color={colors.white} />
                <Text style={styles.badgeText}>Hot</Text>
              </View>
            )}
            {tour.trending && (
              <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
                <Ionicons name="trending-up" size={12} color={colors.white} />
                <Text style={styles.badgeText}>Trending</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.block}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.locRow}>
                  <Ionicons name="location-sharp" size={14} color={colors.primary} />
                  <Text style={styles.loc}>{tour.city}, {tour.country}</Text>
                  {categoryLabel && (
                    <View style={styles.cat}>
                      <Text style={styles.catText}>{categoryLabel}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.title}>{tour.title}</Text>
              </View>

              <View style={styles.priceColumn}>
                {tour.oldPrice ? (
                  <Text style={styles.oldPrice}>{formatPrice(tour.oldPrice)}</Text>
                ) : null}
                <Text style={styles.mainPrice}>{formatPrice(tour.price)}</Text>
                <Text style={styles.priceSub}>/ kishi</Text>
              </View>
            </View>

            <View style={styles.ratingRow}>
              {tour.reviews > 0 ? (
                <>
                  <Ionicons name="star" size={15} color={colors.star} />
                  <Text style={styles.rating}>{tour.rating.toFixed(1)}</Text>
                  <Text style={styles.muted}>({tour.reviews} sharh)</Text>
                </>
              ) : (
                <Text style={styles.muted}>Yangi tur</Text>
              )}
              <Text style={styles.muted}>·</Text>
              <Ionicons name="time-outline" size={15} color={colors.muted} />
              <Text style={styles.muted}>{tour.days} kun</Text>
            </View>
          </View>

          {(discount > 0 || tour.seatsLeft !== undefined) && (
            <View style={styles.banner}>
              <Ionicons name="flame" size={18} color={colors.primary} />
              <Text style={styles.bannerText}>
                {discount > 0 ? `-${discount}% chegirma` : "Qaynoq taklif"}
                {tour.seatsLeft !== undefined ? ` · Qolgan joy: ${tour.seatsLeft}` : ""}
              </Text>
            </View>
          )}

          <View style={{ marginTop: 20 }}>
            <QuickFacts facts={facts} />
          </View>

          <DetailSection title="Agentlik">
            <AgencyCard
              name={tour.agency}
              verified={tour.agencyVerified}
              rating={tour.agencyRating}
              onChat={chatLoading ? () => {} : openChat}
            />
          </DetailSection>

          {!!details.description && (
            <DetailSection title="Tur haqida">
              <ExpandableText text={details.description} />
            </DetailSection>
          )}

          <DetailSection title="Jo'nash sanalari">
            {departures.length > 0 ? (
              <DeparturePicker
                departures={departures}
                days={tour.days}
                selectedId={selected?.id}
                onSelect={setDepartureId}
              />
            ) : (
              <Text style={styles.muted}>Hozircha jo'nash sanalari e'lon qilinmagan.</Text>
            )}
          </DetailSection>

          {details.itinerary.length > 0 && (
            <DetailSection title="Tur dasturi">
              <ItineraryList items={details.itinerary} />
            </DetailSection>
          )}

          {(details.included.length > 0 || details.excluded.length > 0) && (
            <DetailSection title="Narx tarkibi">
              <IncludedList included={details.included} excluded={details.excluded} />
            </DetailSection>
          )}

          {details.reviews.length > 0 && (
            <DetailSection title="Sharhlar">
              <ReviewsSection rating={tour.rating} count={tour.reviews} reviews={details.reviews} />
            </DetailSection>
          )}
        </View>
      </ScrollView>

      <BookingBar
        price={tour.price}
        oldPrice={tour.oldPrice}
        disabled={!selected}
        onPress={onBook}
        onChat={openChat}
        chatLoading={chatLoading}
      />

      {showBar && (
        <View style={[styles.sticky, { paddingTop: insets.top + 6 }]}>
          <RoundButton dark icon="chevron-back" onPress={() => router.back()} />
          <Text style={styles.stickyTitle} numberOfLines={1}>{tour.title}</Text>
          <RoundButton
            dark
            icon={liked ? "heart" : "heart-outline"}
            color={liked ? colors.primary : undefined}
            onPress={() => toggleFavorite(tour.id)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center" },
  heroTop: {
    position: "absolute", left: 16, right: 16,
    flexDirection: "row", justifyContent: "space-between",
  },
  heroActions: { flexDirection: "row", gap: 10 },
  badges: { position: "absolute", left: 16, bottom: 44, flexDirection: "row", gap: 8 },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, height: 26, borderRadius: 13,
  },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  content: {
    marginTop: -28, paddingTop: 22,
    borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background,
  },
  block: { paddingHorizontal: 16, gap: 10 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  priceColumn: { alignItems: "flex-end", paddingTop: 4 },
  mainPrice: { fontSize: 20, fontWeight: "800", color: colors.primary },
  priceSub: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  oldPrice: { fontSize: 12, color: colors.muted, textDecorationLine: "line-through" },
  locRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  loc: { fontSize: 13, fontWeight: "600", color: colors.muted, flexShrink: 1 },
  cat: {
    marginLeft: 6, paddingHorizontal: 10, height: 24, borderRadius: 12,
    backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center",
  },
  catText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, lineHeight: 32 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  rating: { fontSize: 15, fontWeight: "800", color: colors.text },
  muted: { fontSize: 13, color: colors.muted },
  banner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginTop: 16, paddingHorizontal: 14, height: 46,
    borderRadius: 14, backgroundColor: colors.primarySoft,
  },
  bannerText: { fontSize: 14, fontWeight: "700", color: colors.primary },
  sticky: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 12, paddingBottom: 8,
    backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  stickyTitle: { flex: 1, fontSize: 16, fontWeight: "800", color: colors.text },
});