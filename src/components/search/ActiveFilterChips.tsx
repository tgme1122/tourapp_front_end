import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import {
  categoryOptions, defaultFilters, durations, priceRanges,
} from "@/constants/filters";
import { SearchFilters } from "@/types/search";

type Props = { filters: SearchFilters; onChange: (filters: SearchFilters) => void };

export default function ActiveFilterChips({ filters, onChange }: Props) {
  const chips: { key: string; label: string; remove: () => void }[] = [];

  filters.categories.forEach((c) =>
    chips.push({
      key: `cat-${c}`,
      label: categoryOptions.find((o) => o.key === c)?.label ?? c,
      remove: () =>
        onChange({ ...filters, categories: filters.categories.filter((x) => x !== c) }),
    })
  );
  if (filters.country)
    chips.push({
      key: "country", label: filters.country,
      remove: () => onChange({ ...filters, country: null }),
    });
  if (filters.priceRange)
    chips.push({
      key: "price",
      label: priceRanges.find((r) => r.key === filters.priceRange)?.label ?? "",
      remove: () => onChange({ ...filters, priceRange: null }),
    });
  if (filters.duration)
    chips.push({
      key: "duration",
      label: durations.find((d) => d.key === filters.duration)?.label ?? "",
      remove: () => onChange({ ...filters, duration: null }),
    });
  if (filters.minRating)
    chips.push({
      key: "rating", label: `${filters.minRating.toFixed(1)}+ reyting`,
      remove: () => onChange({ ...filters, minRating: null }),
    });

    if (filters.hotOnly)
    chips.push({
      key: "hot", label: "Faqat Hot",
      remove: () => onChange({ ...filters, hotOnly: false }),
    });

  if (chips.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.scroll}
    >
      {chips.map((c) => (
        <Pressable key={c.key} style={styles.chip} onPress={c.remove}>
          <Text style={styles.text}>{c.label}</Text>
          <Ionicons name="close" size={14} color={colors.primary} />
        </Pressable>
      ))}
      {chips.length > 1 && (
        <Pressable style={styles.clear} onPress={() => onChange(defaultFilters)}>
          <Text style={styles.clearText}>Hammasini tozalash</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: 14, flexGrow: 0 },
  content: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft,
  },
  text: { fontSize: 13, fontWeight: "700", color: colors.primary },
  clear: { paddingHorizontal: 8, height: 32, justifyContent: "center" },
  clearText: { fontSize: 13, fontWeight: "700", color: colors.muted },
});