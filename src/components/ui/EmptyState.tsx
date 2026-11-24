import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: IconName;
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({ icon, title, text, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.circle}>
        <Ionicons name={icon} size={36} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      {actionLabel && (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingHorizontal: 32, gap: 8 },
  circle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.primarySoft,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "800", color: colors.text },
  text: { fontSize: 14, color: colors.muted, textAlign: "center", lineHeight: 20 },
  button: {
    marginTop: 12, paddingHorizontal: 24, height: 46, borderRadius: 14,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
  },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: "700" },
});