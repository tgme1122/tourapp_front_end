import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "@/constants/theme";

type Props = { name: string; verified: boolean; rating: number; onChat: () => void };

export default function AgencyCard({ name, verified, rating, onChat }: Props) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {verified && <Ionicons name="checkmark-circle" size={16} color={colors.verified} />}
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={13} color={colors.star} />
          <Text style={styles.rating}>{rating}</Text>
          <Text style={styles.muted}>
            · {verified ? "Tasdiqlangan agentlik" : "Agentlik"}
          </Text>
        </View>
      </View>

      <Pressable style={styles.chat} onPress={onChat}>
        <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
        <Text style={styles.chatText}>Yozish</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl,
    backgroundColor: colors.background,
    ...shadows.soft,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "800", color: colors.primary },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  name: { fontSize: 15, fontWeight: "800", color: colors.text, flexShrink: 1 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rating: { fontSize: 12, fontWeight: "700", color: colors.text },
  muted: { fontSize: 12, color: colors.muted },
  chat: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, height: 40, borderRadius: radius.pill, backgroundColor: colors.primarySoft,
  },
  chatText: { fontSize: 13, fontWeight: "700", color: colors.primary },
});