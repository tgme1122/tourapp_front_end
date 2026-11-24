import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

type Props = { included: string[]; excluded: string[] };

function Block({
  title, items, icon, color,
}: { title: string; items: string[]; icon: "checkmark-circle" | "close-circle"; color: string }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {items.map((t) => (
        <View key={t} style={styles.item}>
          <Ionicons name={icon} size={18} color={color} />
          <Text style={styles.itemText}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

export default function IncludedList({ included, excluded }: Props) {
  return (
    <View style={{ gap: 12 }}>
      <Block title="Narxga kiritilgan" items={included} icon="checkmark-circle" color={colors.success} />
      <Block title="Narxga kiritilmagan" items={excluded} icon="close-circle" color={colors.danger} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    padding: 14, gap: 10, borderRadius: 18,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
  },
  blockTitle: { fontSize: 14, fontWeight: "800", color: colors.text },
  item: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  itemText: { flex: 1, fontSize: 14, lineHeight: 20, color: colors.text },
});