import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { formatDateMask } from "@/utils/validation";
import FormField from "@/components/ui/FormField";

export type DepartureDraft = { date: string; seats: string };

type Props = { items: DepartureDraft[]; onChange: (items: DepartureDraft[]) => void; error?: string };

export default function DepartureEditor({ items, onChange, error }: Props) {
  const update = (i: number, patch: Partial<DepartureDraft>) =>
    onChange(items.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  return (
    <View style={{ gap: 12 }}>
      {items.map((d, i) => (
        <View key={i} style={styles.row}>
          <View style={{ flex: 1.4 }}>
            <FormField
              label="Boshlanish sanasi" value={d.date} placeholder="KK.OO.YYYY" maxLength={10}
              onChangeText={(v) => update(i, { date: formatDateMask(v) })} keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormField
              label="Joylar" value={d.seats} placeholder="20" maxLength={3}
              onChangeText={(v) => update(i, { seats: v.replace(/\D/g, "") })} keyboardType="number-pad"
            />
          </View>
          <Pressable style={styles.remove} onPress={() => onChange(items.filter((_, j) => j !== i))}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </Pressable>
        </View>
      ))}

      <Pressable
        style={styles.addBtn}
        onPress={() => onChange([...items, { date: "", seats: "" }])}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        <Text style={styles.addText}>Jo'nash qo'shish</Text>
      </Pressable>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  remove: { width: 44, height: 52, alignItems: "center", justifyContent: "center" },
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50,
    borderRadius: 14, borderWidth: 1, borderStyle: "dashed", borderColor: colors.primary,
  },
  addText: { fontSize: 14, fontWeight: "700", color: colors.primary },
  error: { fontSize: 12, color: colors.danger },
});