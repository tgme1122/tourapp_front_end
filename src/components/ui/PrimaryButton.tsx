import { Pressable, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline";
  icon?: IconName;
};

export default function PrimaryButton({
  label, onPress, loading, disabled, variant = "primary", icon,
}: Props) {
  const outline = variant === "outline";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        outline ? styles.outline : styles.primary,
        disabled && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? colors.primary : colors.white} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={20} color={outline ? colors.text : colors.white} />}
          <Text style={[styles.text, outline && { color: colors.text }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 54, borderRadius: radius.pill, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 10,
  },
  primary: { backgroundColor: colors.primary, ...shadows.soft },
  outline: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, ...shadows.soft },
  text: { fontSize: 16, fontWeight: "700", color: colors.white },
});