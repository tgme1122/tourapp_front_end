import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadows } from "@/constants/theme";

type Props = { onPress: () => void; onFilterPress: () => void };

export default function SearchBar({ onPress, onFilterPress }: Props) {
  return (
    <View style={styles.box}>
      <Pressable style={styles.field} onPress={onPress}>
        <Ionicons name="search" size={20} color={colors.primary} />
        <Text style={styles.placeholder} numberOfLines={1}>
          Davlat, shahar yoki sayohat turini qidiring
        </Text>
      </Pressable>
      <Pressable style={styles.filter} onPress={onFilterPress} hitSlop={4}>
        <Ionicons name="options-outline" size={18} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill,
    paddingLeft: 16, paddingRight: 6, height: 54,
    backgroundColor: colors.background, ...shadows.soft,
  },
  field: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, height: "100%" },
  placeholder: { flex: 1, fontSize: 14, color: colors.muted },
  filter: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
});
