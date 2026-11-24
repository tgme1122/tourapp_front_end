import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, shadows } from "@/constants/theme";
import { useUnreadNotifications } from "@/hooks/useNotificationsApi";

type Props = { title: string; subtitle?: string };

export default function ScreenHeader({ title, subtitle }: Props) {
  const unread = useUnreadNotifications().data ?? 0;
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Pressable style={styles.bell} onPress={() => router.push("/notifications")} hitSlop={4}>
        <Ionicons name="notifications-outline" size={22} color={colors.text} />
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12,
    backgroundColor: colors.background,
  },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
  bell: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center", ...shadows.soft,
  },
  badge: {
    position: "absolute", top: 2, right: 2,
    minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4,
    backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.background,
    alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: "700" },
});
