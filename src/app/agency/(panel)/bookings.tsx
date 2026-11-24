import { useMemo, useState } from "react";
import {
  View, Text, FlatList, Pressable, ScrollView, RefreshControl, ActivityIndicator, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { router } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { BookingCardSkeleton } from "@/components/ui/Skeleton";
import { useAgency } from "@/hooks/useAgency";
import { BookingFilter, useAgencyBookings } from "@/hooks/useAgencyBookingsApi";
import { useBookingDecisions } from "@/hooks/useBookingDecisions";
import { isApiError } from "@/services/api";
import AgencyBookingCard from "@/components/agency/AgencyBookingCard";
import ApprovalNotice from "@/components/agency/ApprovalNotice";
import ReasonSheet from "@/components/admin/ReasonSheet";
import EmptyState from "@/components/ui/EmptyState";

const TABS: { key: BookingFilter; label: string }[] = [
  { key: "confirmed", label: "Tasdiqlangan" },
  { key: "completed", label: "Yakunlangan" },
  { key: "cancelled", label: "Bekor qilingan" },
  { key: "refunded", label: "Qaytarilgan" },
  { key: "all", label: "Hammasi" },
];

export default function AgencyBookingsScreen() {
  const { isApproved, isManager, isPending: agencyLoading } = useAgency();
  const [status, setStatus] = useState<BookingFilter>("confirmed");

  const {
    data, isPending, isError, error, refetch, isRefetching,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useAgencyBookings(status, isApproved);

  const decisions = useBookingDecisions();
  const bookings = useMemo(() => data?.pages.flat() ?? [], [data]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Bronlar" />

      {agencyLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !isApproved ? (
        <ApprovalNotice />
      ) : (
        <>
          {!isManager && (
            <Text style={styles.readonly}>Faqat ko'rish. Bronlarni menejer boshqaradi.</Text>
          )}

          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabs}
            >
              {TABS.map((t) => {
                const active = t.key === status;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setStatus(t.key)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <FlatList
            data={bookings}
            keyExtractor={(b) => b.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
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
              <AgencyBookingCard
                booking={item}
                canManage={isManager}
                busy={decisions.busyId === item.id}
                onPress={() => router.push({ pathname: "/agency/booking/[id]", params: { id: item.id } })}
                onCancel={() => decisions.onCancel(item)}
              />
            )}
            ListFooterComponent={
              isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={{ margin: 16 }} /> : null
            }
            ListEmptyComponent={
              isPending ? (
                <View style={{ gap: 14, paddingTop: 4 }}>
                  <BookingCardSkeleton />
                  <BookingCardSkeleton />
                  <BookingCardSkeleton />
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
                  icon="ticket-outline"
                  title="Bronlar yo'q"
                  text="Bu bo'limda hozircha bronlar mavjud emas."
                />
              )
            }
          />
        </>
      )}

      <ReasonSheet {...decisions.sheetProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  readonly: { paddingHorizontal: 16, paddingTop: 10, fontSize: 12, color: colors.muted },
  center: { flex: 1, justifyContent: "center", paddingVertical: 40 },
  tabs: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 15, height: 38, borderRadius: radius.pill, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center",
    ...shadows.soft,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "700", color: colors.text },
  chipTextActive: { color: colors.white },
  list: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 },
});