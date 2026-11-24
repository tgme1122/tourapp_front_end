import { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import {
  categoryOptions, defaultFilters, durations, priceRanges, ratingOptions,
} from "@/constants/filters";
import { SearchFilters } from "@/types/search";
import { TourCategory } from "@/types/tour";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
  visible: boolean;
  filters: SearchFilters;
  countries: string[];
  onApply: (filters: SearchFilters) => void;
  onClose: () => void;
};

function Chip({
  label, active, onPress, icon,
}: { label: string; active: boolean; onPress: () => void; icon?: IconName }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      {icon && <Ionicons name={icon} size={16} color={active ? colors.white : colors.primary} />}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.wrap}>{children}</View>
    </View>
  );
}

export default function FilterSheet({ visible, filters, countries, onApply, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<SearchFilters>(filters);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const toggleCategory = (key: TourCategory) =>
    setDraft((d) => ({
      ...d,
      categories: d.categories.includes(key)
        ? d.categories.filter((c) => c !== key)
        : [...d.categories, key],
    }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Filtrlar</Text>
            <Pressable onPress={() => setDraft(defaultFilters)}>
              <Text style={styles.reset}>Tozalash</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
            <Section title="Tur turi">
              {categoryOptions.map((o) => (
                <Chip
                  key={o.key} label={o.label} icon={o.icon}
                  active={draft.categories.includes(o.key)}
                  onPress={() => toggleCategory(o.key)}
                />
              ))}
            </Section>

            <Section title="Davlat">
              {countries.map((c) => (
                <Chip
                  key={c} label={c} active={draft.country === c}
                  onPress={() =>
                    setDraft((d) => ({ ...d, country: d.country === c ? null : c }))
                  }
                />
              ))}
            </Section>

            <Section title="Narx">
              {priceRanges.map((r) => (
                <Chip
                  key={r.key} label={r.label} active={draft.priceRange === r.key}
                  onPress={() =>
                    setDraft((d) => ({ ...d, priceRange: d.priceRange === r.key ? null : r.key }))
                  }
                />
              ))}
            </Section>

            <Section title="Davomiyligi">
              {durations.map((r) => (
                <Chip
                  key={r.key} label={r.label} active={draft.duration === r.key}
                  onPress={() =>
                    setDraft((d) => ({ ...d, duration: d.duration === r.key ? null : r.key }))
                  }
                />
              ))}
            </Section>

            <Section title="Minimal reyting">
              {ratingOptions.map((r) => (
                <Chip
                  key={r} label={`${r.toFixed(1)}+`} icon="star" active={draft.minRating === r}
                  onPress={() =>
                    setDraft((d) => ({ ...d, minRating: d.minRating === r ? null : r }))
                  }
                />
              ))}
            </Section>
            <Section title="Qo'shimcha">
              <Chip
                label="Faqat Hot turlar" icon="flame" active={draft.hotOnly}
                onPress={() => setDraft((d) => ({ ...d, hotOnly: !d.hotOnly }))}
              />
            </Section>
          </ScrollView>

          <Pressable style={styles.apply} onPress={() => onApply(draft)}>
            <Text style={styles.applyText}>Natijalarni ko'rsatish</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    maxHeight: "85%", paddingHorizontal: 16, paddingTop: 10,
    borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background,
  },
  handle: {
    alignSelf: "center", width: 42, height: 4, borderRadius: 2,
    backgroundColor: colors.border, marginBottom: 12,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  reset: { fontSize: 14, fontWeight: "700", color: colors.primary },
  section: { marginTop: 16, gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: colors.text },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, height: 38, borderRadius: 19,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: "700", color: colors.text },
  chipTextActive: { color: colors.white },
  apply: {
    height: 54, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", marginTop: 8,
  },
  applyText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});