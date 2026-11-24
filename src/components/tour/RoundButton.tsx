import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = { icon: IconName; onPress: () => void; color?: string; dark?: boolean };

export default function RoundButton({ icon, onPress, color, dark }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={[styles.btn, dark ? styles.dark : styles.light]}
    >
      <Ionicons name={icon} size={22} color={color ?? (dark ? colors.text : colors.white)} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  light: { backgroundColor: "rgba(0,0,0,0.38)" },
  dark: { backgroundColor: colors.surface },
});