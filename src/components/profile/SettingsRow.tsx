import { View, Text, Pressable, Switch, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: IconName;
  label: string;
  value?: string | number;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  last?: boolean;
};

export default function SettingsRow({
  icon, label, value, switchValue, onSwitchChange, onPress, last,
}: Props) {
  const isSwitch = switchValue !== undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.divider,
        pressed && { backgroundColor: colors.surface },
      ]}
    >
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={19} color={colors.primary} />
      </View>

      <Text style={styles.label}>{label}</Text>

      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.white}
        />
      ) : (
        <View style={styles.right}>
          {value !== undefined && <Text style={styles.value}>{value}</Text>}
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, height: 56,
  },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  iconBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  label: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.text },
  right: { flexDirection: "row", alignItems: "center", gap: 6 },
  value: { fontSize: 15, fontWeight: "600", color: colors.muted },
});