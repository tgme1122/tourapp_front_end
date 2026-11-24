import { View, Text, Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { discountPercent } from "@/utils/format";
import { Tour } from "@/types/tour";

const UNSEEN = ["#F5A623", colors.primary, "#B3361A"] as const;
const SEEN = [colors.border, colors.border] as const;

type Props = { tours: Tour[]; seen: Set<string>; onPress: (index: number) => void };

export default function StoriesRow({ tours, seen, onPress }: Props) {
  if (tours.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <Ionicons name="flame" size={18} color={colors.primary} />
        <Text style={styles.title}>Qaynoq turlar</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {tours.map((tour, index) => {
          const isSeen = seen.has(tour.id);
          const discount = discountPercent(tour.price, tour.oldPrice);
          return (
            <Pressable key={tour.id} style={styles.item} onPress={() => onPress(index)}>
              <LinearGradient
                colors={isSeen ? SEEN : UNSEEN}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ring}
              >
                <View style={styles.inner}>
                  <Image source={{ uri: tour.image }} style={styles.image} />
                </View>
              </LinearGradient>

              {discount > 0 && (
                <View style={styles.discountWrap}>
                  <View style={styles.discount}>
                    <Text style={styles.discountText}>-{discount}%</Text>
                  </View>
                </View>
              )}

              <Text style={[styles.label, isSeen && { color: colors.muted }]} numberOfLines={1}>
                {tour.city}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4, marginBottom: 14 },
  titleRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "800", color: colors.text },
  content: { paddingHorizontal: 16, gap: 14 },
  item: { width: 76, alignItems: "center", gap: 6 },
  ring: {
    width: 76, height: 76, borderRadius: 38, padding: 3,
    alignItems: "center", justifyContent: "center",
  },
  inner: {
    width: "100%", height: "100%", borderRadius: 35, padding: 3,
    backgroundColor: colors.background,
  },
  image: { width: "100%", height: "100%", borderRadius: 32, backgroundColor: colors.surface },
  discountWrap: { position: "absolute", top: 62, left: 0, right: 0, alignItems: "center" },
  discount: {
    paddingHorizontal: 7, height: 18, borderRadius: 9,
    backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.background,
    alignItems: "center", justifyContent: "center",
  },
  discountText: { fontSize: 10, fontWeight: "800", color: colors.white },
  label: { fontSize: 12, fontWeight: "600", color: colors.text, marginTop: 4 },
});