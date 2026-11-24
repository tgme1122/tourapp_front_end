import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/theme";
import { useAdminTour, useTourBookings } from "@/hooks/useAdminApi";
import { isApiError } from "@/services/api";
import { AdminBooking } from "@/types/admin";
import BackHeader from "@/components/ui/BackHeader";
import EmptyState from "@/components/ui/EmptyState";
import PrimaryButton from "@/components/ui/PrimaryButton";
import DataTable, { Column } from "@/components/admin/DataTable";
import TourStatusBadge, { money } from "@/components/admin/TourStatusBadge";

const BOOKING_COLUMNS: Column<AdminBooking>[] = [
  { key: "name", title: "Mijoz", width: 170, value: (b) => b.customer_name },
  { key: "phone", title: "Telefon", width: 140, value: (b) => b.phone },
  { key: "email", title: "Email", width: 210, value: (b) => b.email },
  { key: "guests", title: "Mehmon", width: 80, align: "right", value: (b) => String(b.guests) },
  { key: "departure", title: "Jo'nash", width: 110, value: (b) => b.departure },
  { key: "total", title: "Summa", width: 140, align: "right", value: (b) => money(b.total_price) },
  { key: "status", title: "Holat", width: 110, value: (b) => b.status },
];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function AdminTourScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, isError, error, refetch } = useAdminTour(id);
  const bookings = useTourBookings(id);

  if (isPending) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BackHeader title="Tur" />
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BackHeader title="Tur" />
        <View style={styles.center}>
          <EmptyState
            icon="cloud-offline-outline"
            title="Yuklab bo'lmadi"
            text={isApiError(error) ? error.message : "Qayta urinib ko'ring."}
            actionLabel="Qayta urinish"
            onAction={() => refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const { tour, stats } = data;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BackHeader title={tour.title || "Tur"} />
      <ScrollView contentContainerStyle={styles.content}>
        {data.gallery.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {data.gallery.map((u) => (
              <Image key={u} source={{ uri: u }} style={styles.photo} />
            ))}
          </ScrollView>
        )}

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>{tour.title}</Text>
            <TourStatusBadge status={tour.status} />
          </View>
          <Text style={styles.muted}>
            {[tour.city, tour.country].filter(Boolean).join(", ")}{tour.days ? ` · ${tour.days} kun` : ""}
          </Text>
          <Text style={styles.muted}>Agentlik: {tour.agency_name || "—"}</Text>
          <Text style={styles.price}>{money(tour.price)}</Text>
          {!!data.description && <Text style={styles.body}>{data.description}</Text>}
          {!!tour.agency_id && (
            <PrimaryButton
              label="Agentlikning turlari"
              onPress={() => router.push({ pathname: "/admin/tours", params: { agencyId: tour.agency_id } })}
            />
          )}
        </View>

        <Text style={styles.section}>Bronlar statistikasi</Text>
        <View style={styles.statsGrid}>
          <Stat label="Kutilmoqda" value={String(stats.pending)} />
          <Stat label="Tasdiqlangan" value={String(stats.confirmed)} />
          <Stat label="Yakunlangan" value={String(stats.completed)} />
          <Stat label="Bekor" value={String(stats.cancelled)} />
          <Stat label="Mehmonlar" value={String(stats.guests)} />
          <Stat label="Daromad" value={money(stats.revenue)} />
        </View>

        {data.departures.length > 0 && (
          <>
            <Text style={styles.section}>Jo'nashlar</Text>
            <View style={styles.card}>
              {data.departures.map((d) => (
                <View key={d.id} style={styles.rowBetween}>
                  <Text style={styles.body}>{d.date}</Text>
                  <Text style={styles.muted}>Bo'sh joy: {d.seats_left ?? "—"}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {data.itinerary.length > 0 && (
          <>
            <Text style={styles.section}>Dastur</Text>
            <View style={styles.card}>
              {data.itinerary.map((d) => (
                <View key={d.day} style={{ gap: 2 }}>
                  <Text style={styles.itTitle}>{d.day}-kun · {d.title}</Text>
                  {!!d.text && <Text style={styles.body}>{d.text}</Text>}
                </View>
              ))}
            </View>
          </>
        )}

        {data.reviews.length > 0 && (
          <>
            <Text style={styles.section}>Sharhlar ({data.reviews.length})</Text>
            <View style={styles.card}>
              {data.reviews.map((r) => (
                <View key={r.id} style={{ gap: 2 }}>
                  <Text style={styles.itTitle}>{r.author} · {r.rating}★ {r.date ? `· ${r.date}` : ""}</Text>
                  {!!r.text && <Text style={styles.body}>{r.text}</Text>}
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.section}>Bronlar jadvali</Text>
      </ScrollView>

      <View style={styles.table}>
        <DataTable
          columns={BOOKING_COLUMNS}
          rows={bookings.data ?? []}
          keyOf={(b) => b.id}
          loading={bookings.isPending}
          empty={
            <EmptyState
              icon="ticket-outline"
              title="Bronlar yo'q"
              text={bookings.isError ? "Bronlarni yuklab bo'lmadi." : "Bu tur uchun hali bron qilinmagan."}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center" },
  content: { padding: 16, gap: 12 },
  photo: { width: 220, height: 140, borderRadius: 14, backgroundColor: colors.surface },
  card: { padding: 16, gap: 10, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  title: { flex: 1, fontSize: 18, fontWeight: "800", color: colors.text },
  muted: { fontSize: 13, color: colors.muted },
  price: { fontSize: 20, fontWeight: "800", color: colors.primary },
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  section: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 8 },
  itTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stat: { width: "31%", flexGrow: 1, padding: 12, borderRadius: 14, backgroundColor: colors.surface, gap: 2 },
  statValue: { fontSize: 16, fontWeight: "800", color: colors.text },
  statLabel: { fontSize: 11, color: colors.muted },
  table: { height: 260, borderTopWidth: 1, borderTopColor: colors.border },
});

