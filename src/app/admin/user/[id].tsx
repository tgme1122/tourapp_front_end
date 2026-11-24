import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/theme";
import { useAdminUser } from "@/hooks/useAdminApi";
import { isApiError } from "@/services/api";
import { UserTourItem } from "@/types/admin";
import BackHeader from "@/components/ui/BackHeader";
import EmptyState from "@/components/ui/EmptyState";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { money } from "@/components/admin/TourStatusBadge";

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <>
      <Text style={styles.section}>{title} ({count})</Text>
      <View style={styles.card}>{children}</View>
    </>
  );
}

function TourLine({ t }: { t: UserTourItem }) {
  return (
    <Pressable
      style={styles.rowBetween}
      onPress={() => router.push({ pathname: "/admin/tour/[id]", params: { id: t.id } })}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.itTitle} numberOfLines={1}>{t.title}</Text>
        <Text style={styles.muted}>{[t.city, t.status].filter(Boolean).join(" · ")}</Text>
      </View>
      <Text style={styles.muted}>{money(t.price)}</Text>
    </Pressable>
  );
}

export default function AdminUserScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, isError, error, refetch } = useAdminUser(id);

  if (isPending) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BackHeader title="Foydalanuvchi" />
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BackHeader title="Foydalanuvchi" />
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

  const { user } = data;
  const name = `${user.first_name} ${user.last_name}`.trim() || user.email;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BackHeader title={name} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.muted}>{user.email}</Text>
          {!!user.phone && <Text style={styles.muted}>{user.phone}</Text>}
          <Text style={styles.muted}>
            Rol: {user.role} · {user.is_active ? "Faol" : "Bloklangan"} · Qo'shilgan: {user.created_at.slice(0, 10)}
          </Text>
          {!!user.agency_id && (
            <PrimaryButton
              label={`Agentlik: ${user.agency_name || "ochish"}`}
              onPress={() => router.push({ pathname: "/admin/agency/[id]", params: { id: user.agency_id! } })}
            />
          )}
        </View>

        <Section title="Turlari" count={data.tours.length}>
          {data.tours.map((t) => <TourLine key={t.id} t={t} />)}
        </Section>

        <Section title="Bronlar" count={data.bookings.length}>
          {data.bookings.map((b) => (
            <View key={b.id} style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itTitle} numberOfLines={1}>{b.tour_title || "Tur"}</Text>
                <Text style={styles.muted}>{b.created_at} · {b.guests} kishi · {b.status}</Text>
              </View>
              <Text style={styles.muted}>{money(b.total_price)}</Text>
            </View>
          ))}
        </Section>

        <Section title="Sharhlar" count={data.reviews.length}>
          {data.reviews.map((r) => (
            <View key={r.id} style={{ gap: 2 }}>
              <Text style={styles.itTitle}>{r.tour_title || "Tur"} · {r.rating}★ · {r.created_at}</Text>
              {!!r.text && <Text style={styles.body}>{r.text}</Text>}
            </View>
          ))}
        </Section>

        <Section title="Saqlangan turlar" count={data.saved_tours.length}>
          {data.saved_tours.map((t) => <TourLine key={t.id} t={t} />)}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center" },
  content: { padding: 16, gap: 12 },
  card: { padding: 16, gap: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  title: { fontSize: 18, fontWeight: "800", color: colors.text },
  muted: { fontSize: 13, color: colors.muted },
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  section: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 8 },
  itTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
});

