import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, noFocusOutline } from "@/constants/theme";
import { ItineraryItem } from "@/services/agencyTours";
import FormField from "@/components/ui/FormField";

type Props = {
  items: ItineraryItem[];
  maxDays: number;
  onChange: (items: ItineraryItem[]) => void;
  error?: string;
};

const renumber = (items: ItineraryItem[]) => items.map((it, i) => ({ ...it, day: i + 1 }));

export default function ItineraryEditor({ items, maxDays, onChange, error }: Props) {
  const update = (index: number, patch: Partial<ItineraryItem>) =>
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  return (
    <View style={{ gap: 12 }}>
      {items.map((it, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.head}>
            <Text style={styles.day}>{i + 1}-kun</Text>
            <Pressable onPress={() => onChange(renumber(items.filter((_, j) => j !== i)))} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>
          <FormField
            label="Sarlavha" value={it.title} onChangeText={(v) => update(i, { title: v })}
            placeholder="Masalan: Kelish va joylashish"
          />
          <View style={{ gap: 6 }}>
            <Text style={styles.label}>Tavsif</Text>
            <TextInput
              style={styles.area}
              value={it.text}
              onChangeText={(v) => update(i, { text: v })}
              placeholder="Shu kuni nima bo'lishini yozing"
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      ))}

      <Pressable
        style={[styles.addBtn, items.length >= maxDays && { opacity: 0.4 }]}
        disabled={items.length >= maxDays}
        onPress={() => onChange(renumber([...items, { day: 0, title: "", text: "" }]))}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        <Text style={styles.addText}>Kun qo'shish ({items.length}/{maxDays})</Text>
      </Pressable>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14, gap: 12, borderRadius: 18, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  day: { fontSize: 15, fontWeight: "800", color: colors.text },
  label: { fontSize: 13, fontWeight: "700", color: colors.text },
  area: {
    minHeight: 80, padding: 12, borderRadius: 14, fontSize: 15, color: colors.text,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    ...noFocusOutline,
  },
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50,
    borderRadius: 14, borderWidth: 1, borderStyle: "dashed", borderColor: colors.primary,
  },
  addText: { fontSize: 14, fontWeight: "700", color: colors.primary },
  error: { fontSize: 12, color: colors.danger },
});