import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { ItineraryDay } from "@/types/tourDetails";

export default function ItineraryList({ items }: { items: ItineraryDay[] }) {
  const [openDay, setOpenDay] = useState<number | null>(1);

  return (
    <View>
      {items.map((item, index) => {
        const open = openDay === item.day;
        const last = index === items.length - 1;
        return (
          <View key={item.day} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.circle, open && styles.circleOpen]}>
                <Text style={[styles.circleText, open && { color: colors.white }]}>{item.day}</Text>
              </View>
              {!last && <View style={styles.line} />}
            </View>

            <Pressable
              style={styles.content}
              onPress={() => setOpenDay(open ? null : item.day)}
            >
              <View style={styles.head}>
                <Text style={styles.title}>{item.title}</Text>
                <Ionicons
                  name={open ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.muted}
                />
              </View>
              {open && <Text style={styles.text}>{item.text}</Text>}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  rail: { alignItems: "center" },
  circle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center",
  },
  circleOpen: { backgroundColor: colors.primary },
  circleText: { fontSize: 14, fontWeight: "800", color: colors.primary },
  line: { flex: 1, width: 2, marginVertical: 4, backgroundColor: colors.border },
  content: { flex: 1, paddingBottom: 18, gap: 6 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 34 },
  title: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.text },
  text: { fontSize: 14, lineHeight: 21, color: colors.muted },
});