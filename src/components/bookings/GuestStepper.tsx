import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

type Props = {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

export default function GuestStepper({ label, hint, value, min, max, onChange }: Props) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {!!hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      <View style={styles.stepper}>
        <Pressable
          style={[styles.step, value <= min && { opacity: 0.4 }]}
          disabled={value <= min}
          onPress={() => onChange(value - 1)}
        >
          <Ionicons name="remove" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.count}>{value}</Text>
        <Pressable
          style={[styles.step, value >= max && { opacity: 0.4 }]}
          disabled={value >= max}
          onPress={() => onChange(value + 1)}
        >
          <Ionicons name="add" size={18} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  label: { fontSize: 15, fontWeight: "700", color: colors.text },
  hint: { fontSize: 12, color: colors.muted, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 14 },
  step: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center",
  },
  count: { minWidth: 24, textAlign: "center", fontSize: 18, fontWeight: "800", color: colors.text },
});