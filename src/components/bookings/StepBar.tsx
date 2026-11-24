import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

const STEPS = ["Parametrlar", "Sayohatchilar", "Tasdiqlash", "To'lov"];

export default function StepBar({ current }: { current: number }) {
  return (
    <View style={styles.row}>
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View key={label} style={styles.item}>
            <View style={[styles.dot, (done || active) && styles.dotOn]}>
              {done ? (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              ) : (
                <Text style={[styles.num, active && { color: colors.white }]}>{i + 1}</Text>
              )}
            </View>
            <Text style={[styles.label, active && styles.labelOn]} numberOfLines={1}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  item: { flex: 1, alignItems: "center", gap: 4 },
  dot: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center",
  },
  dotOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  num: { fontSize: 12, fontWeight: "800", color: colors.muted },
  label: { fontSize: 10, fontWeight: "600", color: colors.muted },
  labelOn: { color: colors.text, fontWeight: "800" },
});