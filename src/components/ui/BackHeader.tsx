import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/constants/theme";

type Props = { title: string; right?: React.ReactNode };

export default function BackHeader({ title, right }: Props) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)",
  },
  back: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
  },
  title: { flex: 1, fontSize: 19, fontWeight: "800", color: colors.text },
  right: { minWidth: 40, alignItems: "flex-end" },
});
