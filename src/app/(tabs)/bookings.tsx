import { useMemo, useState } from "react";
import {
  View, Text, FlatList, Pressable, RefreshControl, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Href } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { BookingCardSkeleton } from "@/components/ui/Skeleton";
import { useBookingsList, useCancelBooking } from "@/hooks/useBookingsApi";
import { useMyReviews, useSubmitReview } from "@/hooks/useReviewsApi";
import { isApiError } from "@/services/api";
import { confirmAction, notify } from "./../../utils/confirm";
import { Booking } from "@/types/booking";
import ScreenHeader from "@/components/ui/ScreenHeader";
import EmptyState from "@/components/ui/EmptyState";
import BookingCard from "@/components/bookings/BookingCard";
import ReviewSheet from "@/components/bookings/ReviewSheet";

type TabKey = "active" | "completed" | "cancelled";

const tabs: { key: TabKey; label: string }[] = [
  { key: "active", label: "Faol" },
  { key: "completed", label: "Yakunlangan" },
  { key: "cancelled", label: "Bekor qilingan" },
];

const matches = (b: Booking, tab: TabKey) => {
  if (tab === "active") return b.status === "pending_payment" || b.status === "confirmed";
  if (tab === "completed") return b.status === "completed";
  return b.status === "cancelled" || b.status === "expired" || b.status === "refunded";
};

export default function BookingsScreen() {
  const { data, isPending, isError, error, refetch, isRefetching } = useBookingsList();
  const cancel = useCancelBooking();
  const bookings = data ?? [];

  const { data: myReviews = [] } = useMyReviews();
  const submitReviewMutation = useSubmitReview();

  const [tab, setTab] = useState<TabKey>("active");
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);

  const list = useMemo(() => bookings.filter((b) => matches(b, tab)), [bookings, tab]);
  const reviewedTourIds = useMemo(() => new Set(myReviews.map((r) => r.tourId)), [myReviews]);
  const currentReview = myReviews.find((r) => r.tourId === reviewTarget?.tourId);

  const openTour = (b: Booking) =>
    router.push({ pathname: "/tour/[id]", params: { id: b.tourId } });

  const cancelBooking = async (b: Booking) => {
    const ok = await confirmAction({
      title: "Bronni bekor qilish",
      message: `"${b.title}" bronini bekor qilmoqchimisiz?`,
      confirmText: "Ha, bekor qilish",
      cancelText: "Yo'q",
      destructive: true,
    });
    if (!ok) return;

    cancel.mutate(b.id, {
      onError: (e) =>
        notify("Bekor qilib bo'lmadi", isApiError(e) ? e.message : "Qayta urinib ko'ring."),
    });
  };

  const handleAction = (b: Booking) => {
    if (b.status === "pending_payment") {
      router.push(`/booking/pay/${b.id}` as Href);
      return;
    }
    if (b.status === "completed") return setReviewTarget(b);
    openTour(b);
  };

  const submitReview = (rating: number, text: string) => {
    if (!reviewTarget) return;
    submitReviewMutation.mutate(
      { tourId: reviewTarget.tourId, rating, text, isEdit: !!currentReview },
      {
        onSuccess: () => setReviewTarget(null),
        onError: (e) =>
          notify("Sharhni yuborib bo'lmadi", isApiError(e) ? e.message : "Qayta urinib ko'ring."),
      }
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Bronlar" />

      <View style={styles.tabs}>
        {tabs.map((t) => {
          const active = t.key === tab;
          const count = bookings.filter((b) => matches(b, t.key)).length;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {t.label} ({count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item, index }) => (
          <BookingCard
            booking={item}
            index={index}
            reviewed={reviewedTourIds.has(item.tourId)}
            busy={cancel.isPending && cancel.variables === item.id}
            onPress={() => openTour(item)}
            onAction={() => handleAction(item)}
            onSecondary={() => cancelBooking(item)}
          />
        )}
        ListEmptyComponent={
          isPending ? (
            <View style={{ gap: 14 }}>
              <BookingCardSkeleton />
              <BookingCardSkeleton />
              <BookingCardSkeleton />
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
                icon="ticket-outline"
                title="Bronlar yo'q"
                text="Bu bo'limda hozircha bronlar mavjud emas. Yangi sayohatni tanlab ko'ring."
                actionLabel="Turlarni ko'rish"
                onAction={() => router.push("/")}
              />
            </View>
          )
        }
      />

      <ReviewSheet
        visible={reviewTarget !== null}
        booking={reviewTarget}
        initial={currentReview}
        submitting={submitReviewMutation.isPending}
        onClose={() => setReviewTarget(null)}
        onSubmit={submitReview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  tabs: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  chip: {
    paddingHorizontal: 15, height: 38, borderRadius: radius.pill,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
    ...shadows.soft,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "700", color: colors.text },
  chipTextActive: { color: colors.white },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 14, flexGrow: 1 },
  empty: { flex: 1, justifyContent: "center", paddingVertical: 60 },
});