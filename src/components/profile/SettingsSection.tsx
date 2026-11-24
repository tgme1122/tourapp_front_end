import { View, Text, StyleSheet } from "react-native";
import { colors, radius, shadows } from "@/constants/theme";

type Props = { title: string; children: React.ReactNode };

export default function SettingsSection({ title, children }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 20 },
  title: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 8 },
  card: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl,
    backgroundColor: colors.background, overflow: "hidden",
    ...shadows.soft,
  },
});