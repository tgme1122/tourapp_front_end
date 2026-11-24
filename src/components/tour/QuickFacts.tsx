import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export type Fact = { icon: IconName; label: string; value: string };

export default function QuickFacts({ facts }: { facts: Fact[] }) {
  const visibleFacts = facts.filter((f) => f.value && f.value !== "—");

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {visibleFacts.map((f) => (
        <View key={f.label} style={styles.pill}>
          <View style={styles.iconCircle}>
            <Ionicons name={f.icon} size={15} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.label}>{f.label}</Text>
            <Text style={styles.value} numberOfLines={1}>{f.value}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 8 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 10, fontWeight: "600", color: colors.muted },
  value: { fontSize: 13, fontWeight: "700", color: colors.text, maxWidth: 140 },
});
