import { ScrollView, Pressable, View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { colors } from "@/constants/theme";

const FLAGS: Record<string, string> = {
  "O'zbekiston": "🇺🇿",
  Turkiya: "🇹🇷",
  BAA: "🇦🇪",
  Misr: "🇪🇬",
  Indoneziya: "🇮🇩",
  Gruziya: "🇬🇪",
  Shveytsariya: "🇨🇭",
  Maldiv: "🇲🇻",
  Tailand: "🇹🇭",
  Italiya: "🇮🇹",
  Fransiya: "🇫🇷",
  Ispaniya: "🇪🇸",
  Yaponiya: "🇯🇵",
  Qozogiston: "🇰🇿",
  Qirgiziston: "🇰🇬",
  Malayziya: "🇲🇾",
  Vetnam: "🇻🇳",
  Yunoniston: "🇬🇷",
};

type Props = {
  countries: { name: string; count: number }[];
  total: number;
  selected: string | null;
  onSelect: (country: string | null) => void;
};

function Chip({
  flag, label, count, active, onPress,
}: { flag?: string; label: string; count: number; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      {flag ? <Text style={styles.flag}>{flag}</Text> : null}
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      <View style={[styles.count, active && styles.countActive]}>
        <Text style={[styles.countText, active && styles.countTextActive]}>{count}</Text>
      </View>
    </Pressable>
  );
}

export default function CountryChips({ countries, total, selected, onSelect }: Props) {
  return (
    <Animated.View
      style={styles.root}
      entering={FadeInDown.duration(250)}
      exiting={FadeOutUp.duration(150)}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Chip label="Hammasi" count={total} active={selected === null} onPress={() => onSelect(null)} />
        {countries.map((c) => (
          <Chip
            key={c.name}
            flag={FLAGS[c.name] ?? "🌍"}
            label={c.name}
            count={c.count}
            active={selected === c.name}
            onPress={() => onSelect(selected === c.name ? null : c.name)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { marginTop: 14 },
  content: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    height: 40, paddingHorizontal: 12, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  flag: { fontSize: 16 },
  label: { fontSize: 14, fontWeight: "700", color: colors.text },
  labelActive: { color: colors.white },
  count: {
    minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5,
    backgroundColor: colors.white, alignItems: "center", justifyContent: "center",
  },
  countActive: { backgroundColor: "rgba(255,255,255,0.25)" },
  countText: { fontSize: 11, fontWeight: "800", color: colors.muted },
  countTextActive: { color: colors.white },
});