import {
  View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radius, shadows } from "@/constants/theme";
import { useAgencyCounts } from "@/hooks/useAdminApi";
import { isApiError } from "@/services/api";
import { AgencyStatus } from "@/types/agency";
import EmptyState from "@/components/ui/EmptyState";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const items: { key: AgencyStatus; label: string; icon: IconName; color: string; bg: string }[] = [
  { key: "pending", label: "Kutilayotgan", icon: "hourglass-outline", color: colors.warning, bg: colors.warningSoft },
  { key: "approved", label: "Tasdiqlangan", icon: "checkmark-circle-outline", color: colors.success, bg: colors.successSoft },
  { key: "rejected", label: "Rad etilgan", icon: "close-circle-outline", color: colors.danger, bg: colors.dangerSoft },
  { key: "suspended", label: "Bloklangan", icon: "ban-outline", color: "#4B5563", bg: "#E5E7EB" },
];

export default function AdminHome() {
  const { data, isPending, isError, error, refetch, isRefetching } = useAgencyCounts();

  const openList = (status: AgencyStatus) =>
    router.navigate({ pathname: "/admin/agencies", params: { status } });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.header}>Admin panel</Text>

      {isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError || !data ? (
        <View style={styles.center}>
          <EmptyState
            icon="cloud-offline-outline"
            title="Yuklab bo'lmadi"
            text={isApiError(error) ? error.message : "Qayta urinib ko'ring."}
            actionLabel="Qayta urinish"
            onAction={() => refetch()}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {data.pending > 0 && (
            <Pressable style={styles.alert} onPress={() => openList("pending")}>
              <View style={styles.alertIcon}>
                <Ionicons name="alert-circle" size={22} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>{data.pending} ta ariza ko'rib chiqilishini kutmoqda</Text>
                <Text style={styles.alertText}>Ko'rib chiqish uchun bosing</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </Pressable>
          )}

          <Text style={styles.section}>Agentliklar</Text>
          <View style={styles.grid}>
            {items.map((i) => (
              <Pressable
                key={i.key}
                style={[styles.card, { backgroundColor: i.bg }]}
                onPress={() => openList(i.key)}
              >
                <Ionicons name={i.icon} size={24} color={i.color} />
                <Text style={[styles.count, { color: i.color }]}>{data[i.key]}</Text>
                <Text style={styles.label}>{i.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    fontSize: 28, fontWeight: "800", color: colors.text, letterSpacing: -0.5,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  center: { flex: 1, justifyContent: "center" },
  content: { padding: 16, gap: 14 },
  alert: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.xl,
    backgroundColor: colors.primarySoft, ...shadows.soft,
  },
  alertIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  alertTitle: { fontSize: 14, fontWeight: "800", color: colors.text },
  alertText: { fontSize: 12, color: colors.muted, marginTop: 2 },
  section: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { width: "47.5%", padding: 16, gap: 6, borderRadius: radius.xl, ...shadows.soft },
  count: { fontSize: 32, fontWeight: "800" },
  label: { fontSize: 13, fontWeight: "600", color: colors.text },
});