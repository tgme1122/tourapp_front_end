import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { BookingStatus } from "@/types/booking";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const config: Record<BookingStatus, { label: string; icon: IconName; color: string; bg: string }> = {
  pending_payment: { label: "To'lov kutilmoqda", icon: "card-outline", color: colors.warning, bg: colors.warningSoft },
  confirmed: { label: "Tasdiqlangan", icon: "checkmark-circle", color: colors.success, bg: colors.successSoft },
  completed: { label: "Yakunlangan", icon: "checkmark-done", color: colors.muted, bg: colors.surface },
  cancelled: { label: "Bekor qilingan", icon: "close-circle", color: colors.danger, bg: colors.dangerSoft },
  expired: { label: "Muddati tugagan", icon: "hourglass-outline", color: "#4B5563", bg: "#E5E7EB" },
  refunded: { label: "Qaytarilgan", icon: "return-down-back", color: colors.verified, bg: "#E8F0FE" },
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  const c = config[status] ?? config.pending_payment;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon} size={13} color={c.color} />
      <Text style={[styles.text, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, height: 26, borderRadius: 13,
  },
  text: { fontSize: 12, fontWeight: "700" },
});