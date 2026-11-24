import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

type Props = { title: string; subtitle?: string; onPress?: () => void };

export default function SectionHeader({ title, subtitle, onPress }: Props) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Pressable style={styles.link} onPress={onPress}>
        <Text style={styles.linkText}>Barchasi</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "flex-start",
    paddingHorizontal: 16, marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
  link: { flexDirection: "row", alignItems: "center", gap: 2, paddingTop: 4 },
  linkText: { fontSize: 13, fontWeight: "700", color: colors.primary },
});