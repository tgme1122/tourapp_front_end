import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { AgencyStatus } from "@/types/agency";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const config: Record<AgencyStatus, { label: string; icon: IconName; color: string; bg: string }> = {
  pending: { label: "Kutilmoqda", icon: "time", color: colors.warning, bg: colors.warningSoft },
  approved: { label: "Tasdiqlangan", icon: "checkmark-circle", color: colors.success, bg: colors.successSoft },
  rejected: { label: "Rad etilgan", icon: "close-circle", color: colors.danger, bg: colors.dangerSoft },
  suspended: { label: "Bloklangan", icon: "ban", color: "#4B5563", bg: "#E5E7EB" },
};

export default function AgencyStatusBadge({ status }: { status: AgencyStatus }) {
  const c = config[status] ?? config.pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon} size={13} color={c.color} />
      <Text style={[styles.text, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start",
    paddingHorizontal: 10, height: 26, borderRadius: 13,
  },
  text: { fontSize: 12, fontWeight: "700" },
});