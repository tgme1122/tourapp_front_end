import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "@/constants/theme";
import { Language, languageLabels, useSettings } from "@/store/settings";
import BackHeader from "@/components/ui/BackHeader";

const options: { key: Language; available: boolean }[] = [
  { key: "uz", available: true },
  { key: "ru", available: false },
  { key: "en", available: false },
];

export default function LanguageScreen() {
  const language = useSettings((s) => s.language);
  const update = useSettings((s) => s.update);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <BackHeader title="Til" />

      <View style={styles.list}>
        {options.map((o) => {
          const active = language === o.key;
          return (
            <Pressable
              key={o.key}
              disabled={!o.available}
              onPress={() => update({ language: o.key })}
              style={[styles.row, active && styles.rowActive, !o.available && { opacity: 0.55 }]}
            >
              <Text style={styles.label}>{languageLabels[o.key]}</Text>
              {!o.available ? (
                <View style={styles.soon}>
                  <Text style={styles.soonText}>Tez orada</Text>
                </View>
              ) : active ? (
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              ) : (
                <View style={styles.radio} />
              )}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 10 },
  row: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    height: 60, paddingHorizontal: 16, borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background,
    ...shadows.soft,
  },
  rowActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  label: { fontSize: 16, fontWeight: "700", color: colors.text },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border },
  soon: {
    paddingHorizontal: 10, height: 24, borderRadius: 12,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
  },
  soonText: { fontSize: 12, fontWeight: "700", color: colors.muted },
});