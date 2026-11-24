import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { passwordChecks } from "@/utils/validation";

export default function PasswordChecklist({ password }: { password: string }) {
  const c = passwordChecks(password);
  const items = [
    { ok: c.length, label: "Kamida 8 ta belgi" },
    { ok: c.mix, label: "Harf va raqam" },
  ];

  return (
    <View style={styles.row}>
      {items.map((i) => (
        <View key={i.label} style={styles.item}>
          <Ionicons
            name={i.ok ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={i.ok ? colors.success : colors.muted}
          />
          <Text style={[styles.text, i.ok && { color: colors.success }]}>{i.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  item: { flexDirection: "row", alignItems: "center", gap: 5 },
  text: { fontSize: 12, color: colors.muted, fontWeight: "600" },
});