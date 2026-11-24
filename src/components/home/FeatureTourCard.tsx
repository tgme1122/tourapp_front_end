import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { categoryColors, colors, radius, shadows } from "@/constants/theme";
import { useFavorites } from "@/store/favorites";
import { discountPercent, formatPrice } from "@/utils/format";
import { Tour } from "@/types/tour";

type Props = { tour: Tour; index?: number };

// Bosh sahifadagi katta vertikal karta: rasm asosiy, narx pastda
export default function FeatureTourCard({ tour, index = 0 }: Props) {
  const liked = useFavorites((s) => s.ids.includes(tour.id));
  const toggleFavorite = useFavorites((s) => s.toggle);
  const discount = discountPercent(tour.price, tour.oldPrice);
  const fewSeats = tour.seatsLeft != null && tour.seatsLeft > 0 && tour.seatsLeft <= 5;
  const tint = categoryColors[tour.category] ?? categoryColors.all;
  const open = () => router.push({ pathname: "/tour/[id]", params: { id: tour.id } });

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 4) * 70).duration(380)}>
      <Pressable style={styles.card} onPress={open}>
        {tour.image ? (
          <Image source={{ uri: tour.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.noImage, { backgroundColor: tint.soft }]}>
            <Ionicons name="image-outline" size={48} color={tint.accent} />
          </View>
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.top}>
          <View style={styles.leftBadges}>
            {tour.reviews > 0 && (
              <View style={styles.glass}>
                <Ionicons name="star" size={13} color={colors.star} />
                <Text style={styles.glassText}>{tour.rating.toFixed(1)}</Text>
              </View>
            )}
            {tour.hot && (
              <View style={[styles.glass, { backgroundColor: colors.primary }]}>
                <Ionicons name="flame" size={13} color={colors.white} />
                <Text style={styles.glassText}>Hot</Text>
              </View>
            )}
            {discount > 0 && (
              <View style={[styles.glass, { backgroundColor: colors.success }]}>
                <Text style={styles.glassText}>-{discount}%</Text>
              </View>
            )}
          </View>
          <Pressable style={styles.heart} hitSlop={6} onPress={() => toggleFavorite(tour.id)}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color={liked ? colors.primary : colors.white}
            />
          </Pressable>
        </View>

        <View style={styles.bottom}>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.row}>
              <Ionicons name="location-outline" size={14} color={colors.white} />
              <Text style={styles.loc} numberOfLines={1}>{tour.city}, {tour.country}</Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>{tour.title}</Text>
            <View style={styles.row}>
              <Text style={styles.price}>{formatPrice(tour.price)}</Text>
              <Text style={styles.sub}>· {tour.days} kun</Text>
              {fewSeats && <Text style={styles.seats}>· {tour.seatsLeft} joy qoldi</Text>}
            </View>
          </View>
          <Pressable style={styles.arrow} onPress={open} hitSlop={6}>
            <Ionicons name="arrow-up-outline" size={22} color={colors.text} style={{ transform: [{ rotate: "45deg" }] }} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 300, marginHorizontal: 16, borderRadius: radius.xl, overflow: "hidden",
    backgroundColor: colors.placeholder, justifyContent: "space-between", ...shadows.card,
  },
  noImage: { alignItems: "center", justifyContent: "center" },
  top: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 14,
  },
  leftBadges: { flexDirection: "row", gap: 6, flexShrink: 1, flexWrap: "wrap" },
  glass: {
    flexDirection: "row", alignItems: "center", gap: 4, height: 28, paddingHorizontal: 10,
    borderRadius: 14, backgroundColor: "rgba(0,0,0,0.38)",
  },
  glassText: { color: colors.white, fontSize: 12, fontWeight: "800" },
  heart: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center", justifyContent: "center",
  },
  bottom: { flexDirection: "row", alignItems: "flex-end", gap: 12, padding: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  loc: { color: "rgba(255,255,255,0.92)", fontSize: 13, fontWeight: "600", flexShrink: 1 },
  title: { color: colors.white, fontSize: 24, fontWeight: "800", lineHeight: 29 },
  price: { color: colors.white, fontSize: 17, fontWeight: "800" },
  sub: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "600" },
  seats: { color: "#FFD27A", fontSize: 13, fontWeight: "700" },
  arrow: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.white,
    alignItems: "center", justifyContent: "center",
  },
});
