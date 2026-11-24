import { useState } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "@/constants/theme";
import { useAgency } from "@/hooks/useAgency";
import { useAgencyReports } from "@/hooks/useAgencyApi";
import { isApiError } from "@/services/api";
import { fillSeries, KpiGrid, PeriodKey, PeriodTabs, rangeFor, RevenueHero, TopToursCard,
  ToursSummary, TrendChart, BookingBreakdown } from "@/components/agency/reports/ReportWidgets";
import AgencyStatusCard from "@/components/agency/AgencyStatusCard";
import EmptyState from "@/components/ui/EmptyState";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { Skeleton } from "@/components/ui/Skeleton";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const ACTIONS: { icon: IconName; label: string; href: string }[] = [
  { icon: "map-outline", label: "Turlar", href: "/agency/tours" },
  { icon: "ticket-outline", label: "Bronlar", href: "/agency/bookings" },
  { icon: "people-outline", label: "Xodimlar", href: "/agency/members" },
  { icon: "document-text-outline", label: "Hujjatlar", href: "/agency/documents" },
];

function ReportsSkeleton() {
  return (
    <View style={{ gap: 16 }}>
      <Skeleton width="100%" height={170} borderRadius={radius.xl} />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Skeleton width="48%" height={120} borderRadius={radius.xl} />
        <Skeleton width="48%" height={120} borderRadius={radius.xl} />
      </View>
      <Skeleton width="100%" height={240} borderRadius={radius.xl} />
    </View>
  );
}

export default function AgencyDashboard() {
  const { agency, agencyRole, isOwner, isApproved, isPending, isError, error, refetch } = useAgency();
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const range = rangeFor(period);
  const reports = useAgencyReports({ from: range.from, to: range.to }, range.group, isOwner && isApproved);

  // Menejerga bu ekran yo'q
  if (agencyRole && !isOwner) return <Redirect href="/agency/tours" />;

  const go = (href: string) => router.push(href as never);
  const ov = reports.overview.data;
  const reportError = reports.overview.error;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Asosiy" subtitle={`${agency?.name ?? "Agentlik"} · Agentlik egasi`} />

      {isPending ? (
        <View style={styles.content}><ReportsSkeleton /></View>
      ) : isError || !agency ? (
        <View style={styles.center}>
          <EmptyState
            icon="cloud-offline-outline"
            title="Yuklab bo'lmadi"
            text={isApiError(error) ? error.message : "Agentlik ma'lumoti topilmadi."}
            actionLabel="Qayta urinish"
            onAction={() => refetch()}
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={reports.isRefetching}
              onRefresh={() => { refetch(); if (isApproved) reports.refetch(); }}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {!isApproved && (
            <>
              <AgencyStatusCard status={agency.status} reason={agency.rejection_reason} />
              <Pressable style={styles.notice} onPress={() => go("/agency/documents")}>
                <Ionicons name="document-attach-outline" size={22} color={colors.primary} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.noticeTitle}>Hujjatlarni tekshiring</Text>
                  <Text style={styles.noticeText}>
                    Hisobotlar agentlik tasdiqlangandan keyin ochiladi.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
              </Pressable>
            </>
          )}

          <View style={styles.actions}>
            {ACTIONS.map((a) => (
              <Pressable key={a.label} style={styles.action} onPress={() => go(a.href)}>
                <View style={styles.actionIcon}>
                  <Ionicons name={a.icon} size={22} color={colors.primary} />
                </View>
                <Text style={styles.actionText} numberOfLines={1}>{a.label}</Text>
              </Pressable>
            ))}
          </View>

          {isApproved && (
            <>
              <View style={styles.sectionHead}>
                <Text style={styles.section}>Hisobotlar</Text>
              </View>
              <PeriodTabs value={period} onChange={setPeriod} />

              {reports.overview.isPending ? (
                <ReportsSkeleton />
              ) : reportError || !ov ? (
                <EmptyState
                  icon="stats-chart-outline"
                  title="Hisobotni yuklab bo'lmadi"
                  text={isApiError(reportError) ? reportError.message : "Qayta urinib ko'ring."}
                  actionLabel="Qayta urinish"
                  onAction={() => reports.refetch()}
                />
              ) : (
                <>
                  <RevenueHero data={ov} />

                  {ov.pending_now > 0 && (
                    <Pressable style={styles.alert} onPress={() => go("/agency/bookings")}>
                      <View style={styles.alertIcon}>
                        <Ionicons name="notifications" size={18} color={colors.white} />
                      </View>
                      <Text style={styles.alertText}>
                        {ov.pending_now} ta bron bo'yicha to'lov kutilmoqda
                      </Text>
                      <Ionicons name="chevron-forward" size={18} color={colors.warning} />
                    </Pressable>
                  )}

                  <KpiGrid data={ov} />

                  {reports.series.data && (
                    <TrendChart
                      points={fillSeries(reports.series.data, range.from, range.to, range.group)}
                    />
                  )}

                  <BookingBreakdown data={ov} />

                  {reports.top.data && (
                    <TopToursCard
                      tours={reports.top.data}
                      onPress={(id) => router.push({ pathname: "/agency/tour/[id]", params: { id } })}
                    />
                  )}

                  <ToursSummary data={ov} onPress={() => go("/agency/tours")} />
                </>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center" },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  notice: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
  },
  noticeTitle: { fontSize: 14, fontWeight: "800", color: colors.text },
  noticeText: { fontSize: 12, color: colors.muted },
  actions: { flexDirection: "row", gap: 10 },
  action: { flex: 1, alignItems: "center", gap: 6 },
  actionIcon: {
    width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center",
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, ...shadows.soft,
  },
  actionText: { fontSize: 12, fontWeight: "700", color: colors.text },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  section: { fontSize: 18, fontWeight: "800", color: colors.text },
  alert: {
    flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: radius.xl,
    backgroundColor: colors.warningSoft,
  },
  alertIcon: {
    width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center",
    backgroundColor: colors.warning,
  },
  alertText: { flex: 1, fontSize: 13, fontWeight: "700", color: colors.text },
});
