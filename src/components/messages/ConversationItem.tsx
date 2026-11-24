import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { Conversation } from "@/types/chat";
import Avatar from "@/components/ui/Avatar";

type Props = { item: Conversation; onPress: () => void };

export default function ConversationItem({ item, onPress }: Props) {
  const unread = item.unread > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surface }]}
    >
      <Avatar initials={item.initials} online={item.online} />

      <View style={styles.body}>
        <View style={styles.line}>
          <View style={styles.nameWrap}>
            <Text style={styles.name} numberOfLines={1}>{item.agency}</Text>
            {item.verified && (
              <Ionicons name="checkmark-circle" size={15} color={colors.verified} />
            )}
          </View>
          <Text style={[styles.time, unread && styles.timeUnread]}>{item.time}</Text>
        </View>

        <Text style={styles.tour} numberOfLines={1}>{item.tourTitle}</Text>

        <View style={styles.line}>
          <Text style={[styles.last, unread && styles.lastUnread]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {unread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  body: { flex: 1, gap: 3 },
  line: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  nameWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 5 },
  name: { fontSize: 16, fontWeight: "800", color: colors.text, flexShrink: 1 },
  time: { fontSize: 12, color: colors.muted },
  timeUnread: { color: colors.primary, fontWeight: "700" },
  tour: { fontSize: 12, fontWeight: "600", color: colors.primary },
  last: { flex: 1, fontSize: 14, color: colors.muted },
  lastUnread: { color: colors.text, fontWeight: "600" },
  badge: {
    minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: "700" },
});