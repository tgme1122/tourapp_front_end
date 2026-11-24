import { Text, Pressable, ScrollView, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { categoryColors, colors, radius } from "@/constants/theme";

const items = [
  { key: "countries", label: "Davlatlar", icon: "earth", tint: categoryColors.countries },
  { key: "cities", label: "Shaharlar", icon: "city-variant", tint: categoryColors.city },
  { key: "mountains", label: "Tog'lar", icon: "image-filter-hdr", tint: categoryColors.mountain },
  { key: "sea", label: "Dengiz", icon: "waves", tint: categoryColors.sea },
  { key: "culture", label: "Madaniyat", icon: "bank", tint: categoryColors.culture },
] as const;

export type CategoryKey = (typeof items)[number]["key"];

export const categoryLabels: Record<CategoryKey, string> = {
  countries: "Davlatlar",
  cities: "Shaharlar",
  mountains: "Tog'lar",
  sea: "Dengiz",
  culture: "Madaniyat",
};

type Props = {
  selected?: CategoryKey | null;
  onSelect: (key: CategoryKey) => void;
  counts?: Partial<Record<CategoryKey, number>>;
};

export default function CategoryRow({ selected = null, onSelect, counts }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {items.map((item) => {
        const active = selected === item.key;
        const count = counts?.[item.key];
        return (
          <Pressable
            key={item.key}
            onPress={() => onSelect(item.key)}
            style={({ pressed }) => [
              styles.pill,
              active && { backgroundColor: item.tint.accent, borderColor: item.tint.accent },
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={[styles.icon, { backgroundColor: active ? "rgba(255,255,255,0.25)" : item.tint.soft }]}>
              <MaterialCommunityIcons
                name={item.icon}
                size={20}
                color={active ? colors.white : item.tint.accent}
              />
            </View>
            <View>
              <Text style={[styles.label, active && { color: colors.white }]}>{item.label}</Text>
              {count !== undefined && (
                <Text style={[styles.count, active && { color: "rgba(255,255,255,0.85)" }]}>
                  {item.key === "countries" ? `${count} davlat` : `${count} ta tur`}
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 10 },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    height: 46, paddingLeft: 6, paddingRight: 14, borderRadius: radius.pill,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
  },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 13, fontWeight: "700", color: colors.text },
  count: { fontSize: 10, fontWeight: "600", color: colors.muted },
});
