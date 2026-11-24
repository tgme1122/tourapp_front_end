import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

export type SortKey = "cheap" | "popular" | "rating";

const options: { key: SortKey; label: string }[] = [
  { key: "cheap", label: "Eng arzon" },
  { key: "popular", label: "Mashhur" },
  { key: "rating", label: "Reyting" },
];

type Props = { value: SortKey; onChange: (key: SortKey) => void };

export default function FilterChips({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 14 },
  chip: {
    paddingHorizontal: 18, height: 38, borderRadius: 19,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 14, fontWeight: "700", color: colors.text },
  textActive: { color: colors.white },
});