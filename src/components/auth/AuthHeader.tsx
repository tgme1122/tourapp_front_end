import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import Logo from "@/components/ui/Logo";

type Props = { title: string; subtitle: string; onBack?: () => void };

export default function AuthHeader({ title, subtitle, onBack }: Props) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable style={styles.back} onPress={onBack} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
      ) : null}
      <Logo size={64} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10, alignItems: "flex-start" },
  back: {
    width: 40, height: 40, borderRadius: 20, marginBottom: 4,
    backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 32, fontWeight: "800", color: colors.text, marginTop: 14, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 22, color: colors.muted },
});